import React from 'react';
import { motion } from 'motion/react';

interface ReviewButtonsProps {
  intervals: Record<1|2|3|4, string>;
  onGrade: (grade: 1|2|3|4) => void;
  disabled?: boolean;
}

export const ReviewButtons: React.FC<ReviewButtonsProps> = ({ intervals, onGrade, disabled }) => {
  const buttons = [
    { grade: 1 as const, label: 'Again', color: 'bg-[var(--color-error)]/20 text-[var(--color-error)] border-[var(--color-error)]/30' },
    { grade: 2 as const, label: 'Hard', color: 'bg-[var(--color-accent-gold)]/20 text-[var(--color-accent-gold)] border-[var(--color-accent-gold)]/30' },
    { grade: 3 as const, label: 'Good', color: 'bg-[var(--color-success)]/20 text-[var(--color-success)] border-[var(--color-success)]/30' },
    { grade: 4 as const, label: 'Easy', color: 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8]/30' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full gap-2 px-4"
    >
      {buttons.map((btn) => (
        <button
          key={btn.grade}
          onClick={() => onGrade(btn.grade)}
          disabled={disabled}
          className={`flex-1 flex flex-col items-center py-3 rounded-xl border transition-transform tap-highlight active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${btn.color}`}
        >
          <span className="text-sm font-semibold mb-1">{btn.label}</span>
          <span className="text-xs opacity-80 font-jetbrains">{intervals[btn.grade]}</span>
        </button>
      ))}
    </motion.div>
  );
};
