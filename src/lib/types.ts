// ─── SRS Types ───────────────────────────────────────────────

export type SRSState = 'new' | 'learning' | 'review' | 'relearning';
export type ReviewGrade = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export type SRSStage =
  | 'new'
  | 'apprentice'
  | 'guru'
  | 'master'
  | 'enlightened'
  | 'burned';

export interface FSRSItemState {
  stability: number;
  difficulty: number;
  lastReviewDate: number; // epoch ms
  reps: number;
  lapses: number;
  state: SRSState;
}

// ─── Card Types ──────────────────────────────────────────────

export type CardType = 'kana' | 'kanji' | 'vocab' | 'grammar';
export type KanaType = 'hiragana' | 'katakana';

export interface Card {
  id: number;
  externalId: string; // e.g., "hi_a", "kn5_1", "vn5_1"
  type: CardType;
  category: string; // e.g., "hiragana", "katakana", "kanji-n5", "vocab-n5"
  jlptLevel: number;

  // SRS state
  srsState: SRSState;
  srsStage: SRSStage;
  stability: number;
  difficulty: number;
  nextReview: number; // epoch ms
  lastReview: number; // epoch ms
  reps: number;
  lapses: number;

  // Content reference (JSON key)
  dataRef: string;

  createdAt: number;
}

// ─── Review Log ──────────────────────────────────────────────

export interface ReviewLog {
  id?: number;
  cardId: number;
  timestamp: number;
  rating: ReviewGrade;
  elapsedMs: number; // time spent on card
  previousState: SRSState;
  newState: SRSState;
  previousStability: number;
  newStability: number;
}

// ─── Progress ────────────────────────────────────────────────

export interface DailyProgress {
  id?: number;
  date: string; // YYYY-MM-DD
  lessonsCompleted: number;
  reviewsCorrect: number;
  reviewsTotal: number;
  timeSpentMs: number;
  xpEarned: number;
}

// ─── Achievement ─────────────────────────────────────────────

export type AchievementType =
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'streak_100'
  | 'streak_365'
  | 'hiragana_complete'
  | 'katakana_complete'
  | 'kana_complete'
  | 'kanji_10'
  | 'kanji_50'
  | 'kanji_100'
  | 'vocab_50'
  | 'vocab_100'
  | 'vocab_500'
  | 'reviews_100'
  | 'reviews_500'
  | 'reviews_1000'
  | 'accuracy_90'
  | 'accuracy_95'
  | 'first_burn';

export interface Achievement {
  id?: number;
  type: AchievementType;
  unlockedAt: number;
}

// ─── Settings ────────────────────────────────────────────────

export interface AppSettings {
  key: string;
  value: string | number | boolean;
}

// ─── Static Data Shapes ─────────────────────────────────────

export interface KanaCharacter {
  id: string;
  character: string;
  romaji: string;
  type: 'basic' | 'dakuon' | 'handakuon' | 'yoon';
  row: string;
  column: string;
  strokeCount: number;
  mnemonic: string;
  audio: string;
}

export interface KanaRow {
  id: string;
  label: string;
  labelJp: string;
  characters: string[]; // character ids
}

export interface KanaData {
  characters: KanaCharacter[];
  rows: KanaRow[];
}

export interface Radical {
  id: string;
  character: string;
  meaning: string;
  meaningEs: string;
  strokeCount: number;
  mnemonic: string;
  position: string;
}

export interface KanjiEntry {
  id: string;
  character: string;
  meanings: string[];
  meaningsEs: string[];
  onReadings: string[];
  kunReadings: string[];
  strokeCount: number;
  jlptLevel: number;
  gradeLevel: number;
  radicals: string[];
  mnemonic: string;
  exampleWords: {
    word: string;
    reading: string;
    meaning: string;
  }[];
}

export interface VocabEntry {
  id: string;
  word: string;
  reading: string;
  meanings: string[];
  meaningsEs: string[];
  partOfSpeech: string;
  jlptLevel: number;
  exampleSentence: {
    japanese: string;
    reading: string;
    meaning: string;
    meaningEs: string;
  };
  tags: string[];
}

// ─── Quiz Types ──────────────────────────────────────────────

export type QuizMode =
  | 'kana-to-romaji'
  | 'romaji-to-kana'
  | 'kanji-to-meaning'
  | 'meaning-to-kanji'
  | 'kanji-to-reading'
  | 'vocab-to-meaning'
  | 'meaning-to-vocab'
  | 'audio-to-meaning';

export interface QuizOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  prompt: string;
  promptSub?: string;
  correctAnswer: string;
  options: QuizOption[];
  mode: QuizMode;
  cardId?: number;
}

// ─── Navigation ──────────────────────────────────────────────

export type TabId = 'home' | 'kana' | 'kanji' | 'vocab' | 'settings';
