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

  const avgRating = profile.reviewsReceived?.length > 0 
    ? (profile.reviewsReceived.reduce((sum: number, r: any) => sum + r.rating, 0) / profile.reviewsReceived.length).toFixed(1)
    : '-'

  return (
    <main className="min-h-screen bg-slate-50/50 p-4 md:p-10 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <div className="pt-4">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight">
            โปรไฟล์ของฉัน ✨
          </h1>
          <p className="text-white font-medium mt-2 drop-shadow-md">จัดการข้อมูลส่วนตัวและประวัติการเตะบอลของคุณ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ข้อมูลส่วนตัวและฟอร์มแก้ไข */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-inner flex items-center justify-center text-white font-black text-2xl relative z-10">
                  {profile.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 leading-tight">ข้อมูลบัญชี</h2>
                  <div className="flex flex-wrap gap-2 items-center mt-1.5">
                    <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                      {profile.role === 'ADMIN' ? '👑 ADMIN' : '👤 USER'}
                    </p>
                    <p className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <span className="text-amber-500">⭐</span> {avgRating} <span className="text-amber-500/70 font-medium">({profile.reviewsReceived?.length || 0})</span>
                    </p>
                  </div>
                </div>
              </div>

              <form action={updateProfile} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider pl-1">
                    อีเมลบัญชี (แก้ไขไม่ได้)
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-slate-100/70 border border-slate-200 p-3.5 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider pl-1">
                    ชื่อแสดงผลในระบบ
                  </label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={profile.name || ''}
                    placeholder="ตั้งชื่อเท่ๆ ของคุณ"
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800"
                  />
                </div>
                
                <div className="pt-2 border-t border-slate-100 mt-2">
                  <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider pl-1">
                    QR Code รับเงิน (อัพโหลดรูปภาพ)
                  </label>
                  {profile.promptpayQR && (
                    <div className="mb-4 border border-slate-100 rounded-2xl p-4 bg-slate-50 flex justify-center group relative overflow-hidden">
                       <img src={profile.promptpayQR} alt="PromptPay QR Code" className="max-h-40 object-contain rounded-xl group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <input
                    name="promptpayQRFile"
                    type="file"
                    accept="image/*"
                    className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-slate-50 border border-slate-200 p-2 rounded-2xl focus:outline-none text-sm cursor-pointer transition-all form-input"
                  />
                  <p className="text-[11px] text-slate-400 font-semibold mt-2 px-1">
                    อัพโหลดรูป QR Code ขนาดไม่เกิน 5MB เพื่อให้ลูกตี้สแกนจ่ายง่ายขึ้น
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    💾 บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ประวัติการเข้าร่วมก๊วน */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ตี้ที่ฉันไปรวมด้วย */}
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">🏃</span>
                ตี้ที่ฉันไปแจม (ประวัติการจอง)
              </h2>
              
              {profile.bookings.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[1.5rem] bg-slate-50/50">
                  <p className="text-slate-400 font-bold">ยังไม่เคยไปแจมตี้ไหนเลย ลองหาตี้เตะดูสิ!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {profile.bookings.map((booking: typeof profile.bookings[0]) => (
                    <Link key={booking.id} href={`/posts/${booking.post.id}`} className="block">
                      <div className="border border-slate-100 rounded-2xl p-5 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white hover:bg-slate-50 hover:shadow-md hover:border-blue-200 group relative overflow-hidden">
                        
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl"></div>
                        
                        <div className="pl-2">
                          <p className="font-extrabold text-slate-800 text-lg group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                            {booking.post.fieldName}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-xs font-bold text-slate-600">{booking.post.sportType}</span>
                            <span>{fmtDate(booking.post.startTime)}</span>
                            <span>•</span>
                            <span>{fmtTime(booking.post.startTime)}</span>
                          </div>
                        </div>
                        
                        <div className="shrink-0 ml-2 sm:ml-0">
                          {booking.post.status === 'CANCELLED' ? (
                            <span className="text-xs font-extrabold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> ถูกยกเลิกแล้ว
                            </span>
                          ) : (
                            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
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
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">👑</span>
                ตี้ที่ฉันเปิดเอง (ฐานะ Host)
              </h2>
              
              {profile.posts.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[1.5rem] bg-slate-50/50">
                  <p className="text-slate-400 font-bold">ยังไม่เคยเปิดตี้เองเลย</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {profile.posts.map((post: typeof profile.posts[0]) => (
                    <Link key={post.id} href={`/posts/${post.id}`} className="block">
                      <div className="border border-slate-100 rounded-2xl p-5 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white hover:bg-indigo-50/50 hover:shadow-md hover:border-indigo-200 group relative overflow-hidden">
                        
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl"></div>
                        
                        <div className="pl-2 flex-1 w-full">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-extrabold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {post.fieldName}
                            </p>
                            <span className="text-xs font-bold text-slate-400 whitespace-nowrap hidden sm:inline">
                              {post.bookings.length}/{post.maxPlayers} คน
                            </span>
                          </div>
                          
                          <div className="flex items-center flex-wrap gap-2 text-sm text-slate-500 font-medium">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-xs font-bold text-slate-600">{post.sportType}</span>
                            <span>{fmtDate(post.startTime)}</span>
                            <span className="sm:hidden text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold">
                              คนแจม: {post.bookings.length}/{post.maxPlayers}
                            </span>
                          </div>
                        </div>
                        
                        <div className="shrink-0 ml-2 sm:ml-0 mt-2 sm:mt-0">
                          {post.status === 'CANCELLED' ? (
                            <span className="text-xs font-extrabold text-red-600 bg-red-50 border border-red-100 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> ยกเลิกแล้ว
                            </span>
                          ) : (
                            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
                              <span>⭐</span> โฮสต์
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
