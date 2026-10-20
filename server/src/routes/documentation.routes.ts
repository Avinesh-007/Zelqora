import { Router, Request, Response } from 'express';
import { DocumentationService } from '../services/documentation.service.js';

const router = Router();

router.get('/sources', (req: Request, res: Response) => {
  const sources = DocumentationService.getAllSources();
  res.json({ sources });
});

router.get('/search', (req: Request, res: Response) => {
  const query = typeof req.query.q === 'string' ? req.query.q : '';
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 5;

  const results = DocumentationService.search(query, category, limit);
  res.json({ results });
});

export default router;
