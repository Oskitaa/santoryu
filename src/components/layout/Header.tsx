import React from 'react';
import { Flame, Star } from 'lucide-react';
import { useStudyStore } from '../../stores/useStudyStore';

interface HeaderProps {
  title?: string;
  showStats?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title = 'Santoryu', showStats = true }) => {
  const { streak, xp } = useStudyStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[var(--color-bg-primary)]/90 backdrop-blur-md border-b border-[var(--color-bg-elevated)] pt-[env(safe-area-inset-top,0px)]">
      <div className="flex items-center justify-between h-14 max-w-lg mx-auto px-4">
        <div className="w-20 flex justify-start">
          {showStats && (
            <div className="flex items-center space-x-1.5 text-[var(--color-accent-gold)] font-mono text-sm">
              <Flame size={18} className="fill-current text-orange-500" />
              <span className="font-bold">{streak}</span>
            </div>
          )}
        </div>

        <h1 className="text-base font-bold text-[var(--color-text-primary)] truncate font-jp">
          {title}
        </h1>

        <div className="w-20 flex justify-end">
          {showStats && (
            <div className="flex items-center space-x-1.5 text-[var(--color-accent-gold)] font-mono text-sm">
              <span className="font-bold">{xp}</span>
              <Star size={16} className="fill-current text-[var(--color-accent-gold)]" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
