"use client";

import { useState } from "react";
import { DAY_NAMES, DAY_SHORT, newId, type ExerciseItem, type ItemKind, type ProgramDay, type Visibility } from "@/lib/types";
import { parseNote } from "@/lib/parseNote";

export interface EditorValue {
  title: string;
  description: string;
  visibility: Visibility;
  days: ProgramDay[];
}

const KIND_LABEL: Record<ItemKind, string> = { strength: "🏋️ เวท", cardio: "🏃 คาร์ดิโอ", task: "✅ อื่นๆ" };

const blankItem = (kind: ItemKind): ExerciseItem =>
  kind === "strength"
    ? { id: newId(), name: "", kind, sets: 3, reps: "10" }
    : kind === "cardio"
      ? { id: newId(), name: "", kind, duration: "20 นาที" }
      : { id: newId(), name: "", kind };

export function ProgramEditor({
  initial, onSave, saving, submitLabel,
}: {
  initial: EditorValue;
  onSave: (v: EditorValue) => void;
  saving: boolean;
  submitLabel: string;
}) {
  const [v, setV] = useState<EditorValue>(initial);
  const [day, setDay] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [note, setNote] = useState("");

  const setDayData = (i: number, d: Partial<ProgramDay>) =>
    setV((s) => ({ ...s, days: s.days.map((x, j) => (j === i ? { ...x, ...d } : x)) }));

  const items = v.days[day].items;
  const setItems = (next: ExerciseItem[]) => setDayData(day, { items: next });
  const patchItem = (id: string, p: Partial<ExerciseItem>) =>
    setItems(items.map((it) => (it.id === id ? { ...it, ...p } : it)));
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next);
  };

  function copyDayTo(target: number) {
    setDayData(target, {
      title: v.days[day].title,
      items: v.days[day].items.map((it) => ({ ...it, id: newId() })),
    });
    setDay(target);
  }

  function applyImport() {
    const parsed = parseNote(note);
    if (!parsed.some((d) => d.items.length)) {
      alert("ไม่พบรายการ — ตรวจว่าแต่ละวันขึ้นต้นด้วย “📅 วันจันทร์” และแต่ละท่าขึ้นต้นด้วย ☐");
      return;
    }
    setV((s) => ({ ...s, days: parsed.map((d, i) => (d.items.length ? d : s.days[i])) }));
    setImportOpen(false);
    setNote("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = v.days.map((d) => ({
      title: d.title.trim(),
      items: d.items
        .filter((it) => it.name.trim())
        .map((it) => {
          const o: ExerciseItem = { id: it.id, name: it.name.trim(), kind: it.kind };
          if (it.kind === "strength") {
            o.sets = Number(it.sets) || 1;
            o.reps = (it.reps || "").trim();
          }
          if (it.duration?.trim()) o.duration = it.duration.trim();
          if (it.note?.trim()) o.note = it.note.trim();
          return o;
        }),
    }));
    onSave({ ...v, title: v.title.trim(), description: v.description.trim(), days: clean });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="card space-y-3">
        <div>
          <label className="label">ชื่อโปรแกรม</label>
          <input className="input" required placeholder="เช่น Push/Pull/Legs ลดไขมัน" value={v.title}
            onChange={(e) => setV({ ...v, title: e.target.value })} />
        </div>
        <div>
          <label className="label">คำอธิบาย (ไม่บังคับ)</label>
          <textarea className="input min-h-16" placeholder="เหมาะกับใคร เป้าหมาย ข้อควรระวัง" value={v.description}
            onChange={(e) => setV({ ...v, description: e.target.value })} />
        </div>
        <div>
          <span className="label">การมองเห็น</span>
          <div className="grid grid-cols-2 gap-2">
            {(["private", "public"] as Visibility[]).map((opt) => (
              <button type="button" key={opt} onClick={() => setV({ ...v, visibility: opt })}
                className={`rounded-xl border px-3 py-2 text-left text-sm ${
                  v.visibility === opt ? "border-accent bg-accent-soft" : "border-line"}`}>
                <div className="font-medium">{opt === "private" ? "🔒 ส่วนตัว" : "🌏 สาธารณะ"}</div>
                <div className="text-xs text-muted">
                  {opt === "private" ? "เห็นแค่คุณ" : "ทุกคนดูและคัดลอกไปใช้ได้"}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">ตารางรายวัน</h2>
        <button type="button" className="btn btn-sm" onClick={() => setImportOpen(true)}>📝 นำเข้าจากโน้ต</button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAY_SHORT.map((s, i) => (
          <button type="button" key={i} onClick={() => setDay(i)}
            className={`rounded-xl py-2 text-sm ${day === i ? "bg-accent font-semibold text-accent-ink" : "bg-surface border border-line"}`}>
            {s}
            <div className={`text-[10px] ${day === i ? "" : "text-muted"}`}>{v.days[i].items.length || "–"}</div>
          </button>
        ))}
      </div>

      <div className="card space-y-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="label">วัน{DAY_NAMES[day]} — ชื่อวัน</label>
            <input className="input" placeholder="เช่น อก + ไหล่, ขา, พัก" value={v.days[day].title}
              onChange={(e) => setDayData(day, { title: e.target.value })} />
          </div>
          <select className="input w-auto text-sm" value="" onChange={(e) => e.target.value && copyDayTo(Number(e.target.value))}>
            <option value="">คัดลอกไป…</option>
            {DAY_NAMES.map((n, i) => i !== day && <option key={i} value={i}>วัน{n}</option>)}
          </select>
        </div>

        {items.length === 0 && (
          <p className="rounded-xl bg-surface-2 py-6 text-center text-sm text-muted">
            ยังไม่มีรายการ — วันพักก็เพิ่ม “พัก” หรือ “ยืดเหยียด” ได้
          </p>
        )}

        {items.map((it, idx) => (
          <div key={it.id} className="space-y-2 rounded-xl border border-line p-3">
            <div className="flex gap-2">
              <select className="input w-auto text-sm" value={it.kind}
                onChange={(e) => patchItem(it.id, { ...blankItem(e.target.value as ItemKind), id: it.id, name: it.name })}>
                {Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <input className="input" placeholder="ชื่อท่า / กิจกรรม" value={it.name}
                onChange={(e) => patchItem(it.id, { name: e.target.value })} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {it.kind === "strength" && (
                <>
                  <input className="input w-16 text-center" type="number" min={1} value={it.sets ?? ""}
                    onChange={(e) => patchItem(it.id, { sets: Number(e.target.value) })} />
                  <span className="text-muted">×</span>
                  <input className="input w-24 text-center" placeholder="8-10" value={it.reps ?? ""}
                    onChange={(e) => patchItem(it.id, { reps: e.target.value })} />
                  <span className="text-xs text-muted">เซ็ต × ครั้ง</span>
                </>
              )}
              {it.kind !== "strength" && (
                <input className="input w-32" placeholder="ระยะเวลา" value={it.duration ?? ""}
                  onChange={(e) => patchItem(it.id, { duration: e.target.value })} />
              )}
              <input className="input min-w-32 flex-1" placeholder="หมายเหตุ" value={it.note ?? ""}
                onChange={(e) => patchItem(it.id, { note: e.target.value })} />
            </div>
            <div className="flex justify-end gap-1">
              <button type="button" className="btn btn-sm" onClick={() => move(idx, -1)} aria-label="เลื่อนขึ้น">↑</button>
              <button type="button" className="btn btn-sm" onClick={() => move(idx, 1)} aria-label="เลื่อนลง">↓</button>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => setItems(items.filter((x) => x.id !== it.id))}>ลบ</button>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          {(Object.keys(KIND_LABEL) as ItemKind[]).map((k) => (
            <button type="button" key={k} className="btn btn-sm" onClick={() => setItems([...items, blankItem(k)])}>
              + {KIND_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="sticky bottom-16 z-10 sm:bottom-4">
        <button className="btn btn-primary w-full py-3 shadow-lg" disabled={saving}>
          {saving ? "กำลังบันทึก…" : submitLabel}
        </button>
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="card w-full max-w-lg space-y-3">
            <h3 className="font-semibold">นำเข้าจากโน้ต</h3>
            <p className="text-sm text-muted">
              วางโน้ตในรูปแบบ “📅 วันจันทร์” ตามด้วย “☐ ชื่อท่า” และบรรทัด “4 × 8-10” — วันที่มีข้อมูลจะถูกแทนที่
            </p>
            <textarea className="input min-h-64 font-mono text-xs" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder={"📅 วันจันทร์\n☐ Bench Press\n4 × 8-10\n🏃 Cardio\n☐ วิ่งสลับเดิน 20 นาที"} />
            <div className="flex justify-end gap-2">
              <button type="button" className="btn" onClick={() => setImportOpen(false)}>ยกเลิก</button>
              <button type="button" className="btn btn-primary" onClick={applyImport}>นำเข้า</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
