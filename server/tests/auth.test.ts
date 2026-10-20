import { describe, it, expect, beforeAll } from 'vitest';
import { resetDatabaseForTests } from '../src/db/database.js';
import { AuthService } from '../src/services/auth.service.js';

describe('AuthService', () => {
  const testEmail = `dev.engineer.${Date.now()}@example.com`;

  beforeAll(() => {
    resetDatabaseForTests(':memory:');
  });

  it('registers a user, hashes password, and creates session', async () => {
    const { user, token } = await AuthService.register(testEmail, 'securePassword123!');
    expect(user.id).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(token).toBeDefined();

    // Verify session
    const validated = await AuthService.validateSession(token);
    expect(validated).not.toBeNull();
    expect(validated?.id).toBe(user.id);
  });

  it('rejects duplicate email registrations', async () => {
    await expect(AuthService.register(testEmail, 'anotherPass123!'))
      .rejects.toThrow(/already exists/);
  });

  it('authenticates user with valid password and rejects invalid password', async () => {
    const { user, token } = await AuthService.login(testEmail, 'securePassword123!');
    expect(user.email).toBe(testEmail);
    expect(token).toBeDefined();

    await expect(AuthService.login(testEmail, 'wrongPassword!'))
      .rejects.toThrow(/Invalid email or password/);
  });

  it('revokes session on logout', async () => {
    const { token } = await AuthService.login(testEmail, 'securePassword123!');
    const before = await AuthService.validateSession(token);
    expect(before).not.toBeNull();

    await AuthService.logout(token);
    const after = await AuthService.validateSession(token);
    expect(after).toBeNull();
  });
});
