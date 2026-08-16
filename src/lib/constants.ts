import type { SRSStage, AchievementType } from './types';

// ─── SRS Constants ───────────────────────────────────────────

export const SRS_STAGES: Record<SRSStage, { label: string; color: string; minStability: number }> = {
  new: { label: 'Nuevo', color: 'var(--color-srs-new)', minStability: 0 },
  apprentice: { label: 'Aprendiz', color: 'var(--color-srs-apprentice)', minStability: 0.1 },
  guru: { label: 'Guru', color: 'var(--color-srs-guru)', minStability: 7 },
  master: { label: 'Master', color: 'var(--color-srs-master)', minStability: 30 },
  enlightened: { label: 'Iluminado', color: 'var(--color-srs-enlightened)', minStability: 120 },
  burned: { label: 'Dominado', color: 'var(--color-srs-burned)', minStability: 365 },
};

export const GRADE_LABELS = {
  1: { label: 'Otra vez', shortLabel: '✕', color: 'var(--color-error)' },
  2: { label: 'Difícil', shortLabel: '△', color: 'var(--color-warning)' },
  3: { label: 'Bien', shortLabel: '○', color: 'var(--color-success)' },
  4: { label: 'Fácil', shortLabel: '◎', color: 'var(--color-accent-gold)' },
} as const;

// ─── JLPT Levels ─────────────────────────────────────────────

export const JLPT_LEVELS = [
  { level: 5, label: 'N5', kanji: 100, vocab: 800, description: 'Básico' },
  { level: 4, label: 'N4', kanji: 300, vocab: 1500, description: 'Elemental' },
  { level: 3, label: 'N3', kanji: 650, vocab: 3750, description: 'Intermedio' },
  { level: 2, label: 'N2', kanji: 1000, vocab: 6000, description: 'Avanzado' },
  { level: 1, label: 'N1', kanji: 2136, vocab: 10000, description: 'Experto' },
] as const;

// ─── XP System ───────────────────────────────────────────────

export const XP_REWARDS = {
  lessonComplete: 10,
  reviewCorrect: 5,
  reviewIncorrect: 1,
  perfectSession: 25,
  streakBonus: 5, // per day of streak
} as const;

// ─── Achievements ────────────────────────────────────────────

export const ACHIEVEMENTS: Record<
  AchievementType,
  { title: string; description: string; icon: string }
> = {
  streak_3: { title: 'Estudiante Constante', description: '3 días de racha', icon: '🔥' },
  streak_7: { title: 'Semana Completa', description: '7 días de racha', icon: '🗓️' },
  streak_14: { title: 'Medio Mes', description: '14 días de racha', icon: '💪' },
  streak_30: { title: 'Samurai Dedicado', description: '30 días de racha', icon: '⚔️' },
  streak_100: { title: 'Centurión', description: '100 días de racha', icon: '🏆' },
  streak_365: { title: 'Maestro del Año', description: '365 días de racha', icon: '👑' },
  hiragana_complete: { title: 'Hiragana Master', description: 'Completaste todo el Hiragana', icon: 'あ' },
  katakana_complete: { title: 'Katakana Master', description: 'Completaste todo el Katakana', icon: 'ア' },
  kana_complete: { title: 'Kana Master', description: 'Dominaste ambos silabarios', icon: '🎌' },
  kanji_10: { title: 'Primer Paso Kanji', description: 'Aprendiste 10 kanji', icon: '📝' },
  kanji_50: { title: 'Medio Centenar', description: 'Aprendiste 50 kanji', icon: '📖' },
  kanji_100: { title: 'N5 Kanji Master', description: 'Aprendiste 100 kanji', icon: '🏯' },
  vocab_50: { title: 'Vocabulario Inicial', description: '50 palabras aprendidas', icon: '📚' },
  vocab_100: { title: 'Conversación Básica', description: '100 palabras aprendidas', icon: '💬' },
  vocab_500: { title: 'Políglota', description: '500 palabras aprendidas', icon: '🌏' },
  reviews_100: { title: 'Primer Centenar', description: '100 reviews completados', icon: '✅' },
  reviews_500: { title: 'Revisador Experto', description: '500 reviews completados', icon: '🔄' },
  reviews_1000: { title: 'Mil Reviews', description: '1000 reviews completados', icon: '🎯' },
  accuracy_90: { title: 'Precisión Alta', description: '90% de accuracy', icon: '🎯' },
  accuracy_95: { title: 'Casi Perfecto', description: '95% de accuracy', icon: '💎' },
  first_burn: { title: 'Primera Quema', description: 'Dominaste tu primer item', icon: '🔥' },
};

// ─── Default Settings ────────────────────────────────────────

export const DEFAULT_SETTINGS = {
  dailyLessonGoal: 10,
  dailyReviewGoal: 50,
  notificationsEnabled: false,
  notificationHour: 9,
  notificationMinute: 0,
  furiganaMode: 'hover' as 'always' | 'hover' | 'hidden',
  targetRetention: 0.9,
  autoPlayAudio: true,
} as const;

// ─── Kana Row Order ──────────────────────────────────────────

export const KANA_ROW_ORDER = [
  'vowel', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w', 'nn',
  'g', 'z', 'd', 'b', 'p',
] as const;

// ─── Today helper ────────────────────────────────────────────

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
