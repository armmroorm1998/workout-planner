import { bmr, tdee } from "@/lib/calories";
import type { ProfileForm } from "./ProfileFields";

const kcal = (n: number) => Math.round(n).toLocaleString("th-TH");

/** BMR / TDEE and daily calorie targets, recalculated live from the profile form. */
export function CalorieCard({ form }: { form: ProfileForm }) {
  const [age, height, weight] = [Number(form.age), Number(form.height), Number(form.weight)];
  if (!form.sex || !form.activity || !(age > 0 && height > 0 && weight > 0)) return null;

  const b = bmr(form.sex, weight, height, age);
  const t = tdee(b, form.activity);
  // Don't suggest eating below BMR when cutting.
  const targets = [
    { label: "ลดไขมัน", value: Math.max(t - 500, b), note: "≈ −0.5 กก./สัปดาห์" },
    { label: "คงน้ำหนัก", value: t, note: "เท่ากับ TDEE" },
    { label: "เพิ่มกล้าม", value: t + 300, note: "≈ +0.25 กก./สัปดาห์" },
  ];

  return (
    <div className="space-y-2 rounded-xl bg-surface-2 px-3 py-3 text-sm">
      <div className="flex justify-between gap-2">
        <span>
          🔥 TDEE <b>{kcal(t)}</b> kcal/วัน
        </span>
        <span className="text-muted">BMR {kcal(b)}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {targets.map((x) => (
          <div key={x.label} className="rounded-lg bg-surface px-2 py-2">
            <div className="text-xs text-muted">{x.label}</div>
            <div className="font-semibold">{kcal(x.value)}</div>
            <div className="text-[11px] text-muted">{x.note}</div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted">
        BMR = พลังงานที่ใช้ตอนพักเฉย ๆ · TDEE = พลังงานที่ใช้ทั้งวันรวมกิจกรรม (ค่าประมาณจากสูตร Mifflin-St Jeor)
      </p>
    </div>
  );
}
