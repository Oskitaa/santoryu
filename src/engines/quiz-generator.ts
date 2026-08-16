import type {
  KanaCharacter,
  KanjiEntry,
  VocabEntry,
  QuizQuestion,
  QuizOption,
} from '../lib/types';
import { shuffleArray } from '../lib/utils';

export function generateKanaQuiz(
  characters: KanaCharacter[],
  current: KanaCharacter
): QuizQuestion {
  const options: QuizOption[] = [
    { id: current.id, label: current.romaji, isCorrect: true },
  ];

  // Smart distractors: same type (hiragana/katakana)
  const pool = characters.filter(
    (c) => c.id !== current.id && c.type === current.type
  );
  const shuffledPool = shuffleArray(pool);

  for (let i = 0; i < 3 && i < shuffledPool.length; i++) {
    options.push({
      id: shuffledPool[i].id,
      label: shuffledPool[i].romaji,
      isCorrect: false,
    });
  }

  return {
    prompt: current.character,
    correctAnswer: current.romaji,
    options: shuffleArray(options),
    mode: 'kana-to-romaji',
  };
}

export function generateKanjiQuiz(
  entries: KanjiEntry[],
  current: KanjiEntry,
  mode: 'kanji-to-meaning' | 'kanji-to-reading'
): QuizQuestion {
  const correctLabel =
    mode === 'kanji-to-meaning'
      ? current.meaningsEs?.[0] || current.meanings[0] || ''
      : current.onReadings?.[0] || current.kunReadings?.[0] || '';

  const options: QuizOption[] = [
    {
      id: current.id,
      label: correctLabel,
      isCorrect: true,
    },
  ];

  const pool = entries.filter((e) => e.id !== current.id);
  const shuffledPool = shuffleArray(pool);

  for (let i = 0; i < 3 && i < shuffledPool.length; i++) {
    const wrong = shuffledPool[i];
    const wrongLabel =
      mode === 'kanji-to-meaning'
        ? wrong.meaningsEs?.[0] || wrong.meanings[0] || ''
        : wrong.onReadings?.[0] || wrong.kunReadings?.[0] || '';

    options.push({
      id: wrong.id,
      label: wrongLabel,
      isCorrect: false,
    });
  }

  return {
    prompt: current.character,
    correctAnswer: correctLabel,
    options: shuffleArray(options),
    mode,
  };
}

export function generateVocabQuiz(
  entries: VocabEntry[],
  current: VocabEntry,
  mode: 'vocab-to-meaning' | 'meaning-to-vocab'
): QuizQuestion {
  const isVocabToMeaning = mode === 'vocab-to-meaning';
  const correctLabel = isVocabToMeaning
    ? current.meaningsEs?.[0] || current.meanings[0] || ''
    : current.word;

  const options: QuizOption[] = [
    {
      id: current.id,
      label: correctLabel,
      isCorrect: true,
    },
  ];

  const pool = entries.filter((e) => e.id !== current.id);
  const shuffledPool = shuffleArray(pool);

  for (let i = 0; i < 3 && i < shuffledPool.length; i++) {
    const wrong = shuffledPool[i];
    const wrongLabel = isVocabToMeaning
      ? wrong.meaningsEs?.[0] || wrong.meanings[0] || ''
      : wrong.word;

    options.push({
      id: wrong.id,
      label: wrongLabel,
      isCorrect: false,
    });
  }

  return {
    prompt: isVocabToMeaning ? current.word : current.meaningsEs?.[0] || current.meanings[0] || '',
    promptSub: isVocabToMeaning ? current.reading : undefined,
    correctAnswer: correctLabel,
    options: shuffleArray(options),
    mode,
  };
}
