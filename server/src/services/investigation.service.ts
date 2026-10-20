import crypto from 'crypto';
import { getDatabase } from '../db/database.js';
import { EnvironmentInfo, Investigation, InvestigationTurn } from '../types/index.js';
import { GeminiService } from './gemini.service.js';
import { RedactionService } from './redaction.service.js';

export class InvestigationService {
  /**
   * Starts a new investigation, redacts input secrets, runs the initial diagnostic assessment,
   * and persists turn 1 into the database.
   */
  public static async createInvestigation(params: {
    userId?: string | null;
    guestToken?: string | null;
    title: string;
    category: string;
    description: string;
    environment: EnvironmentInfo;
  }): Promise<{ investigation: Investigation; mode: 'gemini_live' | 'local_diagnostic_engine' }> {
    const db = getDatabase();

    // Redact inputs
    const redactedDescription = RedactionService.redact(params.description).redactedText;
    const redactedEnvironment = RedactionService.redactObject(params.environment);

    // Initial diagnostic analysis
    const { assessment, mode } = await GeminiService.analyzeIssue({
      description: redactedDescription,
      environment: redactedEnvironment,
      category: params.category
    });

    const investigationId = 'inv_' + crypto.randomBytes(12).toString('hex');
    const turnId = 'turn_' + crypto.randomBytes(12).toString('hex');
    const now = new Date().toISOString();

    const turn1: InvestigationTurn = {
      id: turnId,
      investigation_id: investigationId,
      turn_index: 1,
      user_input: {
        description: redactedDescription,
        environment: redactedEnvironment
      },
      assessment,
      created_at: now
    };

    const investigation: Investigation = {
      id: investigationId,
      user_id: params.userId || null,
      guest_token: params.guestToken || null,
      title: params.title || 'Technical Investigation',
      category: params.category || 'General',
      initial_description: redactedDescription,
      environment: redactedEnvironment,
      status: 'active',
      created_at: now,
      updated_at: now,
      turns: [turn1]
    };

    const insertTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO investigations (
          id, user_id, guest_token, title, category, initial_description,
          environment, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        investigation.id,
        investigation.user_id,
        investigation.guest_token,
        investigation.title,
        investigation.category,
        investigation.initial_description,
        JSON.stringify(investigation.environment),
        investigation.status,
        investigation.created_at,
        investigation.updated_at
      );

      db.prepare(`
        INSERT INTO investigation_turns (
          id, investigation_id, turn_index, user_input, assessment, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        turn1.id,
        turn1.investigation_id,
        turn1.turn_index,
        JSON.stringify(turn1.user_input),
        JSON.stringify(turn1.assessment),
        turn1.created_at
      );
    });

    insertTx();

    return { investigation, mode };
  }

  /**
   * Retrieves an investigation with all its turns, verifying access ownership.
   */
  public static getInvestigation(id: string, actor: { userId?: string | null; guestToken?: string | null }): Investigation | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM investigations WHERE id = ?').get(id) as any;
    if (!row) return null;

    // Check ownership: user matches OR guest token matches
    const isOwner = (actor.userId && row.user_id === actor.userId) || 
                    (actor.guestToken && row.guest_token === actor.guestToken);

    if (!isOwner) {
      throw new Error('Forbidden: You do not have permission to access this private investigation.');
    }

    const turnsRows = db.prepare(`
      SELECT * FROM investigation_turns WHERE investigation_id = ? ORDER BY turn_index ASC
    `).all(id) as any[];

    const turns: InvestigationTurn[] = turnsRows.map(r => ({
      id: r.id,
      investigation_id: r.investigation_id,
      turn_index: r.turn_index,
      user_input: JSON.parse(r.user_input),
      assessment: JSON.parse(r.assessment),
      created_at: r.created_at
    }));

    return {
      id: row.id,
      user_id: row.user_id,
      guest_token: row.guest_token,
      title: row.title,
      category: row.category,
      initial_description: row.initial_description,
      environment: JSON.parse(row.environment),
      status: row.status,
      resolution_notes: row.resolution_notes || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      turns
    };
  }

  /**
   * Lists investigations belonging to the user or guest token.
   */
  public static listInvestigations(actor: { userId?: string | null; guestToken?: string | null }): Investigation[] {
    const db = getDatabase();
    let rows: any[] = [];

    if (actor.userId) {
      rows = db.prepare(`
        SELECT * FROM investigations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50
      `).all(actor.userId);
    } else if (actor.guestToken) {
      rows = db.prepare(`
        SELECT * FROM investigations WHERE guest_token = ? AND user_id IS NULL ORDER BY updated_at DESC LIMIT 50
      `).all(actor.guestToken);
    }

    return rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      guest_token: row.guest_token,
      title: row.title,
      category: row.category,
      initial_description: row.initial_description,
      environment: JSON.parse(row.environment),
      status: row.status,
      resolution_notes: row.resolution_notes || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  /**
   * Appends a new turn when the user submits diagnostic test output or answers clarifying questions.
   */
  public static async submitTurn(params: {
    investigationId: string;
    actor: { userId?: string | null; guestToken?: string | null };
    testOutput?: string;
    answeredQuestions?: Record<string, string>;
  }): Promise<{ turn: InvestigationTurn; mode: 'gemini_live' | 'local_diagnostic_engine' }> {
    const investigation = this.getInvestigation(params.investigationId, params.actor);
    if (!investigation) {
      throw new Error('Investigation not found.');
    }

    if (investigation.status !== 'active') {
      throw new Error(`Cannot add diagnostic evidence to an investigation that is ${investigation.status}.`);
    }

    const cleanTestOutput = params.testOutput 
      ? RedactionService.redact(params.testOutput).redactedText 
      : undefined;

    const { assessment, mode } = await GeminiService.analyzeIssue({
      description: investigation.initial_description,
      environment: investigation.environment,
      category: investigation.category,
      submittedTestOutput: cleanTestOutput,
      answeredQuestions: params.answeredQuestions,
      previousTurns: investigation.turns
    });

    const db = getDatabase();
    const nextTurnIndex = (investigation.turns?.length || 0) + 1;
    const turnId = 'turn_' + crypto.randomBytes(12).toString('hex');
    const now = new Date().toISOString();

    const newTurn: InvestigationTurn = {
      id: turnId,
      investigation_id: investigation.id,
      turn_index: nextTurnIndex,
      user_input: {
        submitted_test_output: cleanTestOutput,
        answered_questions: params.answeredQuestions
      },
      assessment,
      created_at: now
    };

    const appendTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO investigation_turns (
          id, investigation_id, turn_index, user_input, assessment, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        newTurn.id,
        newTurn.investigation_id,
        newTurn.turn_index,
        JSON.stringify(newTurn.user_input),
        JSON.stringify(newTurn.assessment),
        newTurn.created_at
      );

      db.prepare(`
        UPDATE investigations SET updated_at = ? WHERE id = ?
      `).run(now, investigation.id);
    });

    appendTx();

    return { turn: newTurn, mode };
  }

  /**
   * Safe rollback to a previous turn (e.g. if the user wants to retry with different test outputs).
   */
  public static rollbackToTurn(investigationId: string, turnIndex: number, actor: { userId?: string | null; guestToken?: string | null }): Investigation {
    const investigation = this.getInvestigation(investigationId, actor);
    if (!investigation) {
      throw new Error('Investigation not found.');
    }

    if (turnIndex < 1 || turnIndex >= (investigation.turns?.length || 1)) {
      throw new Error('Invalid turn index for rollback.');
    }

    const db = getDatabase();
    const rollbackTx = db.transaction(() => {
      db.prepare(`
        DELETE FROM investigation_turns WHERE investigation_id = ? AND turn_index > ?
      `).run(investigationId, turnIndex);

      db.prepare(`
        UPDATE investigations SET updated_at = ? WHERE id = ?
      `).run(new Date().toISOString(), investigationId);
    });

    rollbackTx();

    return this.getInvestigation(investigationId, actor)!;
  }

  /**
   * Marks an investigation as resolved or abandoned.
   */
  public static updateResolution(
    investigationId: string, 
    status: 'resolved' | 'abandoned', 
    resolutionNotes: string,
    actor: { userId?: string | null; guestToken?: string | null }
  ): Investigation {
    const investigation = this.getInvestigation(investigationId, actor);
    if (!investigation) {
      throw new Error('Investigation not found.');
    }

    const db = getDatabase();
    const now = new Date().toISOString();
    const cleanNotes = RedactionService.redact(resolutionNotes).redactedText;

    db.prepare(`
      UPDATE investigations 
      SET status = ?, resolution_notes = ?, updated_at = ?
      WHERE id = ?
    `).run(status, cleanNotes, now, investigationId);

    return this.getInvestigation(investigationId, actor)!;
  }

  /**
   * Deletes an investigation.
   */
  public static deleteInvestigation(investigationId: string, actor: { userId?: string | null; guestToken?: string | null }): void {
    const investigation = this.getInvestigation(investigationId, actor);
    if (!investigation) {
      throw new Error('Investigation not found.');
    }

    const db = getDatabase();
    db.prepare('DELETE FROM investigations WHERE id = ?').run(investigationId);
  }
}
