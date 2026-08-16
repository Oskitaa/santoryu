import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showStats?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ children, title, showStats }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-inter flex flex-col">
      <Header title={title} showStats={showStats} />

      <main className="flex-1 w-full max-w-lg mx-auto pt-[calc(env(safe-area-inset-top,0px)+3.5rem+0.75rem)] pb-[calc(env(safe-area-inset-bottom,0px)+3.5rem+1.75rem)] px-3 sm:px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
};
