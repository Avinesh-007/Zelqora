import { describe, it, expect, beforeAll } from 'vitest';
import { resetDatabaseForTests } from '../src/db/database.js';
import { GeminiService } from '../src/services/gemini.service.js';
import { DocumentationService } from '../src/services/documentation.service.js';
import { InvestigationService } from '../src/services/investigation.service.js';

describe('Diagnostic Reasoning Quality & Evidence Verification', () => {
  beforeAll(() => {
    resetDatabaseForTests(':memory:');
  });

  // =========================================================================
  // Problem 1: Do not recommend diagnostic commands unrelated to the issue
  // =========================================================================
  describe('Rule 1: Relevant Diagnostic Commands Only', () => {
    it('recommends Docker-specific commands for Docker issues and excludes runtime chaining', async () => {
      const { assessment } = await GeminiService.analyzeIssue({
        description: 'Our backend container exited with code 137 under load.',
        environment: {
          os: 'Ubuntu 22.04',
          runtime: 'Docker',
          error_message: 'Container exited with code 137'
        }
      });

      expect(assessment.diagnostic_tests.length).toBeGreaterThan(0);
      const firstTest = assessment.diagnostic_tests[0];
      // Must be relevant to Docker
      expect(firstTest.command.toLowerCase()).toContain('docker');
      // Must NOT contain unrelated composite runtimes
      expect(firstTest.command).not.toContain('node -v || python');
      expect(firstTest.command).not.toContain('npm -v');
    });

    it('recommends Python-specific commands for Python import errors and excludes Docker', async () => {
      const { assessment } = await GeminiService.analyzeIssue({
        description: 'ModuleNotFoundError: No module named requests in my script.',
        environment: {
          os: 'Windows 11',
          runtime: 'Python 3.11',
          error_message: 'ModuleNotFoundError: No module named requests'
        }
      });

      const firstTest = assessment.diagnostic_tests[0];
      expect(firstTest.command.toLowerCase()).toContain('python');
      expect(firstTest.command.toLowerCase()).not.toContain('docker');
      expect(firstTest.command.toLowerCase()).not.toContain('psql');
    });

    it('uses a single targeted baseline test when general issue is reported', async () => {
      const { assessment } = await GeminiService.analyzeIssue({
        description: 'Generic build script fails during execution.',
        environment: {
          os: 'Linux'
        }
      });

      expect(assessment.diagnostic_tests.length).toBe(1);
      // No composite command chaining
      expect(assessment.diagnostic_tests[0].command).not.toContain('||');
    });
  });

  // =========================================================================
  // Problem 2: Qualitative likelihood labels and uncertainty explanations
  // =========================================================================
  describe('Rule 2: Qualitative Likelihood Labels & Uncertainty Explanation', () => {
    it('uses qualitative likelihood labels (likely | possible | unlikely | confirmed)', async () => {
      const { assessment } = await GeminiService.analyzeIssue({
        description: 'CORS policy: No Access-Control-Allow-Origin header is present on requested resource.',
        environment: {
          runtime: 'Node.js Express'
        }
      });

      expect(assessment.hypotheses.length).toBeGreaterThan(0);
      const validLabels = ['likely', 'possible', 'unlikely', 'confirmed'];
      for (const hyp of assessment.hypotheses) {
        expect(validLabels).toContain(hyp.likelihood);
      }
    });

    it('provides uncertainty_reason when hypothesis is not yet confirmed', async () => {
      const { assessment } = await GeminiService.analyzeIssue({
        description: 'PostgreSQL error: remaining connection slots are reserved for non-replication superuser connections',
        environment: {
          runtime: 'PostgreSQL'
        }
      });

      expect(assessment.is_conclusive).toBe(false);
      expect(assessment.uncertainty_summary).toBeDefined();
      expect(assessment.uncertainty_summary!.length).toBeGreaterThan(10);

      const unconfirmed = assessment.hypotheses.filter(h => h.likelihood !== 'confirmed');
      expect(unconfirmed.length).toBeGreaterThan(0);
      for (const hyp of unconfirmed) {
        expect(hyp.uncertainty_reason).toBeDefined();
        expect(hyp.uncertainty_reason!.length).toBeGreaterThan(5);
      }
    });
  });

  // =========================================================================
  // Problem 3: Select official documentation that directly relates
  // =========================================================================
  describe('Rule 3: Precise & Relevant Documentation Selection', () => {
    it('matches Docker OOM topic and excludes unrelated Docker Networking topics', () => {
      const refs = DocumentationService.search(
        'docker container exited with code 137 oom out of memory killer',
        'Docker'
      );

      expect(refs.length).toBeGreaterThan(0);
      const titles = refs.map(r => r.title);
      expect(titles.some(t => t.includes('Memory Limits') || t.includes('OOMKilled'))).toBe(true);
      expect(titles.some(t => t.includes('Docker Networking Overview'))).toBe(false);
      expect(titles.some(t => t.includes('Docker Compose Specification'))).toBe(false);
    });

    it('excludes PostgreSQL documentation when troubleshooting CORS issues', () => {
      const refs = DocumentationService.search(
        'Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at Access-Control-Allow-Origin',
        'HTTP'
      );

      expect(refs.length).toBeGreaterThan(0);
      for (const r of refs) {
        expect(r.source_name).not.toContain('PostgreSQL');
        expect(r.url).not.toContain('postgresql.org');
      }
    });
  });

  // =========================================================================
  // Problem 4: Beginner-friendly OS-appropriate instructions & expected output
  // =========================================================================
  describe('Rule 4: OS-Appropriate Commands & Step Sequencing', () => {
    it('provides PowerShell-compatible commands on Windows without bash chaining', async () => {
      const { assessment } = await GeminiService.analyzeIssue({
        description: 'Script fails with ModuleNotFoundError on Windows 11 PowerShell',
        environment: {
          os: 'Windows 11 PowerShell',
          runtime: 'Python'
        }
      });

      const test = assessment.diagnostic_tests[0];
      expect(test.step_order).toBe(1);
      expect(test.expected_output_pattern).toBeDefined();
      // On Windows PowerShell, command must not use bash && or bash specific tools
      expect(test.command).not.toContain('&&');
      expect(test.command).not.toContain('grep');
      expect(test.command).not.toContain('tail');
    });

    it('specifies explicit expected_output_pattern for diagnostic verification', async () => {
      const { assessment } = await GeminiService.analyzeIssue({
        description: 'Node.js process crashed with JavaScript heap out of memory',
        environment: {
          runtime: 'Node.js'
        }
      });

      const test = assessment.diagnostic_tests[0];
      expect(test.expected_output_pattern).toBeDefined();
      expect(test.expected_output_pattern.length).toBeGreaterThan(0);
      expect(test.what_result_means.if_matches).toBeDefined();
      expect(test.what_result_means.if_fails_or_differs).toBeDefined();
    });
  });

  // =========================================================================
  // Problem 5: Security-sensitive changes avoid system-wide modifications
  // =========================================================================
  describe('Rule 5: Security Safety & Safer Alternatives', () => {
    it('recommends direct binary execution as safest and provides safer alternative for Windows Python', async () => {
      const { assessment } = await GeminiService.analyzeIssue({
        description: 'Cannot activate Python virtual environment in Windows PowerShell due to execution policy',
        environment: {
          os: 'Windows 11',
          runtime: 'Python 3.11'
        }
      });

      expect(assessment.recommended_solution).toBeDefined();
      const steps = assessment.recommended_solution!;
      
      // Step 1 should be direct binary execution (safe, no policy modifications)
      const step1 = steps[0];
      expect(step1.is_security_sensitive).toBe(false);
      expect(step1.instructions).toContain('virtual environment');
      expect(step1.safer_alternative).toBeDefined();

      // If an execution policy bypass step exists, it must be marked security sensitive
      const sensitiveSteps = steps.filter(s => s.is_security_sensitive);
      for (const s of sensitiveSteps) {
        expect(s.caution_notes).toBeDefined();
        // Must NOT recommend machine-wide Set-ExecutionPolicy Unrestricted
        expect(s.code_snippet).not.toContain('Set-ExecutionPolicy Unrestricted');
      }
    });
  });

  // =========================================================================
  // Problem 6: Evidence refinement (Never confirm without positive evidence)
  // =========================================================================
  describe('Rule 6: Evidence-Based Verification & Refutation', () => {
    it('marks hypothesis as confirmed ONLY when test output positively verifies it', async () => {
      const { assessment } = await GeminiService.analyzeIssue({
        description: 'Docker container exited with code 137',
        environment: { runtime: 'Docker' },
        testOutput: '137 true' // Positive OOM evidence
      });

      expect(assessment.is_conclusive).toBe(true);
      const oomHyp = assessment.hypotheses.find(h => h.id === 'hyp_oom_cgroup');
      expect(oomHyp?.likelihood).toBe('confirmed');
      expect(assessment.recommended_solution).toBeDefined();
    });

    it('refutes hypothesis and does NOT mark conclusive when test output is negative', async () => {
      const { assessment } = await GeminiService.analyzeIssue({
        description: 'Docker container exited with code 137',
        environment: { runtime: 'Docker' },
        testOutput: '137 false' // Refuting evidence: exit 137 but OOMKilled is FALSE
      });

      // Must NOT claim confirmation
      expect(assessment.is_conclusive).toBe(false);

      const oomHyp = assessment.hypotheses.find(h => h.id === 'hyp_oom_cgroup');
      // OOM cause is refuted / unlikely
      expect(oomHyp?.likelihood).toBe('unlikely');
      expect(oomHyp?.refuting_evidence?.length).toBeGreaterThan(0);

      // Alternative cause (external signal / docker stop) becomes more likely
      const externalHyp = assessment.hypotheses.find(h => h.id === 'hyp_external_sigkill');
      expect(externalHyp?.likelihood).toBe('likely');
    });

    it('remains inconclusive when test output is uninformative or ambiguous', async () => {
      const { assessment } = await GeminiService.analyzeIssue({
        description: 'Docker container exited with code 137',
        environment: { runtime: 'Docker' },
        testOutput: 'command not found: docker'
      });

      expect(assessment.is_conclusive).toBe(false);
      const oomHyp = assessment.hypotheses.find(h => h.id === 'hyp_oom_cgroup');
      expect(oomHyp?.likelihood).not.toBe('confirmed');
    });
  });

  // =========================================================================
  // Problem 7: Honest Fallback & Genuine Documentation URLs
  // =========================================================================
  describe('Rule 7: Honest Fallback & Genuine Documentation URLs', () => {
    it('reports local_diagnostic_engine mode honestly when Gemini API key is absent', async () => {
      const { mode } = await GeminiService.analyzeIssue({
        description: '502 Bad Gateway Nginx upstream connection refused'
      });

      // Since GEMINI_API_KEY is not set in test environment, it must honestly declare fallback mode
      expect(mode).toBe('local_diagnostic_engine');
    });

    it('all documentation URLs originate from official, trusted technical documentation domains', () => {
      const sources = DocumentationService.getAllSources();
      expect(sources.length).toBeGreaterThan(0);

      const trustedDomains = [
        'docs.docker.com',
        'developer.mozilla.org',
        'docs.python.org',
        'www.postgresql.org',
        'nodejs.org',
        'react.dev',
        'typescriptlang.org',
        'fastapi.tiangolo.com',
        'git-scm.com',
        'sqlite.org'
      ];

      for (const source of sources) {
        const matchesTrusted = trustedDomains.some(domain => source.base_url.includes(domain));
        expect(matchesTrusted).toBe(true);

        for (const topic of source.verified_topics) {
          expect(topic.url.startsWith('https://')).toBe(true);
          const topicMatchesTrusted = trustedDomains.some(domain => topic.url.includes(domain));
          expect(topicMatchesTrusted).toBe(true);
        }
      }
    });
  });
});
