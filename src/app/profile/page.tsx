"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "@/lib/db";
import { errorMessage } from "@/lib/authErrors";
import { useAuth } from "@/components/AuthProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { LoginTokenCard } from "@/components/LoginTokenCard";
import { ProfileFields, emptyProfileForm, formToProfile, profileToForm } from "@/components/ProfileFields";
import { CalorieCard } from "@/components/CalorieCard";
import { BtnLabel } from "@/components/Loading";

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "น้ำหนักน้อย";
  if (bmi < 23) return "ปกติ";
  if (bmi < 25) return "น้ำหนักเกิน";
  if (bmi < 30) return "อ้วนระดับ 1";
  return "อ้วนระดับ 2";
}

// First letter for the avatar, skipping Thai leading vowels (เ แ โ ใ ไ) so "เอก" shows "อ".
const initial = (name: string) => name.trim().replace(/^[เแโใไ]/, "").charAt(0).toUpperCase() || "👤";

function ProfileEditor() {
  const { user, profile, refreshProfile, logout } = useAuth();
  const router = useRouter();
  // Setup mode follows the actual profile, not ?setup=1, which lingers in the URL after the first save.
  const setup = !profile;
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
      await saveProfile(user.uid, formToProfile(form));
      await refreshProfile();
      if (setup) router.replace("/programs/new?template=sample");
      else setMsg("บันทึกแล้ว ✓");
    } catch (err) {
      setMsg(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stagger mx-auto max-w-md space-y-4">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-content-center rounded-3xl text-2xl font-extrabold text-accent-ink"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))", boxShadow: "0 12px 30px -10px var(--glow)" }}>
          {initial(form.name || profile?.name || "")}
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight">{setup ? "ข้อมูลของคุณ" : "โปรไฟล์"}</h1>
          <p className="truncate text-muted">{setup ? "กรอกข้อมูลอีกนิดก่อนเริ่มใช้งาน" : profile?.name}</p>
        </div>
      </div>
      {user && <LoginTokenCard uid={user.uid} highlight={setup} />}
      <form onSubmit={submit} className="card space-y-4">
        <ProfileFields value={form} onChange={setForm} />
        {bmi > 0 && (
          <div className="scale-in flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3 text-sm">
            <span className="text-muted">BMI</span>
            <span>
              <b className="text-lg tabular-nums">{bmi.toFixed(1)}</b> <span className="text-muted">· {bmiLabel(bmi)}</span>
            </span>
          </div>
        )}
        <CalorieCard form={form} />
        {msg && <p key={msg} className="toast rounded-2xl bg-accent-soft px-3 py-2 text-sm font-medium">{msg}</p>}
        <button className="btn btn-primary w-full py-3" disabled={busy}>
          <BtnLabel loading={busy} text={setup ? "บันทึกและเริ่มใช้งาน →" : "บันทึก"} loadingText="กำลังบันทึก…" />
        </button>
      </form>
      {!setup && (
        <button
          className="btn btn-danger w-full"
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
      <ProfileEditor />
    </RequireAuth>
  );
}
