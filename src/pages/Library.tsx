import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import KanaDojo from './KanaDojo';
import KanjiTower from './KanjiTower';
import VocabForge from './VocabForge';
import { BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Library() {
  const [activeTab, setActiveTab] = useState<'kana' | 'kanji' | 'vocab'>('kana');

  return (
    <AppShell title="Biblioteca" showStats>
      <div className="space-y-5 animate-fade-in max-w-lg mx-auto pb-4">
        {/* Top Subtab Switcher */}
        <div className="flex bg-[var(--color-bg-surface)] p-1.5 rounded-2xl border border-white/5 shadow-sm">
          <button
            onClick={() => setActiveTab('kana')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all tap-highlight flex items-center justify-center gap-1.5',
              activeTab === 'kana'
                ? 'bg-[var(--color-accent)] text-white shadow-md'
                : 'text-[var(--color-text-secondary)] hover:text-white'
            )}
          >
            <span className="font-jp text-sm font-bold">あ</span>
            <span>Kana</span>
          </button>
          <button
            onClick={() => setActiveTab('kanji')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all tap-highlight flex items-center justify-center gap-1.5',
              activeTab === 'kanji'
                ? 'bg-[var(--color-accent)] text-white shadow-md'
                : 'text-[var(--color-text-secondary)] hover:text-white'
            )}
          >
            <span className="font-jp text-sm font-bold">日</span>
            <span>Kanji</span>
          </button>
          <button
            onClick={() => setActiveTab('vocab')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all tap-highlight flex items-center justify-center gap-1.5',
              activeTab === 'vocab'
                ? 'bg-[var(--color-accent)] text-white shadow-md'
                : 'text-[var(--color-text-secondary)] hover:text-white'
            )}
          >
            <BookOpen size={14} />
            <span>Vocab</span>
          </button>
        </div>

        {/* Active Embedded Content */}
        <div>
          {activeTab === 'kana' && <KanaDojo embedded />}
          {activeTab === 'kanji' && <KanjiTower embedded />}
          {activeTab === 'vocab' && <VocabForge embedded />}
        </div>
      </div>
    </AppShell>
  );
}
