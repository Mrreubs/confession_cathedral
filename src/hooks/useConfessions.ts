import { useState, useCallback, useEffect } from 'react';
import type { Confession } from '../types';

const STORAGE_KEY = 'confession-cathedral';
const MAX_CONFESSIONS = 500;

function load(): Confession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c: Record<string, unknown>) => ({
      id: String(c.id),
      text: String(c.text),
      timestamp: new Date(String(c.timestamp)),
    }));
  } catch {
    return [];
  }
}

function save(confessions: Confession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(confessions));
  } catch {
    // Storage full or unavailable — silently ignore.
  }
}

export function useConfessions() {
  const [confessions, setConfessions] = useState<Confession[]>(load);

  useEffect(() => {
    save(confessions);
  }, [confessions]);

  const addConfession = useCallback((text: string): boolean => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return false;

    const newConfession: Confession = {
      id: crypto.randomUUID(),
      text: trimmed,
      timestamp: new Date(),
    };

    setConfessions((prev) => [newConfession, ...prev].slice(0, MAX_CONFESSIONS));
    return true;
  }, []);

  return { confessions, addConfession };
}
