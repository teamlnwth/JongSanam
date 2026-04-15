import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { joinMatch, cancelPost } from '@/app/actions'
import { createClient } from '@/lib/supabase/server'

export default async function PostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      host: true,
      bookings: {
        include: { user: true },
        orderBy: { joinedAt: 'asc' },
      },
    },
  })

  if (!post) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    profile = await prisma.profile.findUnique({ where: { id: user.id } })
  }
  
  const isHost = user?.id === post.hostId || profile?.role === 'ADMIN'
  const isJoined = post.bookings.some(b => b.userId === user?.id)
  const isCancelled = post.status === 'CANCELLED'

  const pricePerPerson = Number(post.totalPrice) / post.maxPlayers
  const currentPlayers = post.bookings.length
  const isFull = currentPlayers >= post.maxPlayers

  const endTime = new Date(post.startTime.getTime() + post.duration * 60 * 1000)
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })
  const fmtDate = (d: Date) =>
    d.toLocaleDateString('th-TH', { dateStyle: 'medium', timeZone: 'Asia/Bangkok' })

  return (
    <main className="min-h-screen bg-slate-50/50 p-4 md:p-10 text-slate-800">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Navbar Back */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="group flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md border border-slate-200 transition-all text-sm font-bold text-slate-700 hover:text-blue-600">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> กลับหน้าหลัก
          </Link>
          {isCancelled && (
            <span className="bg-red-50 text-red-600 font-extrabold px-4 py-2 rounded-full text-sm border border-red-200 flex items-center gap-2 shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              สนามนี้ถูกยกเลิกแล้ว
            </span>
          )}
        </div>

        {/* Post Hero Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none"></div>

          <div className="p-8 md:p-10 relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 text-sm px-4 py-2 rounded-full font-extrabold tracking-wide shadow-sm">
                {post.sportType === 'FOOTBALL' ? '⚽ FOOTBALL' : '⚡ FUTSAL'}
              </span>
              {post.passcode && (
                <span className="bg-amber-50 text-amber-600 border border-amber-100 text-sm px-4 py-2 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                  <span>🔒</span> Private Room
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight leading-tight">
              {post.fieldName}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/80 rounded-3xl p-6 border border-slate-100/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl border border-slate-200">👤</div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ผู้เปิดตี้</p>
                  <p className="font-bold text-slate-800">{post.host?.name || 'ไม่ระบุชื่อ'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl border border-slate-200">📅</div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">วันและเวลา</p>
                  <p className="font-bold text-slate-800">{fmtDate(post.startTime)}</p>
                  <p className="text-sm text-slate-500 font-medium">
                    {fmtTime(post.startTime)} → {fmtTime(endTime)} <span className="opacity-60">({post.duration >= 60 ? `${post.duration / 60} ชม.` : `${post.duration} นาที`})</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl border border-slate-200">💰</div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ราคารวม</p>
                  <p className="font-black text-slate-800 text-xl">฿{Number(post.totalPrice).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-black">🔥</div>
                <div>
                  <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mb-0.5">เฉลี่ยตกคนละ</p>
                  <p className="font-black text-emerald-600 text-2xl">฿{pricePerPerson.toFixed(0)}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-8 bg-red-50 text-red-600 border border-red-100 rounded-2xl p-4 flex items-center gap-3 font-semibold">
                <span className="text-xl">⚠️</span> {decodeURIComponent(error)}
              </div>
            )}

            {/* Progress */}
            <div className="mt-10 mb-8 max-w-lg mx-auto">
              <div className="flex justify-between items-end mb-3">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">สถานะคนเข้าร่วม</span>
                <span className="font-black text-2xl text-slate-800">{currentPlayers} <span className="text-slate-400 text-lg">/ {post.maxPlayers}</span></span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                  style={{ width: `${Math.min((currentPlayers / post.maxPlayers) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Actions & QR Code */}
            <div className="mt-8">
              {(isHost || isJoined) && post.host?.promptpayQR && (
                <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-[2rem]">
                  <h3 className="text-sm font-extrabold text-slate-700 mb-4 text-center">📱 สแกนชำระเงินโฮสต์ (PromptPay)</h3>
                  <div className="bg-white border border-slate-200 shadow-sm rounded-[1.5rem] p-6 flex justify-center w-max mx-auto hover:scale-105 transition-transform">
                    <img src={post.host.promptpayQR} alt="PromptPay QR Code" className="w-48 h-48 object-contain rounded-xl" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 text-center mt-4">กรุณาชำระเงินให้โฮสต์ตามสัดส่วนและแจ้งโฮสต์</p>
                </div>
              )}

              {isHost && !isCancelled && (
                <form action={cancelPost.bind(null, post.id)}>
                  <button
                    type="submit"
                    className="w-full text-red-600 font-bold bg-white border-2 border-red-100 hover:border-red-200 hover:bg-red-50 py-4 rounded-2xl transition-all shadow-sm active:scale-95"
                  >
                    🗑️ ยกเลิกข้อมูลสนาม (ลบโพสต์)
                  </button>
                </form>
              )}

              {!isHost && !isJoined && !isCancelled && (
                <form action={joinMatch.bind(null, post.id)} className="space-y-4 max-w-sm mx-auto">
                  {post.passcode && (
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                      <label className="block text-sm font-bold text-amber-800 mb-2 text-center">
                        🔒 กรุณาระบุรหัสผ่านเพื่อเข้าร่วม
                      </label>
                      <input
                        type="password"
                        name="passcode"
                        required
                        placeholder="รหัสผ่านห้อง 4-6 หลัก"
                        className="w-full text-center tracking-widest text-lg font-bold bg-white border border-amber-200 p-4 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all placeholder:text-amber-200 placeholder:tracking-normal"
                      />
                    </div>
                  )}
                  <button
                    disabled={isFull}
                    className={`w-full py-4 rounded-2xl font-black text-white text-lg transition-all shadow-lg active:scale-95 ${
                      isFull 
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none active:scale-100' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5'
                    }`}
                  >
                    {isFull ? '🚫 ที่เต็มแล้ว' : '✅ ยืนยันเข้าร่วมกดจองเลย!'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-8 md:p-10">
          <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
            <span>👥 รายชื่อผู้เข้าร่วม</span>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 text-sm rounded-full">{currentPlayers}/{post.maxPlayers}</span>
          </h2>

          {post.bookings.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl">
              <span className="text-4xl mb-3 block opacity-50">👻</span>
              <p className="text-slate-400 font-bold">ยังไม่มีใครจองเลย เป็นคนแรกสิ!</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {post.bookings.map((booking, index) => (
                <li
                  key={booking.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-100"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-inner shadow-blue-800 text-lg shrink-0 border border-blue-400/20">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate mb-0.5">
                      {booking.user?.name || 'ไม่ระบุชื่อ'}
                    </p>
                    <p className="text-[11px] font-bold text-slate-400">
                      เข้าร่วมเมื่อ {booking.joinedAt.toLocaleDateString('th-TH', { dateStyle: 'short', timeZone: 'Asia/Bangkok' })}
                    </p>
                  </div>
                  {index === 0 && (
                    <span className="text-[10px] bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 border border-yellow-300/50 px-2.5 py-1 rounded-lg font-black shrink-0 tracking-wide shadow-sm">
                      HOST ⭐
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </main>
  )
}
