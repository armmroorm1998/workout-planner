"use client";

import { useEffect, useState } from "react";
import { formatToken, rememberedToken } from "@/lib/loginToken";

export function LoginTokenCard({ uid, highlight }: { uid: string; highlight?: boolean }) {
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => setToken(rememberedToken(uid)), [uid]);

  if (!token) return null;
  const shown = formatToken(token);

  return (
    <div className={`card space-y-3 ${highlight ? "border-accent/50 ring-4 ring-accent/10" : ""}`}>
      <div className="flex items-center gap-2 text-sm font-bold">
        <span className="grid h-8 w-8 place-content-center rounded-xl bg-accent-soft">🔑</span>
        รหัสเข้าสู่ระบบของคุณ
      </div>
      <p className="text-xs text-muted">
        เบราว์เซอร์นี้จำบัญชีไว้แล้ว เก็บรหัสนี้ไว้สำหรับเข้าใช้งานจากเบราว์เซอร์หรือเครื่องอื่น ถ้าทำหายจะกู้บัญชีไม่ได้
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 select-all rounded-2xl border border-dashed border-accent/40 bg-accent-soft px-3 py-2.5 text-center font-mono text-sm font-semibold tracking-wider">{shown}</code>
        <button
          type="button"
          className={`btn btn-sm ${copied ? "btn-primary" : ""}`}
          onClick={() => navigator.clipboard.writeText(shown).then(() => setCopied(true))}
        >
          <span key={String(copied)} className="scale-in">{copied ? "✓ แล้ว" : "คัดลอก"}</span>
        </button>
      </div>
    </div>
  );
}
