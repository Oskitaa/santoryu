import React from 'react';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';

interface FlashcardProps {
  front: string;
  frontSub?: string;
  back: string;
  backSub?: string;
  isFlipped: boolean;
  onFlip: () => void;
  onPlayAudio?: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  front,
  frontSub,
  back,
  backSub,
  isFlipped,
  onFlip,
  onPlayAudio
}) => {
  return (
    <div className="relative w-full max-w-sm mx-auto h-80 perspective-1000">
      <motion.div
        className="w-full h-full relative preserve-3d cursor-pointer tap-highlight"
        onClick={onFlip}
        initial={false}
        animate={{ rotateX: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden card-elevated rounded-2xl flex flex-col items-center justify-center p-6 border border-[var(--color-bg-elevated)] bg-[var(--color-bg-surface)]">
          {onPlayAudio && (
            <button 
              onClick={(e) => { e.stopPropagation(); onPlayAudio(); }}
              className="absolute top-4 right-4 p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              aria-label="Play audio"
            >
              <Volume2 size={24} />
            </button>
          )}
          <span className="text-[var(--color-text-primary)] font-jp text-5xl mb-4 font-bold tracking-wide">{front}</span>
          {frontSub && <span className="text-[var(--color-text-secondary)] text-lg">{frontSub}</span>}
        </div>

        {/* Back */}
        <div 
          className="absolute w-full h-full backface-hidden card-elevated rounded-2xl flex flex-col items-center justify-center p-6 border border-[var(--color-bg-elevated)] bg-[var(--color-bg-surface)]"
          style={{ transform: 'rotateX(180deg)' }}
        >
          <span className="text-[var(--color-text-primary)] text-3xl font-bold mb-4 text-center">{back}</span>
          {backSub && <span className="text-[var(--color-text-secondary)] font-jp text-xl">{backSub}</span>}
        </div>
      </motion.div>
    </div>
  );
};
