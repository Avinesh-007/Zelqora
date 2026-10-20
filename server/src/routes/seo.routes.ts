import { Router, Request, Response } from 'express';
import { SeoService } from '../services/seo.service.js';

const router = Router();

router.get('/sitemap.xml', (req: Request, res: Response) => {
  const xml = SeoService.generateSitemapXml();
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

router.get('/robots.txt', (req: Request, res: Response) => {
  const robots = SeoService.generateRobotsTxt();
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

export default router;
