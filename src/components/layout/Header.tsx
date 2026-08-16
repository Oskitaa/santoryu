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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg-primary)]/90 backdrop-blur-sm border-b border-[var(--color-bg-elevated)] pt-safe">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="w-20 flex justify-start">
          {showStats && (
            <div className="flex items-center space-x-1 text-[var(--color-accent-gold)] font-jetbrains">
              <Flame size={18} className="fill-current" />
              <span className="font-bold">{streak}</span>
            </div>
          )}
        </div>
        
        <h1 className="text-lg font-bold text-[var(--color-text-primary)] truncate">
          {title}
        </h1>

        <div className="w-20 flex justify-end">
          {showStats && (
            <div className="flex items-center space-x-1 text-[var(--color-accent-gold)] font-jetbrains">
              <span className="font-bold">{xp}</span>
              <Star size={18} className="fill-current" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
