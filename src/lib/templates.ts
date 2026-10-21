import { parseNote } from "./parseNote";
import type { ProgramDay } from "./types";

export const SAMPLE_NOTE = `📅 วันจันทร์
☐ Bench Press
4 × 8-10
☐ Incline Dumbbell Press
3 × 10-12
☐ Pec Deck / Cable Fly
3 × 12-15
☐ Shoulder Press
3 × 10-12
☐ Lateral Raise
3 × 15
☐ Rope Pushdown
3 × 12
🏃 Cardio
☐ วิ่งสลับเดิน 20 นาที

📅 วันอังคาร
☐ Lat Pulldown
4 × 10
☐ Seated Cable Row
4 × 10
☐ One-arm Dumbbell Row
3 × 12
☐ Face Pull
3 × 15
☐ Dumbbell Curl
3 × 12
☐ Hammer Curl
3 × 12
🏃 Cardio
☐ วิ่งสลับเดิน 20 นาที

📅 วันพุธ
☐ พัก
หรือ
☐ เดิน 30 นาที
☐ ยืดเหยียด 10 นาที

📅 วันพฤหัส
☐ Squat หรือ Leg Press
4 × 10
☐ Romanian Deadlift
3 × 10
☐ Walking Lunge
3 × 12
☐ Leg Extension
3 × 12
☐ Leg Curl
3 × 12
☐ Standing Calf Raise
4 × 15
🏃 Cardio
☐ วิ่งสลับเดิน 20 นาที

📅 วันศุกร์
☐ Incline Bench Press
3 × 10
☐ Lat Pulldown
3 × 10
☐ Chest Supported Row
3 × 10
☐ Shoulder Press
3 × 10
☐ Lateral Raise
3 × 15
☐ Rope Pushdown
2 × 12
☐ Dumbbell Curl
2 × 12
🏃 Cardio
☐ วิ่งสลับเดิน 20 นาที

📅 วันเสาร์
☐ พัก
หรือ
☐ เดิน 30-45 นาที
☐ ยืดเหยียด

📅 วันอาทิตย์
☐ พัก
☐ เตรียมอาหารสำหรับสัปดาห์
☐ ชั่งน้ำหนักตอนเช้า`;

const TITLES = ["อก + ไหล่ + หลังแขน", "หลัง + หน้าแขน", "", "ขา", "Upper body", "", "พัก + เตรียมตัว"];

export function sampleDays(): ProgramDay[] {
  return parseNote(SAMPLE_NOTE).map((d, i) => ({ ...d, title: TITLES[i] || d.title }));
}
