/**
 * FSRS-5 (Free Spaced Repetition Scheduler) Implementation
 *
 * Based on the FSRS algorithm by Jarrett Ye.
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki
 *
 * This provides 20-30% more efficient scheduling than SM-2 (Anki classic)
 * and completely eliminates the "Ease Hell" problem.
 */

import type { FSRSItemState, ReviewGrade, SRSState, SRSStage } from '../lib/types';

// ─── Default FSRS Parameters ─────────────────────────────────

// These are the optimized default parameters from FSRS-5
const DEFAULT_WEIGHTS = {
  w0: 0.4072,   // Initial stability for Again
  w1: 1.1829,   // Initial stability for Hard
  w2: 3.1262,   // Initial stability for Good
  w3: 15.4722,  // Initial stability for Easy
  w4: 7.2102,   // Difficulty weight
  w5: 0.5316,   // Difficulty weight
  w6: 1.0651,   // Difficulty weight
  w7: 0.0589,   // Stability growth base
  w8: 1.5747,   // Stability growth factor
  w9: 0.1070,   // Stability recall modifier
  w10: 1.0070,  // Stability recall modifier
  w11: 2.0966,  // Stability fail penalty
  w12: 0.0350,  // Stability fail modifier
  w13: 0.3803,  // Stability fail modifier
  w14: 0.0,     // Hard penalty
  w15: 0.0,     // Easy bonus
  w16: 0.0,     // Mean reversion strength
  w17: 2.7380,  // Short-term stability (learning)
};

// ─── FSRS Engine Class ───────────────────────────────────────

export class FSRSEngine {
  private targetRetention: number;
  private weights: typeof DEFAULT_WEIGHTS;

  // Retrievability decay parameters
  private readonly DECAY = -0.5;
  private readonly FACTOR = 19 / 81; // (0.9^(1/DECAY) - 1)

  constructor(targetRetention = 0.9) {
    this.targetRetention = Math.max(0.7, Math.min(0.97, targetRetention));
    this.weights = { ...DEFAULT_WEIGHTS };
  }

  // ─── Core Formulas ───────────────────────────────────────

  /**
   * Calculate current retrievability R(t, S)
   * The probability of recalling an item after t days with stability S
   */
  calculateRetrievability(elapsedDays: number, stability: number): number {
    if (stability <= 0) return 0;
    return Math.pow(1 + this.FACTOR * (elapsedDays / stability), this.DECAY);
  }

  /**
   * Calculate the next review interval in days for target retention
   */
  calculateNextInterval(stability: number): number {
    const interval =
      (stability / this.FACTOR) *
      (Math.pow(this.targetRetention, 1 / this.DECAY) - 1);
    return Math.max(1, Math.round(interval));
  }

  // ─── Initial State ──────────────────────────────────────

  /**
   * Create a new FSRS state for a brand new item
   */
  createNewState(): FSRSItemState {
    return {
      stability: 0,
      difficulty: 0,
      lastReviewDate: 0,
      reps: 0,
      lapses: 0,
      state: 'new',
    };
  }

  // ─── State Transitions ─────────────────────────────────

  /**
   * Process a review and return the updated state
   */
  review(current: FSRSItemState, grade: ReviewGrade, now = Date.now()): FSRSItemState {
    const elapsedDays = current.lastReviewDate > 0
      ? (now - current.lastReviewDate) / (24 * 60 * 60 * 1000)
      : 0;

    let newState: FSRSItemState;

    if (current.state === 'new') {
      newState = this.handleNewReview(grade, now);
    } else if (current.state === 'learning' || current.state === 'relearning') {
      newState = this.handleLearningReview(current, grade, now);
    } else {
      newState = this.handleReviewReview(current, grade, elapsedDays, now);
    }

    return newState;
  }

  /**
   * Handle first review of a new item
   */
  private handleNewReview(grade: ReviewGrade, now: number): FSRSItemState {
    const w = this.weights;

    // Initial stability depends on grade
    const initialStability = [w.w0, w.w1, w.w2, w.w3][grade - 1];

    // Initial difficulty
    const initialDifficulty = this.clampDifficulty(
      w.w4 - Math.exp(w.w5 * (grade - 1)) + 1
    );

    const state: SRSState = grade === 1 ? 'learning' : 'review';

    return {
      stability: initialStability,
      difficulty: initialDifficulty,
      lastReviewDate: now,
      reps: 1,
      lapses: grade === 1 ? 1 : 0,
      state,
    };
  }

  /**
   * Handle review during learning/relearning phase
   */
  private handleLearningReview(
    current: FSRSItemState,
    grade: ReviewGrade,
    now: number
  ): FSRSItemState {
    const w = this.weights;

    if (grade === 1) {
      // Failed again: stay in learning, reset stability
      return {
        ...current,
        stability: w.w0,
        lastReviewDate: now,
        reps: current.reps + 1,
        lapses: current.lapses + 1,
        state: current.state === 'relearning' ? 'relearning' : 'learning',
      };
    }

    // Passed: graduate to review
    const newStability = [w.w0, w.w1, w.w2, w.w3][grade - 1];
    const newDifficulty = current.difficulty > 0
      ? this.updateDifficulty(current.difficulty, grade)
      : this.clampDifficulty(w.w4 - Math.exp(w.w5 * (grade - 1)) + 1);

    return {
      stability: newStability,
      difficulty: newDifficulty,
      lastReviewDate: now,
      reps: current.reps + 1,
      lapses: current.lapses,
      state: 'review',
    };
  }

  /**
   * Handle review of an item already in review state
   */
  private handleReviewReview(
    current: FSRSItemState,
    grade: ReviewGrade,
    elapsedDays: number,
    now: number
  ): FSRSItemState {
    const retrievability = this.calculateRetrievability(elapsedDays, current.stability);
    const newDifficulty = this.updateDifficulty(current.difficulty, grade);

    if (grade === 1) {
      // Failed: enter relearning, calculate new stability after lapse
      const newStability = this.calculateStabilityAfterFail(
        current.stability,
        newDifficulty,
        retrievability
      );

      return {
        stability: newStability,
        difficulty: newDifficulty,
        lastReviewDate: now,
        reps: current.reps + 1,
        lapses: current.lapses + 1,
        state: 'relearning',
      };
    }

    // Passed: update stability based on grade
    const newStability = this.calculateStabilityAfterSuccess(
      current.stability,
      newDifficulty,
      retrievability,
      grade
    );

    return {
      stability: newStability,
      difficulty: newDifficulty,
      lastReviewDate: now,
      reps: current.reps + 1,
      lapses: current.lapses,
      state: 'review',
    };
  }

  // ─── Stability Calculations ────────────────────────────

  /**
   * Calculate new stability after successful review
   */
  private calculateStabilityAfterSuccess(
    stability: number,
    difficulty: number,
    retrievability: number,
    grade: ReviewGrade
  ): number {
    const w = this.weights;

    // Hard penalty / easy bonus
    let hardPenalty = 1;
    let easyBonus = 1;
    if (grade === 2) hardPenalty = w.w14 > 0 ? w.w14 : 1;
    if (grade === 4) easyBonus = w.w15 > 0 ? w.w15 : 1;

    const newStability =
      stability *
      (1 +
        Math.exp(w.w7) *
        (11 - difficulty) *
        Math.pow(stability, -w.w8) *
        (Math.exp(w.w9 * (1 - retrievability)) - 1) *
        hardPenalty *
        easyBonus);

    return Math.max(0.1, newStability);
  }

  /**
   * Calculate new stability after failed review (lapse)
   */
  private calculateStabilityAfterFail(
    stability: number,
    difficulty: number,
    retrievability: number
  ): number {
    const w = this.weights;

    const newStability =
      w.w11 *
      Math.pow(difficulty, -w.w12) *
      (Math.pow(stability + 1, w.w13) - 1) *
      Math.exp(w.w14 * (1 - retrievability));

    return Math.max(0.1, Math.min(newStability, stability));
  }

  // ─── Difficulty Calculations ───────────────────────────

  /**
   * Update difficulty based on review grade
   */
  private updateDifficulty(currentDifficulty: number, grade: ReviewGrade): number {
    const w = this.weights;

    // Mean reversion to initial difficulty
    const meanDifficulty = w.w4;
    const newDifficulty =
      w.w16 * meanDifficulty +
      (1 - w.w16) *
        (currentDifficulty - w.w6 * (grade - 3));

    return this.clampDifficulty(newDifficulty);
  }

  /**
   * Clamp difficulty to valid range [1, 10]
   */
  private clampDifficulty(difficulty: number): number {
    return Math.max(1, Math.min(10, difficulty));
  }

  // ─── Scheduling ────────────────────────────────────────

  /**
   * Get the next review date for a given state
   */
  getNextReviewDate(state: FSRSItemState): number {
    if (state.state === 'new') return 0;

    if (state.state === 'learning' || state.state === 'relearning') {
      // Short intervals during learning phase
      const minutes = state.state === 'learning' ? 10 : 5;
      return state.lastReviewDate + minutes * 60 * 1000;
    }

    // Review state: use FSRS interval calculation
    const intervalDays = this.calculateNextInterval(state.stability);
    return state.lastReviewDate + intervalDays * 24 * 60 * 60 * 1000;
  }

  /**
   * Get the SRS stage based on stability
   */
  getSRSStage(state: FSRSItemState): SRSStage {
    if (state.state === 'new') return 'new';
    if (state.state === 'learning' || state.state === 'relearning') return 'apprentice';

    const intervalDays = this.calculateNextInterval(state.stability);

    if (intervalDays >= 365) return 'burned';
    if (intervalDays >= 120) return 'enlightened';
    if (intervalDays >= 30) return 'master';
    if (intervalDays >= 7) return 'guru';
    return 'apprentice';
  }

  /**
   * Preview scheduling for all grades (for showing intervals on buttons)
   */
  previewSchedule(current: FSRSItemState): Record<ReviewGrade, string> {
    const result = {} as Record<ReviewGrade, string>;
    const grades: ReviewGrade[] = [1, 2, 3, 4];

    for (const grade of grades) {
      const preview = this.review({ ...current }, grade);
      const nextDate = this.getNextReviewDate(preview);
      const diffMs = nextDate - Date.now();
      result[grade] = this.formatInterval(diffMs);
    }

    return result;
  }

  /**
   * Format interval in human-readable form
   */
  private formatInterval(ms: number): string {
    const minutes = Math.round(ms / (60 * 1000));
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.round(ms / (60 * 60 * 1000));
    if (hours < 24) return `${hours}h`;

    const days = Math.round(ms / (24 * 60 * 60 * 1000));
    if (days < 30) return `${days}d`;

    const months = Math.round(days / 30);
    if (months < 12) return `${months}mo`;

    const years = Math.round(days / 365);
    return `${years}y`;
  }
}

// ─── Singleton Instance ──────────────────────────────────────

export const fsrs = new FSRSEngine(0.9);
