import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateProfile } from './actions'
import { SubmitButton } from '@/components/SubmitButton'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    include: {
      posts: {
        include: { bookings: true },
        orderBy: { startTime: 'desc' },
      },
      bookings: {
        include: { post: true },
        orderBy: { joinedAt: 'desc' },
      },
      reviewsReceived: true,
    },
  })

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white">
        ไม่พบข้อมูลโปรไฟล์
      </div>
    )
  }

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('th-TH', { dateStyle: 'medium', timeZone: 'Asia/Bangkok' })
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })

  const avgRating = profile.reviewsReceived?.length > 0
    ? (profile.reviewsReceived.reduce((sum: number, r: any) => sum + r.rating, 0) / profile.reviewsReceived.length).toFixed(1)
    : '-'

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Abstract Glowing Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 relative z-10 space-y-10">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">
              โปรไฟล์ของฉัน ✨
            </h1>
          </div>
          <p className="text-slate-400 font-medium">จัดการข้อมูลส่วนตัวและประวัติการเตะบอลของคุณ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ข้อมูลส่วนตัวและฟอร์มแก้ไข (Left Column) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center text-white font-black text-2xl">
                  {profile.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">ข้อมูลบัญชี</h2>
                  <div className="flex flex-wrap gap-2 items-center mt-2">
                    <p className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md tracking-wider">
                      {profile.role === 'ADMIN' ? '👑 ADMIN' : '👤 USER'}
                    </p>
                    <p className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span>⭐</span> {avgRating} <span className="text-amber-400/60 font-medium">({profile.reviewsReceived?.length || 0})</span>
                    </p>
                  </div>
                </div>
              </div>

              <form action={updateProfile} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                    อีเมลบัญชี (แก้ไขไม่ได้)
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-white/5 border border-white/5 p-3.5 rounded-xl text-slate-500 font-medium cursor-not-allowed text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                    ชื่อแสดงผลในระบบ
                  </label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={profile.name || ''}
                    placeholder="ตั้งชื่อเท่ๆ ของคุณ"
                    className="w-full bg-black/30 border border-white/10 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 text-sm text-white"
                  />
                </div>

                <div className="pt-2 border-t border-white/10 mt-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">
                    QR Code รับเงิน (อัพโหลดรูปภาพ)
                  </label>
                  {profile.promptpayQR && (
                    <div className="mb-4 border border-white/10 rounded-2xl p-4 bg-black/20 flex justify-center group relative overflow-hidden">
                      <img src={profile.promptpayQR} alt="PromptPay QR Code" className="max-h-40 object-contain rounded-xl group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <input
                    name="promptpayQRFile"
                    type="file"
                    accept="image/*"
                    className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 bg-black/30 border border-white/10 p-2 rounded-xl focus:outline-none text-sm text-slate-300 cursor-pointer transition-all"
                  />
                  <p className="text-[10px] text-slate-500 mt-2 px-1">
                    อัพโหลดรูป QR Code (ไม่เกิน 5MB) เพื่อให้คนในตี้สแกนจ่ายค่าสนามได้ง่ายขึ้น
                  </p>
                </div>

                <div className="pt-4">
                  <SubmitButton isFullWidth className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200">
                    บันทึกการเปลี่ยนแปลง
                  </SubmitButton>
                </div>
              </form>
            </div>
          </div>

          {/* ประวัติการเข้าร่วมก๊วน (Right Column) */}
          <div className="lg:col-span-2 space-y-8">

            {/* ตี้ที่ฉันไปรวมด้วย */}
            <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm border border-emerald-500/20">🏃</span>
                ตี้ที่ฉันไปแจม (ประวัติการจอง)
              </h2>

              {profile.bookings.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-[1.5rem] bg-black/20">
                  <p className="text-slate-500 text-sm">ยังไม่เคยไปแจมตี้ไหนเลย ลองหาตี้เตะดูสิ!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {profile.bookings.map((booking: typeof profile.bookings[0]) => (
                    <Link key={booking.id} href={`/posts/${booking.post.id}`} className="block">
                      <div className="border border-white/5 rounded-2xl p-5 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 hover:bg-white/10 hover:border-white/20 group relative overflow-hidden">

                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl"></div>

                        <div className="pl-2">
                          <p className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors mb-1.5 line-clamp-1">
                            {booking.post.fieldName}
                          </p>
                          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 font-mono">
                            <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-300 tracking-wider uppercase">{booking.post.sportType}</span>
                            <span>{fmtDate(booking.post.startTime)}</span>
                            <span className="text-slate-600">•</span>
                            <span>{fmtTime(booking.post.startTime)} น.</span>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2 sm:ml-0">
                          {booking.post.status === 'CANCELLED' ? (
                            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 tracking-wider uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> ถูกยกเลิกแล้ว
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 tracking-wider uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> จองสำเร็จ
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* ตี้ที่ฉันเปิดเอง (โฮสต์) */}
            <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm border border-indigo-500/20">👑</span>
                ตี้ที่ฉันเปิดเอง (ฐานะ Host)
              </h2>

              {profile.posts.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-[1.5rem] bg-black/20">
                  <p className="text-slate-500 text-sm">ยังไม่เคยเปิดตี้เองเลย</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {profile.posts.map((post: typeof profile.posts[0]) => (
                    <Link key={post.id} href={`/posts/${post.id}`} className="block">
                      <div className="border border-white/5 rounded-2xl p-5 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 hover:bg-white/10 hover:border-white/20 group relative overflow-hidden">

                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl"></div>

                        <div className="pl-2 flex-1 w-full">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors line-clamp-1">
                              {post.fieldName}
                            </p>
                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap hidden sm:inline uppercase tracking-wider bg-black/40 px-2 py-1 rounded">
                              ลูกตี้: <span className="text-indigo-400">{post.bookings.length}</span> / {post.maxPlayers}
                            </span>
                          </div>

                          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 font-mono">
                            <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-300 tracking-wider uppercase">{post.sportType}</span>
                            <span>{fmtDate(post.startTime)}</span>
                            <span className="sm:hidden text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              ลูกตี้: {post.bookings.length}/{post.maxPlayers}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2 sm:ml-0 mt-2 sm:mt-0">
                          {post.status === 'CANCELLED' ? (
                            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 tracking-wider uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> ยกเลิกแล้ว
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 tracking-wider uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> สถานะ: โฮสต์
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}