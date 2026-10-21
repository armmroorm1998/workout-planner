"use client";

import { useEffect, useMemo, useState } from "react";
import { ProgramCard } from "@/components/ProgramCard";
import { RequireAuth, Spinner } from "@/components/RequireAuth";
import { listPublicPrograms } from "@/lib/db";
import { errorMessage } from "@/lib/authErrors";
import type { Program } from "@/lib/types";

function Explore() {
  const [list, setList] = useState<Program[] | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    listPublicPrograms().then(setList).catch((e) => setError(errorMessage(e)));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!list || !s) return list;
    return list.filter((p) =>
      [p.title, p.description, p.ownerName, ...p.days.flatMap((d) => [d.title, ...d.items.map((i) => i.name)])]
        .join(" ").toLowerCase().includes(s));
  }, [list, q]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">สำรวจโปรแกรม</h1>
        <p className="text-muted">โปรแกรมที่คนอื่นแชร์เป็นสาธารณะ — กดเข้าไปแล้ว “คัดลอกไปใช้” ได้เลย</p>
      </div>
      <input className="input" placeholder="ค้นหา เช่น squat, ลดไขมัน, ชื่อผู้สร้าง" value={q} onChange={(e) => setQ(e.target.value)} />
      {error && <p className="text-sm text-danger">{error}</p>}
      {!filtered && !error ? <Spinner /> : filtered?.length === 0 ? (
        <p className="card text-center text-muted">ยังไม่มีโปรแกรมสาธารณะ</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered?.map((p) => <ProgramCard key={p.id} p={p} showOwner />)}
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
