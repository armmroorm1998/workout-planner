"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { RequireAuth, Spinner } from "@/components/RequireAuth";
import { RegisterForm } from "@/components/RegisterForm";
import { WeekTracker } from "@/components/WeekTracker";
import { getProgram, listMyPrograms } from "@/lib/db";
import type { Program } from "@/lib/types";

function Today() {
  const { user, profile } = useAuth();
  const [program, setProgram] = useState<Program | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const active = profile?.activeProgramId ? await getProgram(profile.activeProgramId).catch(() => null) : null;
      if (active && active.ownerId === user.uid) return setProgram(active);
      const mine = await listMyPrograms(user.uid);
      setProgram(mine[0] ?? null);
    })();
  }, [user, profile?.activeProgramId]);

  if (program === undefined) return <Spinner />;
  if (!program)
    return (
      <div className="card mt-6 space-y-3 text-center">
        <div className="text-4xl">📋</div>
        <p>สวัสดี {profile?.name}! ยังไม่มีโปรแกรมเลย</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/programs/new?template=sample" className="btn btn-primary">เริ่มจากตัวอย่าง</Link>
          <Link href="/programs/new" className="btn">สร้างเปล่า</Link>
          <Link href="/explore" className="btn">ดูของคนอื่น</Link>
        </div>
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <div className="text-sm text-muted">สวัสดี {profile?.name} 👋</div>
          <h1 className="text-xl font-bold">{program.title}</h1>
        </div>
        <Link href={`/programs/${program.id}`} className="text-sm text-accent">รายละเอียด</Link>
      </div>
      <WeekTracker program={program} uid={user!.uid} />
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <RegisterForm />;
  return (
    <RequireAuth>
      <Today />
    </RequireAuth>
  );
}
