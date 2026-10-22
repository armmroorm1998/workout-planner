import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Nav } from "@/components/Nav";
import { TopProgress } from "@/components/Loading";

const thai = Noto_Sans_Thai({ variable: "--font-thai", subsets: ["thai", "latin"] });

export const metadata: Metadata = {
  title: "Workout Planner",
  description: "จัดโปรแกรมออกกำลังกาย 7 วัน ติ๊กเช็ก และแชร์ให้คนอื่นใช้",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#070a0f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className={`${thai.variable} antialiased`}>
        <TopProgress />
        <AuthProvider>
          <Nav />
          <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-6 sm:pb-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
