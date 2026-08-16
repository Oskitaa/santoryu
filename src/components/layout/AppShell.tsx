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
      
      <main className="flex-1 overflow-y-auto pt-[max(env(safe-area-inset-top,0px),56px)] pb-[max(env(safe-area-inset-bottom,0px),64px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
};
