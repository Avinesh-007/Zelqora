import { describe, it, expect } from 'vitest';
import { DocumentationService } from '../src/services/documentation.service.js';

describe('DocumentationService', () => {
  it('validates approved official documentation domains', () => {
    expect(DocumentationService.isApprovedUrl('https://nodejs.org/docs/latest/api/errors.html')).toBe(true);
    expect(DocumentationService.isApprovedUrl('https://docs.docker.com/engine/containers/resource_constraints/')).toBe(true);
    expect(DocumentationService.isApprovedUrl('https://react.dev/reference/react/useEffect')).toBe(true);
    expect(DocumentationService.isApprovedUrl('https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS')).toBe(true);
  });

  it('rejects untrusted, SSRF, or malicious external URLs', () => {
    expect(DocumentationService.isApprovedUrl('http://169.254.169.254/latest/meta-data/')).toBe(false);
    expect(DocumentationService.isApprovedUrl('https://evil-hacker.com/phish')).toBe(false);
    expect(DocumentationService.isApprovedUrl('javascript:alert(1)')).toBe(false);
    expect(DocumentationService.isApprovedUrl('file:///etc/passwd')).toBe(false);
  });

  it('searches approved sources and ranks by relevance score', () => {
    const results = DocumentationService.search('Docker container exit code 137 OOMKilled', 'Docker', 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].url).toContain('docs.docker.com');
    expect(results[0].verified).toBe(true);
  });

  it('retrieves CORS documentation when searched', () => {
    const results = DocumentationService.search('Access-Control-Allow-Origin CORS error in browser fetch', 'HTTP', 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.url.includes('developer.mozilla.org') || r.url.includes('fastapi.tiangolo.com'))).toBe(true);
  });

  it('strictly excludes unrelated topics from query results', () => {
    // When searching for Docker exit code 137 OOMKilled:
    const oomResults = DocumentationService.search('Docker container exit code 137 OOMKilled', 'Docker', 4);
    // Should NOT include Docker Networking, Compose, or React Hydration
    expect(oomResults.some(r => r.url.includes('/engine/network/'))).toBe(false);
    expect(oomResults.some(r => r.url.includes('react.dev'))).toBe(false);
    expect(oomResults.some(r => r.url.includes('sqlite.org'))).toBe(false);
    expect(oomResults.every(r => r.url.includes('resource_constraints') || r.url.includes('process.html'))).toBe(true);
  });
});
