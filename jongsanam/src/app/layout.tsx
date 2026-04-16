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
      <body className="min-h-full flex flex-col bg-slate-50 relative selection:bg-blue-500/30">
        {user && (
          <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/50 shadow-[0_4px_30px_rgb(0,0,0,0.03)] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between transition-all">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-sm shadow-blue-500/30 flex items-center justify-center text-white font-black text-sm group-hover:scale-105 transition-transform">
                J
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 hidden sm:inline">
                JongSanam
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationBell />
              {user.email === 'pakawatpromhom@gmail.com' && (
                <Link href="/admin" className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold text-xs px-3 py-1.5 rounded-full transition-colors border border-indigo-100">
                  <span>👑</span> <span className="hidden sm:inline">จัดการระบบ</span>
                </Link>
              )}
              <Link href="/profile" className="flex items-center gap-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 shadow-sm text-slate-700 hover:text-blue-600 text-sm font-bold px-3 sm:px-4 py-1.5 rounded-xl transition duration-200">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">โปรไฟล์ของฉัน</span>
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-600 hover:text-red-600 text-sm font-bold px-3 sm:px-4 py-1.5 rounded-xl transition duration-200"
                >
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                  <span className="sm:hidden">🚪</span>
                </button>
              </form>
            </div>
          </nav>
        )}
        <div className="flex-1 w-full relative">
          {children}
        </div>
      </body>
    </html>
  );
}
