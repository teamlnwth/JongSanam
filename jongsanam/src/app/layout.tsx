import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import Link from "next/link";
import { NotificationBell } from "@/components/NotificationBell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JongSanam ⚽ - หาคนเตะบอล",
  description: "หาคนเตะบอล หารค่าสนามง่ายๆ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0F19] text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
        <nav className="sticky top-0 z-50 bg-[#0B0F19]/60 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between transition-all">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              JS
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white hidden sm:inline">
              JongSanam<span className="text-blue-500">.io</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="hidden md:block text-sm font-medium hover:text-white transition-colors text-slate-300">Live Dashboard</Link>
            {user ? (
              <>
                <NotificationBell />
                {user.email === 'pakawatpromhom@gmail.com' && (
                  <Link href="/admin" className="flex items-center gap-1.5 text-blue-400 bg-white/5 hover:bg-white/10 font-bold text-xs px-3 py-1.5 rounded-full transition-colors border border-white/10">
                    <span>👑</span> <span className="hidden sm:inline">Admin System</span>
                  </Link>
                )}
                <Link href="/profile" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 shadow-sm text-slate-300 hover:text-white text-sm font-bold px-3 sm:px-4 py-1.5 rounded-xl transition duration-200">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">My Profile</span>
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="bg-white/5 hover:bg-red-500/20 border border-white/10 shadow-sm text-slate-300 hover:text-red-400 text-sm font-bold px-3 sm:px-4 py-1.5 rounded-xl transition duration-200"
                  >
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden">🚪</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium hover:text-white transition-colors text-slate-300">Sign in</Link>
                <Link href="/register" className="text-sm font-semibold bg-white text-slate-900 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors">Get Started</Link>
              </div>
            )}
          </div>
        </nav>
        <div className="flex-1 w-full relative">
          {children}
        </div>
      </body>
    </html>
  );
}
