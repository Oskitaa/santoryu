import React, { useState, useMemo } from 'react';
import { Check, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAudio } from '../../hooks/useAudio';
import type { ExerciseMatchPairs as ExerciseMatchPairsType } from '../../lib/types';
import { cn } from '../../lib/utils';

interface ExerciseMatchPairsProps {
  exercise: ExerciseMatchPairsType;
  onComplete: () => void;
  disabled?: boolean;
}

interface ItemCard {
  id: string;
  pairId: string;
  side: 'left' | 'right';
  text: string;
}

export const ExerciseMatchPairs: React.FC<ExerciseMatchPairsProps> = ({
  exercise,
  onComplete,
  disabled,
}) => {
  const { speak } = useAudio();
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);

  // Shuffle left and right independently for randomness
  const { leftItems, rightItems } = useMemo(() => {
    const left: ItemCard[] = exercise.pairs.map((p) => ({
      id: `l_${p.id}`,
      pairId: p.id,
      side: 'left',
      text: p.left,
    }));
    const right: ItemCard[] = exercise.pairs.map((p) => ({
      id: `r_${p.id}`,
      pairId: p.id,
      side: 'right',
      text: p.right,
    }));

    return {
      leftItems: [...left].sort(() => Math.random() - 0.5),
      rightItems: [...right].sort(() => Math.random() - 0.5),
    };
  }, [exercise.pairs]);

  const handleSelect = (item: ItemCard) => {
    if (disabled || matchedPairs.has(item.pairId)) return;

    if (item.side === 'left') {
      speak(item.text);
      if (selectedRight) {
        // Evaluate pair
        checkMatch(item.pairId, selectedRight);
      } else {
        setSelectedLeft(item.pairId);
      }
    } else {
      if (selectedLeft) {
        // Evaluate pair
        checkMatch(selectedLeft, item.pairId);
      } else {
        setSelectedRight(item.pairId);
      }
    }
  };

  const checkMatch = (leftPairId: string, rightPairId: string) => {
    if (leftPairId === rightPairId) {
      // Success Match
      const updated = new Set(matchedPairs);
      updated.add(leftPairId);
      setMatchedPairs(updated);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (updated.size === exercise.pairs.length) {
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    } else {
      // Wrong Match
      setWrongPair({ left: leftPairId, right: rightPairId });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-5 max-w-sm mx-auto my-auto w-full py-2">
      <h3 className="text-base font-bold text-center text-[var(--color-text-primary)]">
        {exercise.prompt}
      </h3>

      <div className="grid grid-cols-2 gap-3 w-full">
        {/* Left Column (Japanese) */}
        <div className="space-y-2.5">
          {leftItems.map((item) => {
            const isMatched = matchedPairs.has(item.pairId);
            const isSelected = selectedLeft === item.pairId;
            const isWrong = wrongPair?.left === item.pairId;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleSelect(item)}
                disabled={isMatched || disabled}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'w-full p-3.5 rounded-2xl font-jp text-xl font-bold flex items-center justify-between border transition-all shadow-sm tap-highlight',
                  isMatched
                    ? 'bg-[var(--color-success)]/15 border-[var(--color-success)]/40 text-[var(--color-success)] opacity-60'
                    : isWrong
                    ? 'bg-[var(--color-error)]/20 border-[var(--color-error)] text-[var(--color-error)] animate-shake'
                    : isSelected
                    ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40 text-white'
                    : 'bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border-white/5 text-[var(--color-text-primary)]'
                )}
              >
                <span>{item.text}</span>
                {isMatched ? (
                  <Check size={16} />
                ) : (
                  <Volume2 size={14} className="text-[var(--color-text-muted)] opacity-50" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right Column (Meaning / Romaji) */}
        <div className="space-y-2.5">
          {rightItems.map((item) => {
            const isMatched = matchedPairs.has(item.pairId);
            const isSelected = selectedRight === item.pairId;
            const isWrong = wrongPair?.right === item.pairId;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleSelect(item)}
                disabled={isMatched || disabled}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'w-full p-3.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between border transition-all shadow-sm tap-highlight text-left',
                  isMatched
                    ? 'bg-[var(--color-success)]/15 border-[var(--color-success)]/40 text-[var(--color-success)] opacity-60'
                    : isWrong
                    ? 'bg-[var(--color-error)]/20 border-[var(--color-error)] text-[var(--color-error)] animate-shake'
                    : isSelected
                    ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40 text-white'
                    : 'bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border-white/5 text-[var(--color-text-secondary)]'
                )}
              >
                <span className="truncate">{item.text}</span>
                {isMatched && <Check size={16} />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
