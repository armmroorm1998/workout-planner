"use client";

import { ACTIVITY_LEVELS, type ActivityLevel, type Sex } from "@/lib/calories";
import type { UserProfile } from "@/lib/types";

export interface ProfileForm {
  name: string;
  age: string;
  height: string;
  weight: string;
  sex: "" | Sex;
  activity: "" | ActivityLevel;
}

export const emptyProfileForm: ProfileForm = { name: "", age: "", height: "", weight: "", sex: "", activity: "" };

export function ProfileFields({ value, onChange }: { value: ProfileForm; onChange: (v: ProfileForm) => void }) {
  const set = (k: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...value, [k]: e.target.value });

  return (
    <>
      <div>
        <label className="label">ชื่อ</label>
        <input className="input" required value={value.name} onChange={set("name")} />
      </div>
      <div>
        <label className="label">เพศ</label>
        <div className="grid grid-cols-2 gap-2">
          {([["male", "ชาย"], ["female", "หญิง"]] as const).map(([v, label]) => (
            <label key={v} className={`pill cursor-pointer py-2.5 text-center font-medium ${value.sex === v ? "pill-active" : ""}`}>
              <input type="radio" name="sex" className="sr-only" required value={v} checked={value.sex === v} onChange={set("sex")} />
              {v === "male" ? "👨 " : "👩 "}{label}
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="label">อายุ (ปี)</label>
          <input className="input" type="number" inputMode="numeric" min={5} max={120} required value={value.age} onChange={set("age")} />
        </div>
        <div>
          <label className="label">ส่วนสูง (ซม.)</label>
          <input className="input" type="number" inputMode="decimal" min={50} max={250} step="0.1" required value={value.height} onChange={set("height")} />
        </div>
        <div>
          <label className="label">น้ำหนัก (กก.)</label>
          <input className="input" type="number" inputMode="decimal" min={20} max={400} step="0.1" required value={value.weight} onChange={set("weight")} />
        </div>
      </div>
      <div>
        <label className="label">ระดับกิจกรรมต่อสัปดาห์</label>
        <select className="input" required value={value.activity} onChange={set("activity")}>
          <option value="" disabled>เลือกระดับกิจกรรม</option>
          {ACTIVITY_LEVELS.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>
    </>
  );
}

export const profileToForm = (p: UserProfile): ProfileForm => ({
  name: p.name,
  age: String(p.age ?? ""),
  height: String(p.height ?? ""),
  weight: String(p.weight ?? ""),
  sex: p.sex ?? "",
  activity: p.activity ?? "",
});

export const formToProfile = (f: ProfileForm) => ({
  name: f.name.trim(),
  age: Number(f.age),
  height: Number(f.height),
  weight: Number(f.weight),
  ...(f.sex && { sex: f.sex }),
  ...(f.activity && { activity: f.activity }),
});
