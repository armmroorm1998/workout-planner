// บัญชีผูกกับรหัสเข้าสู่ระบบที่สุ่มให้ตอนสมัคร (ไม่มี username/password)
// Firebase Auth ต้องใช้อีเมล จึงใช้ 8 ตัวแรกของรหัสเป็นอีเมลภายใน และทั้งรหัสเป็นรหัสผ่าน
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const DOMAIN = "devices.workout-planner.local";
const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789"; // ไม่มี I, L, O, U, 0, 1 ที่สับสนง่าย
const LENGTH = 20;
const storageKey = (uid: string) => `wp.loginToken.${uid}`;

function generate(): string {
  const bytes = crypto.getRandomValues(new Uint32Array(LENGTH));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** "k7qm 2xrd-9fht…" → "K7QM2XRD9FHT…" or null when it can't be a token. */
function normalize(input: string): string | null {
  const t = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return t.length === LENGTH && [...t].every((c) => ALPHABET.includes(c)) ? t : null;
}

export const formatToken = (t: string) => t.match(/.{1,4}/g)!.join("-");

const credentials = (t: string) => [`${t.slice(0, 8).toLowerCase()}@${DOMAIN}`, t] as const;

function remember(uid: string, token: string) {
  try {
    localStorage.setItem(storageKey(uid), token);
  } catch {}
}

export function rememberedToken(uid: string): string | null {
  try {
    return localStorage.getItem(storageKey(uid));
  } catch {
    return null;
  }
}

export async function registerWithNewToken(): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    const token = generate();
    try {
      const cred = await createUserWithEmailAndPassword(auth(), ...credentials(token));
      remember(cred.user.uid, token);
      return token;
    } catch (e) {
      if ((e as { code?: string }).code !== "auth/email-already-in-use" || attempt >= 2) throw e;
    }
  }
}

export async function signInWithToken(input: string) {
  const token = normalize(input);
  if (!token) throw { code: "auth/invalid-credential" };
  const cred = await signInWithEmailAndPassword(auth(), ...credentials(token));
  remember(cred.user.uid, token);
}
