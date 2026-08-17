import React, { useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import type { ExerciseListenPick as ExerciseListenPickType } from '../../lib/types';
import { cn } from '../../lib/utils';

interface ExerciseListenPickProps {
  exercise: ExerciseListenPickType;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  disabled?: boolean;
}

export const ExerciseListenPick: React.FC<ExerciseListenPickProps> = ({
  exercise,
  selectedOptionId,
  onSelectOption,
  disabled,
}) => {
  const { speak } = useAudio();

  useEffect(() => {
    // Auto-play audio when exercise appears
    const timer = setTimeout(() => {
      speak(exercise.audioText);
    }, 250);
    return () => clearTimeout(timer);
  }, [exercise.audioText, speak]);

  return (
    <div className="flex flex-col items-center space-y-6 max-w-sm mx-auto my-auto w-full py-2">
      {/* Exercise Prompt */}
      <h3 className="text-base font-bold text-center text-[var(--color-text-primary)]">
        {exercise.prompt}
      </h3>

      {/* Big Replay Audio Button */}
      <button
        onClick={() => speak(exercise.audioText)}
        className="w-24 h-24 rounded-full bg-[var(--color-accent)]/15 border-2 border-[var(--color-accent)] text-[var(--color-accent)] flex flex-col items-center justify-center gap-1 shadow-lg tap-highlight hover:scale-105 active:scale-95 transition-all"
        aria-label="Reproducir audio"
      >
        <Volume2 size={32} className="animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Escuchar</span>
      </button>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-3 w-full pt-2">
        {exercise.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => {
                if (!disabled) {
                  onSelectOption(opt.id);
                  speak(opt.label);
                }
              }}
              disabled={disabled}
              className={cn(
                'p-4 rounded-2xl border transition-all flex items-center justify-between text-left tap-highlight shadow-sm',
                isSelected
                  ? 'bg-[var(--color-accent)]/15 border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40'
                  : 'bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border-white/5'
              )}
            >
              <span className="font-jp text-2xl font-bold text-[var(--color-text-primary)]">
                {opt.label}
              </span>
              {opt.subLabel && (
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                  {opt.subLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
