import { describe, it, expect, beforeAll } from 'vitest';
import { resetDatabaseForTests } from '../src/db/database.js';
import { InvestigationService } from '../src/services/investigation.service.js';

describe('InvestigationService', () => {
  beforeAll(() => {
    resetDatabaseForTests(':memory:');
  });

  const guestToken = 'guest_token_test_12345';
  let createdInvId: string;

  it('creates an investigation with initial diagnostic assessment (Turn 1)', async () => {
    const { investigation, mode } = await InvestigationService.createInvestigation({
      guestToken,
      title: 'Docker OOM Investigation',
      category: 'Docker & Deployment',
      description: 'Our backend container exited with code 137 under load.',
      environment: {
        os: 'Ubuntu 22.04',
        runtime: 'Node.js',
        version: 'v20.10.0',
        error_message: 'Container exited with status 137'
      }
    });

    expect(investigation.id).toBeDefined();
    expect(investigation.turns?.length).toBe(1);
    expect(investigation.turns![0].assessment.hypotheses.length).toBeGreaterThan(0);
    expect(investigation.turns![0].assessment.diagnostic_tests.length).toBeGreaterThan(0);
    expect(investigation.turns![0].assessment.documentation_references.length).toBeGreaterThan(0);

    createdInvId = investigation.id;
  });

  it('enforces ownership: forbids access without matching guestToken or userId', () => {
    const wrongActor = { guestToken: 'wrong_intruder_token' };
    expect(() => {
      InvestigationService.getInvestigation(createdInvId, wrongActor);
    }).toThrow(/Forbidden/);
  });

  it('allows owner to submit diagnostic test output and creates Turn 2', async () => {
    const actor = { guestToken };
    const { turn } = await InvestigationService.submitTurn({
      investigationId: createdInvId,
      actor,
      testOutput: 'ExitCode: 137, OOMKilled: true'
    });

    expect(turn.turn_index).toBe(2);
    expect(turn.assessment.is_conclusive).toBe(true);

    const reloaded = InvestigationService.getInvestigation(createdInvId, actor);
    expect(reloaded?.turns?.length).toBe(2);
  });

  it('allows safe rollback to Turn 1', () => {
    const actor = { guestToken };
    const rolledBack = InvestigationService.rollbackToTurn(createdInvId, 1, actor);
    expect(rolledBack.turns?.length).toBe(1);
    expect(rolledBack.turns![0].turn_index).toBe(1);
  });

  it('marks investigation as resolved with resolution notes', () => {
    const actor = { guestToken };
    const resolved = InvestigationService.updateResolution(
      createdInvId,
      'resolved',
      'Configured --max-old-space-size=384 and memory limit in compose file.',
      actor
    );

    expect(resolved.status).toBe('resolved');
    expect(resolved.resolution_notes).toContain('--max-old-space-size');
  });
});
