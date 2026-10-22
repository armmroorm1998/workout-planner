// Global count of in-flight requests, shown as the top progress bar.
let pending = 0;
const listeners = new Set<(n: number) => void>();

export function subscribePending(fn: (n: number) => void) {
  listeners.add(fn);
  fn(pending);
  return () => void listeners.delete(fn);
}

function bump(d: number) {
  pending += d;
  listeners.forEach((fn) => fn(pending));
}

export async function track<T>(p: Promise<T>): Promise<T> {
  bump(1);
  try {
    return await p;
  } finally {
    bump(-1);
  }
}

/** Wraps an async function so every call shows up in the progress bar (keeps overloads). */
export const tracked = <F extends (...args: never[]) => Promise<unknown>>(fn: F): F =>
  ((...args: Parameters<F>) => track(fn(...args))) as F;
