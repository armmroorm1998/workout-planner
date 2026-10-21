"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { RequireAuth, Spinner } from "@/components/RequireAuth";
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">โปรแกรมของฉัน</h1>
        <Link href="/programs/new" className="btn btn-primary">+ สร้าง</Link>
      </div>
      {!list ? <Spinner /> : list.length === 0 ? (
        <div className="card text-center text-muted">
          ยังไม่มีโปรแกรม —{" "}
          <Link href="/programs/new?template=sample" className="text-accent underline">เริ่มจากตัวอย่าง</Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((p) => (
            <div key={p.id} className="relative">
              <ProgramCard p={p} />
              {profile?.activeProgramId === p.id && (
                <span className="chip absolute bottom-4 right-4 bg-accent-soft text-accent">⭐ โปรแกรมหลัก</span>
              )}
            </div>
          ))}
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
