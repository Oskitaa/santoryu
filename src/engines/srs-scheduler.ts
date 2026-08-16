import { db } from '../db/database';
import { fsrs } from './fsrs';
import type { Card, ReviewGrade, FSRSItemState, SRSStage } from '../lib/types';
import { getToday } from '../lib/constants';

/**
 * Get cards due for review right now.
 */
export async function getReviewQueue(category?: string): Promise<Card[]> {
  const now = Date.now();
  let cards: Card[];

  if (category) {
    cards = await db.cards
      .where('category')
      .equals(category)
      .and((c) => c.srsState !== 'new' && c.nextReview > 0 && c.nextReview <= now)
      .toArray();
  } else {
    cards = await db.cards
      .where('nextReview')
      .belowOrEqual(now)
      .and((c) => c.srsState !== 'new' && c.nextReview > 0)
      .toArray();
  }

  return cards;
}

/**
 * Get new cards available for lessons.
 */
export async function getLessonQueue(category?: string, limit = 10): Promise<Card[]> {
  let cards: Card[];

  if (category) {
    cards = await db.cards
      .where({ srsState: 'new', category })
      .limit(limit)
      .toArray();
  } else {
    cards = await db.cards
      .where('srsState')
      .equals('new')
      .limit(limit)
      .toArray();
  }

  return cards;
}

/**
 * Process a review for a card: update SRS state, log review, update daily progress.
 */
export async function processReview(cardId: number, grade: ReviewGrade): Promise<void> {
  const card = await db.cards.get(cardId);
  if (!card) throw new Error('Card not found');

  const now = Date.now();

  // Build FSRS state from card
  const currentState: FSRSItemState = {
    stability: card.stability,
    difficulty: card.difficulty,
    lastReviewDate: card.lastReview,
    reps: card.reps,
    lapses: card.lapses,
    state: card.srsState,
  };

  // Run through FSRS engine
  const newState = fsrs.review(currentState, grade, now);
  const nextReview = fsrs.getNextReviewDate(newState);
  const srsStage = fsrs.getSRSStage(newState);

  const elapsedMs = card.lastReview > 0 ? now - card.lastReview : 0;
  const isCorrect = grade > 1;

  await db.transaction('rw', db.cards, db.reviews, db.progress, async () => {
    // 1. Update Card
    await db.cards.update(cardId, {
      srsState: newState.state,
      srsStage: srsStage,
      stability: newState.stability,
      difficulty: newState.difficulty,
      nextReview: nextReview,
      lastReview: now,
      reps: newState.reps,
      lapses: newState.lapses,
    });

    // 2. Create Review Log
    await db.reviews.add({
      cardId,
      timestamp: now,
      rating: grade,
      elapsedMs,
      previousState: card.srsState,
      newState: newState.state,
      previousStability: card.stability,
      newStability: newState.stability,
    });

    // 3. Update Daily Progress
    const today = getToday();
    const progress = await db.progress.where('date').equals(today).first();

    if (!progress) {
      await db.progress.add({
        date: today,
        lessonsCompleted: card.srsState === 'new' ? 1 : 0,
        reviewsCorrect: isCorrect ? 1 : 0,
        reviewsTotal: 1,
        timeSpentMs: elapsedMs,
        xpEarned: isCorrect ? 10 : 2,
      });
    } else {
      await db.progress.update(progress.id!, {
        lessonsCompleted: progress.lessonsCompleted + (card.srsState === 'new' ? 1 : 0),
        reviewsCorrect: progress.reviewsCorrect + (isCorrect ? 1 : 0),
        reviewsTotal: progress.reviewsTotal + 1,
        timeSpentMs: progress.timeSpentMs + elapsedMs,
        xpEarned: progress.xpEarned + (isCorrect ? 10 : 2),
      });
    }
  });
}

/**
 * Get SRS stage distribution stats for the dashboard.
 */
export async function getStats(): Promise<{
  stages: Record<SRSStage, number>;
  total: number;
}> {
  const cards = await db.cards.toArray();
  const stages: Record<SRSStage, number> = {
    new: 0,
    apprentice: 0,
    guru: 0,
    master: 0,
    enlightened: 0,
    burned: 0,
  };

  for (const card of cards) {
    stages[card.srsStage] = (stages[card.srsStage] || 0) + 1;
  }

  return { stages, total: cards.length };
}
