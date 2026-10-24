"use client";

import { useEffect, useMemo, useState } from "react";
import { ProgramCard } from "@/components/ProgramCard";
import { RequireAuth } from "@/components/RequireAuth";
import { ListSkeleton } from "@/components/Loading";
import { useAuth } from "@/components/AuthProvider";
import { listLikedIds, listPublicPrograms } from "@/lib/db";
import { errorMessage } from "@/lib/authErrors";
import type { Program } from "@/lib/types";

function Explore() {
  const { user } = useAuth();
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [list, setList] = useState<Program[] | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    listPublicPrograms().then(setList).catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    if (user) listLikedIds(user.uid).then(setLiked).catch(() => {});
  }, [user]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!list || !s) return list;
    return list.filter((p) =>
      [p.title, p.description, p.ownerName, ...p.days.flatMap((d) => [d.title, ...d.items.map((i) => i.name)])]
        .join(" ").toLowerCase().includes(s));
  }, [list, q]);

  return (
    <div className="space-y-5">
      <div className="fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight">ค้นหา<span className="text-gradient">โปรแกรม</span></h1>
        <p className="text-muted">โปรแกรมที่คนอื่นแชร์เป็นสาธารณะ — กดเข้าไปแล้ว “คัดลอกไปใช้” ได้เลย</p>
      </div>
      <div className="fade-up relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">🔍</span>
        <input className="input py-3 pl-11" placeholder="ค้นหา เช่น squat, ลดไขมัน, ชื่อผู้สร้าง" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {error && <p className="toast rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {!filtered && !error ? <ListSkeleton /> : filtered?.length === 0 ? (
        <div className="card fade-up py-10 text-center text-muted">
          <div className="text-4xl">🔭</div>
          <p className="mt-2">{q ? "ไม่พบโปรแกรมที่ตรงกับคำค้น" : "ยังไม่มีโปรแกรมสาธารณะ"}</p>
        </div>
      ) : (
        <div className="stagger grid gap-3 sm:grid-cols-2">
          {filtered?.map((p) => <ProgramCard key={p.id} p={p} showOwner liked={liked.has(p.id)} />)}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <RequireAuth>
      <Explore />
    </RequireAuth>
  );
}
