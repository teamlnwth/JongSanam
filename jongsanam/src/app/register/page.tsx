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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2">JongSanam ⚽</h1>
          <p className="text-blue-300 text-sm">หาคนเตะบอล หารค่าสนามง่ายๆ</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">สมัครสมาชิก</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-400/40 text-red-200 rounded-lg px-4 py-3 mb-5 text-sm">
              ⚠️ {decodeURIComponent(error)}
            </div>
          )}

          <form action={signUp} className="space-y-4">
            <div>
              <label className="block text-blue-200 text-sm font-medium mb-1">
                ชื่อเล่น / ชื่อจริง
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="เช่น กันต์"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div>
              <label className="block text-blue-200 text-sm font-medium mb-1">
                อีเมล
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="example@email.com"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div>
              <label className="block text-blue-200 text-sm font-medium mb-1">
                รหัสผ่าน
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="อย่างน้อย 6 ตัวอักษร"
                minLength={6}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <SubmitButton
              isFullWidth
              className="bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-green-500/30 mt-2"
            >
              สมัครสมาชิก
            </SubmitButton>
          </form>

          <p className="text-center text-blue-300 text-sm mt-6">
            มีบัญชีแล้ว?{' '}
            <Link
              href="/login"
              className="text-white font-semibold hover:text-blue-200 underline underline-offset-2 transition"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
