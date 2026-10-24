import {
  collection, doc, query, where, limit, serverTimestamp, increment, writeBatch, Timestamp, type DocumentData,
  getDoc as _getDoc, getDocs as _getDocs, setDoc as _setDoc, updateDoc as _updateDoc,
  deleteDoc as _deleteDoc, addDoc as _addDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { track, tracked } from "./loading";
import type { Program, UserProfile, WeekLog, LogEntry } from "./types";

// Every Firestore round-trip shows in the global progress bar.
const getDoc = tracked(_getDoc);
const getDocs = tracked(_getDocs);
const setDoc = tracked(_setDoc);
const updateDoc = tracked(_updateDoc);
const deleteDoc = tracked(_deleteDoc);
const addDoc = tracked(_addDoc);

const toMillis = (v: unknown) => (v instanceof Timestamp ? v.toMillis() : undefined);

function toProgram(id: string, d: DocumentData): Program {
  return {
    id,
    ownerId: d.ownerId,
    ownerName: d.ownerName ?? "",
    title: d.title ?? "",
    description: d.description ?? "",
    visibility: d.visibility ?? "private",
    days: d.days ?? [],
    copiedFrom: d.copiedFrom ?? null,
    likeCount: d.likeCount ?? 0,
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

const byUpdatedDesc = (a: Program, b: Program) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0);

// ---------- Profile ----------

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db(), "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function saveProfile(uid: string, p: Partial<UserProfile>) {
  await setDoc(doc(db(), "users", uid), { ...p, updatedAt: serverTimestamp() }, { merge: true });
}

// ---------- Programs ----------

export async function getProgram(id: string): Promise<Program | null> {
  const snap = await getDoc(doc(db(), "programs", id));
  return snap.exists() ? toProgram(snap.id, snap.data()) : null;
}

export async function listMyPrograms(uid: string): Promise<Program[]> {
  const snap = await getDocs(query(collection(db(), "programs"), where("ownerId", "==", uid)));
  return snap.docs.map((d) => toProgram(d.id, d.data())).sort(byUpdatedDesc);
}

export async function listPublicPrograms(): Promise<Program[]> {
  const snap = await getDocs(
    query(collection(db(), "programs"), where("visibility", "==", "public"), limit(100)),
  );
  return snap.docs.map((d) => toProgram(d.id, d.data())).sort(byUpdatedDesc);
}

type ProgramInput = Omit<Program, "id" | "likeCount" | "createdAt" | "updatedAt">;

export async function createProgram(p: ProgramInput): Promise<string> {
  const ref = await addDoc(collection(db(), "programs"), {
    ...p,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProgram(id: string, p: Partial<ProgramInput>) {
  const { ownerId: _ignored, ...rest } = p;
  void _ignored;
  await updateDoc(doc(db(), "programs", id), { ...rest, updatedAt: serverTimestamp() });
}

export async function deleteProgram(id: string) {
  await deleteDoc(doc(db(), "programs", id));
}

export async function copyProgram(src: Program, uid: string, ownerName: string): Promise<string> {
  return createProgram({
    ownerId: uid,
    ownerName,
    title: src.ownerId === uid ? `${src.title} (สำเนา)` : src.title,
    description: src.description,
    visibility: "private",
    days: src.days,
    copiedFrom: src.id,
  });
}

// ---------- Likes ----------
// A like is users/{uid}/likes/{programId}; programs.likeCount is kept in step in the same batch.

const likeRef = (uid: string, programId: string) => doc(db(), "users", uid, "likes", programId);

export async function listLikedIds(uid: string): Promise<Set<string>> {
  const snap = await getDocs(collection(db(), "users", uid, "likes"));
  return new Set(snap.docs.map((d) => d.id));
}

export async function isLiked(uid: string, programId: string): Promise<boolean> {
  return (await getDoc(likeRef(uid, programId))).exists();
}

export async function setLiked(uid: string, programId: string, liked: boolean) {
  const batch = writeBatch(db());
  if (liked) batch.set(likeRef(uid, programId), { createdAt: serverTimestamp() });
  else batch.delete(likeRef(uid, programId));
  batch.update(doc(db(), "programs", programId), { likeCount: increment(liked ? 1 : -1) });
  await track(batch.commit());
}

// ---------- Weekly check-off logs ----------

const logRef = (uid: string, programId: string, week: string) =>
  doc(db(), "users", uid, "logs", `${programId}_${week}`);

export async function getWeekLog(uid: string, programId: string, week: string): Promise<WeekLog> {
  const snap = await getDoc(logRef(uid, programId, week));
  return snap.exists()
    ? (snap.data() as WeekLog)
    : { programId, week, entries: {} };
}

export async function saveLogEntry(
  uid: string, programId: string, week: string, itemId: string, entry: LogEntry,
) {
  await setDoc(
    logRef(uid, programId, week),
    { programId, week, entries: { [itemId]: entry }, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
