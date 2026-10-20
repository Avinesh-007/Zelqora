import { Router, Response } from 'express';
import { z } from 'zod';
import { InvestigationService } from '../services/investigation.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { diagnosticRateLimiter } from '../middleware/security.middleware.js';

const router = Router();

const CreateInvestigationSchema = z.object({
  title: z.string().min(3).max(150),
  category: z.string().min(2).max(80),
  description: z.string().min(10, 'Please provide at least 10 characters describing the issue.').max(10000),
  environment: z.object({
    os: z.string().max(100).optional(),
    runtime: z.string().max(100).optional(),
    version: z.string().max(100).optional(),
    framework: z.string().max(100).optional(),
    error_message: z.string().max(3000).optional(),
    reproduction_steps: z.string().max(3000).optional(),
    config_context: z.string().max(5000).optional(),
    logs: z.string().max(10000).optional()
  }).default({})
});

const SubmitTurnSchema = z.object({
  test_output: z.string().max(10000).optional(),
  answered_questions: z.record(z.string(), z.string()).optional()
});

const RollbackSchema = z.object({
  turn_index: z.number().int().min(1)
});

const ResolutionSchema = z.object({
  status: z.enum(['resolved', 'abandoned']),
  resolution_notes: z.string().max(2000).default('Issue addressed.')
});

// List investigations for current actor (authenticated user or guest)
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const actor = { userId: req.user?.id, guestToken: req.guestToken };
  const list = InvestigationService.listInvestigations(actor);
  res.json({ investigations: list });
});

// Create new investigation
router.post('/', diagnosticRateLimiter, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parse = CreateInvestigationSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.issues });
      return;
    }

    const { investigation, mode } = await InvestigationService.createInvestigation({
      userId: req.user?.id,
      guestToken: req.guestToken,
      title: parse.data.title,
      category: parse.data.category,
      description: parse.data.description,
      environment: parse.data.environment
    });

    res.status(201).json({
      investigation,
      diagnostic_engine_mode: mode
    });
  } catch (err: any) {
    next(err);
  }
});

// Get investigation details by ID
router.get('/:id', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const actor = { userId: req.user?.id, guestToken: req.guestToken };
    const investigationId = String(req.params.id);
    const investigation = InvestigationService.getInvestigation(investigationId, actor);

    if (!investigation) {
      res.status(404).json({ error: 'Investigation not found' });
      return;
    }

    res.json({ investigation });
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      res.status(403).json({ error: 'Forbidden', message: err.message });
      return;
    }
    next(err);
  }
});

// Submit diagnostic test output or answered questions (turn progression)
router.post('/:id/turn', diagnosticRateLimiter, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parse = SubmitTurnSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.issues });
      return;
    }

    const actor = { userId: req.user?.id, guestToken: req.guestToken };
    const { turn, mode } = await InvestigationService.submitTurn({
      investigationId: String(req.params.id),
      actor,
      testOutput: parse.data.test_output,
      answeredQuestions: parse.data.answered_questions
    });

    res.status(201).json({
      turn,
      diagnostic_engine_mode: mode
    });
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      res.status(403).json({ error: 'Forbidden', message: err.message });
      return;
    }
    next(err);
  }
});

// Rollback to previous turn
router.post('/:id/rollback', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parse = RollbackSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.issues });
      return;
    }

    const actor = { userId: req.user?.id, guestToken: req.guestToken };
    const updatedInvestigation = InvestigationService.rollbackToTurn(
      String(req.params.id),
      parse.data.turn_index,
      actor
    );

    res.json({
      success: true,
      investigation: updatedInvestigation
    });
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      res.status(403).json({ error: 'Forbidden', message: err.message });
      return;
    }
    next(err);
  }
});

// Mark investigation as resolved or abandoned
router.patch('/:id/resolution', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const parse = ResolutionSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.issues });
      return;
    }

    const actor = { userId: req.user?.id, guestToken: req.guestToken };
    const updated = InvestigationService.updateResolution(
      String(req.params.id),
      parse.data.status,
      parse.data.resolution_notes,
      actor
    );

    res.json({ investigation: updated });
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      res.status(403).json({ error: 'Forbidden', message: err.message });
      return;
    }
    next(err);
  }
});

// Delete investigation
router.delete('/:id', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const actor = { userId: req.user?.id, guestToken: req.guestToken };
    InvestigationService.deleteInvestigation(String(req.params.id), actor);
    res.json({ success: true, message: 'Investigation deleted successfully.' });
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      res.status(403).json({ error: 'Forbidden', message: err.message });
      return;
    }
    next(err);
  }
});

export default router;
