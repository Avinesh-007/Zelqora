import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../db/database.js';
import { ENV } from '../config/env.js';
import { User } from '../types/index.js';

export class AuthService {
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Register a new user with password hashing and session creation.
   */
  public static async register(email: string, password: string, role: 'user' | 'editor' | 'admin' = 'user'): Promise<{ user: User; token: string }> {
    const db = getDatabase();

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = 'usr_' + crypto.randomBytes(12).toString('hex');
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, normalizedEmail, passwordHash, role, now, now);

    const user: User = {
      id: userId,
      email: normalizedEmail,
      role,
      created_at: now,
      updated_at: now
    };

    const token = await this.createSession(userId);
    return { user, token };
  }

  /**
   * Authenticate a user with email and password.
   */
  public static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const db = getDatabase();
    const normalizedEmail = email.trim().toLowerCase();

    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as any;
    if (!row) {
      throw new Error('Invalid email or password.');
    }

    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) {
      throw new Error('Invalid email or password.');
    }

    const user: User = {
      id: row.id,
      email: row.email,
      role: row.role,
      created_at: row.created_at,
      updated_at: row.updated_at
    };

    const token = await this.createSession(user.id);
    return { user, token };
  }

  /**
   * Generates a secure session token and persists the session hash.
   */
  public static async createSession(userId: string): Promise<string> {
    const db = getDatabase();
    const token = jwt.sign({ userId, nonce: crypto.randomBytes(16).toString('hex') }, ENV.JWT_SECRET, {
      expiresIn: `${ENV.SESSION_EXPIRY_DAYS}d`
    });

    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + ENV.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO sessions (token_hash, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenHash, userId, expiresAt, now);

    return token;
  }

  /**
   * Validates a session token and returns the corresponding User.
   */
  public static async validateSession(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
      if (!decoded || !decoded.userId) return null;

      const db = getDatabase();
      const tokenHash = this.hashToken(token);

      const session = db.prepare(`
        SELECT * FROM sessions 
        WHERE token_hash = ? AND datetime(expires_at) > datetime('now')
      `).get(tokenHash) as any;

      if (!session) return null;

      const userRow = db.prepare('SELECT id, email, role, created_at, updated_at FROM users WHERE id = ?').get(session.user_id) as any;
      if (!userRow) return null;

      return {
        id: userRow.id,
        email: userRow.email,
        role: userRow.role,
        created_at: userRow.created_at,
        updated_at: userRow.updated_at
      };
    } catch {
      return null;
    }
  }

  /**
   * Revokes a session upon logout.
   */
  public static async logout(token: string): Promise<void> {
    const db = getDatabase();
    const tokenHash = this.hashToken(token);
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
  }

  /**
   * Claims / migrates anonymous investigations associated with a guest token into the authenticated user's account.
   */
  public static async claimGuestInvestigations(guestToken: string, userId: string): Promise<number> {
    if (!guestToken) return 0;
    const db = getDatabase();
    const result = db.prepare(`
      UPDATE investigations 
      SET user_id = ?, guest_token = NULL, updated_at = ?
      WHERE guest_token = ? AND user_id IS NULL
    `).run(userId, new Date().toISOString(), guestToken);

    return result.changes;
  }

  /**
   * Deletes an account and cascades associated data.
   */
  public static async deleteAccount(userId: string): Promise<void> {
    const db = getDatabase();
    db.transaction(() => {
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM investigations WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    })();
  }
}
