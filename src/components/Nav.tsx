"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

const LINKS = [
  { href: "/", label: "วันนี้", icon: "🔥" },
  { href: "/programs", label: "โปรแกรมของฉัน", icon: "📋" },
  { href: "/explore", label: "สำรวจ", icon: "🌏" },
  { href: "/profile", label: "โปรไฟล์", icon: "👤" },
];

export function Nav() {
  const { user } = useAuth();
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="font-semibold">
            💪 Workout Planner
          </Link>
          {user ? (
            <nav className="hidden gap-1 sm:flex">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    active(l.href) ? "bg-accent-soft text-accent" : "text-muted hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className="btn btn-sm btn-primary">เข้าสู่ระบบ</Link>
            </div>
          )}
        </div>
      </header>

      {user && (
        <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center py-2 text-[11px] ${
                active(l.href) ? "text-accent" : "text-muted"
              }`}
            >
              <span className="text-lg leading-none">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
