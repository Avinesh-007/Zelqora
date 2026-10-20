import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { ENV } from '../config/env.js';
import { MIGRATIONS } from './schema.js';

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure directory exists if not memory
  if (ENV.DATABASE_PATH !== ':memory:') {
    const dir = path.dirname(ENV.DATABASE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(ENV.DATABASE_PATH);

  // WAL mode for superior concurrency and performance
  if (ENV.DATABASE_PATH !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  dbInstance = db;
  runMigrations(db);

  return dbInstance;
}

export function resetDatabaseForTests(testDbPath: string = ':memory:'): Database.Database {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {}
    dbInstance = null;
  }
  const db = new Database(testDbPath);
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  dbInstance = db;
  runMigrations(db);
  return dbInstance;
}

export function runMigrations(db: Database.Database): void {
  // Ensure migrations tracking table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedVersions = new Set<number>(
    db.prepare('SELECT version FROM schema_migrations').all().map((r: any) => r.version)
  );

  for (const migration of MIGRATIONS) {
    if (!appliedVersions.has(migration.version)) {
      const applyTx = db.transaction(() => {
        db.exec(migration.up);
        db.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)')
          .run(migration.version, migration.name, new Date().toISOString());
      });
      applyTx();
    }
  }
}

export function checkDatabaseHealth(): { healthy: boolean; error?: string; migrationCount?: number } {
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT count(*) as count FROM schema_migrations').get() as { count: number };
    return {
      healthy: true,
      migrationCount: result.count
    };
  } catch (err: any) {
    return {
      healthy: false,
      error: err.message
    };
  }
}
