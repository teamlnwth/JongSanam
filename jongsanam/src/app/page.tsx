import prisma from '@/lib/prisma'
import { createBookingPost, joinMatch } from './actions'
import Link from 'next/link'


export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  const posts = await prisma.post.findMany({
    where: {
      status: 'OPEN',
      startTime: {
        gte: twoDaysAgo, // ซ่อนโพสต์ที่ผ่านมาแล้วเกิน 2 วัน
      },
    },
    include: {
      bookings: true,
      host: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="min-h-screen bg-slate-50/50 p-4 md:p-8 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Hero */}
        <div className="text-center pt-8 pb-4 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-400/20 blur-3xl rounded-full pointer-events-none"></div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-600 mb-4 inline-block drop-shadow-sm">
            JongSanam ⚽
          </h1>
          <p className="text-white font-medium text-lg max-w-md mx-auto drop-shadow-md">เพื่อนขาด สนามว่าง? หาคนเตะบอล หารค่าสนามง่ายๆ จบในที่เดียว</p>
        </div>

        {/* Create Post Form */}
        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <div className="mb-8 relative z-10">
            <h2 className="text-2xl font-bold text-slate-800">เปิดตี้จองสนามใหม่ ✨</h2>
            <p className="text-slate-500 text-sm mt-1">กรอกข้อมูลให้ครบถ้วนเพื่อตั้งตี้และรอเพื่อนมาแจม</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-100 rounded-2xl p-4 mb-6 text-sm font-semibold flex items-center gap-3">
              <span className="text-xl">⚠️</span> {decodeURIComponent(error)}
            </div>
          )}

          <form action={createBookingPost} className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
            <div className="md:col-span-2">
              <input name="fieldName" placeholder="⚽ ชื่อสนาม (ตัวอย่าง: สนามหญ้าเทียมพระราม 9)" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium" />
            </div>
            
            <select name="sportType" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium appearance-none cursor-pointer">
              <option value="FOOTBALL">ฟุตบอล (11 คน)</option>
              <option value="FUTSAL">ฟุตซอล (5-7 คน)</option>
            </select>
            
            <input type="number" name="maxPlayers" placeholder="👥 ต้องการกี่คน?" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium" />
            
            <div className="md:col-span-2 grid grid-cols-2 gap-5 p-5 bg-slate-50/50 rounded-3xl border border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider pl-2">วันและเวลาเริ่ม</label>
                <input type="datetime-local" name="startTime" required className="w-full bg-white border border-slate-200 p-3.5 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider pl-2">ระยะเวลา (ชั่วโมง)</label>
                <input type="number" name="duration" placeholder="เช่น 2" min="1" max="12" step="0.5" required className="w-full bg-white border border-slate-200 p-3.5 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium" />
              </div>
            </div>
            
            <input type="number" name="totalPrice" placeholder="💰 ราคาสนามรวมทั้งหมด (บาท)" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium" />
            
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">🔒</span>
              <input name="passcode" type="password" placeholder="รหัสผ่านห้อง (เว้นว่างถ้าเป็นห้องเปิด)" className="w-full bg-slate-50 border border-slate-200 py-4 pr-4 pl-10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium" />
            </div>

            <button type="submit" className="md:col-span-2 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
              โพสต์หาเพื่อนเตะ 🚀
            </button>
          </form>
        </div>

        {/* Feed Section */}
        <div className="space-y-6 relative z-10">
          <div className="flex items-end justify-between px-2">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">ตี้ที่กำลังหาคน 🔥</h2>
              <p className="text-sm text-white mt-1 drop-shadow-md">เข้าร่วมตี้ที่น่าสนใจ หรือจองที่ว่าง</p>
            </div>
            <div className="bg-slate-200 text-slate-600 font-bold text-xs px-3 py-1 rounded-full">
              {posts.length} สนาม
            </div>
          </div>
          
          {posts.length === 0 && (
            <div className="text-center py-16 bg-white/50 border border-dashed border-slate-300 rounded-[2rem]">
              <div className="text-4xl mb-4">🏟️</div>
              <p className="text-slate-500 font-medium">ยังไม่มีคนเปิดตี้เลย เปิดเป็นคนแรกเลยสิ!</p>
            </div>
          )}

          <div className="grid gap-6">
            {posts.map((post: typeof posts[0]) => {
              const pricePerPerson = Number(post.totalPrice) / post.maxPlayers;
              const currentPlayers = post.bookings.length;
              const isFull = currentPlayers >= post.maxPlayers;
              const hasPasscode = !!post.passcode;

              return (
                <div key={post.id} className="group bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                  <div className="flex-1 w-full">
                    <Link href={`/posts/${post.id}`} className="block w-full">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full font-extrabold tracking-wide">
                          {post.sportType === 'FOOTBALL' ? '⚽ FOOTBALL' : '⚡ FUTSAL'}
                        </span>
                        {hasPasscode && (
                          <span className="bg-amber-50 text-amber-600 border border-amber-100 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
                            <span>🔒</span> Private
                          </span>
                        )}
                        {isFull && (
                          <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-full font-bold">
                            ที่เต็มแล้ว
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">{post.fieldName}</h3>
                    </Link>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center text-[10px]">👤</span> 
                        <span className="font-semibold text-slate-700">{post.host?.name || 'ไม่ระบุชื่อ'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">
                        <span>💰</span> ราคารวม: <span className="font-bold text-slate-700">฿{Number(post.totalPrice).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-4 text-sm font-medium text-slate-600">
                      <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl border border-blue-100">
                        🕐 {post.startTime.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Bangkok' })}
                      </div>
                      <span className="text-slate-300">→</span>
                      <div className="text-slate-500">
                         {new Date(post.startTime.getTime() + post.duration * 60 * 1000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })}
                        <span className="ml-2 px-2 py-0.5 bg-slate-100 rounded-md text-xs font-bold">
                          {post.duration >= 60 ? `${post.duration / 60} ชม.` : `${post.duration} นาที`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto md:min-w-[220px] bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">เฉลี่ยตกคนละ</p>
                    <p className="text-4xl font-black text-emerald-500 drop-shadow-sm mb-4">฿{pricePerPerson.toFixed(0)}</p>
                    
                    <div className="w-full mb-4">
                      <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-500">
                        <span>คนจองแล้ว</span>
                        <span className={isFull ? "text-red-500" : "text-blue-600"}>{currentPlayers} / {post.maxPlayers}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-slate-400' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min((currentPlayers / post.maxPlayers) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {hasPasscode ? (
                      <Link href={`/posts/${post.id}`} className="w-full block text-center bg-slate-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-700 transition-all shadow-md shadow-slate-800/20 active:scale-95">
                        🔒 เข้าร่วม (ใส่รหัส)
                      </Link>
                    ) : (
                      <form action={joinMatch.bind(null, post.id)} className="w-full">
                        <button 
                          disabled={isFull}
                          className={`w-full font-bold py-3 px-4 rounded-xl transition-all shadow-md active:scale-95 ${
                            isFull 
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none active:scale-100' 
                              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-emerald-500/30 hover:shadow-emerald-500/40'
                          }`}
                        >
                          {isFull ? 'เต็มแล้ว 🚫' : 'กดจองเลย! ✅'}
                        </button>
                      </form>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}