import { ENV } from '../config/env.js';
import { EditorialService } from './editorial.service.js';

export class SeoService {
  /**
   * Generates a valid XML sitemap containing only eligible public pages and published guides.
   * Excludes all private user investigations, authentication routes, and internal APIs.
   */
  public static generateSitemapXml(): string {
    const baseUrl = ENV.APP_URL.replace(/\/+$/, '');
    const now = new Date().toISOString().split('T')[0];

    // Static public pages
    const staticPages = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/troubleshoot`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${baseUrl}/guides`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/docs/sources`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/about`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/contact`, priority: '0.6', changefreq: 'monthly' },
      { loc: `${baseUrl}/privacy`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/terms`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/methodology`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/editorial-policy`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/adsense-readiness`, priority: '0.6', changefreq: 'monthly' }
    ];

    // Dynamic published guides only
    const publishedGuides = EditorialService.getPublishedGuides();
    const guideEntries = publishedGuides.map(guide => ({
      loc: `${baseUrl}/guides/${guide.slug}`,
      lastmod: guide.last_reviewed_at ? guide.last_reviewed_at.split('T')[0] : now,
      priority: '0.8',
      changefreq: 'weekly'
    }));

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${page.loc}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const guide of guideEntries) {
      xml += `  <url>\n`;
      xml += `    <loc>${guide.loc}</loc>\n`;
      xml += `    <lastmod>${guide.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${guide.changefreq}</changefreq>\n`;
      xml += `    <priority>${guide.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }

  /**
   * Generates robots.txt rules protecting private paths while allowing public SEO crawling.
   */
  public static generateRobotsTxt(): string {
    const baseUrl = ENV.APP_URL.replace(/\/+$/, '');
    return `# Zelqora Search Engine Robot Policy
User-agent: *
Allow: /
Allow: /guides/
Allow: /docs/
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /methodology
Allow: /editorial-policy
Allow: /adsense-readiness

# Disallow private user sessions, diagnostics, auth, and API endpoints
Disallow: /api/
Disallow: /investigations/
Disallow: /editorial/
Disallow: /auth/

Sitemap: ${baseUrl}/sitemap.xml
`;
  }
}
