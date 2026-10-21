"use client";

import { useState } from "react";
import Link from "next/link";
import { registerWithNewToken } from "@/lib/loginToken";
import { errorMessage } from "@/lib/authErrors";

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
    <div className="mx-auto max-w-sm pt-6">
      <h1 className="mb-1 text-2xl font-bold">สมัครสมาชิก</h1>
      <p className="mb-6 text-muted">สร้างโปรแกรมออกกำลังกายของคุณเอง</p>
      <div className="card space-y-3">
        <p className="text-sm">
          ไม่ต้องตั้งชื่อผู้ใช้หรือรหัสผ่าน เบราว์เซอร์นี้จะจำบัญชีไว้ให้ และคุณจะได้
          <b> รหัสเข้าสู่ระบบ </b>ไว้ใช้เมื่อเปลี่ยนเบราว์เซอร์หรือเครื่อง
        </p>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy} onClick={start}>
          {busy ? "กำลังสร้างบัญชี…" : "เริ่มใช้งาน"}
        </button>
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        มีรหัสเข้าสู่ระบบแล้ว? <Link href="/login" className="text-accent underline">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}
