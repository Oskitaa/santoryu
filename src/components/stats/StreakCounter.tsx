import React from 'react';
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ streak }) => {
  const hasStreak = streak > 0;

  return (
    <motion.div 
      className={`card-surface rounded-2xl p-6 flex flex-col items-center justify-center border border-[var(--color-bg-elevated)] relative overflow-hidden bg-[var(--color-bg-surface)] ${hasStreak ? 'shadow-[0_0_20px_rgba(212,168,83,0.15)]' : ''}`}
      whileHover={{ scale: 1.02 }}
    >
      {hasStreak && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-[var(--color-accent-gold)]/10 to-transparent pointer-events-none"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      
      <div className={`mb-2 p-3 rounded-full z-10 ${hasStreak ? 'bg-[var(--color-accent-gold)]/20 text-[var(--color-accent-gold)]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]'}`}>
        <Flame size={40} className={hasStreak ? 'fill-current' : ''} />
      </div>
      
      <span className={`text-4xl font-jetbrains font-bold mb-1 z-10 ${hasStreak ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
        {streak}
      </span>
      
      <span className="text-sm text-[var(--color-text-secondary)] font-medium z-10">
        días de racha
      </span>
    </motion.div>
  );
};
