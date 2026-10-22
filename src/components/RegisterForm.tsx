"use client";

import { useState } from "react";
import Link from "next/link";
import { registerWithNewToken } from "@/lib/loginToken";
import { errorMessage } from "@/lib/authErrors";
import { BtnLabel } from "./Loading";
import { Logo } from "./Logo";

const FEATURES = [
  ["📋", "ออกแบบตาราง 7 วัน"],
  ["☑️", "ติ๊กเช็กทุกวัน"],
  ["🏋️", "จดน้ำหนักที่ยก"],
  ["🔥", "คำนวณ TDEE"],
];

/** Sign-up screen; AuthProvider picks up the new user and RequireAuth sends them to profile setup. */
export function RegisterForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    setError("");
    try {
      await registerWithNewToken();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="stagger mx-auto max-w-md space-y-6 pt-6 text-center sm:pt-12">
      <Logo size={88} className="logo-float mx-auto rounded-[1.75rem]" />
      <div>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          ฟิตแบบมี<span className="text-gradient">แผน</span>
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-muted">
          จัดโปรแกรมออกกำลังกายของคุณเอง ติดตามทุกเซ็ต เห็นความก้าวหน้าทุกสัปดาห์
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {FEATURES.map(([icon, t]) => (
          <span key={t} className="chip px-3 py-1 text-xs">{icon} {t}</span>
        ))}
      </div>
      <div className="card space-y-4 text-left">
        <p className="text-sm text-muted">
          ไม่ต้องตั้งชื่อผู้ใช้หรือรหัสผ่าน เบราว์เซอร์นี้จะจำบัญชีไว้ให้ และคุณจะได้
          <b className="text-ink"> รหัสเข้าสู่ระบบ </b>ไว้ใช้เมื่อเปลี่ยนเบราว์เซอร์หรือเครื่อง
        </p>
        {error && <p className="toast rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <button className="btn btn-primary w-full py-3.5 text-base" disabled={busy} onClick={start}>
          <BtnLabel loading={busy} text="เริ่มใช้งานฟรี →" loadingText="กำลังสร้างบัญชี…" />
        </button>
      </div>
      <p className="text-sm text-muted">
        มีรหัสเข้าสู่ระบบแล้ว? <Link href="/login" className="font-semibold text-accent hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}
