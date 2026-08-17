import React from 'react';
import { motion } from 'motion/react';
import { useAudio } from '../../hooks/useAudio';
import type { ExerciseSentenceBuilder as ExerciseSentenceBuilderType } from '../../lib/types';

interface ExerciseSentenceBuilderProps {
  exercise: ExerciseSentenceBuilderType;
  selectedWords: string[];
  onAddWord: (word: string, indexInPool: number) => void;
  onRemoveWord: (indexInSelected: number) => void;
  poolUsedIndices: Set<number>;
  disabled?: boolean;
}

export const ExerciseSentenceBuilder: React.FC<ExerciseSentenceBuilderProps> = ({
  exercise,
  selectedWords,
  onAddWord,
  onRemoveWord,
  poolUsedIndices,
  disabled,
}) => {
  const { speak } = useAudio();

  const handleSlotClick = (index: number) => {
    if (!disabled) {
      onRemoveWord(index);
    }
  };

  const handlePoolClick = (word: string, index: number) => {
    if (!disabled && !poolUsedIndices.has(index)) {
      speak(word);
      onAddWord(word, index);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-5 max-w-sm mx-auto my-auto w-full py-2">
      {/* Exercise Prompt */}
      <div className="text-center space-y-1">
        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
          {exercise.prompt}
        </h3>
        <div className="inline-block px-3 py-1 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 text-xs font-semibold text-[var(--color-accent-gold)]">
          "{exercise.targetTranslation}"
        </div>
      </div>

      {/* Assembled Sentence Area (Drop Area) */}
      <div className="w-full min-h-[70px] p-3 rounded-2xl bg-[var(--color-bg-surface)] border-2 border-dashed border-white/15 flex flex-wrap items-center gap-2">
        {selectedWords.map((word, idx) => (
          <motion.button
            key={idx}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => handleSlotClick(idx)}
            disabled={disabled}
            className="py-2 px-3.5 rounded-xl bg-[var(--color-accent)] text-white font-jp font-bold text-base shadow-md tap-highlight cursor-pointer"
          >
            {word}
          </motion.button>
        ))}

        {selectedWords.length === 0 && (
          <span className="text-xs text-[var(--color-text-muted)] w-full text-center py-2">
            Toca las palabras abajo en el orden correcto
          </span>
        )}
      </div>

      {/* Word Pool Area */}
      <div className="w-full pt-4 space-y-2">
        <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block text-center">
          Banco de palabras
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {exercise.pool.map((word, idx) => {
            const isUsed = poolUsedIndices.has(idx);

            return (
              <button
                key={idx}
                onClick={() => handlePoolClick(word, idx)}
                disabled={isUsed || disabled}
                className={`py-2 px-4 rounded-xl font-jp font-bold text-sm sm:text-base border transition-all tap-highlight ${
                  isUsed
                    ? 'opacity-20 bg-[var(--color-bg-surface)] border-transparent text-transparent cursor-default'
                    : 'bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-surface)] border-white/10 text-[var(--color-text-primary)] shadow-sm'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
