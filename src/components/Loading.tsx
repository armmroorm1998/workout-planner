"use client";

import { useEffect, useState } from "react";
import { subscribePending } from "@/lib/loading";

/** Full-area loader for route-level waits. */
export function Spinner({ label }: { label?: string }) {
  return (
    <div className="fade-up flex flex-col items-center justify-center gap-3 py-20 text-muted">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-surface-2" />
        <div
          className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent"
          style={{ borderTopColor: "var(--accent)", borderRightColor: "var(--accent-2)" }}
        />
        <div className="absolute inset-3 animate-pulse rounded-full bg-accent-soft" />
      </div>
      {label && <div className="text-sm">{label}</div>}
    </div>
  );
}

export const Skeleton = ({ className = "" }: { className?: string }) => <div className={`skeleton ${className}`} />;

export function ProgramCardSkeleton() {
  return (
    <div className="card space-y-3">
      <div className="flex justify-between gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="flex gap-1.5">
        {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-8 w-8" />)}
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: count }, (_, i) => <ProgramCardSkeleton key={i} />)}
    </div>
  );
}

/** Button label that swaps to a spinner while `loading`. */
export function BtnLabel({ loading, text, loadingText }: { loading: boolean; text: React.ReactNode; loadingText?: string }) {
  return loading ? (
    <>
      <span className="spinner" />
      {loadingText ?? text}
    </>
  ) : (
    <>{text}</>
  );
}

/** Thin gradient bar at the very top while any Firestore/Auth request is in flight. */
export function TopProgress() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsub = subscribePending((n) => {
      clearTimeout(timer);
      // Small delay on show so instant cache hits don't flash; quick hide when done.
      timer = setTimeout(() => setActive(n > 0), n > 0 ? 120 : 200);
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] overflow-hidden transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full w-full origin-left"
        style={{
          background: "linear-gradient(90deg, transparent, var(--accent), var(--accent-2), transparent)",
          boxShadow: "0 0 12px var(--glow)",
          animation: "indeterminate 1.1s cubic-bezier(0.65, 0, 0.35, 1) infinite",
        }}
      />
    </div>
  );
}
