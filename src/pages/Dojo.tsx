import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { AppShell } from '../components/layout/AppShell';
import { getReviewQueue } from '../engines/srs-scheduler';
import { ExerciseMatchPairs } from '../components/lesson/ExerciseMatchPairs';
import {
  Sword,
  Zap,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useStudyStore } from '../stores/useStudyStore';
import { cn } from '../lib/utils';

export default function Dojo() {
  const navigate = useNavigate();
  const { addXp } = useStudyStore();
  const [isPlayingMatchGame, setIsPlayingMatchGame] = useState(false);
  const [matchGameFinished, setMatchGameFinished] = useState(false);

  // Pending SRS reviews count
  const pendingReviews = useLiveQuery(
    async () => {
      const queue = await getReviewQueue();
      return queue.length;
    },
    [],
    0
  );

  // Total learned cards in SRS
  const learnedCardsCount = useLiveQuery(
    async () => {
      return await db.cards.where('srsState').notEqual('new').count();
    },
    [],
    0
  );

  // Quick pairs dataset for the Dojo Time Attack minigame
  const miniGamePairs = [
    { id: 'p1', left: 'あ', right: 'a' },
    { id: 'p2', left: 'い', right: 'i' },
    { id: 'p3', left: 'う', right: 'u' },
    { id: 'p4', left: 'か', right: 'ka' },
    { id: 'p5', left: 'さ', right: 'sa' },
    { id: 'p6', left: '日', right: 'Sol (hi)' },
  ];

  const handleMinigameComplete = () => {
    addXp(20);
    setMatchGameFinished(true);
  };

  return (
    <AppShell title="Dojo de Práctica" showStats>
      <div className="space-y-6 animate-fade-in max-w-lg mx-auto pb-4">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold font-jp text-[var(--color-text-primary)]">
            Dojo de Entrenamiento
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Refuerza y consolida lo aprendido con minijuegos y repetición espaciada
          </p>
        </div>

        {/* SRS Main Card */}
        <div className="card-elevated p-5 rounded-3xl border border-white/10 space-y-4 shadow-xl relative overflow-hidden bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-bg-elevated)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)] text-white flex items-center justify-center font-bold shadow-lg">
                <Sword size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                  Repaso FSRS
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {learnedCardsCount} elementos en tu memoria
                </p>
              </div>
            </div>

            <span className="text-2xl font-bold font-mono text-[var(--color-accent-gold)]" style={{ fontFamily: 'var(--font-mono)' }}>
              {pendingReviews}
            </span>
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            El algoritmo FSRS calcula el momento exacto antes de que olvides un carácter para repasarlo.
          </p>

          <button
            onClick={() => navigate('/review')}
            disabled={pendingReviews === 0}
            className={cn(
              'w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 tap-highlight transition-all shadow-lg',
              pendingReviews > 0
                ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white'
                : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] cursor-not-allowed'
            )}
          >
            <RefreshCw size={16} />
            <span>{pendingReviews > 0 ? `Repasar (${pendingReviews} pendientes)` : 'Todo repasado por ahora'}</span>
          </button>
        </div>

        {/* Minigames Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] px-1">
            Minijuegos de Reflejos
          </h3>

          {/* Time Attack Match Pairs Minigame */}
          <div className="card-surface p-4 rounded-2xl border border-white/5 space-y-3">
            {!isPlayingMatchGame ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                      Emparejar Parejas (Speed Match)
                    </h4>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      Conecta las parejas lo más rápido que puedas (+20 XP)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsPlayingMatchGame(true);
                    setMatchGameFinished(false);
                  }}
                  className="py-2 px-3.5 rounded-xl bg-[var(--color-accent)] text-white font-bold text-xs tap-highlight"
                >
                  Jugar
                </button>
              </div>
            ) : matchGameFinished ? (
              <div className="text-center py-4 space-y-3">
                <Award size={32} className="text-[var(--color-accent-gold)] mx-auto animate-bounce" />
                <h4 className="font-bold text-base">¡Reto completado!</h4>
                <p className="text-xs text-[var(--color-text-secondary)]">+20 XP ganados para tu racha</p>
                <button
                  onClick={() => {
                    setIsPlayingMatchGame(false);
                    setMatchGameFinished(false);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[var(--color-accent)] text-white font-bold text-xs tap-highlight"
                >
                  Volver al Dojo
                </button>
              </div>
            ) : (
              <div className="py-2">
                <ExerciseMatchPairs
                  exercise={{
                    type: 'match-pairs',
                    prompt: '⚡ Conecta las parejas rápidamente',
                    pairs: miniGamePairs,
                  }}
                  onComplete={handleMinigameComplete}
                />
              </div>
            )}
          </div>

          {/* Quick Category Review Links */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => navigate('/review/hiragana')}
              className="card-surface p-3.5 rounded-2xl flex items-center gap-2.5 tap-highlight border border-white/5 text-left"
            >
              <span className="font-jp text-xl font-bold text-[var(--color-accent)]">あ</span>
              <div>
                <span className="font-bold text-xs block">Repasar Hiragana</span>
                <span className="text-[10px] text-[var(--color-text-secondary)]">Solo silabario</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/review/kanji-n5')}
              className="card-surface p-3.5 rounded-2xl flex items-center gap-2.5 tap-highlight border border-white/5 text-left"
            >
              <span className="font-jp text-xl font-bold text-[var(--color-accent-gold)]">日</span>
              <div>
                <span className="font-bold text-xs block">Repasar Kanji N5</span>
                <span className="text-[10px] text-[var(--color-text-secondary)]">Solo ideogramas</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
