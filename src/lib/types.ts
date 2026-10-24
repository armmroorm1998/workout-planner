import type { ActivityLevel, Sex } from "./calories";

export type ItemKind = "strength" | "cardio" | "task";

export interface ExerciseItem {
  id: string;
  name: string;
  kind: ItemKind;
  sets?: number;
  reps?: string; // "8-10", "12", "15"
  duration?: string; // "20 นาที"
  note?: string;
  videoUrl?: string; // TikTok / YouTube / Instagram demo
  videoCredit?: string; // creator shown with the video, e.g. "@coach_name"
}

export interface ProgramDay {
  title: string; // e.g. "อก + ไหล่", "พัก"
  items: ExerciseItem[];
}

export type Visibility = "private" | "public";

export interface Program {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  visibility: Visibility;
  days: ProgramDay[]; // length 7, index 0 = Monday
  copiedFrom?: string | null;
  likeCount?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  sex?: Sex;
  activity?: ActivityLevel;
  activeProgramId?: string | null;
}

export interface LogEntry {
  done: boolean;
  weight?: string;
}

export interface WeekLog {
  programId: string;
  week: string; // "2026-W43"
  entries: Record<string, LogEntry>; // keyed by item id
}

export const DAY_NAMES = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];
export const DAY_SHORT = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

export const newId = () => Math.random().toString(36).slice(2, 10);

export const emptyDays = (): ProgramDay[] =>
  DAY_NAMES.map(() => ({ title: "", items: [] }));
