"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { errorMessage } from "@/lib/authErrors";
import { signInWithToken } from "@/lib/loginToken";
import { useAuth } from "@/components/AuthProvider";

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
    <div className="mx-auto max-w-sm pt-6">
      <h1 className="mb-1 text-2xl font-bold">เข้าสู่ระบบ</h1>
      <p className="mb-6 text-muted">ใส่รหัสเข้าสู่ระบบที่ได้ตอนสมัคร เพื่อใช้บัญชีเดิมบนเบราว์เซอร์นี้</p>
      <form onSubmit={submit} className="card space-y-3">
        <div>
          <label className="label">รหัสเข้าสู่ระบบ</label>
          <input className="input font-mono tracking-wider" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX" autoCapitalize="characters" autoComplete="off" spellCheck={false} required value={token} onChange={(e) => setToken(e.target.value)} />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        ยังไม่มีบัญชี? <Link href="/" className="text-accent underline">เริ่มใช้งาน</Link>
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
