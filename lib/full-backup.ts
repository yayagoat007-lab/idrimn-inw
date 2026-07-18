import { getAllKeysForUser, STORAGE_KEY_REGISTRY } from './storage-registry';
import { patternToRegex } from './storage-inspector';
import { encryptField, decryptField } from './client-encryption';

const EXCLUDED_BACKUP_CATEGORIES = ['cache_ephemeral'];
const EXCLUDED_BACKUP_PATTERNS = [
  'floussi_tour_completed_${tourId}_${userId}',
  'floussi_tour_skipped_${tourId}_${userId}',
  'floussi_recent_searches_${userId}'
];

export interface BackupPreview {
  createdAt: string;
  transactionsCount: number;
  bucketsCount: number;
  goalsCount: number;
  walletBalance: number;
  currentLevel: string;
}

const encoder = new TextEncoder();

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derives a dedicated PBKDF2 key from the user's chosen backup password and salt.
 */
async function deriveBackupKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error("Web Crypto API is not available.");
  }
  
  const passwordBuffer = encoder.encode(password);
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Creates a fully encrypted backup of all user's data.
 * EXCLUDES ephemeral data like recent searches or completed tours.
 */
export async function createFullBackup(userId: string, backupPassword: string): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error("Browser environment required for backup creation.");
  }

  // 1. Collect all valid keys for the user
  const allKeys = getAllKeysForUser(userId);
  const backupData: Record<string, string> = {};

  for (const key of allKeys) {
    // Check if the key matches an excluded category or pattern
    const entry = STORAGE_KEY_REGISTRY.find(e => {
      const regex = patternToRegex(e.pattern);
      return regex.test(key);
    });

    if (entry) {
      if (EXCLUDED_BACKUP_CATEGORIES.includes(entry.category)) continue;
      if (EXCLUDED_BACKUP_PATTERNS.includes(entry.pattern)) continue;
    }

    const value = localStorage.getItem(key);
    if (value !== null) {
      backupData[key] = value;
    }
  }

  // 2. Generate a random salt for this backup
  const salt = window.crypto.getRandomValues(new Uint8Array(16));

  // 3. Derive key and encrypt payload
  const backupKey = await deriveBackupKey(backupPassword, salt);
  const payloadStr = JSON.stringify(backupData);
  const encryptedPayload = await encryptField(payloadStr, backupKey);

  // 4. Create the final backup object
  const backupObj = {
    version: 1,
    createdAt: new Date().toISOString(),
    appVersion: "1.0.0",
    salt: arrayBufferToBase64(salt.buffer),
    encryptedPayload
  };

  return new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
}

/**
 * Decrypts and retrieves a preview of the backup content BEFORE applying it.
 */
export async function previewBackupContent(
  backupFile: File, 
  backupPassword: string
): Promise<BackupPreview | { error: string }> {
  try {
    const fileText = await backupFile.text();
    const backupObj = JSON.parse(fileText);

    if (!backupObj.encryptedPayload || !backupObj.salt) {
      return { error: "Format de fichier invalide ou corrompu / صيغة الملف غير صالحة أو تالفة" };
    }

    const salt = new Uint8Array(base64ToArrayBuffer(backupObj.salt));
    const backupKey = await deriveBackupKey(backupPassword, salt);
    
    const decryptedPayload = await decryptField(backupObj.encryptedPayload, backupKey);

    if (decryptedPayload === "[Déchiffrement Impossible]") {
      return { error: "Mot de passe de sauvegarde incorrect / الرمز السري للنسخة الاحتياطية خاطئ" };
    }

    const backupData: Record<string, string> = JSON.parse(decryptedPayload);
    const keys = Object.keys(backupData);

    // Extract counts & info
    const txKey = keys.find(k => k === 'floussi_table_transactions');
    const transactionsCount = txKey ? JSON.parse(backupData[txKey] || '[]').length : 0;

    const bkKey = keys.find(k => k === 'floussi_table_buckets');
    const bucketsCount = bkKey ? JSON.parse(backupData[bkKey] || '[]').length : 0;

    const glKey = keys.find(k => k === 'floussi_table_goals');
    const goalsCount = glKey ? JSON.parse(backupData[glKey] || '[]').length : 0;

    const walletKey = keys.find(k => k.startsWith('floussi_wallet_balance_'));
    let walletBalance = 0;
    if (walletKey) {
      try {
        const parsed = JSON.parse(backupData[walletKey]);
        walletBalance = typeof parsed.balance === 'number' ? parsed.balance : 0;
      } catch (_) {}
    }

    const gamificationKey = keys.find(k => k.startsWith('floussi_gamification_'));
    let currentLevel = '1';
    if (gamificationKey) {
      try {
        const parsed = JSON.parse(backupData[gamificationKey]);
        currentLevel = parsed.level ? String(parsed.level) : '1';
      } catch (_) {}
    }

    return {
      createdAt: backupObj.createdAt,
      transactionsCount,
      bucketsCount,
      goalsCount,
      walletBalance,
      currentLevel
    };
  } catch (err) {
    console.error("[Backup Preview Error]", err);
    return { error: "Erreur de lecture ou mot de passe incorrect / خطأ في القراءة أو الرمز السري خاطئ" };
  }
}

/**
 * Restores all localStorage keys from an encrypted backup.
 */
export async function restoreFromBackup(
  backupFile: File, 
  backupPassword: string
): Promise<{ success: boolean; restoredKeysCount: number; error?: string }> {
  try {
    const fileText = await backupFile.text();
    const backupObj = JSON.parse(fileText);

    if (!backupObj.encryptedPayload || !backupObj.salt) {
      return { success: false, restoredKeysCount: 0, error: "Fichier de sauvegarde invalide / ملف النسخة الاحتياطية غير صالح" };
    }

    const salt = new Uint8Array(base64ToArrayBuffer(backupObj.salt));
    const backupKey = await deriveBackupKey(backupPassword, salt);
    
    const decryptedPayload = await decryptField(backupObj.encryptedPayload, backupKey);

    if (decryptedPayload === "[Déchiffrement Impossible]") {
      return { success: false, restoredKeysCount: 0, error: "Mot de passe incorrect / الرمز السري خاطئ" };
    }

    const backupData: Record<string, string> = JSON.parse(decryptedPayload);
    const keys = Object.keys(backupData);

    let restoredCount = 0;
    for (const [key, value] of Object.entries(backupData)) {
      localStorage.setItem(key, value);
      restoredCount++;
    }

    return {
      success: true,
      restoredKeysCount: restoredCount
    };
  } catch (err) {
    console.error("[Backup Restore Error]", err);
    return {
      success: false,
      restoredKeysCount: 0,
      error: "Erreur lors de la restauration / خطأ أثناء استعادة البيانات"
    };
  }
}
