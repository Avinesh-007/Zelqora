import { ENV } from '../config/env.js';
import { EditorialService } from './editorial.service.js';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export class SeoService {
  /**
   * Resolves the canonical base origin URL.
   * Always prefers production HTTPS origin when running in deployment or behind proxies.
   */
  public static resolveBaseUrl(requestBaseUrl?: string): string {
    // 1. Explicit production APP_URL configured in environment (not loopback)
    if (ENV.APP_URL && !ENV.APP_URL.includes('localhost') && !ENV.APP_URL.includes('127.0.0.1')) {
      return ENV.APP_URL.replace(/\/+$/, '');
    }

    // 2. If request header specifies onrender.com, enforce exact canonical HTTPS origin
    if (requestBaseUrl) {
      const cleanUrl = requestBaseUrl.replace(/\/+$/, '');
      if (cleanUrl.includes('onrender.com')) {
        return 'https://zelqora.onrender.com';
      }
      // If custom public domain (excluding loopback and local IPs)
      if (
        !cleanUrl.includes('localhost') && 
        !cleanUrl.includes('127.0.0.1') && 
        !cleanUrl.includes('::1') &&
        !cleanUrl.startsWith('http://10.') &&
        !cleanUrl.startsWith('http://192.168.')
      ) {
        return cleanUrl;
      }
    }

    // 3. Default canonical production origin
    return 'https://zelqora.onrender.com';
  }

  /**
   * Core public static pages indexed by search engines.
   */
  public static getStaticPages(baseUrl: string) {
    return [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/troubleshoot`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${baseUrl}/guides`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/docs/sources`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/about`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/contact`, priority: '0.6', changefreq: 'monthly' },
      { loc: `${baseUrl}/privacy`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/terms`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/methodology`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/editorial-policy`, priority: '0.7', changefreq: 'monthly' }
    ];
  }

  /**
   * Generates a valid XML sitemap containing only eligible public pages and published guides.
   * Excludes all private user investigations, authentication routes, and internal APIs.
   */
  public static generateSitemapXml(requestBaseUrl?: string): string {
    const baseUrl = this.resolveBaseUrl(requestBaseUrl);
    const now = new Date().toISOString().split('T')[0];

    const staticPages = this.getStaticPages(baseUrl);

    // Dynamic published guides
    let guideEntries: Array<{ loc: string; lastmod: string; priority: string; changefreq: string }> = [];
    try {
      const publishedGuides = EditorialService.getPublishedGuides();
      guideEntries = publishedGuides.map(guide => ({
        loc: `${baseUrl}/guides/${escapeXml(guide.slug)}`,
        lastmod: guide.last_reviewed_at ? guide.last_reviewed_at.split('T')[0] : now,
        priority: '0.8',
        changefreq: 'weekly'
      }));
    } catch (err) {
      console.warn('SeoService: Failed to retrieve dynamic guides, falling back to static guide list', err);
      return this.getFallbackSitemapXml(requestBaseUrl);
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(page.loc)}</loc>\n`;
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

    xml += `</urlset>\n`;
    return xml;
  }

  /**
   * Resilient fallback sitemap XML in case database connection fails during server startup or cold boot.
   */
  public static getFallbackSitemapXml(requestBaseUrl?: string): string {
    const baseUrl = this.resolveBaseUrl(requestBaseUrl);
    const now = new Date().toISOString().split('T')[0];
    const staticPages = this.getStaticPages(baseUrl);

    const coreKnownGuides = [
      'sqlite-database-is-locked-busy',
      'docker-port-already-allocated-eaddrinuse',
      'react-hydration-mismatch-errors',
      'nodejs-memory-leak-heap-exhaustion',
      'postgresql-max-connections-exhausted',
      'resolving-cors-errors-react-express',
      'docker-exit-code-137-oomkilled',
      'python-modulenotfounderror-virtualenv-vscode'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(page.loc)}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const slug of coreKnownGuides) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/guides/${escapeXml(slug)}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>\n`;
    return xml;
  }

  /**
   * Generates robots.txt rules protecting private paths while allowing public SEO crawling.
   */
  public static generateRobotsTxt(requestBaseUrl?: string): string {
    const baseUrl = this.resolveBaseUrl(requestBaseUrl);
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

# Disallow private user sessions, diagnostics, auth, and API endpoints
Disallow: /api/
Disallow: /investigations/
Disallow: /editorial/
Disallow: /auth/

Sitemap: ${baseUrl}/sitemap.xml
`;
  }

  public static getFallbackRobotsTxt(): string {
    return this.generateRobotsTxt('https://zelqora.onrender.com');
  }
}
