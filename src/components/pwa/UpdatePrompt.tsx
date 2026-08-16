import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const UpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 bg-[var(--color-bg-surface)] border border-[var(--color-accent)] rounded-xl p-4 shadow-xl"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-bold">
                <RefreshCw size={20} className="text-[var(--color-accent)]" />
                <span>Nueva versión disponible</span>
              </div>
              <button onClick={close} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-[var(--color-text-secondary)] text-sm">
              Hay una nueva actualización lista. Recarga para ver los cambios.
            </p>
            
            <button
              onClick={() => updateServiceWorker(true)}
              className="w-full py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white rounded-lg font-semibold transition-colors tap-highlight"
            >
              Actualizar App
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
