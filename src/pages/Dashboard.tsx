import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { curriculumUnits } from '../data/curriculum';
import { useLessonStore } from '../stores/useLessonStore';
import { getGreeting } from '../lib/utils';
import { AppShell } from '../components/layout/AppShell';
import { LessonRunner } from '../components/lesson/LessonRunner';
import { BeginnerGuideModal } from '../components/guide/BeginnerGuideModal';
import {
  Star,
  Lock,
  Check,
  HelpCircle,
  Sword,
} from 'lucide-react';
import type { Lesson } from '../lib/types';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { completedLessons, isLessonUnlocked, getUnitProgress } = useLessonStore();

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Live count of pending SRS reviews
  const pendingReviews = useLiveQuery(
    async () => {
      const now = Date.now();
      return await db.cards
        .where('srsState')
        .notEqual('new')
        .and((c) => c.nextReview > 0 && c.nextReview <= now)
        .count();
    },
    [],
    0
  );

  const handleLessonClick = (lesson: Lesson) => {
    if (isLessonUnlocked(lesson.id)) {
      setActiveLesson(lesson);
    }
  };

  return (
    <AppShell title="Santoryu" showStats>
      <div className="space-y-6 animate-fade-in max-w-lg mx-auto pb-4">
        {/* Welcome & Beginner Header */}
        <section className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-xl font-bold font-jp text-[var(--color-text-primary)]">
              {getGreeting()}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Tu camino interactivo para dominar el japonés
            </p>
          </div>

          <button
            onClick={() => setIsGuideOpen(true)}
            className="p-2.5 rounded-2xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 text-[var(--color-accent)] tap-highlight flex items-center gap-1.5 text-xs font-bold shadow-sm"
          >
            <HelpCircle size={15} />
            <span>Guía</span>
          </button>
        </section>

        {/* Pending SRS Reviews Quick Bar (if any) */}
        {pendingReviews > 0 && (
          <section className="p-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-accent)]/15 to-transparent border border-[var(--color-accent)]/30 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] text-white flex items-center justify-center font-bold">
                <Sword size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--color-text-primary)] block">
                  {pendingReviews} repasos pendientes en el Dojo
                </span>
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  Consolida lo aprendido con FSRS
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/dojo')}
              className="py-2 px-3 rounded-xl bg-[var(--color-accent)] text-white font-bold text-xs tap-highlight"
            >
              Repasar
            </button>
          </section>
        )}

        {/* Units and Adventure Path */}
        <div className="space-y-8">
          {curriculumUnits.map((unit) => {
            const { completed, total, percent } = getUnitProgress(unit.id);

            return (
              <div key={unit.id} className="space-y-4">
                {/* Unit Header Card */}
                <div
                  className="card-surface p-4 rounded-3xl border border-white/5 space-y-2.5 shadow-md relative overflow-hidden"
                  style={{
                    borderLeft: `4px solid ${unit.color}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{unit.icon}</span>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-secondary)]">
                          Unidad {unit.number}
                        </span>
                        <h3 className="font-bold text-sm text-[var(--color-text-primary)]">
                          {unit.title}
                        </h3>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-[var(--color-accent-gold)]">
                      {completed}/{total}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {unit.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-[var(--color-bg-primary)] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: unit.color,
                      }}
                    />
                  </div>
                </div>

                {/* Lesson Nodes Tree */}
                <div className="flex flex-col items-center space-y-4 py-1 relative">
                  {unit.lessons.map((lesson, lessonIdx) => {
                    const isUnlocked = isLessonUnlocked(lesson.id);
                    const completion = completedLessons[lesson.id];
                    const isCompleted = Boolean(completion);
                    const isCurrent = isUnlocked && !isCompleted;

                    // Alternating slight offset for organic tree feeling
                    const offsetClass =
                      lessonIdx % 3 === 0
                        ? 'translate-x-0'
                        : lessonIdx % 3 === 1
                        ? 'translate-x-5'
                        : '-translate-x-5';

                    return (
                      <div
                        key={lesson.id}
                        className={cn('flex flex-col items-center gap-1.5 transition-transform', offsetClass)}
                      >
                        <motion.button
                          onClick={() => handleLessonClick(lesson)}
                          disabled={!isUnlocked}
                          whileHover={isUnlocked ? { scale: 1.08 } : {}}
                          whileTap={isUnlocked ? { scale: 0.92 } : {}}
                          className={cn(
                            'w-16 h-16 rounded-full flex flex-col items-center justify-center relative shadow-xl transition-all border-2 tap-highlight',
                            isCompleted
                              ? 'bg-[var(--color-accent)] border-[var(--color-accent-gold)] text-white'
                              : isCurrent
                              ? 'bg-[var(--color-accent)] border-white text-white ring-4 ring-[var(--color-accent)]/30 animate-pulse'
                              : 'bg-[var(--color-bg-surface)] border-white/10 text-[var(--color-text-muted)] cursor-not-allowed opacity-50'
                          )}
                        >
                          {isCompleted ? (
                            <Check size={26} strokeWidth={3} />
                          ) : isCurrent ? (
                            <span className="font-jp text-xl font-bold">{lesson.icon}</span>
                          ) : (
                            <Lock size={20} />
                          )}

                          {/* Floating Star Badges */}
                          {isCompleted && completion && (
                            <div className="absolute -bottom-2 flex gap-0.5 px-1.5 py-0.5 rounded-full bg-[var(--color-bg-primary)] border border-white/10 shadow-sm">
                              {[1, 2, 3].map((star) => (
                                <Star
                                  key={star}
                                  size={9}
                                  className={
                                    star <= completion.stars
                                      ? 'fill-[var(--color-accent-gold)] text-[var(--color-accent-gold)]'
                                      : 'text-white/20'
                                  }
                                />
                              ))}
                            </div>
                          )}
                        </motion.button>

                        {/* Lesson Label */}
                        <span className="text-[11px] font-semibold text-center max-w-[130px] leading-tight text-[var(--color-text-secondary)]">
                          {lesson.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Interactive Lesson Runner */}
      {activeLesson && (
        <LessonRunner
          lesson={activeLesson}
          onExit={() => setActiveLesson(null)}
        />
      )}

      {/* Beginner Foundation Guide Modal */}
      <BeginnerGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </AppShell>
  );
}
