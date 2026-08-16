import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, RefreshCw, BookOpen } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { db } from '../db/database';
import { useAudio } from '../hooks/useAudio';
import { SRS_STAGES } from '../lib/constants';
import type { KanaData, KanaCharacter, SRSStage } from '../lib/types';
import { cn } from '../lib/utils';

export default function KanaDojo() {
  const [activeTab, setActiveTab] = useState<'hiragana' | 'katakana'>('hiragana');
  const [kanaData, setKanaData] = useState<KanaData | null>(null);
  const [selectedChar, setSelectedChar] = useState<KanaCharacter | null>(null);

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

  return (
    <AppShell title="Kana Dojo" showStats>
      <div className="space-y-5 animate-fade-in px-1">
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

        {/* Progress Card */}
        <div className="card-surface p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--color-text-secondary)]">Dominio</span>
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
              className="py-3 px-4 rounded-xl bg-[var(--color-bg-elevated)] border border-white/5 font-semibold text-sm flex items-center justify-center gap-2 tap-highlight disabled:opacity-40"
            >
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              Nuevos ({newCount})
            </button>
            <button
              onClick={() => navigate(`/review/${activeTab}`)}
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

        {/* Selected Kana Detail Card */}
        <AnimatePresence>
          {selectedChar && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card-elevated p-4 flex items-center justify-between border-l-4 border-[var(--color-accent)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--color-bg-surface)] flex items-center justify-center border border-white/5">
                  <span className="font-jp text-3xl font-bold">{selectedChar.character}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-mono text-[var(--color-accent-gold)]">
                      {selectedChar.romaji}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]">
                      {selectedChar.type}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {selectedChar.mnemonic || `${selectedChar.strokeCount} trazos`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => speak(selectedChar.character)}
                className="p-3 rounded-full bg-[var(--color-bg-surface)] text-[var(--color-accent)] tap-highlight"
                aria-label="Escuchar pronunciación"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Gojūon Chart */}
        <div className="card-surface p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
              Tabla Gojūon
            </h3>
            <span className="text-xs text-[var(--color-text-secondary)]">
              Toca para escuchar
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-5 gap-2">
            {kanaData?.characters
              .filter((c) => c.type === 'basic')
              .map((char) => {
                const card = cardMap.get(char.id);
                const stage = (card?.srsStage || 'new') as SRSStage;
                const stageColor = SRS_STAGES[stage]?.color || 'var(--color-srs-new)';
                const isSelected = selectedChar?.id === char.id;

                return (
                  <button
                    key={char.id}
                    onClick={() => handleCharClick(char)}
                    className={cn(
                      'aspect-square rounded-xl flex flex-col items-center justify-center relative p-1 transition-all tap-highlight',
                      isSelected
                        ? 'bg-[var(--color-bg-elevated)] ring-2 ring-[var(--color-accent)] shadow-lg'
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

        {/* Dakuon / Yoon Section if available */}
        {kanaData && kanaData.characters.some((c) => c.type === 'dakuon') && (
          <div className="card-surface p-4 space-y-4">
            <h3 className="font-bold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">
              Dakuon / Handakuon (Sonoros)
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {kanaData.characters
                .filter((c) => c.type === 'dakuon' || c.type === 'handakuon')
                .map((char) => {
                  const isSelected = selectedChar?.id === char.id;

                  return (
                    <button
                      key={char.id}
                      onClick={() => handleCharClick(char)}
                      className={cn(
                        'aspect-square rounded-xl flex flex-col items-center justify-center relative p-1 transition-all tap-highlight',
                        isSelected
                          ? 'bg-[var(--color-bg-elevated)] ring-2 ring-[var(--color-accent)] shadow-lg'
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
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
