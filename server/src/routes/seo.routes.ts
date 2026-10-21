import { Router, Request, Response } from 'express';
import { SeoService } from '../services/seo.service.js';

const router = Router();

router.get('/sitemap.xml', (req: Request, res: Response) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host');
  const reqBaseUrl = `${protocol}://${host}`;
  const xml = SeoService.generateSitemapXml(reqBaseUrl);
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

router.get('/robots.txt', (req: Request, res: Response) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host');
  const reqBaseUrl = `${protocol}://${host}`;
  const robots = SeoService.generateRobotsTxt(reqBaseUrl);
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

export default router;
