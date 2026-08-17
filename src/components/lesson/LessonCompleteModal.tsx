import React from 'react';
import { motion } from 'motion/react';
import { Award, Star, ArrowRight, RotateCcw } from 'lucide-react';
import type { Lesson } from '../../lib/types';

interface LessonCompleteModalProps {
  lesson: Lesson;
  stars: number;
  xpEarned: number;
  accuracy: number;
  onContinue: () => void;
  onRetry: () => void;
}

export const LessonCompleteModal: React.FC<LessonCompleteModalProps> = ({
  lesson,
  stars,
  xpEarned,
  accuracy,
  onContinue,
  onRetry,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-[var(--color-bg-surface)] border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center space-y-6 shadow-2xl"
      >
        {/* Celebration Trophy / Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[var(--color-accent-gold)]/15 border-2 border-[var(--color-accent-gold)]/40 flex items-center justify-center shadow-lg">
            <Award className="w-10 h-10 text-[var(--color-accent-gold)] animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-jp text-[var(--color-text-primary)]">
            ¡Lección Completada!
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] font-medium">
            {lesson.title}
          </p>
        </div>

        {/* Stars */}
        <div className="flex gap-2">
          {[1, 2, 3].map((starIndex) => {
            const isEarned = starIndex <= stars;
            return (
              <motion.div
                key={starIndex}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15 * starIndex, type: 'spring' }}
              >
                <Star
                  size={32}
                  className={
                    isEarned
                      ? 'fill-[var(--color-accent-gold)] text-[var(--color-accent-gold)] filter drop-shadow'
                      : 'text-white/10'
                  }
                />
              </motion.div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="card-elevated p-3.5 rounded-2xl border border-white/5 flex flex-col items-center">
            <span className="text-[11px] text-[var(--color-text-secondary)] font-medium mb-0.5">
              XP Ganado
            </span>
            <span
              className="text-2xl font-bold text-[var(--color-accent-gold)] font-mono"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              +{xpEarned}
            </span>
          </div>

          <div className="card-elevated p-3.5 rounded-2xl border border-white/5 flex flex-col items-center">
            <span className="text-[11px] text-[var(--color-text-secondary)] font-medium mb-0.5">
              Precisión
            </span>
            <span
              className="text-2xl font-bold text-[var(--color-success)] font-mono"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {accuracy}%
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5 pt-2">
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] font-bold text-white text-base flex items-center justify-center gap-2 tap-highlight shadow-lg transition-all"
          >
            <span>Continuar el Camino</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onRetry}
            className="w-full py-3 rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 tap-highlight"
          >
            <RotateCcw size={14} />
            <span>Repetir lección</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
