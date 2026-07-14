/**
 * client-encryption.ts
 * 
 * Progressive client-side encryption using the native Web Crypto API (SubtleCrypto, AES-GCM).
 * The encryption key is derived dynamically from the user's password or PIN via PBKDF2.
 * The derived key is stored purely in memory during the active session and is never written to disk.
 * 
 * Progressive enhancement: Fields prefixed with "__encrypted__:" are decrypted on-the-fly.
 * If no session key is active, values are handled gracefully without breaking existing data structures.
 * 
 * NOTE: Client-side encryption is an added layer of privacy for offline storage,
 * and does not replace server-side database access controls and transmission security.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Conversions helpers
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

// In-memory key storage during session
let activeSessionKey: CryptoKey | null = null;

/**
 * Derives a cryptographic key from a pin or password using PBKDF2 and a static salt.
 */
export async function deriveKeyFromPassword(password: string, saltString: string = "floussi-secure-salt-2026"): Promise<CryptoKey> {
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(saltString);

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
      salt: saltBuffer,
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
 * Encrypts a plain text using AES-GCM with the derived key.
 */
export async function encryptField(plainText: string, key: CryptoKey): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Standard 12-byte IV for AES-GCM
  const plainTextBuffer = encoder.encode(plainText);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    plainTextBuffer
  );

  const ivBase64 = arrayBufferToBase64(iv.buffer);
  const ciphertextBase64 = arrayBufferToBase64(ciphertextBuffer);

  return JSON.stringify({
    iv: ivBase64,
    ciphertext: ciphertextBase64
  });
}

/**
 * Decrypts a cipher text JSON using AES-GCM and the key.
 */
export async function decryptField(cipherTextJson: string, key: CryptoKey): Promise<string> {
  try {
    const { iv: ivBase64, ciphertext: ciphertextBase64 } = JSON.parse(cipherTextJson);
    const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
    const ciphertext = base64ToArrayBuffer(ciphertextBase64);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      ciphertext
    );

    return decoder.decode(decryptedBuffer);
  } catch (err) {
    console.error("[Encryption] Failed to decrypt field:", err);
    return "[Déchiffrement Impossible]";
  }
}

/**
 * Get/Set the active session key
 */
export function getActiveSessionKey(): CryptoKey | null {
  return activeSessionKey;
}

export function setActiveSessionKey(key: CryptoKey | null) {
  activeSessionKey = key;
}

/**
 * Helper to initialize a session key from a 4-digit PIN or custom password
 */
export async function initializeSession(password: string): Promise<void> {
  try {
    const key = await deriveKeyFromPassword(password);
    setActiveSessionKey(key);
    console.log("[Encryption] Cryptographic session initialized successfully.");
  } catch (e) {
    console.error("[Encryption] Failed to initialize cryptographic session:", e);
    setActiveSessionKey(null);
  }
}

/**
 * Close/clear active session key
 */
export function clearSession() {
  setActiveSessionKey(null);
  console.log("[Encryption] Session cleared. Security keys discarded from memory.");
}

/**
 * Progressive helper to encrypt any field. 
 * If no session key is active, it returns the raw value unchanged.
 */
export async function tryEncrypt(value: string | number | undefined | null): Promise<string> {
  if (value === undefined || value === null) return '';
  const textVal = String(value);
  const key = getActiveSessionKey();
  
  if (!key) {
    return textVal; // Normal storage if no key active
  }

  try {
    const encrypted = await encryptField(textVal, key);
    return `__encrypted__:${encrypted}`;
  } catch (e) {
    console.error("[Encryption] Error during progressive encryption:", e);
    return textVal;
  }
}

/**
 * Progressive helper to decrypt fields.
 * If value is not encrypted (not prefixed), returns it raw.
 * If encrypted but no session key exists, returns a masked text.
 */
export async function tryDecrypt(value: string | undefined | null): Promise<string> {
  if (!value) return '';
  if (!value.startsWith('__encrypted__:')) {
    return value; // Progressive fallback: already in cleartext
  }

  const key = getActiveSessionKey();
  if (!key) {
    return "🔒 [Saisir PIN pour voir]";
  }

  try {
    const cipherTextJson = value.replace('__encrypted__:', '');
    return await decryptField(cipherTextJson, key);
  } catch (e) {
    console.error("[Encryption] Error during progressive decryption:", e);
    return "🔒 [Erreur Déchiffrement]";
  }
}
