"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { Skeleton } from "@/components/Loading";
import { ProgramEditor, type EditorValue } from "@/components/ProgramEditor";
import { getProgram, updateProgram } from "@/lib/db";
import { errorMessage } from "@/lib/authErrors";
import type { Program } from "@/lib/types";

function EditProgram() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [program, setProgram] = useState<Program | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProgram(id).then(setProgram).catch(() => setProgram(null));
  }, [id]);

  if (program === undefined)
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-56 rounded-3xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  if (!program || program.ownerId !== user?.uid)
    return <p className="card fade-up py-10 text-center text-muted">ไม่พบโปรแกรม หรือคุณไม่ใช่เจ้าของ</p>;

  async function save(v: EditorValue) {
    setSaving(true);
    setError("");
    try {
      await updateProgram(id, { ...v, ownerName: profile?.name ?? program!.ownerName });
      router.replace(`/programs/${id}`);
    } catch (e) {
      setError(errorMessage(e));
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="fade-up text-3xl font-extrabold tracking-tight">แก้ไข<span className="text-gradient">โปรแกรม</span></h1>
      {error && <p className="toast rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      <ProgramEditor
        initial={{ title: program.title, description: program.description, visibility: program.visibility, days: program.days }}
        onSave={save} saving={saving} submitLabel="บันทึกการแก้ไข" />
    </div>
  );
}

export default function EditProgramPage() {
  return (
    <RequireAuth>
      <EditProgram />
    </RequireAuth>
  );
}
