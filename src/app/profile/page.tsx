"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveProfile } from "@/lib/db";
import { errorMessage } from "@/lib/authErrors";
import { useAuth } from "@/components/AuthProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { LoginTokenCard } from "@/components/LoginTokenCard";
import { ProfileFields, emptyProfileForm, formToProfile, profileToForm } from "@/components/ProfileFields";
import { CalorieCard } from "@/components/CalorieCard";

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "น้ำหนักน้อย";
  if (bmi < 23) return "ปกติ";
  if (bmi < 25) return "น้ำหนักเกิน";
  if (bmi < 30) return "อ้วนระดับ 1";
  return "อ้วนระดับ 2";
}

function ProfileEditor() {
  const { user, profile, refreshProfile, logout } = useAuth();
  const router = useRouter();
  const setup = useSearchParams().get("setup") === "1" || !profile;
  const [form, setForm] = useState(emptyProfileForm);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) setForm(profileToForm(profile));
    else if (user?.displayName) setForm((f) => ({ ...f, name: f.name || user.displayName! }));
  }, [profile, user]);

  const h = Number(form.height) / 100;
  const bmi = h > 0 && Number(form.weight) > 0 ? Number(form.weight) / (h * h) : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setMsg("");
    try {
      const wasSetup = !profile;
      await saveProfile(user.uid, formToProfile(form));
      await refreshProfile();
      if (wasSetup) router.replace("/programs/new?template=sample");
      else setMsg("บันทึกแล้ว ✓");
    } catch (err) {
      setMsg(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-2xl font-bold">{setup ? "ข้อมูลของคุณ" : "โปรไฟล์"}</h1>
      <p className="mb-4 text-muted">{setup ? "กรอกข้อมูลอีกนิดก่อนเริ่มใช้งาน" : profile?.name}</p>
      {user && <LoginTokenCard uid={user.uid} highlight={setup} />}
      <form onSubmit={submit} className="card space-y-3">
        <ProfileFields value={form} onChange={setForm} />
        {bmi > 0 && (
          <div className="rounded-xl bg-surface-2 px-3 py-2 text-sm">
            BMI <b>{bmi.toFixed(1)}</b> <span className="text-muted">· {bmiLabel(bmi)}</span>
          </div>
        )}
        <CalorieCard form={form} />
        {msg && <p className="text-sm text-muted">{msg}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "กำลังบันทึก…" : setup ? "เริ่มใช้งาน" : "บันทึก"}
        </button>
      </form>
      {!setup && (
        <button
          className="btn btn-danger mt-4 w-full"
          onClick={() => {
            if (confirm("ออกจากระบบ? ถ้ายังไม่ได้เก็บรหัสเข้าสู่ระบบไว้ จะกลับมาใช้บัญชีนี้ไม่ได้อีก"))
              logout().then(() => router.replace("/login"));
          }}
        >
          ออกจากระบบ
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <Suspense>
        <ProfileEditor />
      </Suspense>
    </RequireAuth>
  );
}
