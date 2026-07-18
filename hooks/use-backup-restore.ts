import { useState, useEffect } from 'react';
import { createFullBackup, restoreFromBackup, previewBackupContent, BackupPreview } from '../lib/full-backup';

export function useBackupRestore(userId: string) {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);

  const lastBackupKey = `floussi_last_backup_date_${userId}`;

  // Load last backup date on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && userId) {
      setLastBackupDate(localStorage.getItem(lastBackupKey));
    }
  }, [userId, lastBackupKey]);

  /**
   * Generates, encrypts, and triggers browser download of the backup file.
   */
  const createBackup = async (password: string): Promise<boolean> => {
    if (!userId || !password) return false;
    setIsCreatingBackup(true);
    try {
      const blob = await createFullBackup(userId, password);
      
      // Save last backup date
      const nowStr = new Date().toISOString();
      localStorage.setItem(lastBackupKey, nowStr);
      setLastBackupDate(nowStr);

      // Trigger automatic file download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `floussi_backup_${userId}_${new Date().toISOString().split('T')[0]}.floussi-backup`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      console.error("Error creating backup", err);
      return false;
    } finally {
      setIsCreatingBackup(false);
    }
  };

  /**
   * Generates a preview of the backup file's content without applying it yet.
   */
  const previewBackup = async (
    file: File, 
    password: string
  ): Promise<BackupPreview | { error: string }> => {
    return await previewBackupContent(file, password);
  };

  /**
   * Decrypts and applies the backup file's contents over the local storage.
   */
  const restoreBackup = async (
    file: File, 
    password: string
  ): Promise<{ success: boolean; restoredKeysCount: number; error?: string }> => {
    setIsRestoring(true);
    try {
      const result = await restoreFromBackup(file, password);
      return result;
    } catch (err) {
      console.error("Error restoring backup", err);
      return { success: false, restoredKeysCount: 0, error: "Erreur inattendue lors de la restauration / خطأ غير متوقع" };
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    createBackup,
    isCreatingBackup,
    restoreBackup,
    previewBackup,
    isRestoring,
    lastBackupDate
  };
}
