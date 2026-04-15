import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import Link from "next/link";

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
      <body className="min-h-full flex flex-col">
        {user && (
          <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow-md">
            <Link href="/" className="font-black text-xl tracking-tight">
              JongSanam ⚽
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-blue-200 text-sm hidden sm:block">
                {user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition"
                >
                  ออกจากระบบ
                </button>
              </form>
            </div>
          </nav>
        )}
        {children}
      </body>
    </html>
  );
}
