import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateProfile } from './actions'

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
    },
  })

  if (!profile) {
    return <div>Profile not found</div>
  }

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('th-TH', { dateStyle: 'medium', timeZone: 'Asia/Bangkok' })
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">โปรไฟล์ของฉัน</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ข้อมูลส่วนตัวและฟอร์มแก้ไข */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-800">ข้อมูลส่วนตัว</h2>
              <form action={updateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    อีเมล (แก้ไม่ได้)
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full border p-2 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    ชื่อแสดงผล
                  </label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={profile.name || ''}
                    placeholder="ใส่ชื่อของคุณ"
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    PromptPay QR Code Link (สำหรับโฮสต์)
                  </label>
                  <input
                    name="promptpayQR"
                    type="url"
                    defaultValue={profile.promptpayQR || ''}
                    placeholder="https://..."
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    ใส่ลิงก์รูป QR Code เพื่อให้ลูกตี้โอนง่ายขึ้น
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  บันทึกข้อมูล
                </button>
              </form>
            </div>
          </div>

          {/* ประวัติการเข้าร่วมก๊วน */}
          <div className="md:col-span-2 space-y-8">
            
            {/* ตี้ที่ฉันไปรวมด้วย */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-800">ตี้ที่ไปแจม (จองไว้)</h2>
              {profile.bookings.length === 0 ? (
                <p className="text-gray-400">ยังไม่เคยไปแจมตี้ไหนเลย</p>
              ) : (
                <div className="space-y-3">
                  {profile.bookings.map((booking) => (
                    <Link key={booking.id} href={`/posts/${booking.post.id}`} className="block">
                      <div className="border border-gray-100 rounded-xl p-4 hover:border-blue-300 transition group flex justify-between items-center bg-gray-50 hover:bg-blue-50">
                        <div>
                          <p className="font-bold text-gray-800 group-hover:text-blue-600">
                            {booking.post.fieldName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {fmtDate(booking.post.startTime)} | {fmtTime(booking.post.startTime)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                          เข้าร่วมแล้ว
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* ตี้ที่ฉันเปิดเอง (โฮสต์) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-800">ตี้ที่ฉันเปิดเอง (โฮสต์)</h2>
              {profile.posts.length === 0 ? (
                <p className="text-gray-400">ยังไม่เคยเปิดตี้เป็นโฮสต์</p>
              ) : (
                <div className="space-y-3">
                  {profile.posts.map((post) => (
                    <Link key={post.id} href={`/posts/${post.id}`} className="block">
                      <div className="border border-gray-100 rounded-xl p-4 hover:border-purple-300 transition group flex justify-between items-center bg-gray-50 hover:bg-purple-50">
                        <div>
                          <p className="font-bold text-gray-800 group-hover:text-purple-600">
                            {post.fieldName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {fmtDate(post.startTime)} | คนจองแล้ว: {post.bookings.length}/{post.maxPlayers}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                          โฮสต์ ⭐
                        </span>
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
