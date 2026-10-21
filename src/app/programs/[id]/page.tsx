"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { RequireAuth, Spinner } from "@/components/RequireAuth";
import { WeekTracker } from "@/components/WeekTracker";
import { ItemMeta } from "@/components/ItemMeta";
import { copyProgram, deleteProgram, getProgram, saveProfile, updateProgram } from "@/lib/db";
import { errorMessage } from "@/lib/authErrors";
import { DAY_NAMES, type Program } from "@/lib/types";

function WeekOverview({ program }: { program: Program }) {
  return (
    <div className="space-y-3">
      {program.days.map((d, i) => (
        <div key={i} className="card">
          <div className="mb-2 flex items-baseline gap-2">
            <h3 className="font-semibold">📅 วัน{DAY_NAMES[i]}</h3>
            {d.title && <span className="text-sm text-muted">{d.title}</span>}
          </div>
          {d.items.length === 0 ? <p className="text-sm text-muted">—</p> : (
            <ul className="space-y-2">
              {d.items.map((it) => (
                <li key={it.id} className="flex gap-2">
                  <span className="text-muted">☐</span>
                  <div>
                    <div>{it.kind === "cardio" && "🏃 "}{it.name}</div>
                    <ItemMeta item={it} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function ProgramView() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [program, setProgram] = useState<Program | null | undefined>(undefined);
  const [tab, setTab] = useState<"track" | "overview">("track");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getProgram(id).then(setProgram).catch(() => setProgram(null));
  }, [id]);

  if (program === undefined) return <Spinner />;
  if (!program)
    return (
      <div className="card mt-6 text-center text-muted">
        ไม่พบโปรแกรมนี้ หรือโปรแกรมถูกตั้งเป็นส่วนตัว
      </div>
    );

  const isOwner = user?.uid === program.ownerId;
  const isActive = profile?.activeProgramId === program.id;

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2500);
  };

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      flash(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    const url = `${window.location.origin}/programs/${program!.id}`;
    if (program!.visibility !== "public") {
      if (!confirm("โปรแกรมนี้เป็นส่วนตัว คนอื่นจะเปิดลิงก์ไม่ได้\nเปลี่ยนเป็นสาธารณะเลยไหม?")) return;
      await updateProgram(program!.id, { visibility: "public" });
      setProgram({ ...program!, visibility: "public" });
    }
    if (navigator.share) {
      await navigator.share({ title: program!.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      flash("คัดลอกลิงก์แล้ว ✓");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{program.title}</h1>
          <span className="chip">{program.visibility === "public" ? "🌏 สาธารณะ" : "🔒 ส่วนตัว"}</span>
          {isActive && <span className="chip bg-accent-soft text-accent">⭐ โปรแกรมหลัก</span>}
        </div>
        <div className="text-sm text-muted">โดย {program.ownerName || "ไม่ระบุ"}</div>
        {program.description && <p className="mt-2 whitespace-pre-line">{program.description}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {isOwner ? (
          <>
            {!isActive && (
              <button className="btn btn-sm" disabled={busy} onClick={() => run(async () => {
                await saveProfile(user!.uid, { activeProgramId: program.id });
                await refreshProfile();
                flash("ตั้งเป็นโปรแกรมหลักแล้ว — จะแสดงในหน้า “วันนี้”");
              })}>⭐ ตั้งเป็นโปรแกรมหลัก</button>
            )}
            <Link href={`/programs/${program.id}/edit`} className="btn btn-sm">✏️ แก้ไข</Link>
            <button className="btn btn-sm" disabled={busy} onClick={() => run(share)}>🔗 แชร์</button>
            <button className="btn btn-sm" disabled={busy} onClick={() => run(async () => {
              const newId = await copyProgram(program, user!.uid, profile?.name ?? "");
              router.push(`/programs/${newId}/edit`);
            })}>📄 ทำสำเนา</button>
            <button className="btn btn-sm btn-danger" disabled={busy} onClick={() => {
              if (confirm(`ลบ “${program.title}” ?`)) run(async () => {
                await deleteProgram(program.id);
                if (isActive) await saveProfile(user!.uid, { activeProgramId: null });
                await refreshProfile();
                router.replace("/programs");
              });
            }}>🗑 ลบ</button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" disabled={busy} onClick={() => {
              run(async () => {
                const newId = await copyProgram(program, user!.uid, profile!.name);
                if (!profile!.activeProgramId) {
                  await saveProfile(user!.uid, { activeProgramId: newId });
                  await refreshProfile();
                }
                router.push(`/programs/${newId}`);
              });
            }}>📥 คัดลอกไปใช้</button>
            <button className="btn" onClick={() => run(async () => {
              await navigator.clipboard.writeText(window.location.href);
              flash("คัดลอกลิงก์แล้ว ✓");
            })}>🔗 คัดลอกลิงก์</button>
          </>
        )}
      </div>
      {msg && <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm">{msg}</p>}

      {isOwner ? (
        <>
          <div className="grid grid-cols-2 rounded-xl bg-surface-2 p-1 text-sm">
            {(["track", "overview"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`rounded-lg py-1.5 ${tab === t ? "bg-surface font-medium shadow-sm" : "text-muted"}`}>
                {t === "track" ? "☑️ ติ๊กประจำสัปดาห์" : "📋 ภาพรวม 7 วัน"}
              </button>
            ))}
          </div>
          {tab === "track" ? <WeekTracker program={program} uid={user!.uid} /> : <WeekOverview program={program} />}
        </>
      ) : (
        <WeekOverview program={program} />
      )}
    </div>
  );
}

export default function ProgramPage() {
  return (
    <RequireAuth>
      <ProgramView />
    </RequireAuth>
  );
}
