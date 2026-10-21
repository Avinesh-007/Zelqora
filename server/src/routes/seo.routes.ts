import { Router, Request, Response } from 'express';
import { SeoService } from '../services/seo.service.js';

const router = Router();

const sitemapHandler = (req: Request, res: Response) => {
  try {
    const rawProto = (req.headers['x-forwarded-proto'] || req.protocol || 'https') as string;
    const protocol = rawProto.split(',')[0].trim();
    const host = req.get('host') || 'zelqora.onrender.com';
    const reqBaseUrl = `${protocol}://${host}`;

    const xml = SeoService.generateSitemapXml(reqBaseUrl);

    res.status(200);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.send(xml);
  } catch (err) {
    console.error('SeoRoutes: Error generating sitemap XML, using fallback:', err);
    const fallbackXml = SeoService.getFallbackSitemapXml();

    res.status(200);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.send(fallbackXml);
  }
};

const robotsHandler = (req: Request, res: Response) => {
  try {
    const rawProto = (req.headers['x-forwarded-proto'] || req.protocol || 'https') as string;
    const protocol = rawProto.split(',')[0].trim();
    const host = req.get('host') || 'zelqora.onrender.com';
    const reqBaseUrl = `${protocol}://${host}`;

    const robots = SeoService.generateRobotsTxt(reqBaseUrl);

    res.status(200);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.send(robots);
  } catch (err) {
    console.error('SeoRoutes: Error generating robots.txt, using fallback:', err);
    res.status(200);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(SeoService.getFallbackRobotsTxt());
  }
};

// Sitemap routes (support standard sitemap.xml, trailing slash, and sitemap_index.xml)
router.get(['/sitemap.xml', '/sitemap.xml/', '/sitemap_index.xml', '/sitemap_index.xml/'], sitemapHandler);
router.head(['/sitemap.xml', '/sitemap.xml/', '/sitemap_index.xml', '/sitemap_index.xml/'], sitemapHandler);

// Robots.txt routes
router.get(['/robots.txt', '/robots.txt/'], robotsHandler);
router.head(['/robots.txt', '/robots.txt/'], robotsHandler);

// Handle accidental full-URL submissions in search console (e.g. /https://zelqora.onrender.com/sitemap.xml)
router.get('*sitemap.xml', (_req: Request, res: Response) => {
  res.redirect(301, '/sitemap.xml');
});

export default router;
