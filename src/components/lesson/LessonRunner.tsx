import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import type { Lesson } from '../../lib/types';
import { ExerciseIntro } from './ExerciseIntro';
import { ExerciseListenPick } from './ExerciseListenPick';
import { ExerciseMatchPairs } from './ExerciseMatchPairs';
import { ExerciseSentenceBuilder } from './ExerciseSentenceBuilder';
import { ExerciseMultipleChoice } from './ExerciseMultipleChoice';
import { LessonCompleteModal } from './LessonCompleteModal';
import { useLessonStore } from '../../stores/useLessonStore';
import { cn } from '../../lib/utils';

interface LessonRunnerProps {
  lesson: Lesson;
  onExit: () => void;
}

export const LessonRunner: React.FC<LessonRunnerProps> = ({ lesson, onExit }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Exercise states
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [sentenceWords, setSentenceWords] = useState<string[]>([]);
  const [poolUsedIndices, setPoolUsedIndices] = useState<Set<number>>(new Set());
  const [isPairsCompleted, setIsPairsCompleted] = useState(false);

  // Check / Evaluation state
  const [evaluationState, setEvaluationState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [evaluationMessage, setEvaluationMessage] = useState<string>('');

  const completeLessonInStore = useLessonStore((s) => s.completeLesson);

  const exercises = lesson.exercises;
  const currentExercise = exercises[currentStepIndex];
  const totalSteps = exercises.length;
  const progressPercent = Math.round(((currentStepIndex) / totalSteps) * 100);

  // Determine if check button is clickable
  const canCheck = useMemo(() => {
    if (evaluationState !== 'idle') return true; // Clicking "Continuar"

    if (!currentExercise) return false;

    switch (currentExercise.type) {
      case 'intro':
        return true;
      case 'listen-pick':
      case 'multiple-choice':
        return selectedOptionId !== null;
      case 'match-pairs':
        return isPairsCompleted;
      case 'sentence-builder':
        return sentenceWords.length > 0;
      default:
        return false;
    }
  }, [currentExercise, evaluationState, selectedOptionId, isPairsCompleted, sentenceWords]);

  // Check answer logic
  const handleCheck = () => {
    if (evaluationState !== 'idle') {
      // Advance to next step
      handleNextStep();
      return;
    }

    if (!currentExercise) return;

    if (currentExercise.type === 'intro') {
      handleNextStep();
      return;
    }

    if (currentExercise.type === 'listen-pick') {
      const selected = currentExercise.options.find((o) => o.id === selectedOptionId);
      if (selected?.isCorrect) {
        setEvaluationState('correct');
        setEvaluationMessage('¡Excelente pronunciación y oído!');
      } else {
        handleMistake('La opción correcta era: ' + currentExercise.options.find((o) => o.isCorrect)?.label);
      }
      return;
    }

    if (currentExercise.type === 'multiple-choice') {
      const selected = currentExercise.options.find((o) => o.id === selectedOptionId);
      if (selected?.isCorrect) {
        setEvaluationState('correct');
        setEvaluationMessage('¡Respuesta correcta!');
      } else {
        const correct = currentExercise.options.find((o) => o.isCorrect);
        handleMistake(
          `Respuesta correcta: ${correct?.label}. ${currentExercise.explanation || ''}`
        );
      }
      return;
    }

    if (currentExercise.type === 'match-pairs') {
      setEvaluationState('correct');
      setEvaluationMessage('¡Has conectado todas las parejas con éxito!');
      return;
    }

    if (currentExercise.type === 'sentence-builder') {
      const isCorrect =
        sentenceWords.length === currentExercise.correctOrder.length &&
        sentenceWords.every((word, i) => word === currentExercise.correctOrder[i]);

      if (isCorrect) {
        setEvaluationState('correct');
        setEvaluationMessage('¡Frase perfectamente estructurada!');
      } else {
        handleMistake(
          `Orden correcto: ${currentExercise.correctOrder.join(' ')}`
        );
      }
    }
  };

  const handleMistake = (message: string) => {
    setEvaluationState('wrong');
    setEvaluationMessage(message);
    setMistakesCount((prev) => prev + 1);
    setHearts((prev) => Math.max(0, prev - 1));
  };

  const handleNextStep = () => {
    // Reset state for next exercise
    setEvaluationState('idle');
    setEvaluationMessage('');
    setSelectedOptionId(null);
    setSentenceWords([]);
    setPoolUsedIndices(new Set());
    setIsPairsCompleted(false);

    if (currentStepIndex + 1 < totalSteps) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Lesson Complete
      const stars = mistakesCount === 0 ? 3 : mistakesCount <= 2 ? 2 : 1;
      const score = Math.max(60, 100 - mistakesCount * 15);
      completeLessonInStore(lesson.id, stars, score, lesson.xpReward);
      setIsCompleted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[75] bg-[var(--color-bg-primary)] flex flex-col justify-between pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] px-4 max-w-lg mx-auto">
      {/* Top Bar */}
      <div className="flex items-center gap-3 w-full py-1">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="p-2 rounded-full bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-white tap-highlight"
          aria-label="Salir"
        >
          <X size={20} />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 bg-[var(--color-bg-surface)] rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
          <motion.div
            className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-1 text-[var(--color-accent)]">
          <Heart size={18} className="fill-current text-rose-500" />
          <span className="text-sm font-bold font-mono text-rose-400">{hearts}</span>
        </div>
      </div>

      {/* Main Exercise Content Area */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {currentExercise.type === 'intro' && (
              <ExerciseIntro exercise={currentExercise} />
            )}

            {currentExercise.type === 'listen-pick' && (
              <ExerciseListenPick
                exercise={currentExercise}
                selectedOptionId={selectedOptionId}
                onSelectOption={setSelectedOptionId}
                disabled={evaluationState !== 'idle'}
              />
            )}

            {currentExercise.type === 'match-pairs' && (
              <ExerciseMatchPairs
                exercise={currentExercise}
                onComplete={() => setIsPairsCompleted(true)}
                disabled={evaluationState !== 'idle'}
              />
            )}

            {currentExercise.type === 'sentence-builder' && (
              <ExerciseSentenceBuilder
                exercise={currentExercise}
                selectedWords={sentenceWords}
                onAddWord={(word, index) => {
                  setSentenceWords([...sentenceWords, word]);
                  const updated = new Set(poolUsedIndices);
                  updated.add(index);
                  setPoolUsedIndices(updated);
                }}
                onRemoveWord={(index) => {
                  const word = sentenceWords[index];
                  const newSelected = [...sentenceWords];
                  newSelected.splice(index, 1);
                  setSentenceWords(newSelected);

                  // Free index from pool
                  const poolIdx = currentExercise.pool.indexOf(word);
                  if (poolIdx !== -1) {
                    const updated = new Set(poolUsedIndices);
                    updated.delete(poolIdx);
                    setPoolUsedIndices(updated);
                  }
                }}
                poolUsedIndices={poolUsedIndices}
                disabled={evaluationState !== 'idle'}
              />
            )}

            {currentExercise.type === 'multiple-choice' && (
              <ExerciseMultipleChoice
                exercise={currentExercise}
                selectedOptionId={selectedOptionId}
                onSelectOption={setSelectedOptionId}
                disabled={evaluationState !== 'idle'}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Action / Evaluation Banner */}
      <div className="w-full space-y-3 pt-2">
        <AnimatePresence>
          {evaluationState !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className={cn(
                'p-4 rounded-2xl border flex items-start gap-3 shadow-xl',
                evaluationState === 'correct'
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              )}
            >
              {evaluationState === 'correct' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <span className="font-bold text-sm block">
                  {evaluationState === 'correct' ? '¡Excelente!' : '¡Ups! Sigue practicando'}
                </span>
                <p className="text-xs leading-relaxed opacity-90">{evaluationMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleCheck}
          disabled={!canCheck}
          className={cn(
            'w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 tap-highlight shadow-lg transition-all',
            evaluationState === 'correct'
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : evaluationState === 'wrong'
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : canCheck
              ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white'
              : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50'
          )}
        >
          <span>
            {evaluationState !== 'idle'
              ? 'Continuar'
              : currentExercise?.type === 'intro'
              ? '¡Entendido, vamos!'
              : 'Comprobar'}
          </span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--color-bg-surface)] border border-white/10 p-6 rounded-3xl max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold">¿Salir de la lección?</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Perderás el progreso de esta lección si sales ahora.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-[var(--color-bg-elevated)] text-xs font-bold tap-highlight"
              >
                Seguir practicando
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold tap-highlight"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {isCompleted && (
        <LessonCompleteModal
          lesson={lesson}
          stars={mistakesCount === 0 ? 3 : mistakesCount <= 2 ? 2 : 1}
          xpEarned={lesson.xpReward}
          accuracy={Math.max(60, Math.round(((totalSteps - mistakesCount) / totalSteps) * 100))}
          onContinue={onExit}
          onRetry={() => {
            setCurrentStepIndex(0);
            setMistakesCount(0);
            setHearts(3);
            setIsCompleted(false);
          }}
        />
      )}
    </div>
  );
};
