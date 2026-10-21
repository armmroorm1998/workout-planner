import { DAY_NAMES, emptyDays, newId, type ExerciseItem, type ProgramDay } from "./types";

/**
 * Turns a plain-text note like
 *   📅 วันจันทร์
 *   ☐ Bench Press
 *   4 × 8-10
 *   น้ำหนัก ______ kg
 *   🏃 Cardio
 *   ☐ วิ่งสลับเดิน 20 นาที
 * into 7 program days.
 */
export function parseNote(text: string): ProgramDay[] {
  const days = emptyDays();
  let dayIdx = -1;
  let cardio = false;
  let last: ExerciseItem | null = null;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("📅") || /^วัน/.test(line)) {
      const found = DAY_NAMES.findIndex((n) => line.includes(n));
      if (found >= 0) {
        dayIdx = found;
        cardio = false;
        last = null;
      }
      continue;
    }
    if (dayIdx < 0) continue;

    if (/cardio/i.test(line) && !/^[☐□\-*]/.test(line)) {
      cardio = true;
      continue;
    }

    const box = line.match(/^(?:☐|□|☑|✅|\[ ?\]|-|\*)\s*(.+)$/);
    if (box) {
      const name = box[1].trim();
      const duration = name.match(/(\d+(?:\s*-\s*\d+)?\s*นาที)/)?.[1];
      last = {
        id: newId(),
        name,
        kind: cardio ? "cardio" : "task",
        ...(duration ? { duration } : {}),
      };
      days[dayIdx].items.push(last);
      continue;
    }

    const sr = line.match(/^(\d+)\s*[×xX*]\s*([\d\-–]+)/);
    if (sr && last) {
      last.kind = "strength";
      last.sets = Number(sr[1]);
      last.reps = sr[2].replace("–", "-");
      continue;
    }
    // "น้ำหนัก ____ kg", "หรือ" and other decoration lines are ignored.
  }

  for (const d of days) {
    const strength = d.items.some((i) => i.kind === "strength");
    if (!strength && d.items.some((i) => i.name.includes("พัก"))) d.title = "พัก / Active recovery";
  }
  return days;
}
