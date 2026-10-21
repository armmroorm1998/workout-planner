"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { ProgramEditor, type EditorValue } from "@/components/ProgramEditor";
import { createProgram, saveProfile } from "@/lib/db";
import { errorMessage } from "@/lib/authErrors";
import { sampleDays } from "@/lib/templates";
import { emptyDays } from "@/lib/types";

function NewProgram() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const sample = useSearchParams().get("template") === "sample";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const initial: EditorValue = sample
    ? { title: "โปรแกรม 4 วัน + คาร์ดิโอ", description: "Push / Pull / Legs / Upper พร้อมวิ่งสลับเดินหลังเล่น", visibility: "private", days: sampleDays() }
    : { title: "", description: "", visibility: "private", days: emptyDays() };

  async function save(v: EditorValue) {
    if (!user || !profile) return;
    setSaving(true);
    setError("");
    try {
      const id = await createProgram({ ...v, ownerId: user.uid, ownerName: profile.name, copiedFrom: null });
      if (!profile.activeProgramId) {
        await saveProfile(user.uid, { activeProgramId: id });
        await refreshProfile();
      }
      router.replace(`/programs/${id}`);
    } catch (e) {
      setError(errorMessage(e));
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">สร้างโปรแกรม</h1>
      {sample && (
        <p className="rounded-xl bg-accent-soft px-3 py-2 text-sm">
          เติมตัวอย่างไว้ให้แล้ว แก้ไขได้ตามใจ หรือกด “นำเข้าจากโน้ต” เพื่อวางโน้ตของคุณเอง
        </p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
      <ProgramEditor initial={initial} onSave={save} saving={saving} submitLabel="สร้างโปรแกรม" />
    </div>
  );
}

export default function NewProgramPage() {
  return (
    <RequireAuth>
      <Suspense>
        <NewProgram />
      </Suspense>
    </RequireAuth>
  );
}
