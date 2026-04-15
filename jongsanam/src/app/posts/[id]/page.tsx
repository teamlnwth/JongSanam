import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { joinMatch } from '@/app/actions'

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

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

  const pricePerPerson = Number(post.totalPrice) / post.maxPlayers
  const currentPlayers = post.bookings.length
  const isFull = currentPlayers >= post.maxPlayers

  const endTime = new Date(post.startTime.getTime() + post.duration * 60 * 1000)
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })
  const fmtDate = (d: Date) =>
    d.toLocaleDateString('th-TH', { dateStyle: 'medium', timeZone: 'Asia/Bangkok' })

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back */}
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← กลับหน้าหลัก
        </Link>

        {/* Post Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
              {post.sportType === 'FOOTBALL' ? '⚽ ฟุตบอล' : '🥅 ฟุตซอล'}
            </span>
            <h1 className="text-2xl font-black">{post.fieldName}</h1>
          </div>

          <div className="text-gray-500 text-sm space-y-1">
            <p>👤 โฮสต์: <span className="font-semibold text-gray-700">{post.host?.name || 'ไม่ระบุชื่อ'}</span></p>
            <p>📅 {fmtDate(post.startTime)} &nbsp;|&nbsp; 🕐 {fmtTime(post.startTime)} → {fmtTime(endTime)}
              &nbsp;<span className="text-gray-400">({post.duration >= 60 ? `${post.duration / 60} ชม.` : `${post.duration} นาที`})</span>
            </p>
            <p>💰 ราคารวม: <span className="font-semibold text-gray-700">฿{Number(post.totalPrice).toLocaleString()}</span>
              &nbsp;→ 🔥 ตกคนละ <span className="font-bold text-red-500">฿{pricePerPerson.toFixed(2)}</span>
            </p>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>คนจองแล้ว</span>
              <span className="font-bold text-gray-700">{currentPlayers} / {post.maxPlayers}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all ${isFull ? 'bg-gray-400' : 'bg-green-500'}`}
                style={{ width: `${Math.min((currentPlayers / post.maxPlayers) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Join button */}
          <form action={joinMatch.bind(null, post.id)}>
            <button
              disabled={isFull}
              className={`w-full py-3 rounded-xl font-bold text-white transition ${
                isFull ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isFull ? 'เต็มแล้ว 🚫' : 'กดจองเลย! ✅'}
            </button>
          </form>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4">
            รายชื่อผู้เข้าร่วม ({currentPlayers}/{post.maxPlayers})
          </h2>

          {post.bookings.length === 0 ? (
            <p className="text-gray-400 text-sm">ยังไม่มีใครจองเลย เป็นคนแรกเลย!</p>
          ) : (
            <ul className="space-y-3">
              {post.bookings.map((booking, index) => (
                <li
                  key={booking.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {booking.user?.name || 'ไม่ระบุชื่อ'}
                    </p>
                    <p className="text-xs text-gray-400">
                      เข้าร่วมเมื่อ {booking.joinedAt.toLocaleDateString('th-TH', { dateStyle: 'short', timeZone: 'Asia/Bangkok' })}
                    </p>
                  </div>
                  {index === 0 && (
                    <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold shrink-0">
                      โฮสต์ ⭐
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
