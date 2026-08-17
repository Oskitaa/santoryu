import { useState } from 'react';
import KanaDojo from './KanaDojo';
import KanjiTower from './KanjiTower';
import VocabForge from './VocabForge';
import { BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Library() {
  const [activeTab, setActiveTab] = useState<'kana' | 'kanji' | 'vocab'>('kana');

  return (
    <div>
      {/* Subtab navigation */}
      <div className="fixed top-14 left-0 right-0 z-30 bg-[var(--color-bg-primary)]/90 backdrop-blur-md border-b border-white/5 pt-1">
        <div className="flex max-w-lg mx-auto px-4 py-2 gap-2">
          <button
            onClick={() => setActiveTab('kana')}
            className={cn(
              'flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all tap-highlight flex items-center justify-center gap-1.5',
              activeTab === 'kana'
                ? 'bg-[var(--color-accent)] text-white shadow-md'
                : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]'
            )}
          >
            <span className="font-jp text-sm">あ</span>
            <span>Kana</span>
          </button>
          <button
            onClick={() => setActiveTab('kanji')}
            className={cn(
              'flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all tap-highlight flex items-center justify-center gap-1.5',
              activeTab === 'kanji'
                ? 'bg-[var(--color-accent)] text-white shadow-md'
                : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]'
            )}
          >
            <span className="font-jp text-sm">日</span>
            <span>Kanji</span>
          </button>
          <button
            onClick={() => setActiveTab('vocab')}
            className={cn(
              'flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all tap-highlight flex items-center justify-center gap-1.5',
              activeTab === 'vocab'
                ? 'bg-[var(--color-accent)] text-white shadow-md'
                : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]'
            )}
          >
            <BookOpen size={14} />
            <span>Vocab</span>
          </button>
        </div>
      </div>

      {/* Embedded View with padding for the subtab bar */}
      <div className="pt-10">
        {activeTab === 'kana' && <KanaDojo />}
        {activeTab === 'kanji' && <KanjiTower />}
        {activeTab === 'vocab' && <VocabForge />}
      </div>
    </div>
  );
}
