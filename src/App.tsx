import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { seedDatabase } from './db/seed';
import { useStreak } from './hooks/useStreak';

// Pages
import Dashboard from './pages/Dashboard';
import Dojo from './pages/Dojo';
import Library from './pages/Library';
import KanaDojo from './pages/KanaDojo';
import KanjiTower from './pages/KanjiTower';
import VocabForge from './pages/VocabForge';
import ReviewSession from './pages/ReviewSession';
import Stats from './pages/Stats';
import Settings from './pages/Settings';

// PWA
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { UpdatePrompt } from './components/pwa/UpdatePrompt';

function AppContent() {
  useStreak();

  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dojo" element={<Dojo />} />
        <Route path="/library" element={<Library />} />
        <Route path="/kana" element={<KanaDojo />} />
        <Route path="/kanji" element={<KanjiTower />} />
        <Route path="/vocab" element={<VocabForge />} />
        <Route path="/review" element={<ReviewSession />} />
        <Route path="/review/:category" element={<ReviewSession />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <InstallPrompt />
      <UpdatePrompt />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
