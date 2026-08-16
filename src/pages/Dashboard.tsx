import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useStudyStore } from '../stores/useStudyStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { getGreeting } from '../lib/utils';
import { getReviewQueue } from '../engines/srs-scheduler';
import { SRS_STAGES } from '../lib/constants';
import type { SRSStage } from '../lib/types';
import { AppShell } from '../components/layout/AppShell';
import { StreakCounter } from '../components/stats/StreakCounter';
import { ProgressRing } from '../components/stats/ProgressRing';
import { Flame, BookOpen, Languages, GraduationCap, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { streak, xp, dailyLessonsCompleted, dailyReviewsCompleted } = useStudyStore();
  const { dailyLessonGoal, dailyReviewGoal } = useSettingsStore();

  const [reviewCount, setReviewCount] = useState(0);

  // Live query for SRS stage distribution
  const cards = useLiveQuery(() => db.cards.toArray());

  const stageDistribution = cards
    ? (Object.keys(SRS_STAGES) as SRSStage[]).reduce(
        (acc, stage) => {
          acc[stage] = cards.filter((c) => c.srsStage === stage).length;
          return acc;
        },
        {} as Record<SRSStage, number>
      )
    : null;

  useEffect(() => {
    getReviewQueue().then((queue) => setReviewCount(queue.length));
  }, []);

  const totalCards = cards?.length ?? 0;
  const learnedCards = cards?.filter((c) => c.srsState !== 'new').length ?? 0;
  const progressPercent = totalCards > 0 ? Math.round((learnedCards / totalCards) * 100) : 0;

  return (
    <AppShell title="Santoryu" showStats>
      <div className="space-y-5 animate-fade-in px-1">
        {/* Greeting */}
        <section className="pt-2">
          <h2 className="text-2xl font-bold font-jp">{getGreeting()}</h2>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            Sigue adelante con tu estudio de japonés
          </p>
        </section>

        {/* Review CTA */}
        <section className="card-elevated p-5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className="text-4xl font-bold font-mono"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {reviewCount}
            </span>
            <span className="text-[var(--color-text-secondary)] text-sm">
              reviews pendientes
            </span>
          </div>
          <button
            onClick={() => navigate('/review')}
            className={`w-full py-3.5 rounded-[var(--radius-button)] font-semibold text-white tap-highlight transition-all ${
              reviewCount > 0
                ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] animate-pulse-glow'
                : 'bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]'
            }`}
            disabled={reviewCount === 0}
          >
            {reviewCount > 0 ? 'Empezar Reviews' : 'No hay reviews pendientes'}
          </button>
        </section>

        {/* Daily Goals */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Metas diarias
          </h3>
          <div className="card-surface p-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span>Lecciones</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {dailyLessonsCompleted} / {dailyLessonGoal}
                </span>
              </div>
              <div className="w-full bg-[var(--color-bg-primary)] rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (dailyLessonsCompleted / dailyLessonGoal) * 100)}%`,
                    backgroundColor: 'var(--color-accent)',
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span>Reviews</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {dailyReviewsCompleted} / {dailyReviewGoal}
                </span>
              </div>
              <div className="w-full bg-[var(--color-bg-primary)] rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (dailyReviewsCompleted / dailyReviewGoal) * 100)}%`,
                    backgroundColor: 'var(--color-success)',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="grid grid-cols-3 gap-3">
          <StreakCounter streak={streak} />
          <div className="card-surface p-3 flex flex-col items-center justify-center">
            <span className="text-xs text-[var(--color-text-secondary)]">XP</span>
            <span
              className="text-xl font-bold text-[var(--color-accent-gold)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {xp}
            </span>
          </div>
          <div className="card-surface p-3 flex flex-col items-center justify-center">
            <ProgressRing progress={progressPercent} size={48} strokeWidth={4} />
            <span className="text-xs text-[var(--color-text-secondary)] mt-1">Progreso</span>
          </div>
        </section>

        {/* SRS Distribution */}
        {stageDistribution && totalCards > 0 && (
          <section className="card-surface p-4">
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
              Distribución SRS
            </h3>
            <div className="flex gap-1 h-6 rounded-full overflow-hidden">
              {(Object.keys(SRS_STAGES) as SRSStage[]).map((stage) => {
                const count = stageDistribution[stage] || 0;
                const pct = (count / totalCards) * 100;
                if (pct === 0) return null;
                return (
                  <div
                    key={stage}
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: SRS_STAGES[stage].color,
                      minWidth: pct > 0 ? '4px' : '0',
                    }}
                    title={`${SRS_STAGES[stage].label}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(Object.keys(SRS_STAGES) as SRSStage[]).map((stage) => {
                const count = stageDistribution[stage] || 0;
                if (count === 0) return null;
                return (
                  <span key={stage} className="flex items-center gap-1 text-xs">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: SRS_STAGES[stage].color }}
                    />
                    {SRS_STAGES[stage].label} ({count})
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick Access */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
            Módulos
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/kana')}
              className="card-surface p-5 flex flex-col items-center gap-2 tap-highlight"
            >
              <Languages className="w-6 h-6 text-[var(--color-srs-apprentice)]" />
              <span className="text-jp-lg">あ</span>
              <span className="text-sm font-medium">Kana Dojo</span>
            </button>
            <button
              onClick={() => navigate('/kanji')}
              className="card-surface p-5 flex flex-col items-center gap-2 tap-highlight"
            >
              <BookOpen className="w-6 h-6 text-[var(--color-srs-guru)]" />
              <span className="text-jp-lg">漢</span>
              <span className="text-sm font-medium">Kanji Tower</span>
            </button>
            <button
              onClick={() => navigate('/vocab')}
              className="card-surface p-5 flex flex-col items-center gap-2 tap-highlight"
            >
              <GraduationCap className="w-6 h-6 text-[var(--color-srs-master)]" />
              <span className="text-jp-lg">語</span>
              <span className="text-sm font-medium">Vocab Forge</span>
            </button>
            <button
              onClick={() => navigate('/stats')}
              className="card-surface p-5 flex flex-col items-center gap-2 tap-highlight"
            >
              <BarChart3 className="w-6 h-6 text-[var(--color-srs-enlightened)]" />
              <Flame className="w-8 h-8 text-[var(--color-accent-gold)]" />
              <span className="text-sm font-medium">Estadísticas</span>
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
