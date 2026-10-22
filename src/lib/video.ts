// Exercise demo videos: turn a pasted link into something we can play inside the app.

import { track } from "./loading";

export type VideoKind = "tiktok" | "youtube" | "instagram" | "other";

export interface VideoInfo {
  kind: VideoKind;
  url: string;
  /** iframe src when we can play it in-app without extra lookups */
  embed?: string;
  /** portrait (TikTok, Shorts, Reels) vs landscape player */
  vertical: boolean;
}

const tiktokPlayer = (id: string) =>
  `https://www.tiktok.com/player/v1/${id}?music_info=1&description=1&rel=0`;

export function isHttpUrl(s: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(s).protocol);
  } catch {
    return false;
  }
}

/**
 * Accepts whatever the user pasted — a link, or TikTok's "Embed" HTML snippet — and returns a
 * clean link. Search/tracking params (?q=…, ?is_from_webapp=…) are dropped from TikTok video links.
 */
export function normalizeVideoInput(raw: string): string {
  let s = raw.trim();
  if (s.includes("<")) {
    const fromEmbed = s.match(/cite="([^"]+)"/)?.[1] ?? s.match(/https?:\/\/[^\s"'<>]+\/video\/\d+/)?.[0];
    if (fromEmbed) s = fromEmbed;
  }
  if (isHttpUrl(s)) {
    const u = new URL(s);
    if (u.hostname.endsWith("tiktok.com") && /\/video\/\d+/.test(u.pathname)) return `${u.origin}${u.pathname}`;
  }
  return s;
}

export function parseVideo(raw: string): VideoInfo | null {
  const url = raw.trim();
  if (!isHttpUrl(url)) return null;
  const u = new URL(url);
  const host = u.hostname.replace(/^(www|m|vm|vt)\./, "");

  if (host.endsWith("tiktok.com")) {
    const id = u.pathname.match(/\/(?:video|photo|v)\/(\d+)/)?.[1];
    return { kind: "tiktok", url, vertical: true, embed: id ? tiktokPlayer(id) : undefined };
  }
  if (host === "youtu.be" || host.endsWith("youtube.com")) {
    const shorts = u.pathname.match(/\/shorts\/([\w-]{6,})/)?.[1];
    const id = shorts ?? (host === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v"));
    return {
      kind: "youtube",
      url,
      vertical: !!shorts,
      embed: id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0` : undefined,
    };
  }
  if (host.endsWith("instagram.com")) {
    const code = u.pathname.match(/\/(?:reel|reels|p|tv)\/([\w-]+)/)?.[1];
    return { kind: "instagram", url, vertical: true, embed: code ? `https://www.instagram.com/reel/${code}/embed` : undefined };
  }
  return { kind: "other", url, vertical: false };
}

/**
 * Short TikTok share links (vt.tiktok.com/…) hide the video id; TikTok's oEmbed endpoint
 * allows browser CORS, so ask it for the player URL.
 */
export async function resolveEmbed(info: VideoInfo): Promise<string | null> {
  if (info.embed) return info.embed;
  if (info.kind !== "tiktok") return null;
  try {
    const res = await track(fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(info.url)}`));
    if (!res.ok) return null;
    const data: { html?: string; embed_product_id?: string } = await res.json();
    const id = data.embed_product_id ?? data.html?.match(/(?:player\/v1\/|data-video-id=")(\d+)/)?.[1];
    return id ? tiktokPlayer(id) : null;
  } catch {
    return null;
  }
}

/** Creator handle we can read straight from the link (TikTok/IG/YouTube @handles). */
export function creditFromUrl(info: VideoInfo): string | null {
  const handle = new URL(info.url).pathname.match(/\/@([\w.-]+)/)?.[1];
  return handle ? `@${handle}` : null;
}

/** Best-effort creator name: handle in the URL, else YouTube's oEmbed author (CORS-enabled). */
export async function fetchCredit(info: VideoInfo): Promise<string | null> {
  const fromUrl = creditFromUrl(info);
  if (fromUrl || info.kind !== "youtube") return fromUrl;
  try {
    const res = await track(fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(info.url)}`));
    if (!res.ok) return null;
    const data: { author_name?: string } = await res.json();
    return data.author_name ?? null;
  } catch {
    return null;
  }
}

/** Where the credit should link: the creator's profile when we know it, else the original video. */
export function creditUrl(info: VideoInfo, credit: string): string {
  const handle = credit.match(/^@([\w.-]+)$/)?.[1];
  if (handle && info.kind === "tiktok") return `https://www.tiktok.com/@${handle}`;
  if (handle && info.kind === "instagram") return `https://www.instagram.com/${handle}`;
  if (handle && info.kind === "youtube") return `https://www.youtube.com/@${handle}`;
  return info.url;
}

export const KIND_LABEL: Record<VideoKind, string> = {
  tiktok: "TikTok",
  youtube: "YouTube",
  instagram: "Instagram",
  other: "ลิงก์",
};

export const searchUrls = (name: string) => ({
  tiktok: `https://www.tiktok.com/search/video?q=${encodeURIComponent(`${name} ท่าที่ถูกต้อง`)}`,
  youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} proper form`)}`,
});
