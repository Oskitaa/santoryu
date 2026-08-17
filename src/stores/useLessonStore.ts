import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { curriculumUnits } from '../data/curriculum';
import { db } from '../db/database';
import { useStudyStore } from './useStudyStore';

export interface LessonCompletion {
  stars: number;
  score: number;
  completedAt: number;
}

interface LessonStoreState {
  completedLessons: Record<string, LessonCompletion>;
  currentLessonId: string | null;

  setCurrentLesson: (lessonId: string | null) => void;
  completeLesson: (lessonId: string, stars: number, score: number, xpReward: number) => Promise<void>;
  isLessonUnlocked: (lessonId: string) => boolean;
  getUnitProgress: (unitId: string) => { completed: number; total: number; percent: number };
}

export const useLessonStore = create<LessonStoreState>()(
  persist(
    (set, get) => ({
      completedLessons: {},
      currentLessonId: null,

      setCurrentLesson: (lessonId) => set({ currentLessonId: lessonId }),

      completeLesson: async (lessonId, stars, score, xpReward) => {
        const now = Date.now();

        // 1. Update lesson completion state
        set((state) => ({
          completedLessons: {
            ...state.completedLessons,
            [lessonId]: { stars, score, completedAt: now },
          },
        }));

        // 2. Add XP and increment daily lessons count in study store
        const studyStore = useStudyStore.getState();
        studyStore.addXp(xpReward);
        studyStore.recordLesson();
        studyStore.checkAndUpdateStreak();

        // 3. Unlock associated cards in Dexie for SRS review
        let unlockedCardIds: string[] = [];
        for (const unit of curriculumUnits) {
          const found = unit.lessons.find((l) => l.id === lessonId);
          if (found && found.unlockedCardIds) {
            unlockedCardIds = found.unlockedCardIds;
            break;
          }
        }

        if (unlockedCardIds.length > 0) {
          try {
            await db.transaction('rw', db.cards, async () => {
              for (const extId of unlockedCardIds) {
                const card = await db.cards.where('externalId').equals(extId).first();
                if (card && card.srsState === 'new') {
                  await db.cards.update(card.id!, {
                    srsState: 'learning',
                    srsStage: 'apprentice',
                    stability: 1.0,
                    difficulty: 5.0,
                    nextReview: now + 10 * 60 * 1000, // due in 10 minutes
                    lastReview: now,
                  });
                }
              }
            });
          } catch (err) {
            console.error('Error unlocking cards for SRS:', err);
          }
        }
      },

      isLessonUnlocked: (lessonId: string) => {
        // Flatten all lessons across all units
        const allLessons = curriculumUnits.flatMap((u) => u.lessons);
        const index = allLessons.findIndex((l) => l.id === lessonId);

        if (index <= 0) return true; // First lesson is always unlocked

        // Unlocked if previous lesson is completed
        const prevLesson = allLessons[index - 1];
        return Boolean(get().completedLessons[prevLesson.id]);
      },

      getUnitProgress: (unitId: string) => {
        const unit = curriculumUnits.find((u) => u.id === unitId);
        if (!unit) return { completed: 0, total: 0, percent: 0 };

        const total = unit.lessons.length;
        const completed = unit.lessons.filter((l) => Boolean(get().completedLessons[l.id])).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percent };
      },
    }),
    {
      name: 'santoryu-lesson-progress',
    }
  )
);
