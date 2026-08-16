import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'motion/react';
import { Search, Volume2, Sparkles, RefreshCw, BookOpen, Info, MessageSquare } from 'lucide-react';
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
  const [tagFilter, setTagFilter] = useState<string>('all');

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
    let list = vocabList;
    if (tagFilter !== 'all') {
      list = list.filter((v) => v.tags?.includes(tagFilter) || v.partOfSpeech === tagFilter);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        v.reading.toLowerCase().includes(q) ||
        v.meaningsEs?.some((m) => m.toLowerCase().includes(q)) ||
        v.meanings.some((m) => m.toLowerCase().includes(q))
    );
  }, [vocabList, searchQuery, tagFilter]);

  return (
    <AppShell title="Vocab Forge" showStats>
      <div className="space-y-5 animate-fade-in px-1 max-w-lg mx-auto">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar palabra, lectura o significado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-[var(--color-accent)] transition-all placeholder:text-[var(--color-text-muted)]"
          />
        </div>

        {/* Beginner Tip Banner */}
        <div className="p-3.5 rounded-2xl bg-[var(--color-bg-surface)] border border-white/5 flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <b>Lectura con Furigana:</b> Las pequeñas letras encima de cada palabra son su lectura en Hiragana. Puedes configurar su visibilidad en Ajustes.
          </p>
        </div>

        {/* Progress Card */}
        <div className="card-surface p-4 space-y-3">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-[var(--color-text-secondary)]">Dominio de Vocabulario N5</span>
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
              className="py-3 px-4 rounded-xl bg-[var(--color-bg-elevated)] border border-white/5 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 tap-highlight disabled:opacity-40"
            >
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              Nuevos ({newCount})
            </button>
            <button
              onClick={() => navigate('/review/vocab-n5')}
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

        {/* Tag Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'greetings', label: 'Saludos y Cortesía' },
            { id: 'pronoun', label: 'Pronombres' },
            { id: 'verb', label: 'Verbos clave' },
            { id: 'essential', label: 'Esenciales' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTagFilter(tab.id)}
              className={cn(
                'py-1.5 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all tap-highlight',
                tagFilter === tab.id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Vocab List */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-xs text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
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
                className="card-surface p-4 rounded-2xl flex items-center justify-between gap-3 tap-highlight border border-white/5 hover:border-[var(--color-accent)]/20 transition-all shadow-sm"
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

                  <p className="text-xs sm:text-sm text-[var(--color-text-primary)] font-medium">
                    {vocab.meaningsEs?.join(', ') || vocab.meanings.join(', ')}
                  </p>

                  {vocab.exampleSentence && (
                    <div className="pt-1 flex items-start gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
                      <MessageSquare size={12} className="text-[var(--color-accent-gold)] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-jp text-[var(--color-text-primary)]">{vocab.exampleSentence.japanese}</p>
                        <p className="text-[var(--color-text-muted)] italic">
                          {vocab.exampleSentence.meaningEs || vocab.exampleSentence.meaning}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* SRS Stage indicator */}
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stageColor }}
                    title={SRS_STAGES[stage]?.label}
                  />

                  <button
                    onClick={() => speak(vocab.word)}
                    className="p-2.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-accent)] tap-highlight shadow-sm"
                    aria-label="Escuchar pronunciación"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredVocab.length === 0 && (
            <div className="py-12 text-center text-[var(--color-text-muted)] card-surface rounded-2xl text-xs">
              No se encontraron palabras para "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
