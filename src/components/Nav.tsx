"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/", label: "วันนี้", icon: "🔥" },
  { href: "/programs", label: "โปรแกรม", icon: "📋" },
  { href: "/explore", label: "ค้นหา", icon: "🌏" },
  { href: "/profile", label: "โปรไฟล์", icon: "👤" },
];

export function Nav() {
  const { user } = useAuth();
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const activeIndex = LINKS.findIndex((l) => isActive(l.href));

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/60 backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="group flex items-center gap-2 font-bold tracking-tight">
            <Logo
              size={36}
              className="rounded-xl transition duration-500 ease-spring group-hover:rotate-[-8deg] group-hover:scale-110"
            />
            <span>
              Workout<span className="text-gradient">Planner</span>
            </span>
          </Link>
          {user ? (
            <nav className="relative hidden rounded-2xl border border-line bg-surface p-1 backdrop-blur sm:grid sm:grid-cols-4">
              {activeIndex >= 0 && (
                <span
                  className="absolute inset-y-1 left-1 rounded-xl bg-accent-soft transition-transform duration-500 ease-spring"
                  style={{ width: "calc((100% - 0.5rem) / 4)", transform: `translateX(${activeIndex * 100}%)` }}
                />
              )}
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative z-10 rounded-xl px-4 py-1.5 text-center text-sm font-medium transition-colors ${
                    isActive(l.href) ? "text-accent" : "text-muted hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          ) : (
            path !== "/login" && <Link href="/login" className="btn btn-sm">มีรหัสแล้ว? เข้าสู่ระบบ</Link>
          )}
        </div>
      </header>

      {user && (
        <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 sm:hidden">
          <div
            className="relative grid grid-cols-4 rounded-3xl border border-line bg-surface-solid/80 p-1.5 backdrop-blur-2xl backdrop-saturate-150"
            style={{ boxShadow: "var(--shadow-lg)" }}
          >
            {activeIndex >= 0 && (
              <span
                className="absolute inset-y-1.5 left-1.5 rounded-2xl transition-transform duration-500 ease-spring"
                style={{
                  width: "calc((100% - 0.75rem) / 4)",
                  transform: `translateX(${activeIndex * 100}%)`,
                  background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                  boxShadow: "0 6px 18px -6px var(--glow)",
                }}
              />
            )}
            {LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative z-10 flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-medium transition-colors duration-300 ${
                    active ? "text-accent-ink" : "text-muted"
                  }`}
                >
                  <span className={`text-lg leading-none transition-transform duration-500 ease-spring ${active ? "scale-110 -translate-y-0.5" : ""}`}>
                    {l.icon}
                  </span>
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
