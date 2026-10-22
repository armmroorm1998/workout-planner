"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { ListSkeleton } from "@/components/Loading";
import { ProgramCard } from "@/components/ProgramCard";
import { listMyPrograms } from "@/lib/db";
import type { Program } from "@/lib/types";

function MyPrograms() {
  const { user, profile } = useAuth();
  const [list, setList] = useState<Program[] | null>(null);

  useEffect(() => {
    if (user) listMyPrograms(user.uid).then(setList);
  }, [user]);

  return (
    <div className="space-y-5">
      <div className="fade-up flex items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">โปรแกรมของฉัน</h1>
          {list && <p className="text-sm text-muted">{list.length} โปรแกรม</p>}
        </div>
        <Link href="/programs/new" className="btn btn-primary">+ สร้างใหม่</Link>
      </div>
      {!list ? <ListSkeleton /> : list.length === 0 ? (
        <div className="card fade-up space-y-4 py-10 text-center">
          <div className="text-5xl">🗂️</div>
          <p className="text-muted">ยังไม่มีโปรแกรม</p>
          <Link href="/programs/new?template=sample" className="btn btn-primary">✨ เริ่มจากตัวอย่าง</Link>
        </div>
      ) : (
        <div className="stagger grid gap-3 sm:grid-cols-2">
          {list.map((p) => <ProgramCard key={p.id} p={p} active={profile?.activeProgramId === p.id} />)}
        </div>
      )}
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <RequireAuth>
      <MyPrograms />
    </RequireAuth>
  );
}
