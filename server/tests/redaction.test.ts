import { describe, it, expect } from 'vitest';
import { RedactionService } from '../src/services/redaction.service.js';

describe('RedactionService', () => {
  it('redacts AWS Access Keys', () => {
    const input = 'Error uploading to s3 with key AKIAIOSFODNN7EXAMPLE in bucket logs';
    const result = RedactionService.redact(input);
    expect(result.hasRedactions).toBe(true);
    expect(result.redactedText).toContain('[REDACTED_AWS_KEY]');
    expect(result.redactedText).not.toContain('AKIAIOSFODNN7EXAMPLE');
    expect(result.detectedTypes).toContain('AWS Access Key');
  });

  it('redacts GitHub Personal Access Tokens', () => {
    const input = 'git push failed with token ghp_1234567890abcdef1234567890abcdef1234';
    const result = RedactionService.redact(input);
    expect(result.hasRedactions).toBe(true);
    expect(result.redactedText).toContain('[REDACTED_GITHUB_TOKEN]');
    expect(result.redactedText).not.toContain('ghp_1234567890');
  });

  it('redacts Database credentials in connection URIs', () => {
    const input = 'postgres://admin:superSecretPass123@db.prod.internal:5432/zelqora_prod';
    const result = RedactionService.redact(input);
    expect(result.hasRedactions).toBe(true);
    expect(result.redactedText).toContain('admin:[REDACTED_PASSWORD]@db.prod.internal');
    expect(result.redactedText).not.toContain('superSecretPass123');
  });

  it('redacts Bearer Authorization headers', () => {
    const input = 'Header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.supersecretpayload';
    const result = RedactionService.redact(input);
    expect(result.hasRedactions).toBe(true);
    expect(result.redactedText).toContain('Bearer [REDACTED_BEARER_TOKEN]');
  });

  it('redacts private keys', () => {
    const input = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Y1W9Z...
-----END RSA PRIVATE KEY-----`;
    const result = RedactionService.redact(input);
    expect(result.hasRedactions).toBe(true);
    expect(result.redactedText).toBe('[REDACTED_PRIVATE_KEY]');
  });

  it('recursively redacts nested objects', () => {
    const nested = {
      user: 'alice',
      env: {
        DATABASE_URL: 'postgres://user:pass1234@localhost:5432/db',
        AWS_KEY: 'AKIA1111111111111111'
      },
      tags: ['clean', 'token: ghp_999999999999999999999999999999999999']
    };

    const cleaned = RedactionService.redactObject(nested);
    expect(cleaned.env.DATABASE_URL).toContain('[REDACTED_PASSWORD]');
    expect(cleaned.env.AWS_KEY).toContain('[REDACTED_AWS_KEY]');
    expect(cleaned.tags[1]).toContain('[REDACTED_GITHUB_TOKEN]');
  });
});
