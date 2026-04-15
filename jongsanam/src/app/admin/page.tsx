import { getUser } from '@/app/actions'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { toggleBanStatus } from './actions'

export default async function AdminDashboardPage() {
  const currentProfile = await getUser()

  if (currentProfile.role !== 'ADMIN') {
    redirect('/')
  }

  const allUsers = await prisma.profile.findMany({
    include: {
      _count: {
        select: { posts: true, bookings: true },
      },
    },
    orderBy: { email: 'asc' },
  })


  const totalUsers = allUsers.length
  const totalPosts = allUsers.reduce((sum: number, u: typeof allUsers[0]) => sum + u._count.posts, 0)
  const totalBanned = allUsers.filter((u: typeof allUsers[0]) => u.isBanned).length

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 md:p-12 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight">
              ระบบจัดการสำหรับ Admin 👑
            </h1>
            <p className="text-slate-500 mt-2 font-medium">จัดการผู้ใช้และสถิติการใช้งานทั้งหมดของ JongSanam</p>
          </div>
          <Link href="/" className="group flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md border border-slate-200 transition-all text-sm font-bold text-slate-700 hover:text-blue-600">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> กลับหน้าโฮม
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">บัญชีทั้งหมด</p>
                <p className="text-4xl font-black text-slate-800">{totalUsers}</p>
              </div>
              <div className="text-5xl drop-shadow-sm">👥</div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">การเปิดตี้</p>
                <p className="text-4xl font-black text-slate-800">{totalPosts}</p>
              </div>
              <div className="text-5xl drop-shadow-sm">⚽</div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">ถูกระงับ (แบน)</p>
                <p className="text-4xl font-black text-red-500">{totalBanned}</p>
              </div>
              <div className="text-5xl drop-shadow-sm">⚠️</div>
            </div>
          </div>
        </div>

        {/* Users Table Section */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-white/50 backdrop-blur-xl">
            <h2 className="text-2xl font-extrabold text-slate-800">รายชื่อผู้ใช้ในระบบ</h2>
            <p className="text-sm text-slate-500 mt-1">จัดการสแกนและควบคุมบัญชีผู้ใช้งานได้จากที่นี่</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="p-5 pl-8 tracking-wide">ผู้ใช้งาน (Email)</th>
                  <th className="p-5 tracking-wide">สิทธิ์ (Role)</th>
                  <th className="p-5 text-center tracking-wide">ตั้งตี้ (ครั้ง)</th>
                  <th className="p-5 text-center tracking-wide">แจมตี้ (ครั้ง)</th>
                  <th className="p-5 pr-8 text-right tracking-wide">การควบคุม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allUsers.map((u: typeof allUsers[0]) => (
                  <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-5 pl-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center font-bold text-slate-500 shadow-inner">
                          {u.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{u.name || 'ไม่ระบุชื่อ'}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      {u.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-xs border border-indigo-200/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          USER
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-center font-medium text-slate-700">{u._count.posts}</td>
                    <td className="p-5 text-center font-medium text-slate-700">{u._count.bookings}</td>
                    <td className="p-5 pr-8 text-right">
                      <form action={toggleBanStatus.bind(null, u.id, u.isBanned)}>
                        {u.id === currentProfile.id ? (
                          <span className="inline-block px-4 py-2 text-xs font-bold text-slate-400 bg-slate-50 rounded-xl">บัญชีของคุณ</span>
                        ) : (
                          <button
                            type="submit"
                            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 ${u.isBanned
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-md hover:shadow-emerald-500/20'
                              : 'bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                              }`}
                          >
                            {u.isBanned ? 'ปลดแบนบัญชี' : 'ระงับบัญชี'}
                          </button>
                        )}
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  )
}
