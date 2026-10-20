import { describe, it, expect, beforeAll } from 'vitest';
import { resetDatabaseForTests } from '../src/db/database.js';
import { seedGuides } from '../src/db/seed.js';
import { EditorialService } from '../src/services/editorial.service.js';

describe('EditorialService', () => {
  const uniqueSlug = 'test-diagnostic-guide-' + Math.random().toString(36).substring(2, 9);
  let createdDraftId: string;

  beforeAll(() => {
    const db = resetDatabaseForTests(':memory:');
    seedGuides(db);
  });

  it('retrieves published guides only for public catalog', () => {
    const published = EditorialService.getPublishedGuides();
    expect(published.length).toBeGreaterThan(0);
    expect(published.every(g => g.status === 'published')).toBe(true);
  });

  it('creates a new guide draft in draft status', () => {
    const draft = EditorialService.createGuideDraft({
      slug: uniqueSlug,
      title: 'Testing Diagnostic Guide For Vitest',
      summary: 'A test guide for verifying editorial draft creation.',
      category: 'Testing',
      symptoms: ['Test symptom 1'],
      environment_prereqs: ['Node.js 20+'],
      likely_causes: [{ cause: 'Test Cause', explanation: 'Test Explanation' }],
      diagnostic_steps: [{ step: 'Run test', command: 'npm test', interpretation: 'All pass' }],
      verified_solutions: [{ title: 'Fix test', steps: ['Step 1'] }],
      warnings: ['Test warning'],
      documentation_references: [
        {
          title: 'Node.js Errors',
          url: 'https://nodejs.org/docs/latest/api/errors.html',
          source_name: 'Node.js Docs',
          verified: true
        }
      ],
      author_name: 'Test Author',
      status: 'draft'
    });

    expect(draft.id).toBeDefined();
    expect(draft.status).toBe('draft');
    createdDraftId = draft.id;
  });

  it('blocks direct transition from draft to published without review (editorial policy guardrail)', () => {
    expect(() => {
      EditorialService.updateGuideStatus(createdDraftId, 'published', {
        technical_accuracy_verified: true,
        sources_verified: true,
        tested_in_environment: true,
        reviewed_by: 'Senior Editor'
      });
    }).toThrow(/Editorial Policy Violation/);
  });

  it('allows publication when progressing through in_review with verification checklist', () => {
    // Transition to in_review
    const inReview = EditorialService.updateGuideStatus(createdDraftId, 'in_review');
    expect(inReview.status).toBe('in_review');

    // Transition to published with full checklist
    const published = EditorialService.updateGuideStatus(createdDraftId, 'published', {
      technical_accuracy_verified: true,
      sources_verified: true,
      tested_in_environment: true,
      reviewed_by: 'Senior Technical Lead'
    });

    expect(published.status).toBe('published');
  });
});
