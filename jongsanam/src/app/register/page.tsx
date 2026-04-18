import { signUp } from '@/app/auth/actions'
import Link from 'next/link'
import { SubmitButton } from '@/components/SubmitButton'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden relative flex items-center justify-center p-6">
      {/* Abstract Glowing Backgrounds (ดึงมาจากหน้าอื่นๆ) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">JongSanam</span> ⚽
          </h1>
          <p className="text-slate-400 text-sm">หาคนเตะบอล หารค่าสนามง่ายๆ</p>
        </div>

        {/* Card */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

          <div className="mb-8 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></span>
              <h2 className="text-2xl font-bold text-white">สมัครสมาชิก</h2>
            </div>
            <p className="text-slate-400 text-sm">สร้างบัญชีใหม่เพื่อตั้งตี้และเข้าร่วมแมตช์</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm font-semibold flex items-center gap-3 relative z-10">
              <span className="text-lg">⚠️</span> {decodeURIComponent(error)}
            </div>
          )}

          <form action={signUp} className="space-y-5 relative z-10">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                ชื่อเล่น / ชื่อจริง
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="เช่น กันต์"
                className="w-full bg-black/30 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                อีเมล
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="example@email.com"
                className="w-full bg-black/30 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                รหัสผ่าน
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="อย่างน้อย 6 ตัวอักษร"
                minLength={6}
                className="w-full bg-black/30 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 text-sm text-white"
              />
            </div>

            <div className="pt-2">
              <SubmitButton
                isFullWidth
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200"
              >
                สมัครสมาชิก
              </SubmitButton>
            </div>
          </form>

          <p className="text-center text-slate-400 text-sm mt-8 relative z-10 border-t border-white/10 pt-6">
            มีบัญชีแล้ว?{' '}
            <Link
              href="/login"
              className="text-blue-400 font-bold hover:text-blue-300 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}