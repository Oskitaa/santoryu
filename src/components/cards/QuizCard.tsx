import React from 'react';
import { motion } from 'motion/react';

interface Option {
  id: string;
  label: string;
  isCorrect: boolean;
}

interface QuizCardProps {
  prompt: string;
  promptSub?: string;
  options: Option[];
  onAnswer: (correct: boolean) => void;
  answered: boolean;
  selectedId?: string;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  prompt,
  promptSub,
  options,
  onAnswer,
  answered,
  selectedId
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto card-surface rounded-2xl p-6 border border-[var(--color-bg-elevated)] bg-[var(--color-bg-surface)]"
    >
      <div className="text-center mb-8">
        <h2 className="text-[var(--color-text-primary)] font-jp text-4xl font-bold mb-2">{prompt}</h2>
        {promptSub && <p className="text-[var(--color-text-secondary)] text-lg">{promptSub}</p>}
      </div>

      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          let stateClasses = "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border-[var(--color-bg-elevated)] hover:border-[var(--color-text-secondary)]";
          
          if (answered) {
            if (opt.isCorrect) {
              stateClasses = "bg-[var(--color-success)]/20 text-[var(--color-success)] border-[var(--color-success)]";
            } else if (selectedId === opt.id) {
              stateClasses = "bg-[var(--color-error)]/20 text-[var(--color-error)] border-[var(--color-error)]";
            } else {
              stateClasses = "bg-[var(--color-bg-elevated)]/50 text-[var(--color-text-secondary)] border-transparent opacity-50";
            }
          }

          return (
            <motion.button
              key={opt.id}
              disabled={answered}
              whileTap={!answered ? { scale: 0.98 } : {}}
              onClick={() => onAnswer(opt.isCorrect)}
              className={`w-full p-4 rounded-xl border-2 text-lg font-medium transition-colors text-left ${stateClasses} tap-highlight`}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
