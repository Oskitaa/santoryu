import { useLocation, useNavigate } from 'react-router';
import { House, Languages, BookOpen, GraduationCap, Settings } from 'lucide-react';
import { motion } from 'motion/react';

const tabs = [
  { path: '/', label: 'Inicio', icon: House },
  { path: '/kana', label: 'Kana', icon: Languages },
  { path: '/kanji', label: 'Kanji', icon: BookOpen },
  { path: '/vocab', label: 'Vocab', icon: GraduationCap },
  { path: '/settings', label: 'Ajustes', icon: Settings }
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg-surface)]/80 backdrop-blur-md border-t border-[var(--color-bg-elevated)] pb-safe">
      <nav className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="tap-highlight flex flex-col items-center justify-center w-full h-full space-y-1 relative"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative p-1 rounded-full ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
