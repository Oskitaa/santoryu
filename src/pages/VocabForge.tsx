import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'motion/react';
import { Search, Volume2, Sparkles, RefreshCw, BookOpen } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { db } from '../db/database';
import { useAudio } from '../hooks/useAudio';
import { useSettingsStore } from '../stores/useSettingsStore';
import { SRS_STAGES } from '../lib/constants';
import type { VocabEntry, SRSStage } from '../lib/types';
import { cn } from '../lib/utils';

export default function VocabForge() {
  const [vocabList, setVocabList] = useState<VocabEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const { speak } = useAudio();
  const furiganaMode = useSettingsStore((s) => s.furiganaMode);

  useEffect(() => {
    fetch('/data/vocab-n5.json')
      .then((res) => res.json())
      .then((data: VocabEntry[]) => setVocabList(data))
      .catch((err) => console.error('Error loading vocab data:', err));
  }, []);

  const cards = useLiveQuery(() => db.cards.where('category').equals('vocab-n5').toArray());
  const cardMap = new Map(cards?.map((c) => [c.externalId, c]) || []);

  const totalVocab = vocabList.length;
  const learnedCount = cards?.filter((c) => c.srsState !== 'new').length || 0;
  const dueCount = cards?.filter((c) => c.srsState !== 'new' && c.nextReview > 0 && c.nextReview <= Date.now()).length || 0;
  const newCount = cards?.filter((c) => c.srsState === 'new').length || 0;
  const progressPercent = totalVocab > 0 ? Math.round((learnedCount / totalVocab) * 100) : 0;

  const filteredVocab = useMemo(() => {
    if (!searchQuery.trim()) return vocabList;
    const q = searchQuery.toLowerCase().trim();
    return vocabList.filter(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        v.reading.toLowerCase().includes(q) ||
        v.meaningsEs?.some((m) => m.toLowerCase().includes(q)) ||
        v.meanings.some((m) => m.toLowerCase().includes(q))
    );
  }, [vocabList, searchQuery]);

  return (
    <AppShell title="Vocab Forge" showStats>
      <div className="space-y-5 animate-fade-in px-1">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar palabra, lectura o significado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-accent)] transition-all placeholder:text-[var(--color-text-muted)]"
          />
        </div>

        {/* Progress Card */}
        <div className="card-surface p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--color-text-secondary)]">Dominio de Vocabulario</span>
            <span className="font-bold text-[var(--color-accent-gold)]" style={{ fontFamily: 'var(--font-mono)' }}>
              {learnedCount} / {totalVocab} ({progressPercent}%)
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
              onClick={() => navigate('/review/vocab-n5')}
              disabled={newCount === 0}
              className="py-3 px-4 rounded-xl bg-[var(--color-bg-elevated)] border border-white/5 font-semibold text-sm flex items-center justify-center gap-2 tap-highlight disabled:opacity-40"
            >
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              Nuevos ({newCount})
            </button>
            <button
              onClick={() => navigate('/review/vocab-n5')}
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

        {/* Vocab List */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
              Palabras ({filteredVocab.length})
            </h3>
          </div>

          {filteredVocab.map((vocab) => {
            const card = cardMap.get(vocab.id);
            const stage = (card?.srsStage || 'new') as SRSStage;
            const stageColor = SRS_STAGES[stage]?.color || 'var(--color-srs-new)';

            return (
              <div
                key={vocab.id}
                className="card-surface p-4 flex items-center justify-between gap-3 tap-highlight"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ruby className={cn('font-jp text-xl font-bold', furiganaMode === 'hidden' && 'furigana-hidden', furiganaMode === 'hover' && 'furigana-hover')}>
                      {vocab.word}
                      <rt className="text-xs text-[var(--color-text-secondary)] font-normal">{vocab.reading}</rt>
                    </ruby>
                    {vocab.partOfSpeech && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] uppercase font-semibold">
                        {vocab.partOfSpeech}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[var(--color-text-primary)]">
                    {vocab.meaningsEs?.join(', ') || vocab.meanings.join(', ')}
                  </p>

                  {vocab.exampleSentence && (
                    <p className="text-xs text-[var(--color-text-muted)] font-jp italic pt-0.5">
                      {vocab.exampleSentence.japanese} — {vocab.exampleSentence.meaningEs || vocab.exampleSentence.meaning}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* SRS Stage indicator */}
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: stageColor }}
                    title={SRS_STAGES[stage]?.label}
                  />

                  <button
                    onClick={() => speak(vocab.word)}
                    className="p-2.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-accent)] tap-highlight"
                    aria-label="Escuchar pronunciación"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredVocab.length === 0 && (
            <div className="py-12 text-center text-[var(--color-text-muted)] card-surface rounded-2xl">
              No se encontraron palabras para "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
