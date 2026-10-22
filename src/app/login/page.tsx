"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { errorMessage } from "@/lib/authErrors";
import { signInWithToken } from "@/lib/loginToken";
import { useAuth } from "@/components/AuthProvider";
import { BtnLabel } from "@/components/Loading";

function LoginForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, next, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signInWithToken(token);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="stagger mx-auto max-w-sm space-y-6 pt-6 sm:pt-12">
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-content-center rounded-3xl bg-accent-soft text-3xl">🔑</div>
        <h1 className="text-3xl font-extrabold tracking-tight">ยินดีต้อนรับ<span className="text-gradient">กลับมา</span></h1>
        <p className="mt-2 text-muted">ใส่รหัสเข้าสู่ระบบที่ได้ตอนสมัคร เพื่อใช้บัญชีเดิมบนเบราว์เซอร์นี้</p>
      </div>
      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="label">รหัสเข้าสู่ระบบ</label>
          <input className="input py-3 text-center font-mono tracking-wider sm:text-lg" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX" autoCapitalize="characters" autoComplete="off" spellCheck={false} required value={token} onChange={(e) => setToken(e.target.value)} />
        </div>
        {error && <p className="toast rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <button className="btn btn-primary w-full py-3" disabled={busy}>
          <BtnLabel loading={busy} text="เข้าสู่ระบบ" loadingText="กำลังเข้าสู่ระบบ…" />
        </button>
      </form>
      <p className="text-center text-sm text-muted">
        ยังไม่มีบัญชี? <Link href="/" className="font-semibold text-accent hover:underline">เริ่มใช้งาน</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
