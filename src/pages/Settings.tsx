import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, Trash2, Database, AlertTriangle, Bell, Volume2, Eye } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useNotifications } from '../hooks/useNotifications';
import { exportDatabaseToFile, importDatabaseFromFile, getDatabaseStats } from '../db/backup';
import { db } from '../db/database';
import { seedDatabase } from '../db/seed';
import { cn } from '../lib/utils';

export default function Settings() {
  const settings = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dbStats, setDbStats] = useState<{
    totalCards: number;
    totalReviews: number;
    totalProgress: number;
    totalAchievements: number;
  } | null>(null);

  const { isSupported: notifSupported, permissionState, requestPermission, scheduleReminder } =
    useNotifications();

  useEffect(() => {
    getDatabaseStats().then(setDbStats).catch(console.error);
  }, []);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('Importando datos...');
    const result = await importDatabaseFromFile(file);
    setImportStatus(result.message);

    if (result.success) {
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  };

  const handleClearData = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }

    try {
      await db.cards.clear();
      await db.reviews.clear();
      await db.progress.clear();
      await db.achievements.clear();
      await seedDatabase();
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationToggle = async () => {
    if (!settings.notificationsEnabled) {
      const granted = await requestPermission();
      if (granted) {
        settings.setSetting('notificationsEnabled', true);
        scheduleReminder(settings.notificationHour, settings.notificationMinute);
      }
    } else {
      settings.setSetting('notificationsEnabled', false);
    }
  };

  return (
    <AppShell title="Ajustes" showStats>
      <div className="space-y-5 animate-fade-in px-1 max-w-lg mx-auto">
        {/* Metas Diarias */}
        <section className="card-surface p-5 space-y-5">
          <h3 className="font-bold text-sm text-[var(--color-accent)] uppercase tracking-wider">
            Metas Diarias
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span>Lecciones nuevas / día</span>
                <span className="font-bold font-mono text-[var(--color-accent-gold)]" style={{ fontFamily: 'var(--font-mono)' }}>
                  {settings.dailyLessonGoal}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={settings.dailyLessonGoal}
                onChange={(e) => settings.setSetting('dailyLessonGoal', parseInt(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span>Repasos / día</span>
                <span className="font-bold font-mono text-[var(--color-accent-gold)]" style={{ fontFamily: 'var(--font-mono)' }}>
                  {settings.dailyReviewGoal}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={settings.dailyReviewGoal}
                onChange={(e) => settings.setSetting('dailyReviewGoal', parseInt(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>
          </div>
        </section>

        {/* Furigana & Audio */}
        <section className="card-surface p-5 space-y-4">
          <h3 className="font-bold text-sm text-[var(--color-accent)] uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Visualización y Audio
          </h3>

          <div>
            <label className="text-xs text-[var(--color-text-secondary)] block mb-2 font-medium">
              Modo de Furigana
            </label>
            <div className="grid grid-cols-3 gap-2 bg-[var(--color-bg-primary)] p-1 rounded-xl">
              {(['always', 'hover', 'hidden'] as const).map((mode) => {
                const labels = { always: 'Siempre', hover: 'Al tocar', hidden: 'Oculto' };
                const isSelected = settings.furiganaMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => settings.setSetting('furiganaMode', mode)}
                    className={cn(
                      'py-2 rounded-lg text-xs font-bold transition-all tap-highlight',
                      isSelected
                        ? 'bg-[var(--color-accent)] text-white shadow-md'
                        : 'text-[var(--color-text-secondary)] hover:text-white'
                    )}
                  >
                    {labels[mode]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-[var(--color-text-secondary)]" />
              <div>
                <span className="text-sm font-medium block">Audio automático</span>
                <span className="text-xs text-[var(--color-text-secondary)]">Reproducir al mostrar tarjeta</span>
              </div>
            </div>
            <button
              onClick={() => settings.setSetting('autoPlayAudio', !settings.autoPlayAudio)}
              className={cn(
                'w-12 h-7 rounded-full transition-colors relative p-1 tap-highlight',
                settings.autoPlayAudio ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-elevated)]'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full bg-white transition-transform',
                  settings.autoPlayAudio ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="card-surface p-5 space-y-4">
          <h3 className="font-bold text-sm text-[var(--color-accent)] uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notificaciones y Recordatorios
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium block">Recordatorio diario</span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {notifSupported
                  ? `Estado: ${permissionState === 'granted' ? 'Activado' : 'Sin permiso'}`
                  : 'Requiere añadir a pantalla de inicio (PWA)'}
              </span>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={cn(
                'w-12 h-7 rounded-full transition-colors relative p-1 tap-highlight',
                settings.notificationsEnabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-elevated)]'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full bg-white transition-transform',
                  settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </section>

        {/* Datos y Backup */}
        <section className="card-surface p-5 space-y-4">
          <h3 className="font-bold text-sm text-[var(--color-accent)] uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4" />
            Respaldo y Migración
          </h3>

          {dbStats && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[var(--color-bg-primary)] p-3 rounded-xl flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Total cartas:</span>
                <span className="font-mono font-bold">{dbStats.totalCards}</span>
              </div>
              <div className="bg-[var(--color-bg-primary)] p-3 rounded-xl flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Reviews:</span>
                <span className="font-mono font-bold">{dbStats.totalReviews}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Exporta tu progreso a un archivo JSON para hacer una copia de seguridad o transferirlo a otro dispositivo (ej. otro móvil).
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => exportDatabaseToFile()}
              className="py-3 px-4 rounded-xl bg-[var(--color-bg-elevated)] border border-white/5 font-semibold text-sm flex items-center justify-center gap-2 tap-highlight hover:bg-white/5 transition-all"
            >
              <Download className="w-4 h-4 text-[var(--color-accent)]" />
              Exportar
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 rounded-xl bg-[var(--color-bg-elevated)] border border-white/5 font-semibold text-sm flex items-center justify-center gap-2 tap-highlight hover:bg-white/5 transition-all"
            >
              <Upload className="w-4 h-4 text-[var(--color-accent-gold)]" />
              Importar
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          {importStatus && (
            <p className="text-xs text-center font-bold text-[var(--color-success)] py-1">
              {importStatus}
            </p>
          )}
        </section>

        {/* Zona de Peligro */}
        <section className="card-surface p-5 border border-[var(--color-error)]/20 space-y-3">
          <h3 className="font-bold text-sm text-[var(--color-error)] uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Zona de Peligro
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Reinicia todo tu progreso, reviews y estadísticas a los valores de fábrica.
          </p>
          <button
            onClick={handleClearData}
            className={cn(
              'w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 tap-highlight transition-all',
              confirmDelete
                ? 'bg-[var(--color-error)] text-white shadow-lg'
                : 'bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20'
            )}
          >
            <Trash2 className="w-4 h-4" />
            {confirmDelete ? '¿Estás seguro? Toca de nuevo para borrar' : 'Reiniciar todo el progreso'}
          </button>
        </section>
      </div>
    </AppShell>
  );
}
