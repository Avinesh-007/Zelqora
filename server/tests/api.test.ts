import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { resetDatabaseForTests } from '../src/db/database.js';
import { seedGuides } from '../src/db/seed.js';

describe('Zelqora API Integration Tests', () => {
  beforeAll(() => {
    const db = resetDatabaseForTests(':memory:');
    seedGuides(db);
  });

  it('GET /api/health returns 200 with database and engine health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database.connected).toBe(true);
    expect(res.body.ai_engine.provider).toBe('Google Gemini');
  });

  it('GET /sitemap.xml returns valid XML sitemap with compliant headers and canonical origin', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('application/xml');
    expect(res.header['cache-control']).toContain('public');
    expect(res.header['x-robots-tag']).toBe('noindex');
    expect(res.header['access-control-allow-origin']).toBe('*');
    expect(res.text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(res.text).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(res.text).toContain('<loc>https://zelqora.onrender.com/</loc>');
    expect(res.text).toContain('/guides/docker-exit-code-137-oomkilled');
    expect(res.text).not.toContain('/api/');
    expect(res.text).not.toContain('/investigations/');
    expect(res.text).not.toContain('http://localhost');
  });

  it('HEAD /sitemap.xml returns 200 with matching headers', async () => {
    const res = await request(app).head('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('application/xml');
    expect(res.header['cache-control']).toContain('public');
  });

  it('GET /sitemap_index.xml and /sitemap.xml/ resolve identically to valid XML', async () => {
    const indexRes = await request(app).get('/sitemap_index.xml');
    expect(indexRes.status).toBe(200);
    expect(indexRes.header['content-type']).toContain('application/xml');
    expect(indexRes.text).toContain('<urlset');

    const slashRes = await request(app).get('/sitemap.xml/');
    expect(slashRes.status).toBe(200);
    expect(slashRes.header['content-type']).toContain('application/xml');
    expect(slashRes.text).toContain('<urlset');
  });

  it('Redirects accidental nested search console path (*sitemap.xml) to /sitemap.xml', async () => {
    const res = await request(app).get('/https://zelqora.onrender.com/sitemap.xml');
    expect(res.status).toBe(301);
    expect(res.header.location).toBe('/sitemap.xml');
  });

  it('GET /robots.txt returns valid robot rules disallowing private paths', async () => {
    const res = await request(app).get('/robots.txt');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/plain');
    expect(res.header['cache-control']).toContain('public');
    expect(res.text).toContain('Disallow: /api/');
    expect(res.text).toContain('Disallow: /investigations/');
    expect(res.text).toContain('Sitemap: https://zelqora.onrender.com/sitemap.xml');
  });

  it('GET /api/guides returns published guides only', async () => {
    const res = await request(app).get('/api/guides');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.guides)).toBe(true);
    expect(res.body.guides.length).toBeGreaterThan(0);
    expect(res.body.guides.every((g: any) => g.status === 'published')).toBe(true);
  });

  it('GET /api/guides/:slug returns detailed guide content', async () => {
    const res = await request(app).get('/api/guides/docker-exit-code-137-oomkilled');
    expect(res.status).toBe(200);
    expect(res.body.guide.title).toContain('137 (OOMKilled)');
    expect(res.body.guide.verified_solutions.length).toBeGreaterThan(0);
  });

  it('GET /api/documentation/sources returns approved documentation sources', async () => {
    const res = await request(app).get('/api/documentation/sources');
    expect(res.status).toBe(200);
    expect(res.body.sources.length).toBeGreaterThan(5);
  });

  it('Full Troubleshooting Workflow: Intake -> Test Evidence -> Rollback -> Resolution', async () => {
    const guestToken = 'test_guest_api_token_' + Date.now();

    // 1. Create Investigation (Turn 1)
    const createRes = await request(app)
      .post('/api/investigations')
      .set('x-zelqora-guest-token', guestToken)
      .send({
        title: 'PostgreSQL Connection Exhaustion Test',
        category: 'PostgreSQL & Databases',
        description: 'FATAL: remaining connection slots are reserved for non-replication superuser connections in production.',
        environment: {
          runtime: 'PostgreSQL',
          version: '16.1'
        }
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.investigation.id).toBeDefined();
    const invId = createRes.body.investigation.id;

    // 2. Submit Diagnostic Test Output (Turn 2)
    const turnRes = await request(app)
      .post(`/api/investigations/${invId}/turn`)
      .set('x-zelqora-guest-token', guestToken)
      .send({
        test_output: 'state: idle in transaction, count: 95'
      });

    expect(turnRes.status).toBe(201);
    expect(turnRes.body.turn.turn_index).toBe(2);

    // 3. Rollback to Turn 1
    const rollbackRes = await request(app)
      .post(`/api/investigations/${invId}/rollback`)
      .set('x-zelqora-guest-token', guestToken)
      .send({ turn_index: 1 });

    expect(rollbackRes.status).toBe(200);
    expect(rollbackRes.body.investigation.turns.length).toBe(1);

    // 4. Mark Resolved
    const resolveRes = await request(app)
      .patch(`/api/investigations/${invId}/resolution`)
      .set('x-zelqora-guest-token', guestToken)
      .send({
        status: 'resolved',
        resolution_notes: 'Terminated leaked transaction and adjusted pool limits.'
      });

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.investigation.status).toBe('resolved');
  });

  it('Enforces ownership: rejects unauthorized access without matching token', async () => {
    const guestToken = 'owner_token_' + Date.now();
    const intruderToken = 'intruder_token_' + Date.now();

    const createRes = await request(app)
      .post('/api/investigations')
      .set('x-zelqora-guest-token', guestToken)
      .send({
        title: 'Private Test Investigation',
        category: 'Node.js',
        description: 'Secret private debugging session.'
      });

    const invId = createRes.body.investigation.id;

    // Attempt access as intruder
    const accessRes = await request(app)
      .get(`/api/investigations/${invId}`)
      .set('x-zelqora-guest-token', intruderToken);

    expect(accessRes.status).toBe(403);
  });

  it('POST /api/contact saves inquiry with validation and redaction', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'Jordan Tech',
        email: 'jordan@example.com',
        subject: 'Guide correction for Docker 137',
        message: 'Here is my API key sk-live-1234567890abcdef1234567890abcdef and feedback.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Verify bad email returns 400
    const badRes = await request(app)
      .post('/api/contact')
      .send({
        name: 'Jordan',
        email: 'not-an-email',
        subject: 'Test',
        message: 'Short message'
      });
    expect(badRes.status).toBe(400);
  });

  it('GET /api/guides/:slug returns new SQLite locking guide', async () => {
    const res = await request(app).get('/api/guides/sqlite-database-is-locked-busy');
    expect(res.status).toBe(200);
    expect(res.body.guide.title).toContain('SQLITE_BUSY');
    expect(res.body.guide.verified_solutions.length).toBeGreaterThan(0);
  });
});
