import Link from "next/link";
import { DAY_SHORT, type Program } from "@/lib/types";

export function ProgramCard({ p, showOwner }: { p: Program; showOwner?: boolean }) {
  const workouts = p.days.filter((d) => d.items.some((i) => i.kind === "strength")).length;
  return (
    <Link href={`/programs/${p.id}`} className="card block transition hover:border-accent">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{p.title || "ไม่มีชื่อ"}</h3>
        <span className="chip shrink-0">{p.visibility === "public" ? "🌏 สาธารณะ" : "🔒 ส่วนตัว"}</span>
      </div>
      {showOwner && <div className="text-sm text-muted">โดย {p.ownerName || "ไม่ระบุ"}</div>}
      {p.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{p.description}</p>}
      <div className="mt-3 flex gap-1">
        {DAY_SHORT.map((s, i) => {
          const strength = p.days[i]?.items.some((it) => it.kind === "strength");
          return (
            <span key={i} title={p.days[i]?.title}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] ${
                strength ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted"}`}>
              {s}
            </span>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-muted">เวท {workouts} วัน/สัปดาห์</div>
    </Link>
  );
}
