import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { EditorialService } from '../services/editorial.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

// ============================================================================
// Public Guide Endpoints (Read-only, published status only)
// ============================================================================

router.get('/', (req: Request, res: Response) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const guides = EditorialService.getPublishedGuides(category);
  res.json({ guides });
});

router.get('/:slug', (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const guide = EditorialService.getPublishedGuideBySlug(slug);
  if (!guide) {
    res.status(404).json({ error: 'Guide not found or not published' });
    return;
  }
  res.json({ guide });
});

// ============================================================================
// Editorial System Endpoints
// ============================================================================

const CreateGuideDraftSchema = z.object({
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(10).max(200),
  summary: z.string().min(20).max(500),
  category: z.string().min(2).max(100),
  symptoms: z.array(z.string()).min(1),
  environment_prereqs: z.array(z.string()).default([]),
  likely_causes: z.array(z.object({
    cause: z.string(),
    explanation: z.string()
  })).min(1),
  diagnostic_steps: z.array(z.object({
    step: z.string(),
    command: z.string().optional(),
    interpretation: z.string()
  })).min(1),
  verified_solutions: z.array(z.object({
    title: z.string(),
    steps: z.array(z.string()),
    code_snippet: z.string().optional(),
    language: z.string().optional(),
    rollback: z.string().optional()
  })).min(1),
  warnings: z.array(z.string()).default([]),
  documentation_references: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    source_name: z.string(),
    relevant_excerpt: z.string().optional(),
    verified: z.boolean().default(true)
  })).min(1),
  author_name: z.string().min(2).default('Zelqora Editorial Reviewer'),
  status: z.enum(['draft', 'in_review']).default('draft')
});

const UpdateStatusSchema = z.object({
  status: z.enum(['draft', 'in_review', 'approved', 'published', 'needs_review', 'archived']),
  verification_checklist: z.object({
    technical_accuracy_verified: z.boolean(),
    sources_verified: z.boolean(),
    tested_in_environment: z.boolean(),
    reviewed_by: z.string().min(2)
  }).optional()
});

router.get('/editorial/list', (req: AuthenticatedRequest, res: Response) => {
  const statusFilter = typeof req.query.status === 'string' ? (req.query.status as any) : undefined;
  const guides = EditorialService.getAllGuides(statusFilter);
  res.json({ guides });
});

router.post('/editorial/draft', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parse = CreateGuideDraftSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.issues });
      return;
    }

    const guide = EditorialService.createGuideDraft(parse.data);
    res.status(201).json({ guide });
  } catch (err: any) {
    res.status(400).json({ error: 'Draft Creation Failed', message: err.message });
  }
});

router.patch('/editorial/:id/status', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parse = UpdateStatusSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.issues });
      return;
    }

    const updated = EditorialService.updateGuideStatus(
      String(req.params.id),
      parse.data.status,
      parse.data.verification_checklist
    );

    res.json({ guide: updated });
  } catch (err: any) {
    res.status(400).json({ error: 'Status Transition Failed', message: err.message });
  }
});

export default router;
