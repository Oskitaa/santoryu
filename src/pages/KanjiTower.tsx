import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, RefreshCw, BookOpen, X, Lightbulb, Info } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { db } from '../db/database';
import { useAudio } from '../hooks/useAudio';
import { SRS_STAGES } from '../lib/constants';
import type { KanjiEntry, SRSStage } from '../lib/types';
import { cn } from '../lib/utils';

export default function KanjiTower() {
  const [kanjiList, setKanjiList] = useState<KanjiEntry[]>([]);
  const [selectedKanji, setSelectedKanji] = useState<KanjiEntry | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'numbers' | 'nature' | 'people' | 'actions'>('all');

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

  const filteredKanji = useMemo(() => {
    if (categoryFilter === 'all') return kanjiList;
    if (categoryFilter === 'numbers') return kanjiList.slice(0, 14); // 1-10, 100, 1000, 10000, yen
    if (categoryFilter === 'nature') return kanjiList.slice(14, 21); // sol, luna, fuego, agua, árbol, oro, tierra
    if (categoryFilter === 'people') return kanjiList.slice(21, 29); // persona, hombre, mujer, niño, estudio...
    if (categoryFilter === 'actions') return kanjiList.slice(29); // comer, beber, ver, oir...
    return kanjiList;
  }, [kanjiList, categoryFilter]);

  return (
    <AppShell title="Kanji Tower" showStats>
      <div className="space-y-5 animate-fade-in px-1 max-w-lg mx-auto">
        {/* Level Badge Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-bold text-xs border border-[var(--color-accent)]/30">
              JLPT N5 (Nivel Inicial)
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {totalKanji} Caracteres esenciales
            </span>
          </div>
          <span className="text-xs font-mono text-[var(--color-accent-gold)]" style={{ fontFamily: 'var(--font-mono)' }}>
            {learnedCount} / {totalKanji}
          </span>
        </div>

        {/* Beginner Context Tip Banner */}
        <div className="p-3.5 rounded-2xl bg-[var(--color-bg-surface)] border border-white/5 flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[var(--color-text-secondary)] space-y-1">
            <p>
              <b>¿Qué es un Kanji?</b> Cada kanji representa un significado o idea completa.
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              • <b>On'yomi (Chino):</b> Se usa en palabras compuestas (ej. 日本 <i>Ni-hon</i>).<br/>
              • <b>Kun'yomi (Japonés):</b> Se usa cuando el kanji está solo o con hiragana (ej. 日 <i>hi</i> = sol).
            </p>
          </div>
        </div>

        {/* Progress Card */}
        <div className="card-surface p-4 space-y-3">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-[var(--color-text-secondary)]">Dominio de Kanji N5</span>
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
              className="py-3 px-4 rounded-xl bg-[var(--color-bg-elevated)] border border-white/5 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 tap-highlight disabled:opacity-40"
            >
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              Nuevos ({newCount})
            </button>
            <button
              onClick={() => navigate('/review/kanji-n5')}
              disabled={dueCount === 0}
              className={cn(
                'py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 tap-highlight disabled:opacity-40 transition-all',
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

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'numbers', label: 'Números (1-10)' },
            { id: 'nature', label: 'Naturaleza' },
            { id: 'people', label: 'Personas' },
            { id: 'actions', label: 'Acciones' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as any)}
              className={cn(
                'py-1.5 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all tap-highlight',
                categoryFilter === tab.id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Kanji Grid */}
        <div className="card-surface p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
              Caracteres ({filteredKanji.length})
            </h3>
            <span className="text-[11px] text-[var(--color-text-secondary)]">Toca para detalles</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
            {filteredKanji.map((k) => {
              const card = cardMap.get(k.id);
              const stage = (card?.srsStage || 'new') as SRSStage;
              const stageColor = SRS_STAGES[stage]?.color || 'var(--color-srs-new)';
              const isSelected = selectedKanji?.id === k.id;

              return (
                <button
                  key={k.id}
                  onClick={() => handleKanjiClick(k)}
                  className={cn(
                    'aspect-square rounded-2xl flex flex-col items-center justify-center relative p-1 transition-all tap-highlight shadow-sm',
                    isSelected
                      ? 'bg-[var(--color-bg-elevated)] ring-2 ring-[var(--color-accent)] shadow-lg scale-105'
                      : 'bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border border-white/5'
                  )}
                >
                  <span className="font-jp text-2xl font-bold leading-tight">
                    {k.character}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-secondary)] truncate w-full text-center px-1">
                    {k.meaningsEs?.[0] || k.meanings[0]}
                  </span>

                  {card && card.srsState !== 'new' && (
                    <span
                      className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
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
                className="w-full max-w-lg bg-[var(--color-bg-surface)] border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elevated)] flex items-center justify-center border border-white/10 shadow-inner">
                      <span className="font-jp text-4xl font-bold">{selectedKanji.character}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold capitalize">
                        {selectedKanji.meaningsEs?.join(', ') || selectedKanji.meanings.join(', ')}
                      </h2>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {selectedKanji.strokeCount} trazos • Grado {selectedKanji.gradeLevel} (N5)
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
                  <div className="card-elevated p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">
                      On'yomi (Chino)
                    </span>
                    <span className="font-jp font-bold text-sm text-[var(--color-accent-gold)]">
                      {selectedKanji.onReadings?.join('、 ') || '-'}
                    </span>
                  </div>
                  <div className="card-elevated p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-1">
                      Kun'yomi (Japonés)
                    </span>
                    <span className="font-jp font-bold text-sm text-[var(--color-accent)]">
                      {selectedKanji.kunReadings?.join('、 ') || '-'}
                    </span>
                  </div>
                </div>

                {/* Mnemonic */}
                {selectedKanji.mnemonic && (
                  <div className="card-elevated p-3.5 rounded-2xl border border-white/5 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-[var(--color-accent-gold)] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-[var(--color-text-primary)] block mb-0.5">
                        Mnemotecnia visual
                      </span>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        {selectedKanji.mnemonic}
                      </p>
                    </div>
                  </div>
                )}

                {/* Example Words */}
                {selectedKanji.exampleWords && selectedKanji.exampleWords.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
                      Palabras compuestas de ejemplo
                    </span>
                    <div className="space-y-1.5">
                      {selectedKanji.exampleWords.map((ex, i) => (
                        <div
                          key={i}
                          onClick={() => speak(ex.word)}
                          className="flex justify-between items-center p-3 rounded-2xl bg-[var(--color-bg-elevated)] tap-highlight cursor-pointer border border-white/5 hover:border-[var(--color-accent)]/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-jp font-bold text-base">{ex.word}</span>
                            <span className="font-jp text-xs text-[var(--color-accent-gold)]">
                              ({ex.reading})
                            </span>
                          </div>
                          <span className="text-xs text-[var(--color-text-secondary)]">
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
