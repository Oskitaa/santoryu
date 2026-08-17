import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, RefreshCw, BookOpen, Lightbulb, Info } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { db } from '../db/database';
import { useAudio } from '../hooks/useAudio';
import { SRS_STAGES } from '../lib/constants';
import type { KanaData, KanaCharacter, SRSStage } from '../lib/types';
import { cn } from '../lib/utils';

const rowDescriptions: Record<string, { name: string; tip: string }> = {
  vowel: { name: 'Fila A (Vocales Puras)', tip: 'La base de todo el idioma: a, i, u, e, o. Idénticas al español.' },
  k: { name: 'Fila Ka (K)', tip: 'Consonante K + vocales: ka, ki, ku, ke, ko.' },
  s: { name: 'Fila Sa (S)', tip: '¡Atención a la excepción!: sa, shi (como en inglés "she"), su, se, so.' },
  t: { name: 'Fila Ta (T)', tip: '¡Dos excepciones!: ta, chi (como "chile"), tsu (como "tsunami"), te, to.' },
  n: { name: 'Fila Na (N)', tip: 'Sonidos suaves de la N: na, ni, nu, ne, no.' },
  h: { name: 'Fila Ha (H)', tip: 'La H suena aspirada: ha, hi, fu (soplando suave entre labios), he, ho.' },
  m: { name: 'Fila Ma (M)', tip: 'Sonidos labiales directos: ma, mi, mu, me, mo.' },
  y: { name: 'Fila Ya (Y)', tip: 'Semivocales: solo existen 3 (ya, yu, yo).' },
  r: { name: 'Fila Ra (R)', tip: 'La R japonesa es suave (entre r y l ligera): ra, ri, ru, re, ro.' },
  w: { name: 'Fila Wa & N', tip: 'Wa (palabra), Wo (partícula gramatical) y N (ん, la única consonante solitaria).' },
};

export default function KanaDojo({ embedded = false }: { embedded?: boolean }) {
  const [activeTab, setActiveTab] = useState<'hiragana' | 'katakana'>('hiragana');
  const [kanaData, setKanaData] = useState<KanaData | null>(null);
  const [selectedChar, setSelectedChar] = useState<KanaCharacter | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'basic' | 'dakuon'>('all');

  const navigate = useNavigate();
  const { speak } = useAudio();

  useEffect(() => {
    fetch(`/data/${activeTab}.json`)
      .then((res) => res.json())
      .then((data: KanaData) => setKanaData(data))
      .catch((err) => console.error('Error loading kana data:', err));
  }, [activeTab]);

  const cards = useLiveQuery(
    () => db.cards.where('category').equals(activeTab).toArray(),
    [activeTab]
  );

  const cardMap = new Map(cards?.map((c) => [c.externalId, c]) || []);

  const totalChars = kanaData?.characters.length || 0;
  const learnedCount = cards?.filter((c) => c.srsState !== 'new').length || 0;
  const dueCount = cards?.filter((c) => c.srsState !== 'new' && c.nextReview > 0 && c.nextReview <= Date.now()).length || 0;
  const newCount = cards?.filter((c) => c.srsState === 'new').length || 0;
  const progressPercent = totalChars > 0 ? Math.round((learnedCount / totalChars) * 100) : 0;

  const handleCharClick = (char: KanaCharacter) => {
    setSelectedChar(char);
    speak(char.character);
  };

  const displayedCharacters = kanaData?.characters.filter((c) => {
    if (activeFilter === 'basic') return c.type === 'basic';
    if (activeFilter === 'dakuon') return c.type === 'dakuon' || c.type === 'handakuon';
    return true;
  });

  const content = (
    <div className="space-y-5 animate-fade-in px-1 max-w-lg mx-auto pb-6">
      {/* Tab Selector */}
      <div className="flex bg-[var(--color-bg-surface)] p-1.5 rounded-2xl border border-white/5">
        <button
          onClick={() => { setActiveTab('hiragana'); setSelectedChar(null); }}
          className={cn(
            'flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 tap-highlight',
            activeTab === 'hiragana'
              ? 'bg-[var(--color-accent)] text-white shadow-lg'
              : 'text-[var(--color-text-secondary)] hover:text-white'
          )}
        >
          <span className="font-jp text-lg">あ</span>
          Hiragana
        </button>
        <button
          onClick={() => { setActiveTab('katakana'); setSelectedChar(null); }}
          className={cn(
            'flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 tap-highlight',
            activeTab === 'katakana'
              ? 'bg-[var(--color-accent)] text-white shadow-lg'
              : 'text-[var(--color-text-secondary)] hover:text-white'
          )}
        >
          <span className="font-jp text-lg">ア</span>
          Katakana
        </button>
      </div>

      {/* Beginner Context Tip Banner */}
      <div className="p-3.5 rounded-2xl bg-[var(--color-bg-surface)] border border-white/5 flex items-start gap-3">
        <Info className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          {activeTab === 'hiragana'
            ? 'El Hiragana es el abecedario fundamental para la gramática y palabras japonesas. Cada símbolo representa una sílaba exacta.'
            : 'El Katakana tiene los mismos sonidos que el Hiragana pero trazos más rectos. Se usa para palabras importadas (ej. テレビ terebi = TV).'}
        </p>
      </div>

      {/* Progress Card */}
      <div className="card-surface p-4 space-y-3">
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <span className="text-[var(--color-text-secondary)]">Dominio de {activeTab === 'hiragana' ? 'Hiragana' : 'Katakana'}</span>
          <span className="font-bold text-[var(--color-accent-gold)]" style={{ fontFamily: 'var(--font-mono)' }}>
            {learnedCount} / {totalChars} ({progressPercent}%)
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
            onClick={() => navigate(`/review/${activeTab}`)}
            disabled={newCount === 0}
            className="py-3 px-4 rounded-xl bg-[var(--color-bg-elevated)] border border-white/5 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 tap-highlight disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
            Nuevos ({newCount})
          </button>
          <button
            onClick={() => navigate(`/review/${activeTab}`)}
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

      {/* Selected Kana Detail Card */}
      <AnimatePresence>
        {selectedChar && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card-elevated p-4 flex items-center justify-between border-l-4 border-[var(--color-accent)] rounded-2xl shadow-xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center border border-white/10 shadow-inner">
                <span className="font-jp text-3xl font-bold">{selectedChar.character}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono text-[var(--color-accent-gold)]">
                    {selectedChar.romaji}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] font-semibold uppercase">
                    {selectedChar.type}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 flex items-center gap-1">
                  <Lightbulb size={12} className="text-[var(--color-accent)] flex-shrink-0" />
                  <span>{selectedChar.mnemonic || `${selectedChar.strokeCount} trazos`}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => speak(selectedChar.character)}
              className="p-3 rounded-full bg-[var(--color-bg-surface)] text-[var(--color-accent)] tap-highlight shadow-sm"
              aria-label="Escuchar pronunciación"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Pills */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={cn(
            'py-1.5 px-3 rounded-full text-xs font-semibold transition-all tap-highlight',
            activeFilter === 'all'
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]'
          )}
        >
          Todos
        </button>
        <button
          onClick={() => setActiveFilter('basic')}
          className={cn(
            'py-1.5 px-3 rounded-full text-xs font-semibold transition-all tap-highlight',
            activeFilter === 'basic'
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]'
          )}
        >
          Básicos (46)
        </button>
        <button
          onClick={() => setActiveFilter('dakuon')}
          className={cn(
            'py-1.5 px-3 rounded-full text-xs font-semibold transition-all tap-highlight',
            activeFilter === 'dakuon'
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]'
          )}
        >
          Sonoros (゛/ ゜)
        </button>
      </div>

      {/* Interactive Gojūon Chart */}
      <div className="card-surface p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
            Tabla Gojūon (50 Sonidos)
          </h3>
          <span className="text-[11px] text-[var(--color-text-secondary)]">
            Toca para escuchar
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-5 gap-2">
          {displayedCharacters?.map((char) => {
            const card = cardMap.get(char.id);
            const stage = (card?.srsStage || 'new') as SRSStage;
            const stageColor = SRS_STAGES[stage]?.color || 'var(--color-srs-new)';
            const isSelected = selectedChar?.id === char.id;

            return (
              <button
                key={char.id}
                onClick={() => handleCharClick(char)}
                className={cn(
                  'aspect-square rounded-2xl flex flex-col items-center justify-center relative p-1 transition-all tap-highlight shadow-sm',
                  isSelected
                    ? 'bg-[var(--color-bg-elevated)] ring-2 ring-[var(--color-accent)] shadow-lg scale-105'
                    : 'bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border border-white/5'
                )}
              >
                <span className="font-jp text-2xl font-bold leading-tight">
                  {char.character}
                </span>
                <span
                  className="text-[10px] text-[var(--color-text-secondary)] font-mono"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {char.romaji}
                </span>

                {/* SRS Stage indicator dot */}
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

      {/* Phonetic Row-by-Row Explanations for Absolute Beginners */}
      <div className="card-surface p-4 space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1.5">
          <Lightbulb size={14} className="text-[var(--color-accent-gold)]" />
          Guía de Pronunciación Fila por Fila
        </h3>
        <div className="space-y-2">
          {Object.entries(rowDescriptions).map(([key, desc]) => (
            <div key={key} className="p-2.5 rounded-xl bg-[var(--color-bg-primary)] text-xs border border-white/5">
              <span className="font-bold text-[var(--color-accent)] block mb-0.5">{desc.name}</span>
              <p className="text-[var(--color-text-muted)] leading-snug">{desc.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <AppShell title="Kana Dojo" showStats>
      {content}
    </AppShell>
  );
}
