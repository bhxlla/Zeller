import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Schema migrations, applied in order. Entry N upgrades the database to version N + 1.
 * Append only: never edit or reorder a migration that has shipped, add a new one instead.
 */
const MIGRATIONS: readonly string[] = [
  // v1: customers table. `source`, `is_dirty` and `deleted_at` support local-wins sync.
  `
  CREATE TABLE customers (
    id          TEXT PRIMARY KEY NOT NULL,
    name        TEXT NOT NULL,
    email       TEXT,
    role        TEXT CHECK (role IN ('Admin', 'Manager')),
    source      TEXT NOT NULL CHECK (source IN ('remote', 'local')),
    is_dirty    INTEGER NOT NULL DEFAULT 0,
    deleted_at  INTEGER
  );
  CREATE INDEX idx_customers_name ON customers (name COLLATE NOCASE);
  `,
];

/** Brings the database schema up to date. Safe to call on every app start. */
export async function migrate(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  const pending = MIGRATIONS.slice(currentVersion);

  for (const [index, sql] of pending.entries()) {
    const version = currentVersion + index + 1;
    // Each migration and its version bump commit together, or not at all.
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(sql);
      await txn.execAsync(`PRAGMA user_version = ${version}`);
    });
  }
}
