// ISO-8601 week helpers. Monday is day index 0.

export function todayIndex(d = new Date()): number {
  return (d.getDay() + 6) % 7;
}

export function mondayOf(d: Date): Date {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  m.setDate(m.getDate() - todayIndex(m));
  return m;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function weekKey(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function formatShort(d: Date): string {
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

/** "2026-W33" → "สัปดาห์ที่ 33 ปี 2026" */
export function formatWeekKey(key: string): string {
  const [year, week] = key.split("-W");
  return `สัปดาห์ที่ ${Number(week)} ปี ${year}`;
}
