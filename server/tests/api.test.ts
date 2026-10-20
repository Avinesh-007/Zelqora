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

  it('GET /sitemap.xml returns valid XML sitemap including published guides', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('xml');
    expect(res.text).toContain('<urlset');
    expect(res.text).toContain('/guides/docker-exit-code-137-oomkilled');
    expect(res.text).not.toContain('/api/');
    expect(res.text).not.toContain('/investigations/');
  });

  it('GET /robots.txt returns valid robot rules disallowing private paths', async () => {
    const res = await request(app).get('/robots.txt');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Disallow: /api/');
    expect(res.text).toContain('Disallow: /investigations/');
    expect(res.text).toContain('Sitemap:');
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
});
