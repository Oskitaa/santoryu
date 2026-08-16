import { useState, useEffect, useCallback } from 'react';
import type { Card, ReviewGrade } from '../lib/types';
import { processReview, getReviewQueue, getLessonQueue } from '../engines/srs-scheduler';
import { useSettingsStore } from '../stores/useSettingsStore';

export function useReview(category?: string) {
  const [queue, setQueue] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const { dailyLessonGoal } = useSettingsStore();

  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });

  useEffect(() => {
    let mounted = true;
    const initQueue = async () => {
      setLoading(true);
      const reviews = await getReviewQueue(category);
      const lessons = await getLessonQueue(category, dailyLessonGoal);
      
      if (!mounted) return;
      const combinedQueue = [...lessons, ...reviews];
      // Randomize or sort queue here if needed
      setQueue(combinedQueue);
      setSessionStats(prev => ({ ...prev, total: combinedQueue.length }));
      setLoading(false);
      
      if (combinedQueue.length === 0) {
        setIsComplete(true);
      }
    };
    initQueue();
    return () => { mounted = false; };
  }, [category, dailyLessonGoal]);

  const grade = useCallback(async (rating: ReviewGrade) => {
    if (currentIndex >= queue.length) return;
    
    const currentCard = queue[currentIndex];
    
    // Process review via scheduler
    await processReview(currentCard.id, rating);
    
    // Update stats
    const isCorrect = rating > 1; // 1 = Again (incorrect)
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));

    if (currentIndex + 1 >= queue.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, queue]);

  return {
    currentCard: queue[currentIndex] || null,
    totalCards: queue.length,
    completedCards: currentIndex,
    isComplete,
    grade,
    sessionStats,
    loading
  };
}
