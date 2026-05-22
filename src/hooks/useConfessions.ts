import { useState, useCallback } from 'react';
import type { Confession } from '../types';

export function useConfessions() {
  const [confessions, setConfessions] = useState<Confession[]>([]);

  const addConfession = useCallback((text: string): boolean => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return false;

    const newConfession: Confession = {
      id: Date.now(),
      text: trimmed,
      timestamp: new Date(),
    };

    setConfessions((prev) => [newConfession, ...prev]);
    return true;
  }, []);

  return { confessions, addConfession };
}
