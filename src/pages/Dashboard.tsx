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
import { BeginnerGuideModal } from '../components/guide/BeginnerGuideModal';
import {
  Sparkles,
  HelpCircle,
  ArrowRight,
  Compass,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { streak, xp, dailyLessonsCompleted, dailyReviewsCompleted } = useStudyStore();
  const { dailyLessonGoal, dailyReviewGoal } = useSettingsStore();

  const [reviewCount, setReviewCount] = useState(0);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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

  // Specific counts per module
  const hiraganaLearned = cards?.filter((c) => c.category === 'hiragana' && c.srsState !== 'new').length ?? 0;
  const katakanaLearned = cards?.filter((c) => c.category === 'katakana' && c.srsState !== 'new').length ?? 0;
  const kanjiLearned = cards?.filter((c) => c.category === 'kanji-n5' && c.srsState !== 'new').length ?? 0;
  const vocabLearned = cards?.filter((c) => c.category === 'vocab-n5' && c.srsState !== 'new').length ?? 0;

  return (
    <AppShell title="Santoryu" showStats>
      <div className="space-y-5 animate-fade-in px-1 max-w-lg mx-auto">
        {/* Greeting & Beginner Header */}
        <section className="pt-2 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold font-jp">{getGreeting()}</h2>
            <p className="text-[var(--color-text-secondary)] text-xs sm:text-sm mt-0.5">
              Tu dojo para dominar el japonés desde cero
            </p>
          </div>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="p-2.5 rounded-2xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 text-[var(--color-accent)] tap-highlight flex items-center gap-1.5 text-xs font-bold shadow-sm"
          >
            <HelpCircle size={16} />
            <span>Guía</span>
          </button>
        </section>

        {/* Beginner Context Callout Banner */}
        <section className="card-elevated p-4 rounded-2xl border-l-4 border-[var(--color-accent)] bg-gradient-to-r from-[var(--color-accent)]/10 to-transparent flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent-gold)]">
              <Sparkles size={13} />
              ¿Empiezas por primera vez?
            </span>
            <h3 className="font-bold text-sm text-[var(--color-text-primary)]">
              Fundamentos y Sistemas de Escritura
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-snug">
              Aprende por qué hay 3 alfabetos, cómo se pronuncia y la gramática básica.
            </p>
          </div>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="p-3 rounded-xl bg-[var(--color-accent)] text-white font-bold flex-shrink-0 tap-highlight shadow-md"
            aria-label="Abrir guía"
          >
            <ArrowRight size={18} />
          </button>
        </section>

        {/* Review CTA */}
        <section className="card-elevated p-5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className="text-4xl font-bold font-mono text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {reviewCount}
            </span>
            <span className="text-[var(--color-text-secondary)] text-sm">
              repasos pendientes
            </span>
          </div>
          <button
            onClick={() => navigate('/review')}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white tap-highlight transition-all shadow-lg ${
              reviewCount > 0
                ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] animate-pulse-glow'
                : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
            }`}
            disabled={reviewCount === 0}
          >
            {reviewCount > 0 ? 'Empezar Repasos FSRS' : 'Todo al día por ahora'}
          </button>
        </section>

        {/* Learning Roadmap Step-by-Step */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <Compass size={14} className="text-[var(--color-accent)]" />
              Ruta de Aprendizaje (Paso a Paso)
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Step 1: Hiragana */}
            <button
              onClick={() => navigate('/kana')}
              className="card-surface p-4 rounded-2xl flex flex-col items-start gap-2.5 tap-highlight border border-white/5 relative overflow-hidden"
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold">
                  Paso 1
                </span>
                <span className="font-jp text-2xl font-bold text-[var(--color-text-primary)]">あ</span>
              </div>
              <div>
                <h4 className="font-bold text-sm">Hiragana</h4>
                <p className="text-[11px] text-[var(--color-text-secondary)]">El alfabeto base japonés</p>
              </div>
              <div className="w-full bg-[var(--color-bg-primary)] rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-[var(--color-accent)] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (hiraganaLearned / 71) * 100)}%` }}
                />
              </div>
            </button>

            {/* Step 2: Katakana */}
            <button
              onClick={() => navigate('/kana')}
              className="card-surface p-4 rounded-2xl flex flex-col items-start gap-2.5 tap-highlight border border-white/5 relative overflow-hidden"
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-srs-apprentice)]/20 text-[var(--color-srs-apprentice)] font-bold">
                  Paso 2
                </span>
                <span className="font-jp text-2xl font-bold text-[var(--color-text-primary)]">ア</span>
              </div>
              <div>
                <h4 className="font-bold text-sm">Katakana</h4>
                <p className="text-[11px] text-[var(--color-text-secondary)]">Extranjerismos y nombres</p>
              </div>
              <div className="w-full bg-[var(--color-bg-primary)] rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-[var(--color-srs-apprentice)] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (katakanaLearned / 46) * 100)}%` }}
                />
              </div>
            </button>

            {/* Step 3: Kanji N5 */}
            <button
              onClick={() => navigate('/kanji')}
              className="card-surface p-4 rounded-2xl flex flex-col items-start gap-2.5 tap-highlight border border-white/5 relative overflow-hidden"
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-srs-guru)]/20 text-[var(--color-srs-guru)] font-bold">
                  Paso 3
                </span>
                <span className="font-jp text-2xl font-bold text-[var(--color-text-primary)]">日</span>
              </div>
              <div>
                <h4 className="font-bold text-sm">Kanji N5</h4>
                <p className="text-[11px] text-[var(--color-text-secondary)]">Ideogramas esenciales</p>
              </div>
              <div className="w-full bg-[var(--color-bg-primary)] rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-[var(--color-srs-guru)] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (kanjiLearned / 37) * 100)}%` }}
                />
              </div>
            </button>

            {/* Step 4: Vocabulario */}
            <button
              onClick={() => navigate('/vocab')}
              className="card-surface p-4 rounded-2xl flex flex-col items-start gap-2.5 tap-highlight border border-white/5 relative overflow-hidden"
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-srs-master)]/20 text-[var(--color-srs-master)] font-bold">
                  Paso 4
                </span>
                <span className="font-jp text-2xl font-bold text-[var(--color-text-primary)]">語</span>
              </div>
              <div>
                <h4 className="font-bold text-sm">Vocabulario</h4>
                <p className="text-[11px] text-[var(--color-text-secondary)]">Frases y palabras clave</p>
              </div>
              <div className="w-full bg-[var(--color-bg-primary)] rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-[var(--color-srs-master)] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (vocabLearned / 20) * 100)}%` }}
                />
              </div>
            </button>
          </div>
        </section>

        {/* Daily Goals */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider px-1">
            Metas Diarias
          </h3>
          <div className="card-surface p-4 space-y-4 rounded-2xl">
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-medium">
                <span>Lecciones de hoy</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {dailyLessonsCompleted} / {dailyLessonGoal}
                </span>
              </div>
              <div className="w-full bg-[var(--color-bg-primary)] rounded-full h-2 overflow-hidden">
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
              <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-medium">
                <span>Repasos completados</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {dailyReviewsCompleted} / {dailyReviewGoal}
                </span>
              </div>
              <div className="w-full bg-[var(--color-bg-primary)] rounded-full h-2 overflow-hidden">
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
          <div className="card-surface p-3 flex flex-col items-center justify-center rounded-2xl">
            <span className="text-xs text-[var(--color-text-secondary)]">XP Total</span>
            <span
              className="text-xl font-bold text-[var(--color-accent-gold)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {xp}
            </span>
          </div>
          <div className="card-surface p-3 flex flex-col items-center justify-center rounded-2xl">
            <ProgressRing progress={progressPercent} size={44} strokeWidth={4} />
            <span className="text-xs text-[var(--color-text-secondary)] mt-1">Progreso N5</span>
          </div>
        </section>

        {/* SRS Stage Distribution */}
        {stageDistribution && totalCards > 0 && (
          <section className="card-surface p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Niveles de Memoria SRS
            </h3>
            <div className="flex gap-1 h-3.5 rounded-full overflow-hidden bg-[var(--color-bg-primary)] p-0.5">
              {(Object.keys(SRS_STAGES) as SRSStage[]).map((stage) => {
                const count = stageDistribution[stage] || 0;
                const pct = (count / totalCards) * 100;
                if (pct === 0) return null;
                return (
                  <div
                    key={stage}
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: SRS_STAGES[stage].color,
                      minWidth: '4px',
                    }}
                    title={`${SRS_STAGES[stage].label}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {(Object.keys(SRS_STAGES) as SRSStage[]).map((stage) => {
                const count = stageDistribution[stage] || 0;
                if (count === 0) return null;
                return (
                  <span key={stage} className="flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)]">
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
      </div>

      {/* Beginner Guide Modal */}
      <BeginnerGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </AppShell>
  );
}
