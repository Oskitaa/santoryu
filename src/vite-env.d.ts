/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

declare module 'virtual:pwa-register/react' {
  import type { Dispatch, SetStateAction } from 'react';

  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: Error) => void;
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>];
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}

declare module 'wanakana' {
  export function toHiragana(input: string, options?: Record<string, unknown>): string;
  export function toKatakana(input: string, options?: Record<string, unknown>): string;
  export function toRomaji(input: string, options?: Record<string, unknown>): string;
  export function isHiragana(input: string): boolean;
  export function isKatakana(input: string): boolean;
  export function isKana(input: string): boolean;
  export function isJapanese(input: string): boolean;
  export function isRomaji(input: string): boolean;
  export function bind(element: HTMLInputElement | HTMLTextAreaElement, options?: Record<string, unknown>): void;
  export function unbind(element: HTMLInputElement | HTMLTextAreaElement): void;
}
