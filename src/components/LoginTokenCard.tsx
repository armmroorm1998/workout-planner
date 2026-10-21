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
    <div className={`card mb-4 space-y-2 ${highlight ? "border-accent" : ""}`}>
      <div className="text-sm font-semibold">🔑 รหัสเข้าสู่ระบบของคุณ</div>
      <p className="text-xs text-muted">
        เบราว์เซอร์นี้จำบัญชีไว้แล้ว เก็บรหัสนี้ไว้สำหรับเข้าใช้งานจากเบราว์เซอร์หรือเครื่องอื่น ถ้าทำหายจะกู้บัญชีไม่ได้
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded-xl bg-surface-2 px-3 py-2 text-center font-mono tracking-wider select-all">{shown}</code>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => navigator.clipboard.writeText(shown).then(() => setCopied(true))}
        >
          {copied ? "คัดลอกแล้ว ✓" : "คัดลอก"}
        </button>
      </div>
    </div>
  );
}
