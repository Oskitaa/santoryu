import React, { useEffect } from 'react';
import { Volume2, Lightbulb, Sparkles } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import type { ExerciseIntro as ExerciseIntroType } from '../../lib/types';

interface ExerciseIntroProps {
  exercise: ExerciseIntroType;
}

export const ExerciseIntro: React.FC<ExerciseIntroProps> = ({ exercise }) => {
  const { speak } = useAudio();
  const { item } = exercise;

  useEffect(() => {
    // Play sound automatically when intro slide loads
    const timer = setTimeout(() => {
      speak(item.audioText || item.character);
    }, 200);
    return () => clearTimeout(timer);
  }, [item, speak]);

  return (
    <div className="flex flex-col items-center text-center space-y-5 animate-fade-in max-w-sm mx-auto my-auto py-2">
      {/* Badge */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 text-[var(--color-accent)] text-xs font-bold uppercase tracking-wider">
        <Sparkles size={13} />
        Nuevo Concepto
      </span>

      {/* Main Character Display Card */}
      <div className="relative group">
        <button
          onClick={() => speak(item.audioText || item.character)}
          className="w-32 h-32 rounded-3xl bg-[var(--color-bg-surface)] border border-white/10 shadow-2xl flex flex-col items-center justify-center p-2 tap-highlight hover:border-[var(--color-accent)]/50 transition-all cursor-pointer"
        >
          <span className="font-jp text-5xl font-bold text-[var(--color-text-primary)] leading-none">
            {item.character}
          </span>
          <span className="text-sm font-mono text-[var(--color-accent-gold)] mt-2 font-semibold">
            {item.reading}
          </span>
          <Volume2 size={16} className="text-[var(--color-text-secondary)] mt-1 opacity-70" />
        </button>
      </div>

      {/* Meaning */}
      <div>
        <h3 className="text-xl font-bold text-[var(--color-text-primary)] capitalize">
          {item.meaning}
        </h3>
      </div>

      {/* Mnemonic Story */}
      {item.mnemonic && (
        <div className="w-full card-elevated p-4 rounded-2xl border border-white/5 flex items-start gap-3 text-left">
          <Lightbulb className="w-5 h-5 text-[var(--color-accent-gold)] flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[var(--color-text-primary)] block">
              Mnemotecnia para recordar:
            </span>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {item.mnemonic}
            </p>
          </div>
        </div>
      )}

      {/* Example Usage */}
      {item.example && (
        <div
          onClick={() => speak(item.example!.reading || item.example!.jp)}
          className="w-full p-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-white/5 flex items-center justify-between text-left tap-highlight cursor-pointer"
        >
          <div>
            <span className="font-jp font-bold text-sm block text-[var(--color-text-primary)]">
              {item.example.jp}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {item.example.es}
            </span>
          </div>
          <Volume2 size={16} className="text-[var(--color-accent)] flex-shrink-0" />
        </div>
      )}
    </div>
  );
};
