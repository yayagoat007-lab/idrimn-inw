import { getStoredSchemaVersion, setStoredSchemaVersion, CURRENT_SCHEMA_VERSION } from './schema-version';

export interface Migration {
  fromVersion: number;
  toVersion: number;
  description: string;
  migrate: (userId: string) => void;
}

/**
 * Array of migrations. Empty for now as current code is v1.
 * An illustrative commented example is provided below.
 */
export const MIGRATIONS: Migration[] = [
  /*
  // EXAMPLE: Future schema migration from version 1 to 2
  // Imagine we want to ensure every transaction has a "notes" field (default to "")
  {
    fromVersion: 1,
    toVersion: 2,
    description: "Ajoute un champ 'notes' par défaut à toutes les transactions existantes",
    migrate: (userId: string) => {
      const txKey = 'floussi_table_transactions';
      const txVal = localStorage.getItem(txKey);
      if (txVal) {
        const transactions = JSON.parse(txVal);
        if (Array.isArray(transactions)) {
          const migratedTxs = transactions.map(tx => {
            if (tx.notes === undefined) {
              return { ...tx, notes: "" };
            }
            return tx;
          });
          localStorage.setItem(txKey, JSON.stringify(migratedTxs));
        }
      }
    }
  }
  */
];

/**
 * Executes all pending schema migrations sequentially up to CURRENT_SCHEMA_VERSION.
 */
export function runPendingMigrations(userId: string): { 
  migrationsApplied: number; 
  success: boolean; 
  errors: string[] 
} {
  const storedVersion = getStoredSchemaVersion();
  
  if (storedVersion >= CURRENT_SCHEMA_VERSION) {
    return { migrationsApplied: 0, success: true, errors: [] };
  }

  // If stored version is 0 (first time introducing migrations for legacy users),
  // we first bootstrap them to version 1. Since v1 represents the current database state,
  // we can simply set the version to 1 and complete, or run any legacy migrations if needed.
  if (storedVersion === 0) {
    setStoredSchemaVersion(1);
    
    // Check again, if CURRENT_SCHEMA_VERSION is 1, we are already up to date.
    if (CURRENT_SCHEMA_VERSION === 1) {
      return { migrationsApplied: 1, success: true, errors: [] };
    }
  }

  // Get current active version again in case it was updated by bootstrap
  let activeVersion = getStoredSchemaVersion();
  let migrationsApplied = 0;
  const errors: string[] = [];

  // Sort migrations by fromVersion to guarantee correct order
  const sortedMigrations = [...MIGRATIONS].sort((a, b) => a.fromVersion - b.fromVersion);

  for (const migration of sortedMigrations) {
    if (migration.fromVersion === activeVersion) {
      try {
        console.log(`[Migration] Running migration: v${migration.fromVersion} -> v${migration.toVersion} (${migration.description})`);
        
        migration.migrate(userId);
        
        // Advance version store immediately after successful step
        setStoredSchemaVersion(migration.toVersion);
        activeVersion = migration.toVersion;
        migrationsApplied++;
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        console.error(`[Migration] Failed during migration step from v${migration.fromVersion} to v${migration.toVersion}:`, err);
        errors.push(`v${migration.fromVersion}->v${migration.toVersion}: ${errMsg}`);
        
        // Stop execution on failure to prevent data corruption
        return {
          migrationsApplied,
          success: false,
          errors
        };
      }
    }
  }

  // If there are still higher versions but no migration was defined, keep the system version intact
  // or set it to current version if all defined migrations finished.
  if (activeVersion < CURRENT_SCHEMA_VERSION) {
    setStoredSchemaVersion(CURRENT_SCHEMA_VERSION);
  }

  return {
    migrationsApplied,
    success: true,
    errors: []
  };
}
