export const ACTIVE_THRESHOLD = 0.4;

export interface SpyEntry {
  id: string;
  ratio: number;
}

export function chooseActive(entries: SpyEntry[]): string | null {
  let best: SpyEntry | null = null;
  for (const entry of entries) {
    if (entry.ratio < ACTIVE_THRESHOLD) continue;
    if (best === null || entry.ratio > best.ratio) best = entry;
  }
  return best?.id ?? null;
}
