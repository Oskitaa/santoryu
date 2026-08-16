import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Award } from 'lucide-react';
import { useReview } from '../hooks/useReview';
import { useAudio } from '../hooks/useAudio';
import { useStudyStore } from '../stores/useStudyStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { Flashcard } from '../components/cards/Flashcard';
import { ReviewButtons } from '../components/cards/ReviewButtons';
import { fsrs } from '../engines/fsrs';
import type { ReviewGrade, FSRSItemState, KanaData, KanjiEntry, VocabEntry } from '../lib/types';

export default function ReviewSession() {
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const { currentCard, totalCards, completedCards, isComplete, grade, sessionStats, loading } =
    useReview(category);
  const { speak } = useAudio();
  const addXp = useStudyStore((s) => s.addXp);
  const autoPlayAudio = useSettingsStore((s) => s.autoPlayAudio);

  const [isFlipped, setIsFlipped] = useState(false);
  const [kanaMap, setKanaMap] = useState<Map<string, { character: string; romaji: string; mnemonic?: string }>>(new Map());
  const [kanjiMap, setKanjiMap] = useState<Map<string, KanjiEntry>>(new Map());
  const [vocabMap, setVocabMap] = useState<Map<string, VocabEntry>>(new Map());

  // Load static data references
  useEffect(() => {
    // Hiragana & Katakana
    Promise.all([
      fetch('/data/hiragana.json').then((r) => r.json()),
      fetch('/data/katakana.json').then((r) => r.json()),
    ])
      .then(([hData, kData]: [KanaData, KanaData]) => {
        const map = new Map<string, { character: string; romaji: string; mnemonic?: string }>();
        hData.characters.forEach((c) => map.set(c.id, { character: c.character, romaji: c.romaji, mnemonic: c.mnemonic }));
        kData.characters.forEach((c) => map.set(c.id, { character: c.character, romaji: c.romaji, mnemonic: c.mnemonic }));
        setKanaMap(map);
      })
      .catch((e) => console.error(e));

    // Kanji
    fetch('/data/kanji-n5.json')
      .then((r) => r.json())
      .then((kList: KanjiEntry[]) => {
        const map = new Map<string, KanjiEntry>();
        kList.forEach((k) => map.set(k.id, k));
        setKanjiMap(map);
      })
      .catch((e) => console.error(e));

    // Vocab
    fetch('/data/vocab-n5.json')
      .then((r) => r.json())
      .then((vList: VocabEntry[]) => {
        const map = new Map<string, VocabEntry>();
        vList.forEach((v) => map.set(v.id, v));
        setVocabMap(map);
      })
      .catch((e) => console.error(e));
  }, []);

  // Card display info based on data
  const cardDetails = useMemo(() => {
    if (!currentCard) return null;

    if (currentCard.category === 'hiragana' || currentCard.category === 'katakana') {
      const char = kanaMap.get(currentCard.externalId);
      return {
        front: char?.character || currentCard.dataRef,
        frontSub: currentCard.category.toUpperCase(),
        back: char?.romaji || '',
        backSub: char?.mnemonic || '',
        speechText: char?.character || '',
      };
    }

    if (currentCard.category === 'kanji-n5' || currentCard.type === 'kanji') {
      const kanji = kanjiMap.get(currentCard.externalId);
      const meaning = kanji?.meaningsEs?.join(', ') || kanji?.meanings.join(', ') || '';
      const readings = [
        kanji?.onReadings?.length ? `On: ${kanji.onReadings.join('、')}` : '',
        kanji?.kunReadings?.length ? `Kun: ${kanji.kunReadings.join('、')}` : '',
      ]
        .filter(Boolean)
        .join(' • ');

      return {
        front: kanji?.character || currentCard.dataRef,
        frontSub: 'KANJI N5',
        back: meaning,
        backSub: readings,
        speechText: kanji?.character || '',
      };
    }

    if (currentCard.category === 'vocab-n5' || currentCard.type === 'vocab') {
      const vocab = vocabMap.get(currentCard.externalId);
      const meaning = vocab?.meaningsEs?.join(', ') || vocab?.meanings.join(', ') || '';

      return {
        front: vocab?.word || currentCard.dataRef,
        frontSub: vocab?.reading || '',
        back: meaning,
        backSub: vocab?.exampleSentence?.japanese || '',
        speechText: vocab?.word || '',
      };
    }

    return {
      front: currentCard.dataRef,
      frontSub: currentCard.category,
      back: 'Respuesta',
      backSub: '',
      speechText: currentCard.dataRef,
    };
  }, [currentCard, kanaMap, kanjiMap, vocabMap]);

  // Reset flip and handle auto-audio on card change
  useEffect(() => {
    setIsFlipped(false);
    if (cardDetails?.speechText && autoPlayAudio) {
      speak(cardDetails.speechText);
    }
  }, [currentCard?.id, autoPlayAudio, cardDetails?.speechText, speak]);

  // Calculate schedule preview for FSRS buttons
  const intervals = useMemo(() => {
    if (!currentCard) return { 1: '10m', 2: '1d', 3: '3d', 4: '7d' };

    const itemState: FSRSItemState = {
      stability: currentCard.stability,
      difficulty: currentCard.difficulty,
      lastReviewDate: currentCard.lastReview,
      reps: currentCard.reps,
      lapses: currentCard.lapses,
      state: currentCard.srsState,
    };

    return fsrs.previewSchedule(itemState);
  }, [currentCard]);

  const handleGrade = async (rating: ReviewGrade) => {
    setIsFlipped(false);
    await grade(rating);
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen w-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Completion state
  if (isComplete) {
    const accuracy =
      sessionStats.total > 0
        ? Math.round((sessionStats.correct / sessionStats.total) * 100)
        : 100;
    const earnedXp = sessionStats.correct * 10 + (sessionStats.total - sessionStats.correct) * 2;

    return (
      <div className="h-screen w-screen bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-6 animate-fade-in">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-surface p-8 rounded-3xl flex flex-col items-center text-center max-w-sm w-full space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center border border-[var(--color-success)]/20">
            <CheckCircle className="w-10 h-10 text-[var(--color-success)]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold font-jp">¡Sesión completada!</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Excelente trabajo en tu práctica
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="card-elevated p-4 rounded-2xl flex flex-col items-center">
              <span className="text-xs text-[var(--color-text-secondary)] mb-1">Precisión</span>
              <span
                className="text-2xl font-bold font-mono text-[var(--color-accent)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {accuracy}%
              </span>
            </div>
            <div className="card-elevated p-4 rounded-2xl flex flex-col items-center">
              <span className="text-xs text-[var(--color-text-secondary)] mb-1">XP Ganado</span>
              <span
                className="text-2xl font-bold font-mono text-[var(--color-accent-gold)] flex items-center gap-1"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <Award className="w-5 h-5" /> +{earnedXp}
              </span>
            </div>
            <div className="col-span-2 card-elevated p-3 rounded-2xl flex justify-between items-center px-4 text-sm">
              <span className="text-[var(--color-text-secondary)]">Tarjetas estudiadas</span>
              <span className="font-bold font-mono" style={{ fontFamily: 'var(--font-mono)' }}>
                {sessionStats.total}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              addXp(earnedXp);
              navigate('/');
            }}
            className="w-full py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold rounded-2xl tap-highlight shadow-lg transition-all"
          >
            Volver al inicio
          </button>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (!currentCard || !cardDetails) {
    return (
      <div className="h-screen w-screen bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-lg text-[var(--color-text-secondary)]">
          No hay tarjetas pendientes en esta sección.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-[var(--color-bg-elevated)] text-white rounded-xl font-bold tap-highlight"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const progressPercent = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  return (
    <div className="h-screen w-screen bg-[var(--color-bg-primary)] flex flex-col justify-between p-4 pb-safe max-w-lg mx-auto">
      {/* Top Bar */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={() => navigate('/')}
          className="p-2.5 rounded-full bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-white tap-highlight"
          aria-label="Salir de la sesión"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 bg-[var(--color-bg-surface)] rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-[var(--color-accent)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <span
          className="text-xs font-mono text-[var(--color-text-secondary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {completedCards + 1}/{totalCards}
        </span>
      </div>

      {/* Main Flashcard */}
      <div className="my-auto py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Flashcard
              front={cardDetails.front}
              frontSub={cardDetails.frontSub}
              back={cardDetails.back}
              backSub={cardDetails.backSub}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
              onPlayAudio={() => speak(cardDetails.speechText)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pb-2">
        {!isFlipped ? (
          <button
            onClick={() => setIsFlipped(true)}
            className="w-full py-4 rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] font-bold text-white text-lg tap-highlight shadow-lg transition-all"
          >
            Mostrar respuesta
          </button>
        ) : (
          <ReviewButtons intervals={intervals} onGrade={handleGrade} />
        )}
      </div>
    </div>
  );
}
