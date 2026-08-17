import React from 'react';
import { Volume2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import type { ExerciseMultipleChoice as ExerciseMultipleChoiceType } from '../../lib/types';
import { cn } from '../../lib/utils';

interface ExerciseMultipleChoiceProps {
  exercise: ExerciseMultipleChoiceType;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  disabled?: boolean;
}

export const ExerciseMultipleChoice: React.FC<ExerciseMultipleChoiceProps> = ({
  exercise,
  selectedOptionId,
  onSelectOption,
  disabled,
}) => {
  const { speak } = useAudio();

  return (
    <div className="flex flex-col items-center space-y-6 max-w-sm mx-auto my-auto w-full py-2">
      {/* Question Header */}
      <div className="text-center space-y-2">
        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
          {exercise.question}
        </h3>
        {exercise.questionSub && (
          <p className="text-xs text-[var(--color-text-secondary)]">
            {exercise.questionSub}
          </p>
        )}

        {exercise.audioText && (
          <button
            onClick={() => speak(exercise.audioText!)}
            className="p-3 rounded-full bg-[var(--color-bg-surface)] text-[var(--color-accent)] border border-white/10 tap-highlight mx-auto shadow-sm inline-flex items-center gap-1.5 text-xs font-bold"
          >
            <Volume2 size={16} />
            <span>Escuchar</span>
          </button>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-3 w-full">
        {exercise.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => {
                if (!disabled) {
                  onSelectOption(opt.id);
                }
              }}
              disabled={disabled}
              className={cn(
                'w-full p-4 rounded-2xl border transition-all flex items-center justify-between text-left tap-highlight shadow-sm',
                isSelected
                  ? 'bg-[var(--color-accent)]/15 border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40'
                  : 'bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] border-white/5'
              )}
            >
              <span className="font-jp text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
                {opt.label}
              </span>
              {opt.subLabel && (
                <span className="text-xs text-[var(--color-text-secondary)]">
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
