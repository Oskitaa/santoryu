import { db } from './database';
import type { Card, KanaData, KanjiEntry, VocabEntry } from '../lib/types';

/**
 * Seed the database with initial data from static JSON files.
 * Inserts any cards that don't already exist in the database.
 */
export async function seedDatabase(): Promise<void> {
  const existingCards = await db.cards.toArray();
  const existingIdSet = new Set(existingCards.map((c) => c.externalId));

  const cardsToAdd: Omit<Card, 'id'>[] = [];
  const now = Date.now();

  // ─── Load Hiragana ─────────────────────────────────────
  try {
    const hiraganaRes = await fetch('/data/hiragana.json');
    const hiraganaData: KanaData = await hiraganaRes.json();

    for (const char of hiraganaData.characters) {
      if (!existingIdSet.has(char.id)) {
        cardsToAdd.push({
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
    }
  } catch (err) {
    console.error('Error seeding Hiragana:', err);
  }

  // ─── Load Katakana ─────────────────────────────────────
  try {
    const katakanaRes = await fetch('/data/katakana.json');
    const katakanaData: KanaData = await katakanaRes.json();

    for (const char of katakanaData.characters) {
      if (!existingIdSet.has(char.id)) {
        cardsToAdd.push({
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
    }
  } catch (err) {
    console.error('Error seeding Katakana:', err);
  }

  // ─── Load Kanji N5 ─────────────────────────────────────
  try {
    const kanjiRes = await fetch('/data/kanji-n5.json');
    const kanjiData: KanjiEntry[] = await kanjiRes.json();

    for (const kanji of kanjiData) {
      if (!existingIdSet.has(kanji.id)) {
        cardsToAdd.push({
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
    }
  } catch (err) {
    console.error('Error seeding Kanji:', err);
  }

  // ─── Load Vocab N5 ─────────────────────────────────────
  try {
    const vocabRes = await fetch('/data/vocab-n5.json');
    const vocabData: VocabEntry[] = await vocabRes.json();

    for (const vocab of vocabData) {
      if (!existingIdSet.has(vocab.id)) {
        cardsToAdd.push({
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
    }
  } catch (err) {
    console.error('Error seeding Vocab:', err);
  }

  // Bulk insert all missing cards
  if (cardsToAdd.length > 0) {
    await db.cards.bulkAdd(cardsToAdd as Card[]);
  }
}
