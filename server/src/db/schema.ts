export const MIGRATIONS = [
  {
    version: 1,
    name: 'initial_schema',
    up: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'editor' | 'admin'
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

      CREATE TABLE IF NOT EXISTS investigations (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        guest_token TEXT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        initial_description TEXT NOT NULL,
        environment TEXT NOT NULL, -- JSON
        status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'resolved' | 'abandoned'
        resolution_notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_investigations_user_id ON investigations(user_id);
      CREATE INDEX IF NOT EXISTS idx_investigations_guest_token ON investigations(guest_token);
      CREATE INDEX IF NOT EXISTS idx_investigations_status ON investigations(status);

      CREATE TABLE IF NOT EXISTS investigation_turns (
        id TEXT PRIMARY KEY,
        investigation_id TEXT NOT NULL,
        turn_index INTEGER NOT NULL,
        user_input TEXT NOT NULL, -- JSON
        assessment TEXT NOT NULL, -- JSON
        created_at TEXT NOT NULL,
        FOREIGN KEY (investigation_id) REFERENCES investigations(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_turns_investigation_id ON investigation_turns(investigation_id);

      CREATE TABLE IF NOT EXISTS guides (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        category TEXT NOT NULL,
        symptoms TEXT NOT NULL, -- JSON array
        environment_prereqs TEXT NOT NULL, -- JSON array
        likely_causes TEXT NOT NULL, -- JSON array
        diagnostic_steps TEXT NOT NULL, -- JSON array
        verified_solutions TEXT NOT NULL, -- JSON array
        warnings TEXT NOT NULL, -- JSON array
        documentation_references TEXT NOT NULL, -- JSON array
        status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'in_review' | 'approved' | 'published' | 'needs_review' | 'archived'
        author_name TEXT NOT NULL,
        last_reviewed_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_guides_slug ON guides(slug);
      CREATE INDEX IF NOT EXISTS idx_guides_status ON guides(status);
      CREATE INDEX IF NOT EXISTS idx_guides_category ON guides(category);
    `
  }
];
