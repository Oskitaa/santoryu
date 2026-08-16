import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, RefreshCw, BookOpen, X } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { db } from '../db/database';
import { useAudio } from '../hooks/useAudio';
import { SRS_STAGES } from '../lib/constants';
import type { KanjiEntry, SRSStage } from '../lib/types';
import { cn } from '../lib/utils';

export default function KanjiTower() {
  const [kanjiList, setKanjiList] = useState<KanjiEntry[]>([]);
  const [selectedKanji, setSelectedKanji] = useState<KanjiEntry | null>(null);

  const navigate = useNavigate();
  const { speak } = useAudio();

  useEffect(() => {
    fetch('/data/kanji-n5.json')
      .then((res) => res.json())
      .then((data: KanjiEntry[]) => setKanjiList(data))
      .catch((err) => console.error('Error loading kanji data:', err));
  }, []);

  const cards = useLiveQuery(() => db.cards.where('category').equals('kanji-n5').toArray());
  const cardMap = new Map(cards?.map((c) => [c.externalId, c]) || []);

  const totalKanji = kanjiList.length;
  const learnedCount = cards?.filter((c) => c.srsState !== 'new').length || 0;
  const dueCount = cards?.filter((c) => c.srsState !== 'new' && c.nextReview > 0 && c.nextReview <= Date.now()).length || 0;
  const newCount = cards?.filter((c) => c.srsState === 'new').length || 0;
  const progressPercent = totalKanji > 0 ? Math.round((learnedCount / totalKanji) * 100) : 0;

  const handleKanjiClick = (kanji: KanjiEntry) => {
    setSelectedKanji(kanji);
    speak(kanji.character);
  };

  return (
    <AppShell title="Kanji Tower" showStats>
      <div className="space-y-5 animate-fade-in px-1">
        {/* Level Badge Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold text-xs border border-[var(--color-accent)]/30">
              JLPT N5
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {totalKanji} Caracteres esenciales
            </span>
          </div>
          <span className="text-xs font-mono text-[var(--color-accent-gold)]" style={{ fontFamily: 'var(--font-mono)' }}>
            {learnedCount} / {totalKanji}
          </span>
        </div>

        {/* Progress Card */}
        <div className="card-surface p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--color-text-secondary)]">Dominio de Kanji</span>
            <span className="font-bold text-[var(--color-accent-gold)]" style={{ fontFamily: 'var(--font-mono)' }}>
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-[var(--color-bg-primary)] rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-accent)] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => navigate('/review/kanji-n5')}
              disabled={newCount === 0}
              className="py-3 px-4 rounded-xl bg-[var(--color-bg-elevated)] border border-white/5 font-semibold text-sm flex items-center justify-center gap-2 tap-highlight disabled:opacity-40"
            >
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              Nuevos ({newCount})
            </button>
            <button
              onClick={() => navigate('/review/kanji-n5')}
              disabled={dueCount === 0}
              className={cn(
                'py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 tap-highlight disabled:opacity-40 transition-all',
                dueCount > 0
                  ? 'bg-[var(--color-accent)] text-white shadow-lg'
                  : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]'
              )}
            >
              <RefreshCw className="w-4 h-4" />
              Repasar ({dueCount})
            </button>
          </div>
        </div>

        {/* Kanji Grid */}
        <div className="card-surface p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
              Lista de Kanji
            </h3>
            <span className="text-xs text-[var(--color-text-secondary)]">Toca para detalles</span>
          </div>

          <div className="grid grid-cols-5 gap-2.5">
            {kanjiList.map((k) => {
              const card = cardMap.get(k.id);
              const stage = (card?.srsStage || 'new') as SRSStage;
              const stageColor = SRS_STAGES[stage]?.color || 'var(--color-srs-new)';
              const isSelected = selectedKanji?.id === k.id;

              return (
                <button
                  key={k.id}
                  onClick={() => handleKanjiClick(k)}
                  className={cn(
                    'aspect-square rounded-xl flex flex-col items-center justify-center relative p-1 transition-all tap-highlight',
                    isSelected
                      ? 'bg-[var(--color-bg-elevated)] ring-2 ring-[var(--color-accent)] shadow-lg'
                      : 'bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border border-white/5'
                  )}
                >
                  <span className="font-jp text-2xl font-bold leading-tight">
                    {k.character}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-secondary)] truncate w-full text-center">
                    {k.meaningsEs?.[0] || k.meanings[0]}
                  </span>

                  {card && card.srsState !== 'new' && (
                    <span
                      className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: stageColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedKanji && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
              onClick={() => setSelectedKanji(null)}
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="w-full max-w-lg bg-[var(--color-bg-surface)] border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elevated)] flex items-center justify-center border border-white/10">
                      <span className="font-jp text-4xl font-bold">{selectedKanji.character}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold capitalize">
                        {selectedKanji.meaningsEs?.join(', ') || selectedKanji.meanings.join(', ')}
                      </h2>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {selectedKanji.strokeCount} trazos • Grado {selectedKanji.gradeLevel}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speak(selectedKanji.character)}
                      className="p-2.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-accent)] tap-highlight"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedKanji(null)}
                      className="p-2.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] tap-highlight"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Readings */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="card-elevated p-3 rounded-xl">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">
                      On'yomi (Chino)
                    </span>
                    <span className="font-jp font-bold text-[var(--color-accent-gold)]">
                      {selectedKanji.onReadings?.join('、 ') || '-'}
                    </span>
                  </div>
                  <div className="card-elevated p-3 rounded-xl">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">
                      Kun'yomi (Japonés)
                    </span>
                    <span className="font-jp font-bold text-[var(--color-accent)]">
                      {selectedKanji.kunReadings?.join('、 ') || '-'}
                    </span>
                  </div>
                </div>

                {/* Mnemonic */}
                {selectedKanji.mnemonic && (
                  <div className="card-elevated p-3 rounded-xl">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">
                      Mnemotecnia
                    </span>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {selectedKanji.mnemonic}
                    </p>
                  </div>
                )}

                {/* Example Words */}
                {selectedKanji.exampleWords && selectedKanji.exampleWords.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
                      Vocabulario de ejemplo
                    </span>
                    <div className="space-y-1.5">
                      {selectedKanji.exampleWords.map((ex, i) => (
                        <div
                          key={i}
                          onClick={() => speak(ex.word)}
                          className="flex justify-between items-center p-2.5 rounded-xl bg-[var(--color-bg-elevated)] tap-highlight cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-jp font-bold text-base">{ex.word}</span>
                            <span className="font-jp text-xs text-[var(--color-text-secondary)]">
                              {ex.reading}
                            </span>
                          </div>
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {ex.meaning}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
