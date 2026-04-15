import prisma from '@/lib/prisma'
import { createBookingPost, joinMatch } from './actions'

export default async function Home() {
  const posts = await prisma.post.findMany({
    include: {
      bookings: true,
      host: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">JongSanam ⚽</h1>
          <p className="text-gray-500 mt-2">หาคนเตะบอล หารค่าสนามง่ายๆ</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">เปิดตี้จองสนามใหม่</h2>
          <form action={createBookingPost} className="grid grid-cols-2 gap-4">
            <input name="fieldName" placeholder="ชื่อสนาม" required className="border p-2 rounded col-span-2" />
            <select name="sportType" className="border p-2 rounded">
              <option value="FOOTBALL">ฟุตบอล (11 คน)</option>
              <option value="FUTSAL">ฟุตซอล (5 คน)</option>
            </select>
            <input type="number" name="maxPlayers" placeholder="ต้องการคนกี่คน?" required className="border p-2 rounded" />
            <input type="number" name="totalPrice" placeholder="ราคาสนามรวม (บาท)" required className="border p-2 rounded" />
            <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition col-span-2">
              โพสต์หาเพื่อนเตะ
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">ตี้ที่กำลังหาคน</h2>
          
          {posts.length === 0 && <p className="text-gray-400">ยังไม่มีคนเปิดตี้เลย เปิดคนแรกเลยสิ!</p>}

          {posts.map((post) => {
            const pricePerPerson = Number(post.totalPrice) / post.maxPlayers;
            const currentPlayers = post.bookings.length;
            const isFull = currentPlayers >= post.maxPlayers;

            return (
              <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                      {post.sportType}
                    </span>
                    <h3 className="text-lg font-bold">{post.fieldName}</h3>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    โฮสต์: {post.host?.name || 'ไม่ระบุชื่อ'} | ราคารวม ฿{Number(post.totalPrice).toLocaleString()}
                  </p>
                  <p className="text-red-500 font-semibold mt-2">
                    🔥 ตกคนละ: ฿{pricePerPerson.toFixed(2)}
                  </p>
                </div>

                <div className="text-right">
                  <div className="mb-2 text-sm font-medium text-gray-600">
                    คนจองแล้ว: {currentPlayers} / {post.maxPlayers}
                  </div>
                  <form action={joinMatch.bind(null, post.id)}>
                    <button 
                      disabled={isFull}
                      className={`px-6 py-2 rounded font-bold text-white transition ${
                        isFull ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {isFull ? 'เต็มแล้ว' : 'กดจองเลย!'}
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}