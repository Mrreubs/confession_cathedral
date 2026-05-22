import { useState, useCallback } from 'react';
import type { Confession } from '../types';

const MAX_CONFESSIONS = 500;

export function useConfessions() {
  const [confessions, setConfessions] = useState<Confession[]>([]);

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
