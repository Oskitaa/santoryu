import { exportDB, importDB } from 'dexie-export-import';
import { db } from './database';

/**
 * Export the entire database as a JSON blob for download.
 * Includes all cards, reviews, progress, achievements, and settings.
 */
export async function exportDatabaseToFile(): Promise<void> {
  const blob = await exportDB(db, { prettyJson: true });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `santoryu-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Import a previously exported database file.
 * Validates the file structure before importing.
 *
 * @param file - The JSON backup file to import
 * @param clearExisting - If true, clears all existing data before importing
 */
export async function importDatabaseFromFile(
  file: File,
  clearExisting = true
): Promise<{ success: boolean; message: string }> {
  // Validate file type
  if (!file.name.endsWith('.json')) {
    return { success: false, message: 'El archivo debe ser un JSON (.json)' };
  }

  // Validate file size (max 50MB)
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { success: false, message: 'El archivo es demasiado grande (máx 50MB)' };
  }

  try {
    // Validate it's actually a valid Dexie export by checking structure
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { success: false, message: 'El archivo no contiene JSON válido' };
    }

    // Basic structure validation
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('formatName' in parsed) ||
      (parsed as Record<string, unknown>).formatName !== 'dexie'
    ) {
      return {
        success: false,
        message: 'El archivo no es un backup válido de Santoryu',
      };
    }

    // Re-create blob from validated text for import
    const validatedBlob = new Blob([text], { type: 'application/json' });

    if (clearExisting) {
      await db.delete();
      await db.open();
    }

    await importDB(validatedBlob);

    return { success: true, message: 'Datos importados correctamente' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return { success: false, message: `Error al importar: ${message}` };
  }
}

/**
 * Get the current database size estimation
 */
export async function getDatabaseStats(): Promise<{
  totalCards: number;
  totalReviews: number;
  totalProgress: number;
  totalAchievements: number;
}> {
  const [totalCards, totalReviews, totalProgress, totalAchievements] =
    await Promise.all([
      db.cards.count(),
      db.reviews.count(),
      db.progress.count(),
      db.achievements.count(),
    ]);

  return { totalCards, totalReviews, totalProgress, totalAchievements };
}
