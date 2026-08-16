import Dexie, { type Table } from 'dexie';
import type { Card, ReviewLog, DailyProgress, Achievement, AppSettings } from '../lib/types';

export class SantoryuDB extends Dexie {
  cards!: Table<Card, number>;
  reviews!: Table<ReviewLog, number>;
  progress!: Table<DailyProgress, number>;
  achievements!: Table<Achievement, number>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('SantoryuDB');

    this.version(1).stores({
      cards: '++id, externalId, type, category, jlptLevel, srsState, srsStage, nextReview',
      reviews: '++id, cardId, timestamp',
      progress: '++id, &date',
      achievements: '++id, &type, unlockedAt',
      settings: 'key',
    });
  }
}

export const db = new SantoryuDB();
