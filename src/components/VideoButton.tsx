"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { KIND_LABEL, creditFromUrl, creditUrl, fetchCredit, parseVideo, resolveEmbed, type VideoInfo } from "@/lib/video";
import { Spinner } from "./Loading";

/** Small "▶ วิดีโอ" button; opens the clip in an in-app player with an open-link fallback. */
export function VideoButton({
  url, credit, title, className = "",
}: { url?: string; credit?: string; title: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const info = useMemo(() => (url ? parseVideo(url) : null), [url]);
  if (!info) return null;
  const shownCredit = credit?.trim() || creditFromUrl(info);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`btn btn-sm gap-1 border-accent/30 text-accent ${className}`}
        aria-label={`ดูวิดีโอ ${title}`}
      >
        <span className="text-[10px]">▶</span> วิดีโอ
        {shownCredit && <span className="max-w-28 truncate font-normal text-muted">· {shownCredit}</span>}
      </button>
      {open && <VideoModal info={info} title={title} credit={shownCredit} onClose={() => setOpen(false)} />}
    </>
  );
}

function VideoModal({
  info, title, credit: savedCredit, onClose,
}: { info: VideoInfo; title: string; credit: string | null; onClose: () => void }) {
  // undefined = resolving, null = can't embed → show open-link card
  const [embed, setEmbed] = useState<string | null | undefined>(info.embed);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [credit, setCredit] = useState(savedCredit);

  // Older items have no saved credit; look it up so the creator is still named.
  useEffect(() => {
    if (savedCredit) return;
    let cancelled = false;
    fetchCredit(info).then((c) => !cancelled && c && setCredit(c));
    return () => {
      cancelled = true;
    };
  }, [info, savedCredit]);

  useEffect(() => {
    if (info.embed) return;
    let cancelled = false;
    resolveEmbed(info).then((e) => !cancelled && setEmbed(e));
    return () => {
      cancelled = true;
    };
  }, [info]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  // Portal to <body>: cards use backdrop-filter, which would trap a fixed overlay inside them.
  return createPortal(
    <div
      className="backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-md sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sheet-in flex max-h-full w-full max-w-sm flex-col gap-3 sm:max-w-md">
        <div className="flex items-center justify-between gap-2 text-white">
          <div className="min-w-0">
            <div className="text-xs opacity-70">{KIND_LABEL[info.kind]}</div>
            <div className="truncate font-bold">{title}</div>
          </div>
          <button className="btn btn-sm border-white/20 bg-white/10 text-white" onClick={onClose} aria-label="ปิด">✕</button>
        </div>

        <div
          className={`relative mx-auto w-full overflow-hidden rounded-3xl bg-black ${
            info.vertical ? "aspect-[9/16] max-h-[72dvh] max-w-[calc(72dvh*9/16)]" : "aspect-video"
          }`}
        >
          {embed === undefined || (embed && !frameLoaded) ? (
            <div className="absolute inset-0 grid place-content-center text-white/70">
              <Spinner label="กำลังโหลดวิดีโอ…" />
            </div>
          ) : null}
          {embed ? (
            <iframe
              src={embed}
              title={title}
              onLoad={() => setFrameLoaded(true)}
              className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${frameLoaded ? "opacity-100" : "opacity-0"}`}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : embed === null ? (
            <div className="absolute inset-0 grid place-content-center gap-3 p-6 text-center text-white">
              <div className="text-4xl">🎬</div>
              <p className="text-sm opacity-80">วิดีโอนี้เล่นในเว็บไม่ได้ กดเปิดในแอปหรือเว็บต้นทางแทน</p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white">
          <span className="min-w-0 truncate">
            <span className="opacity-60">วิดีโอโดย </span>
            {credit ? (
              <a href={creditUrl(info, credit)} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                {credit}
              </a>
            ) : (
              <span className="opacity-60">ไม่ระบุ</span>
            )}
          </span>
          <a href={info.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs opacity-70 hover:underline">
            ต้นฉบับบน {KIND_LABEL[info.kind]} ↗
          </a>
        </div>

        <a href={info.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full py-3">
          ↗ เปิดใน {KIND_LABEL[info.kind]}
        </a>
      </div>
    </div>,
    document.body,
  );
}
