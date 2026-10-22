"use client";

import { useEffect, useRef, useState } from "react";
import { getWeekLog, saveLogEntry } from "@/lib/db";
import { DAY_NAMES, DAY_SHORT, type LogEntry, type Program } from "@/lib/types";
import { addDays, formatShort, formatWeekKey, mondayOf, todayIndex, weekKey } from "@/lib/week";
import { ItemMeta } from "./ItemMeta";
import { Skeleton } from "./Loading";
import { VideoButton } from "./VideoButton";

export function WeekTracker({ program, uid }: { program: Program; uid: string }) {
  const [monday, setMonday] = useState(() => mondayOf(new Date()));
  const [day, setDay] = useState(() => todayIndex());
  const [entries, setEntries] = useState<Record<string, LogEntry>>({});
  const [prev, setPrev] = useState<Record<string, LogEntry>>({});
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(0);
  const [savedAt, setSavedAt] = useState(0);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const week = weekKey(monday);
  const isThisWeek = week === weekKey(new Date());

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    Promise.all([
      getWeekLog(uid, program.id, week),
      getWeekLog(uid, program.id, weekKey(addDays(monday, -7))),
    ])
      .then(([cur, last]) => {
        if (cancelled) return;
        setEntries(cur.entries ?? {});
        setPrev(last.entries ?? {});
        setLoaded(true);
      })
      .catch((e) => setError(String(e?.message ?? e)));
    return () => {
      cancelled = true;
    };
  }, [uid, program.id, week, monday]);

  function update(itemId: string, patch: Partial<LogEntry>, delay = 0) {
    const next: LogEntry = { ...(entries[itemId] ?? { done: false }), ...patch };
    setEntries((s) => ({ ...s, [itemId]: next }));
    clearTimeout(timers.current[itemId]);
    timers.current[itemId] = setTimeout(() => {
      setSaving((n) => n + 1);
      saveLogEntry(uid, program.id, week, itemId, next)
        .then(() => setSavedAt(Date.now()))
        .catch((e) => setError(String(e?.message ?? e)))
        .finally(() => setSaving((n) => n - 1));
    }, delay);
  }

  const dayDone = (i: number) => {
    const items = program.days[i]?.items ?? [];
    const done = items.filter((it) => entries[it.id]?.done).length;
    return { done, total: items.length };
  };
  const { done, total } = dayDone(day);
  const items = program.days[day]?.items ?? [];

  const complete = total > 0 && done === total;

  return (
    <div className="space-y-4">
      <div className="fade-up flex items-center justify-between gap-2">
        <button className="btn btn-sm" onClick={() => setMonday(addDays(monday, -7))} aria-label="สัปดาห์ก่อน">‹</button>
        <div key={week} className="scale-in text-center text-sm">
          <div className="font-semibold">{isThisWeek ? "สัปดาห์นี้" : formatWeekKey(week)}</div>
          <div className="text-xs text-muted">{formatShort(monday)} – {formatShort(addDays(monday, 6))}</div>
        </div>
        <button className="btn btn-sm" onClick={() => setMonday(addDays(monday, 7))} aria-label="สัปดาห์ถัดไป">›</button>
      </div>

      <div className="stagger grid grid-cols-7 gap-1.5">
        {DAY_SHORT.map((s, i) => {
          const d = dayDone(i);
          const allDone = d.total > 0 && d.done === d.total;
          const today = isThisWeek && i === todayIndex();
          const selected = day === i;
          return (
            <button key={i} onClick={() => setDay(i)} className={`pill ${selected ? "pill-active" : ""}`}>
              <div className="text-xs">{s}</div>
              <div className={`text-base font-bold leading-tight ${selected ? "" : today ? "text-accent" : ""}`}>
                {addDays(monday, i).getDate()}
              </div>
              <div className={`mx-auto mt-1 h-1 w-5 rounded-full transition-colors duration-500 ${
                selected ? "bg-accent-ink/40" : allDone ? "bg-accent" : d.done ? "bg-accent/40" : "bg-surface-2"}`} />
              {today && !selected && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />}
              {allDone && <span className="scale-in absolute -right-1 -top-1 text-xs">✅</span>}
            </button>
          );
        })}
      </div>

      <div className={`card transition-shadow duration-700 ${complete ? "ring-2 ring-accent/40" : ""}`}
        style={complete ? { boxShadow: "var(--shadow-lg), 0 0 40px -10px var(--glow)" } : undefined}>
        <div className="mb-4 flex items-start justify-between gap-2">
          <div key={day} className="fade-up">
            <h3 className="text-xl font-bold">วัน{DAY_NAMES[day]}</h3>
            {program.days[day]?.title && <div className="text-sm text-muted">{program.days[day].title}</div>}
          </div>
          <div className="flex items-center gap-2">
            {saving > 0 ? (
              <span className="chip"><span className="spinner h-3 w-3" /> กำลังบันทึก</span>
            ) : savedAt > 0 ? (
              <span key={savedAt} className="chip chip-accent scale-in">✓ บันทึกแล้ว</span>
            ) : null}
            {total > 0 && (
              <span className={`text-sm font-semibold tabular-nums ${complete ? "text-accent" : "text-muted"}`}>{done}/{total}</span>
            )}
          </div>
        </div>
        {total > 0 && (
          <div className="progress mb-4">
            <div style={{ width: `${(done / total) * 100}%` }} />
          </div>
        )}
        {complete && (
          <p className="toast mb-3 rounded-2xl bg-accent-soft px-3 py-2 text-center text-sm font-semibold text-accent">
            🎉 ครบทุกรายการแล้ว เก่งมาก!
          </p>
        )}

        {error && <p className="toast mb-2 rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger">บันทึกไม่สำเร็จ: {error}</p>}
        {!loaded && !error && (
          <div className="space-y-4 py-1">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-7 w-7" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            ))}
          </div>
        )}
        {loaded && items.length === 0 && (
          <div className="fade-up py-8 text-center">
            <div className="text-4xl">😴</div>
            <p className="mt-2 text-muted">วันพัก ไม่มีรายการวันนี้</p>
          </div>
        )}

        <ul key={`${week}-${day}`} className="stagger divide-y divide-line">
          {loaded && items.map((it) => {
            const e = entries[it.id];
            return (
              <li key={it.id} className="flex items-center gap-3 py-3">
                <input type="checkbox" className="check"
                  checked={!!e?.done} onChange={(ev) => update(it.id, { done: ev.target.checked })} />
                <div className="min-w-0 flex-1">
                  <div className={`font-medium transition-all duration-300 ${e?.done ? "text-muted line-through decoration-accent decoration-2" : ""}`}>
                    {it.kind === "cardio" && "🏃 "}{it.name}
                  </div>
                  <ItemMeta item={it} />
                  <VideoButton url={it.videoUrl} credit={it.videoCredit} title={it.name} className="mt-1.5" />
                </div>
                {it.kind === "strength" && (
                  <label className="flex shrink-0 items-center gap-1.5 text-sm text-muted">
                    <input className="input w-20 px-2 py-1.5 text-right font-semibold tabular-nums" inputMode="decimal"
                      placeholder={prev[it.id]?.weight || "—"} value={e?.weight ?? ""}
                      onChange={(ev) => {
                        // Numbers only (e.g. 20, 22.5); a comma from some keyboards counts as the decimal point.
                        const v = ev.target.value.replace(",", ".");
                        if (/^\d{0,4}(\.\d{0,2})?$/.test(v)) update(it.id, { weight: v }, 600);
                      }} />
                    kg
                  </label>
                )}
              </li>
            );
          })}
        </ul>
        {loaded && items.some((i) => i.kind === "strength") && (
          <p className="mt-3 text-xs text-muted">💡 ตัวเลขจาง ๆ ในช่องน้ำหนัก = น้ำหนักที่ใช้สัปดาห์ก่อน</p>
        )}
      </div>
    </div>
  );
}
