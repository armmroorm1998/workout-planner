import Link from "next/link";
import { DAY_SHORT, type Program } from "@/lib/types";
import { LikeButton, ShareButton } from "./ProgramActions";

export function ProgramCard({ p, showOwner, active, liked }: {
  p: Program; showOwner?: boolean; active?: boolean; liked?: boolean;
}) {
  const workouts = p.days.filter((d) => d.items.some((i) => i.kind === "strength")).length;
  return (
    <div className="card card-hover group relative">
      <div className="flex items-start justify-between gap-2">
        {/* The ::after stretches the link over the whole card; action buttons sit above it with z-10. */}
        <Link href={`/programs/${p.id}`}
          className="text-lg font-bold leading-snug transition-colors after:absolute after:inset-0 after:rounded-3xl group-hover:text-accent">
          {p.title || "ไม่มีชื่อ"}
        </Link>
        <span className="chip shrink-0">{p.visibility === "public" ? "🌏 สาธารณะ" : "🔒 ส่วนตัว"}</span>
      </div>
      {showOwner && <div className="mt-0.5 text-sm text-muted">โดย {p.ownerName || "ไม่ระบุ"}</div>}
      {p.description && <p className="mt-1.5 line-clamp-2 text-sm text-muted">{p.description}</p>}
      <div className="mt-4 flex gap-1.5">
        {DAY_SHORT.map((s, i) => {
          const strength = p.days[i]?.items.some((it) => it.kind === "strength");
          return (
            <span
              key={i}
              title={p.days[i]?.title}
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-semibold transition-transform duration-300 ease-spring group-hover:scale-105 ${
                strength ? "text-accent-ink" : "bg-surface-2 text-muted"
              }`}
              style={strength ? { background: "linear-gradient(135deg, var(--accent), var(--accent-2))", transitionDelay: `${i * 25}ms` } : { transitionDelay: `${i * 25}ms` }}
            >
              {s}
            </span>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>🏋️ เวท {workouts} วัน/สัปดาห์</span>
        {active && <span className="chip chip-accent">⭐ โปรแกรมหลัก</span>}
      </div>
      <div className="relative z-10 mt-3 flex items-center gap-2">
        <LikeButton programId={p.id} liked={!!liked} count={p.likeCount ?? 0} />
        {p.visibility === "public" && <ShareButton programId={p.id} />}
      </div>
    </div>
  );
}
