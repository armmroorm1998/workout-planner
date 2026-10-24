"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { setLiked } from "@/lib/db";

/** Heart toggle with optimistic count; rolls back if the write fails. */
export function LikeButton({ programId, liked: initialLiked, count: initialCount, small = true }: {
  programId: string; liked: boolean; count: number; small?: boolean;
}) {
  const { user } = useAuth();
  const [liked, setLikedState] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  // The liked flag often arrives after the first render (loaded separately from the program).
  useEffect(() => setLikedState(initialLiked), [initialLiked]);
  useEffect(() => setCount(initialCount), [initialCount]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    if (!user || busy) return;
    const next = !liked;
    setBusy(true);
    setLikedState(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      await setLiked(user.uid, programId, next);
    } catch {
      setLikedState(!next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={liked} title={liked ? "เลิกถูกใจ" : "ถูกใจ"}
      className={`btn ${small ? "btn-sm" : ""} ${liked ? "border-danger/30 text-danger" : ""}`}>
      <span key={String(liked)} className={liked ? "heart-pop" : ""}>{liked ? "❤️" : "🤍"}</span>
      {count}
    </button>
  );
}

/** Copies the program's link to the clipboard. */
export function ShareButton({ programId, label = "แชร์", className = "" }: {
  programId: string; label?: string; className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share(e: React.MouseEvent) {
    e.preventDefault();
    await navigator.clipboard.writeText(`${window.location.origin}/programs/${programId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={share} className={`btn btn-sm ${className}`}>
      {copied ? "✓ คัดลอกลิงก์แล้ว" : `🔗 ${label}`}
    </button>
  );
}
