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

  let dbPath = ENV.DATABASE_PATH;

  // Ensure directory exists if not memory
  if (dbPath !== ':memory:') {
    try {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (err: any) {
      console.warn(`Could not create directory for DATABASE_PATH (${dbPath}): ${err.message}. Falling back to ./data/zelqora.db`);
      dbPath = './data/zelqora.db';
      try {
        const fallbackDir = path.dirname(dbPath);
        if (!fs.existsSync(fallbackDir)) {
          fs.mkdirSync(fallbackDir, { recursive: true });
        }
      } catch {}
    }
  }

  let db: Database.Database;
  try {
    db = new Database(dbPath);
  } catch (err: any) {
    console.warn(`Failed to open database at ${dbPath}: ${err.message}. Falling back to in-memory database.`);
    db = new Database(':memory:');
    dbPath = ':memory:';
  }

  // WAL mode for superior concurrency and performance (file databases only)
  if (dbPath !== ':memory:') {
    try {
      db.pragma('journal_mode = WAL');
    } catch {}
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
