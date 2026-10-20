import crypto from 'crypto';
import { getDatabase } from '../db/database.js';
import { Guide, GuideStatus } from '../types/index.js';
import { DocumentationService } from './documentation.service.js';

export class EditorialService {
  /**
   * Retrieves all published guides for public indexing and browsing.
   */
  public static getPublishedGuides(category?: string): Guide[] {
    const db = getDatabase();
    let query = `SELECT * FROM guides WHERE status = 'published'`;
    const params: any[] = [];

    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }

    query += ` ORDER BY last_reviewed_at DESC`;
    const rows = db.prepare(query).all(...params) as any[];

    return rows.map(this.deserializeGuide);
  }

  /**
   * Retrieves a single published guide by its URL slug.
   */
  public static getPublishedGuideBySlug(slug: string): Guide | null {
    const db = getDatabase();
    const row = db.prepare(`SELECT * FROM guides WHERE slug = ? AND status = 'published'`).get(slug) as any;
    if (!row) return null;
    return this.deserializeGuide(row);
  }

  /**
   * Editorial view: lists all guides across all statuses (draft, in_review, approved, published, etc.).
   */
  public static getAllGuides(filterStatus?: GuideStatus): Guide[] {
    const db = getDatabase();
    let query = `SELECT * FROM guides`;
    const params: any[] = [];

    if (filterStatus) {
      query += ` WHERE status = ?`;
      params.push(filterStatus);
    }

    query += ` ORDER BY updated_at DESC`;
    const rows = db.prepare(query).all(...params) as any[];

    return rows.map(this.deserializeGuide);
  }

  /**
   * Retrieves any guide by ID (for editors/reviewers).
   */
  public static getGuideById(id: string): Guide | null {
    const db = getDatabase();
    const row = db.prepare(`SELECT * FROM guides WHERE id = ?`).get(id) as any;
    if (!row) return null;
    return this.deserializeGuide(row);
  }

  /**
   * Creates a new troubleshooting guide draft.
   * AI-generated content can ONLY enter as a 'draft' or 'in_review'; it cannot be created directly as 'published'.
   */
  public static createGuideDraft(guideData: {
    slug: string;
    title: string;
    summary: string;
    category: string;
    symptoms: string[];
    environment_prereqs: string[];
    likely_causes: { cause: string; explanation: string }[];
    diagnostic_steps: { step: string; command?: string; interpretation: string }[];
    verified_solutions: { title: string; steps: string[]; code_snippet?: string; language?: string; rollback?: string }[];
    warnings: string[];
    documentation_references: any[];
    author_name: string;
    status?: 'draft' | 'in_review';
  }): Guide {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM guides WHERE slug = ?').get(guideData.slug);
    if (existing) {
      throw new Error(`A guide with slug "${guideData.slug}" already exists.`);
    }

    // Validate documentation references: all URLs must be verified approved domains
    for (const ref of guideData.documentation_references) {
      if (ref.url && !DocumentationService.isApprovedUrl(ref.url)) {
        throw new Error(`Documentation reference URL "${ref.url}" is not from an approved documentation domain.`);
      }
    }

    const id = 'guide_' + crypto.randomBytes(12).toString('hex');
    const now = new Date().toISOString();
    const initialStatus = guideData.status || 'draft';

    db.prepare(`
      INSERT INTO guides (
        id, slug, title, summary, category, symptoms, environment_prereqs,
        likely_causes, diagnostic_steps, verified_solutions, warnings,
        documentation_references, status, author_name, last_reviewed_at,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
    `).run(
      id,
      guideData.slug,
      guideData.title,
      guideData.summary,
      guideData.category,
      JSON.stringify(guideData.symptoms),
      JSON.stringify(guideData.environment_prereqs),
      JSON.stringify(guideData.likely_causes),
      JSON.stringify(guideData.diagnostic_steps),
      JSON.stringify(guideData.verified_solutions),
      JSON.stringify(guideData.warnings),
      JSON.stringify(guideData.documentation_references),
      initialStatus,
      guideData.author_name,
      now,
      now,
      now
    );

    return this.getGuideById(id)!;
  }

  /**
   * Updates the editorial status of a guide with strict transition guardrails.
   * Direct publication of unreviewed drafts is strictly blocked.
   */
  public static updateGuideStatus(
    guideId: string, 
    newStatus: GuideStatus, 
    verificationChecklist?: {
      technical_accuracy_verified: boolean;
      sources_verified: boolean;
      tested_in_environment: boolean;
      reviewed_by: string;
    }
  ): Guide {
    const guide = this.getGuideById(guideId);
    if (!guide) {
      throw new Error('Guide not found.');
    }

    // Strict editorial guardrail: drafts must go through in_review or approved before being published
    if (newStatus === 'published') {
      if (guide.status === 'draft') {
        throw new Error('Editorial Policy Violation: Draft guides cannot be published directly. A draft must transition to "in_review" and then "approved" before publication.');
      }

      if (!verificationChecklist || !verificationChecklist.technical_accuracy_verified || !verificationChecklist.sources_verified) {
        throw new Error('Editorial Policy Violation: Publication requires verified technical accuracy and verified official documentation sources.');
      }
    }

    const db = getDatabase();
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE guides 
      SET status = ?, last_reviewed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(newStatus, now, now, guideId);

    return this.getGuideById(guideId)!;
  }

  private static deserializeGuide(row: any): Guide {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      category: row.category,
      symptoms: JSON.parse(row.symptoms),
      environment_prereqs: JSON.parse(row.environment_prereqs),
      likely_causes: JSON.parse(row.likely_causes),
      diagnostic_steps: JSON.parse(row.diagnostic_steps),
      verified_solutions: JSON.parse(row.verified_solutions),
      warnings: JSON.parse(row.warnings),
      documentation_references: JSON.parse(row.documentation_references),
      status: row.status,
      author_name: row.author_name,
      last_reviewed_at: row.last_reviewed_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
