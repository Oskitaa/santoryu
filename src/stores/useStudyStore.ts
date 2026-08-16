import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getToday } from '../lib/constants';

interface StudyState {
  streak: number;
  lastStudyDate: string; // YYYY-MM-DD
  xp: number;
  dailyLessonsCompleted: number;
  dailyReviewsCompleted: number;
  currentDailyDate: string;
  addXp: (amount: number) => void;
  recordLesson: () => void;
  recordReview: (correct: boolean) => void;
  checkAndUpdateStreak: () => void;
  resetDailyCounters: () => void;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastStudyDate: '',
      xp: 0,
      dailyLessonsCompleted: 0,
      dailyReviewsCompleted: 0,
      currentDailyDate: getToday(),
      addXp: (amount: number) => set((state) => ({ xp: state.xp + amount })),
      recordLesson: () => {
        const { currentDailyDate, resetDailyCounters } = get();
        const today = getToday();
        if (currentDailyDate !== today) {
          resetDailyCounters();
        }
        set((state) => ({ dailyLessonsCompleted: state.dailyLessonsCompleted + 1, currentDailyDate: today }));
      },
      recordReview: (_correct: boolean) => {
        const { currentDailyDate, resetDailyCounters } = get();
        const today = getToday();
        if (currentDailyDate !== today) {
          resetDailyCounters();
        }
        set((state) => ({ dailyReviewsCompleted: state.dailyReviewsCompleted + 1, currentDailyDate: today }));
      },
      checkAndUpdateStreak: () => {
        const today = getToday();
        const { lastStudyDate, streak } = get();
        if (lastStudyDate === today) return;

        const todayObj = new Date(today);
        const lastDateObj = new Date(lastStudyDate || '2000-01-01');
        const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          set({ streak: streak + 1, lastStudyDate: today });
        } else {
          set({ streak: 1, lastStudyDate: today });
        }
      },
      resetDailyCounters: () => set({ dailyLessonsCompleted: 0, dailyReviewsCompleted: 0, currentDailyDate: getToday() }),
    }),
    {
      name: 'santoryu-study',
    }
  )
);
