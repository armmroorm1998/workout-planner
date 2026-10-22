"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { Skeleton, Spinner } from "@/components/Loading";
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

  if (program === undefined)
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-2/3" />
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  if (!program)
    return (
      <div className="card fade-up mt-6 space-y-5 py-10 text-center">
        <div className="scale-in mx-auto grid h-20 w-20 place-content-center rounded-[1.75rem] bg-accent-soft text-4xl">📋</div>
        <div>
          <h1 className="text-2xl font-bold">สวัสดี {profile?.name} 👋</h1>
          <p className="mt-1 text-muted">ยังไม่มีโปรแกรม เริ่มจากตัวอย่างหรือสร้างเองก็ได้</p>
        </div>
        <div className="stagger flex flex-wrap justify-center gap-2">
          <Link href="/programs/new?template=sample" className="btn btn-primary">✨ เริ่มจากตัวอย่าง</Link>
          <Link href="/programs/new" className="btn">สร้างเปล่า</Link>
          <Link href="/explore" className="btn">ดูของคนอื่น</Link>
        </div>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="fade-up flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-muted">{greeting()}, {profile?.name} 👋</div>
          <h1 className="truncate text-3xl font-extrabold tracking-tight">{program.title}</h1>
        </div>
        <Link href={`/programs/${program.id}`} className="btn btn-sm shrink-0">รายละเอียด →</Link>
      </div>
      <WeekTracker program={program} uid={user!.uid} />
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "อรุณสวัสดิ์" : h < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";
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
