import { useState, useCallback, useEffect, useRef } from 'react';

// Global audio context for unlocking Web Audio on iOS Safari
let globalAudioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

function unlockAudioOnIOS() {
  if (isAudioUnlocked) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      if (!globalAudioCtx) {
        globalAudioCtx = new AudioCtx();
      }
      if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
      }
      // Play a short silent buffer to unlock Web Audio & Speech on iOS
      const buffer = globalAudioCtx.createBuffer(1, 1, 22050);
      const source = globalAudioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(globalAudioCtx.destination);
      source.start(0);
      isAudioUnlocked = true;
    }
  } catch (e) {
    console.warn('AudioContext unlock failed:', e);
  }
}

export function useAudio() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load and cache voices
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsSupported('speechSynthesis' in window || 'Audio' in window);

    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          voicesRef.current = available;
        }
      }
    };

    updateVoices();
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    // Attach unlock listener on first user touch/click
    const handleFirstInteraction = () => {
      unlockAudioOnIOS();
      updateVoices();
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
    };

    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('click', handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  const speak = useCallback((text: string, rate = 0.88) => {
    if (!text || typeof window === 'undefined') return;

    unlockAudioOnIOS();

    // Strategy 1: SpeechSynthesis API with preferred Japanese voice
    if ('speechSynthesis' in window) {
      try {
        // Resume if paused (iOS bug mitigation)
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();

        const cleanText = text.trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ja-JP';
        utterance.rate = rate;
        utterance.volume = 1.0; // Maximum volume
        utterance.pitch = 1.0;

        // Try to find the best available Japanese voice
        const voices = voicesRef.current.length > 0
          ? voicesRef.current
          : window.speechSynthesis.getVoices();

        const jaVoice = voices.find(
          (v) =>
            v.lang === 'ja-JP' ||
            v.lang === 'ja_JP' ||
            v.lang.toLowerCase().startsWith('ja') ||
            v.name.toLowerCase().includes('japanese') ||
            v.name.toLowerCase().includes('kyoko') ||
            v.name.toLowerCase().includes('otoya')
        );

        if (jaVoice) {
          utterance.voice = jaVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (_e) => {
          setIsSpeaking(false);
          // Fallback to audio stream if speech synthesis fails
          playAudioFallback(cleanText);
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('SpeechSynthesis error, falling back:', err);
      }
    }

    // Strategy 2: Google TTS Audio fallback for 100% reliable pronunciation
    playAudioFallback(text);
  }, []);

  const playAudioFallback = (text: string) => {
    try {
      const clean = encodeURIComponent(text.trim());
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&q=${clean}`;

      if (!fallbackAudioRef.current) {
        fallbackAudioRef.current = new Audio();
      }

      const audio = fallbackAudioRef.current;
      audio.src = url;
      audio.volume = 1.0;

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn('Audio fallback play prevented:', e);
          setIsSpeaking(false);
        });
      }
    } catch (e) {
      console.warn('Audio fallback error:', e);
      setIsSpeaking(false);
    }
  };

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.pause();
      fallbackAudioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, isSupported };
}
