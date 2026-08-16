import React, { useState, useEffect } from 'react';
import { Share, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    // Check if running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    // Check if dismissed
    const isDismissed = localStorage.getItem('installPromptDismissed');

    if (isIOS && !isStandalone && !isDismissed) {
      // Delay showing prompt
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', 'true');
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 bg-[var(--color-bg-surface)] border border-[var(--color-bg-elevated)] rounded-xl p-4 shadow-xl"
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="bg-[var(--color-accent)]/20 p-3 rounded-lg text-[var(--color-accent)]">
              <Share size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-[var(--color-text-primary)] font-bold mb-1">Instalar Santoryu</h3>
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                Para la mejor experiencia, instala esta app en tu pantalla de inicio: toca el icono de <strong>Compartir</strong> abajo y selecciona <strong>Añadir a la pantalla de inicio</strong>.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
