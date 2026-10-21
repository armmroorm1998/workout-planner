// พลังงานที่ร่างกายต้องการต่อวัน: BMR สูตร Mifflin-St Jeor × ระดับกิจกรรม = TDEE

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; factor: number }[] = [
  { value: "sedentary", label: "นั่งทำงาน ไม่ค่อยออกกำลังกาย", factor: 1.2 },
  { value: "light", label: "ออกกำลังกายเบา ๆ 1–3 วัน/สัปดาห์", factor: 1.375 },
  { value: "moderate", label: "ออกกำลังกายปานกลาง 3–5 วัน/สัปดาห์", factor: 1.55 },
  { value: "active", label: "ออกกำลังกายหนัก 6–7 วัน/สัปดาห์", factor: 1.725 },
  { value: "very_active", label: "หนักมาก / ใช้แรงงาน / ซ้อมวันละ 2 รอบ", factor: 1.9 },
];

export function bmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);
}

export function tdee(b: number, activity: ActivityLevel): number {
  return b * (ACTIVITY_LEVELS.find((a) => a.value === activity)?.factor ?? 1.2);
}
