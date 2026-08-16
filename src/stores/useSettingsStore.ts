import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS } from '../lib/constants';

interface SettingsState {
  dailyLessonGoal: number;
  dailyReviewGoal: number;
  notificationsEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
  furiganaMode: 'always' | 'hover' | 'hidden';
  targetRetention: number;
  autoPlayAudio: boolean;
  setSetting: <K extends keyof Omit<SettingsState, 'setSetting'>>(key: K, value: SettingsState[K]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setSetting: (key, value) => set({ [key]: value }),
    }),
    {
      name: 'santoryu-settings',
    }
  )
);
