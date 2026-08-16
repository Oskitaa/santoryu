import { useEffect } from 'react';
import { useStudyStore } from '../stores/useStudyStore';

export function useStreak() {
  const streak = useStudyStore((state) => state.streak);
  const checkAndUpdateStreak = useStudyStore((state) => state.checkAndUpdateStreak);

  useEffect(() => {
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  return { streak };
}
