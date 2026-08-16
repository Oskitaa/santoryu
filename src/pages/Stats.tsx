import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Target, TrendingUp, BookOpen, Flame, Award, Calendar } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Heatmap } from '../components/stats/Heatmap';
import { db } from '../db/database';
import { useStudyStore } from '../stores/useStudyStore';
import { ACHIEVEMENTS, SRS_STAGES } from '../lib/constants';
import type { SRSStage, AchievementType } from '../lib/types';
import { cn } from '../lib/utils';

export default function Stats() {
  const { streak, xp } = useStudyStore();

  const cards = useLiveQuery(() => db.cards.toArray());
  const reviews = useLiveQuery(() => db.reviews.toArray());
  const progressList = useLiveQuery(() => db.progress.toArray());
  const achievements = useLiveQuery(() => db.achievements.toArray());

  const unlockedMap = useMemo(
    () => new Set(achievements?.map((a) => a.type) || []),
    [achievements]
  );

  const totalReviews = reviews?.length || 0;
  const correctReviews = reviews?.filter((r) => r.rating > 1).length || 0;
  const accuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 100;
  const learnedCards = cards?.filter((c) => c.srsState !== 'new').length || 0;
  const totalCards = cards?.length || 0;

  // Group by SRS stage
  const stageDistribution = useMemo(() => {
    const dist: Record<SRSStage, number> = {
      new: 0,
      apprentice: 0,
      guru: 0,
      master: 0,
      enlightened: 0,
      burned: 0,
    };
    if (cards) {
      for (const card of cards) {
        dist[card.srsStage] = (dist[card.srsStage] || 0) + 1;
      }
    }
    return dist;
  }, [cards]);

  // Build heatmap data for last 90 days from db.progress
  const heatmapData = useMemo(() => {
    const map = new Map<string, number>();
    if (progressList) {
      for (const p of progressList) {
        map.set(p.date, p.reviewsTotal);
      }
    }

    const result = [];
    const now = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        count: map.get(dateStr) || 0,
      });
    }
    return result;
  }, [progressList]);

  return (
    <AppShell title="Estadísticas" showStats>
      <div className="space-y-5 animate-fade-in px-1">
        {/* Heatmap Section */}
        <div className="card-surface p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
              Actividad de Estudio
            </h3>
            <span className="text-xs text-[var(--color-text-secondary)]">Últimos 3 meses</span>
          </div>
          <Heatmap data={heatmapData} months={3} />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-surface p-4 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono" style={{ fontFamily: 'var(--font-mono)' }}>
                {totalReviews}
              </span>
              <p className="text-xs text-[var(--color-text-secondary)]">Reviews totales</p>
            </div>
          </div>

          <div className="card-surface p-4 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[var(--color-success)]/10 text-[var(--color-success)]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-[var(--color-success)]" style={{ fontFamily: 'var(--font-mono)' }}>
                {accuracy}%
              </span>
              <p className="text-xs text-[var(--color-text-secondary)]">Precisión</p>
            </div>
          </div>

          <div className="card-surface p-4 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[var(--color-srs-guru)]/10 text-[var(--color-srs-guru)]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-[var(--color-srs-guru)]" style={{ fontFamily: 'var(--font-mono)' }}>
                {learnedCards}
              </span>
              <p className="text-xs text-[var(--color-text-secondary)]">Cartas aprendidas</p>
            </div>
          </div>

          <div className="card-surface p-4 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)]">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold font-mono text-[var(--color-accent-gold)]" style={{ fontFamily: 'var(--font-mono)' }}>
                {streak}
              </span>
              <p className="text-xs text-[var(--color-text-secondary)]">Días de racha</p>
            </div>
          </div>

          <div className="col-span-2 card-surface p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[var(--color-accent-gold)]/20 text-[var(--color-accent-gold)]">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-[var(--color-accent-gold)]" style={{ fontFamily: 'var(--font-mono)' }}>
                  {xp}
                </span>
                <p className="text-xs text-[var(--color-text-secondary)]">Experiencia Total (XP)</p>
              </div>
            </div>
          </div>
        </div>

        {/* SRS Stage Breakdown */}
        <div className="card-surface p-4 space-y-4">
          <h3 className="font-bold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">
            Niveles de Memoria (SRS)
          </h3>

          <div className="space-y-2.5">
            {(Object.keys(SRS_STAGES) as SRSStage[]).map((stage) => {
              const count = stageDistribution[stage] || 0;
              const pct = totalCards > 0 ? (count / totalCards) * 100 : 0;
              const info = SRS_STAGES[stage];

              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info.color }} />
                      <span className="font-medium">{info.label}</span>
                    </span>
                    <span className="font-mono text-[var(--color-text-secondary)]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {count} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-bg-primary)] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: info.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="card-surface p-4 space-y-4">
          <h3 className="font-bold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--color-accent-gold)]" />
            Logros Desbloqueables
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(ACHIEVEMENTS) as AchievementType[]).map((type) => {
              const ach = ACHIEVEMENTS[type];
              const isUnlocked =
                unlockedMap.has(type) ||
                (type === 'streak_3' && streak >= 3) ||
                (type === 'streak_7' && streak >= 7) ||
                (type === 'reviews_100' && totalReviews >= 100) ||
                (type === 'accuracy_90' && accuracy >= 90 && totalReviews >= 20);

              return (
                <div
                  key={type}
                  className={cn(
                    'p-3.5 rounded-2xl flex flex-col gap-1.5 transition-all border',
                    isUnlocked
                      ? 'bg-[var(--color-bg-elevated)] border-[var(--color-accent-gold)]/30 text-white'
                      : 'bg-[var(--color-bg-surface)] border-white/5 opacity-40 grayscale'
                  )}
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <span className="font-bold text-xs">{ach.title}</span>
                  <span className="text-[10px] text-[var(--color-text-secondary)] leading-tight">
                    {ach.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
