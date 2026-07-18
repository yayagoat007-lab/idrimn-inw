/**
 * Storage schema version management.
 * Tracks code-level schema version of Floussi.
 */

const SCHEMA_VERSION_KEY = 'floussi_schema_version';

// Increment this whenever schema shapes are added or changed in future prompts.
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Retrieves the current schema version stored in the browser.
 * Returns 0 if never set, which indicates a legacy user prior to versioning.
 */
export function getStoredSchemaVersion(): number {
  if (typeof window === 'undefined') return CURRENT_SCHEMA_VERSION;
  const versionStr = localStorage.getItem(SCHEMA_VERSION_KEY);
  if (versionStr === null) {
    return 0; // Legacy user
  }
  const version = parseInt(versionStr, 10);
  return isNaN(version) ? 0 : version;
}

/**
 * Sets the schema version in localStorage.
 */
export function setStoredSchemaVersion(version: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SCHEMA_VERSION_KEY, version.toString());
}
