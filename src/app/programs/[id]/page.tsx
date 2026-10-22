"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { BtnLabel, Skeleton } from "@/components/Loading";
import { WeekTracker } from "@/components/WeekTracker";
import { ItemMeta } from "@/components/ItemMeta";
import { VideoButton } from "@/components/VideoButton";
import { copyProgram, deleteProgram, getProgram, saveProfile, updateProgram } from "@/lib/db";
import { errorMessage } from "@/lib/authErrors";
import { DAY_NAMES, type Program } from "@/lib/types";

function WeekOverview({ program }: { program: Program }) {
  return (
    <div className="stagger space-y-3">
      {program.days.map((d, i) => (
        <div key={i} className="card">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-content-center rounded-2xl bg-accent-soft text-sm font-bold text-accent">
              {DAY_NAMES[i].slice(0, 2)}
            </span>
            <div>
              <h3 className="font-bold">วัน{DAY_NAMES[i]}</h3>
              {d.title && <div className="text-sm text-muted">{d.title}</div>}
            </div>
          </div>
          {d.items.length === 0 ? <p className="text-sm text-muted">😴 พัก</p> : (
            <ul className="space-y-2.5 border-l-2 border-line pl-4">
              {d.items.map((it) => (
                <li key={it.id} className="relative">
                  <span className="absolute -left-[1.4rem] top-2 h-2 w-2 rounded-full bg-accent" />
                  <div>
                    <div>{it.kind === "cardio" && "🏃 "}{it.name}</div>
                    <ItemMeta item={it} />
                    <VideoButton url={it.videoUrl} credit={it.videoCredit} title={it.name} className="mt-1.5" />
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
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    getProgram(id).then(setProgram).catch(() => setProgram(null));
  }, [id]);

  if (program === undefined)
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-8 w-24" />)}
        </div>
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    );
  if (!program)
    return (
      <div className="card fade-up mt-6 py-10 text-center text-muted">
        <div className="mb-2 text-4xl">🔒</div>
        ไม่พบโปรแกรมนี้ หรือโปรแกรมถูกตั้งเป็นส่วนตัว
      </div>
    );

  const isOwner = user?.uid === program.ownerId;
  const isActive = profile?.activeProgramId === program.id;

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2500);
  };

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      flash(errorMessage(e));
    } finally {
      setBusy(null);
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
    <div className="space-y-5">
      <div className="fade-up">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="chip">{program.visibility === "public" ? "🌏 สาธารณะ" : "🔒 ส่วนตัว"}</span>
          {isActive && <span className="chip chip-accent">⭐ โปรแกรมหลัก</span>}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">{program.title}</h1>
        <div className="mt-1 text-sm text-muted">โดย {program.ownerName || "ไม่ระบุ"}</div>
        {program.description && <p className="mt-3 whitespace-pre-line text-ink/80">{program.description}</p>}
      </div>

      <div className="stagger flex flex-wrap gap-2">
        {isOwner ? (
          <>
            {!isActive && (
              <button className="btn btn-sm" disabled={!!busy} onClick={() => run("active", async () => {
                await saveProfile(user!.uid, { activeProgramId: program.id });
                await refreshProfile();
                flash("ตั้งเป็นโปรแกรมหลักแล้ว — จะแสดงในหน้า “วันนี้”");
              })}><BtnLabel loading={busy === "active"} text="⭐ ตั้งเป็นโปรแกรมหลัก" /></button>
            )}
            <Link href={`/programs/${program.id}/edit`} className="btn btn-sm">✏️ แก้ไข</Link>
            <button className="btn btn-sm" disabled={!!busy} onClick={() => run("share", share)}><BtnLabel loading={busy === "share"} text="🔗 แชร์" /></button>
            <button className="btn btn-sm" disabled={!!busy} onClick={() => run("dup", async () => {
              const newId = await copyProgram(program, user!.uid, profile?.name ?? "");
              router.push(`/programs/${newId}/edit`);
            })}><BtnLabel loading={busy === "dup"} text="📄 ทำสำเนา" /></button>
            <button className="btn btn-sm btn-danger" disabled={!!busy} onClick={() => {
              if (confirm(`ลบ “${program.title}” ?`)) run("delete", async () => {
                await deleteProgram(program.id);
                if (isActive) await saveProfile(user!.uid, { activeProgramId: null });
                await refreshProfile();
                router.replace("/programs");
              });
            }}><BtnLabel loading={busy === "delete"} text="🗑 ลบ" loadingText="กำลังลบ…" /></button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" disabled={!!busy} onClick={() => {
              run("copy", async () => {
                const newId = await copyProgram(program, user!.uid, profile!.name);
                if (!profile!.activeProgramId) {
                  await saveProfile(user!.uid, { activeProgramId: newId });
                  await refreshProfile();
                }
                router.push(`/programs/${newId}`);
              });
            }}><BtnLabel loading={busy === "copy"} text="📥 คัดลอกไปใช้" loadingText="กำลังคัดลอก…" /></button>
            <button className="btn" onClick={() => run("link", async () => {
              await navigator.clipboard.writeText(window.location.href);
              flash("คัดลอกลิงก์แล้ว ✓");
            })}>🔗 คัดลอกลิงก์</button>
          </>
        )}
      </div>
      {msg && <p key={msg} className="toast rounded-2xl border border-accent/20 bg-accent-soft px-4 py-2.5 text-sm font-medium">{msg}</p>}

      {isOwner ? (
        <>
          <div className="relative grid grid-cols-2 rounded-2xl border border-line bg-surface-2 p-1 text-sm">
            <span
              className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-surface-solid transition-transform duration-500 ease-spring"
              style={{ transform: tab === "overview" ? "translateX(100%)" : "none", boxShadow: "var(--shadow)" }}
            />
            {(["track", "overview"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`relative z-10 rounded-xl py-2 font-medium transition-colors ${tab === t ? "text-ink" : "text-muted"}`}>
                {t === "track" ? "☑️ ติ๊กประจำสัปดาห์" : "📋 ภาพรวม 7 วัน"}
              </button>
            ))}
          </div>
          <div key={tab} className="fade-up">
            {tab === "track" ? <WeekTracker program={program} uid={user!.uid} /> : <WeekOverview program={program} />}
          </div>
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
