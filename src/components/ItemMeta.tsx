import type { ExerciseItem } from "@/lib/types";

export function ItemMeta({ item }: { item: ExerciseItem }) {
  const parts: string[] = [];
  if (item.kind === "strength" && item.sets) parts.push(`${item.sets} × ${item.reps || "?"}`);
  if (item.duration && !item.name.includes(item.duration)) parts.push(item.duration);
  if (item.note) parts.push(item.note);
  if (!parts.length) return null;
  return <div className="text-sm text-muted">{parts.join(" · ")}</div>;
}
