import { db } from './database';
import type { Card, KanaData, KanjiEntry, VocabEntry } from '../lib/types';

/**
 * Seed the database with initial data from static JSON files.
 * Only runs if the cards table is empty (first launch).
 */
export async function seedDatabase(): Promise<void> {
  const cardCount = await db.cards.count();
  if (cardCount > 0) return; // Already seeded

  const cards: Omit<Card, 'id'>[] = [];
  const now = Date.now();

  // ─── Load Hiragana ─────────────────────────────────────
  try {
    const hiraganaRes = await fetch('/data/hiragana.json');
    const hiraganaData: KanaData = await hiraganaRes.json();

    for (const char of hiraganaData.characters) {
      cards.push({
        externalId: char.id,
        type: 'kana',
        category: 'hiragana',
        jlptLevel: 5,
        srsState: 'new',
        srsStage: 'new',
        stability: 0,
        difficulty: 0,
        nextReview: 0,
        lastReview: 0,
        reps: 0,
        lapses: 0,
        dataRef: char.id,
        createdAt: now,
      });
    }
  } catch {
    // Data file not available yet
  }

  // ─── Load Katakana ─────────────────────────────────────
  try {
    const katakanaRes = await fetch('/data/katakana.json');
    const katakanaData: KanaData = await katakanaRes.json();

    for (const char of katakanaData.characters) {
      cards.push({
        externalId: char.id,
        type: 'kana',
        category: 'katakana',
        jlptLevel: 5,
        srsState: 'new',
        srsStage: 'new',
        stability: 0,
        difficulty: 0,
        nextReview: 0,
        lastReview: 0,
        reps: 0,
        lapses: 0,
        dataRef: char.id,
        createdAt: now,
      });
    }
  } catch {
    // Data file not available yet
  }

  // ─── Load Kanji N5 ─────────────────────────────────────
  try {
    const kanjiRes = await fetch('/data/kanji-n5.json');
    const kanjiData: KanjiEntry[] = await kanjiRes.json();

    for (const kanji of kanjiData) {
      cards.push({
        externalId: kanji.id,
        type: 'kanji',
        category: 'kanji-n5',
        jlptLevel: 5,
        srsState: 'new',
        srsStage: 'new',
        stability: 0,
        difficulty: 0,
        nextReview: 0,
        lastReview: 0,
        reps: 0,
        lapses: 0,
        dataRef: kanji.id,
        createdAt: now,
      });
    }
  } catch {
    // Data file not available yet
  }

  // ─── Load Vocab N5 ─────────────────────────────────────
  try {
    const vocabRes = await fetch('/data/vocab-n5.json');
    const vocabData: VocabEntry[] = await vocabRes.json();

    for (const vocab of vocabData) {
      cards.push({
        externalId: vocab.id,
        type: 'vocab',
        category: 'vocab-n5',
        jlptLevel: 5,
        srsState: 'new',
        srsStage: 'new',
        stability: 0,
        difficulty: 0,
        nextReview: 0,
        lastReview: 0,
        reps: 0,
        lapses: 0,
        dataRef: vocab.id,
        createdAt: now,
      });
    }
  } catch {
    // Data file not available yet
  }

  // Bulk insert all cards
  if (cards.length > 0) {
    await db.cards.bulkAdd(cards as Card[]);
  }
}
