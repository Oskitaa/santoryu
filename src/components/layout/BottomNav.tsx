import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Compass, Sword, BookOpen, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const tabs = [
  { path: '/', label: 'Camino', icon: Compass },
  { path: '/dojo', label: 'Dojo', icon: Sword },
  { path: '/library', label: 'Biblioteca', icon: BookOpen },
  { path: '/settings', label: 'Ajustes', icon: Settings },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg-surface)]/95 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="flex justify-around items-center h-11 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const isActive =
            tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path) ||
                (tab.path === '/library' &&
                  (location.pathname === '/kana' ||
                    location.pathname === '/kanji' ||
                    location.pathname === '/vocab'));

          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="tap-highlight flex flex-col items-center justify-center flex-1 h-full py-0.5 relative"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={cn(
                  'relative rounded-lg transition-colors flex items-center justify-center',
                  isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'
                )}
              >
                <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
              </motion.div>
              <span
                className={cn(
                  'text-[9px] font-medium leading-none tracking-tight mt-0.5',
                  isActive ? 'text-[var(--color-accent)] font-bold' : 'text-[var(--color-text-muted)]'
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
