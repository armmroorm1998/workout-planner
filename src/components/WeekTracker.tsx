"use client";

import { useEffect, useRef, useState } from "react";
import { getWeekLog, saveLogEntry } from "@/lib/db";
import { DAY_NAMES, DAY_SHORT, type LogEntry, type Program } from "@/lib/types";
import { addDays, formatShort, formatWeekKey, mondayOf, todayIndex, weekKey } from "@/lib/week";
import { ItemMeta } from "./ItemMeta";

export function WeekTracker({ program, uid }: { program: Program; uid: string }) {
  const [monday, setMonday] = useState(() => mondayOf(new Date()));
  const [day, setDay] = useState(() => todayIndex());
  const [entries, setEntries] = useState<Record<string, LogEntry>>({});
  const [prev, setPrev] = useState<Record<string, LogEntry>>({});
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
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
      saveLogEntry(uid, program.id, week, itemId, next).catch((e) => setError(String(e?.message ?? e)));
    }, delay);
  }

  const dayDone = (i: number) => {
    const items = program.days[i]?.items ?? [];
    const done = items.filter((it) => entries[it.id]?.done).length;
    return { done, total: items.length };
  };
  const { done, total } = dayDone(day);
  const items = program.days[day]?.items ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button className="btn btn-sm" onClick={() => setMonday(addDays(monday, -7))}>‹ สัปดาห์ก่อน</button>
        <div className="text-center text-sm">
          <div className="font-medium">{isThisWeek ? "สัปดาห์นี้" : formatWeekKey(week)}</div>
          <div className="text-xs text-muted">{formatShort(monday)} – {formatShort(addDays(monday, 6))}</div>
        </div>
        <button className="btn btn-sm" onClick={() => setMonday(addDays(monday, 7))}>ถัดไป ›</button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAY_SHORT.map((s, i) => {
          const d = dayDone(i);
          const complete = d.total > 0 && d.done === d.total;
          const today = isThisWeek && i === todayIndex();
          return (
            <button key={i} onClick={() => setDay(i)}
              className={`relative rounded-xl border py-2 text-sm ${
                day === i ? "border-accent bg-accent-soft font-semibold" : "border-line bg-surface"}`}>
              {s}
              <div className="text-[10px] text-muted">{addDays(monday, i).getDate()}</div>
              <div className={`mx-auto mt-1 h-1 w-6 rounded-full ${
                complete ? "bg-accent" : d.done ? "bg-accent/40" : "bg-surface-2"}`} />
              {today && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>

      <div className="card">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold">วัน{DAY_NAMES[day]}</h3>
            {program.days[day]?.title && <div className="text-sm text-muted">{program.days[day].title}</div>}
          </div>
          {total > 0 && <div className="text-sm text-muted">{done}/{total}</div>}
        </div>
        {total > 0 && (
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(done / total) * 100}%` }} />
          </div>
        )}

        {error && <p className="mb-2 text-sm text-danger">บันทึกไม่สำเร็จ: {error}</p>}
        {!loaded && !error && <p className="py-6 text-center text-sm text-muted">กำลังโหลด…</p>}
        {loaded && items.length === 0 && <p className="py-6 text-center text-muted">ไม่มีรายการวันนี้ 😴</p>}

        <ul className="divide-y divide-line">
          {loaded && items.map((it) => {
            const e = entries[it.id];
            return (
              <li key={it.id} className="flex items-start gap-3 py-3">
                <input type="checkbox" className="mt-1 h-6 w-6 shrink-0 accent-[var(--accent)]"
                  checked={!!e?.done} onChange={(ev) => update(it.id, { done: ev.target.checked })} />
                <div className="min-w-0 flex-1">
                  <div className={`font-medium ${e?.done ? "text-muted line-through" : ""}`}>
                    {it.kind === "cardio" && "🏃 "}{it.name}
                  </div>
                  <ItemMeta item={it} />
                </div>
                {it.kind === "strength" && (
                  <label className="flex shrink-0 items-center gap-1 text-sm text-muted">
                    <input className="input w-20 px-2 py-1 text-right" inputMode="decimal"
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
          <p className="mt-2 text-xs text-muted">ตัวเลขจาง ๆ ในช่องน้ำหนัก = น้ำหนักที่ใช้สัปดาห์ก่อน</p>
        )}
      </div>
    </div>
  );
}
