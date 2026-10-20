import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env.js';
import { DiagnosticAssessment, EnvironmentInfo, InvestigationTurn } from '../types/index.js';
import { RedactionService } from './redaction.service.js';
import { DocumentationService } from './documentation.service.js';

export class GeminiService {
  private static aiClient: GoogleGenAI | null = null;

  public static isConfigured(): boolean {
    return Boolean(ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY.trim().length > 0);
  }

  private static getClient(): GoogleGenAI {
    if (!this.aiClient) {
      if (!this.isConfigured()) {
        throw new Error('GEMINI_API_KEY is not configured in the server environment.');
      }
      this.aiClient = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
    }
    return this.aiClient;
  }

  /**
   * Generates an adaptive diagnostic assessment for a technical problem intake or follow-up turn.
   */
  public static async analyzeIssue(params: {
    description: string;
    environment: EnvironmentInfo;
    category?: string;
    submittedTestOutput?: string;
    answeredQuestions?: Record<string, string>;
    previousTurns?: InvestigationTurn[];
  }): Promise<{ assessment: DiagnosticAssessment; mode: 'gemini_live' | 'local_diagnostic_engine' }> {
    // 1. Redact secrets from all inputs
    const cleanDescription = RedactionService.redact(params.description).redactedText;
    const cleanEnvironment = RedactionService.redactObject(params.environment);
    const cleanTestOutput = params.submittedTestOutput 
      ? RedactionService.redact(params.submittedTestOutput).redactedText 
      : undefined;

    // 2. Retrieve verified official documentation references as grounding
    const docReferences = DocumentationService.search(
      `${cleanDescription} ${cleanEnvironment.error_message || ''} ${cleanTestOutput || ''}`,
      params.category,
      3
    );

    // 3. Check if real Gemini API key is available
    if (this.isConfigured()) {
      try {
        const assessment = await this.callGeminiLive({
          cleanDescription,
          cleanEnvironment,
          category: params.category,
          cleanTestOutput,
          answeredQuestions: params.answeredQuestions,
          previousTurns: params.previousTurns,
          docReferences
        });
        return { assessment, mode: 'gemini_live' };
      } catch (err: any) {
        console.error('Gemini API call failed:', err?.message || err);
        // Do not silently mock in production if user configured a key that failed;
        // throw a clear structured error with diagnostic details.
        throw new Error(`Gemini diagnostic engine error: ${err?.message || 'External model provider failure'}`);
      }
    }

    // 4. Local rule-based diagnostic engine for offline/local development without API key
    const assessment = this.generateLocalDiagnosticAssessment({
      cleanDescription,
      cleanEnvironment,
      category: params.category,
      cleanTestOutput,
      answeredQuestions: params.answeredQuestions,
      previousTurns: params.previousTurns,
      docReferences
    });

    return { assessment, mode: 'local_diagnostic_engine' };
  }

  /**
   * Invokes Google Gemini via official @google/genai SDK with structured schema.
   */
  private static async callGeminiLive(params: {
    cleanDescription: string;
    cleanEnvironment: EnvironmentInfo;
    category?: string;
    cleanTestOutput?: string;
    answeredQuestions?: Record<string, string>;
    previousTurns?: InvestigationTurn[];
    docReferences: any[];
  }): Promise<DiagnosticAssessment> {
    const ai = this.getClient();

    const systemInstruction = `
You are the Zelqora Technical Diagnostic Engine, an elite systems, software, and infrastructure troubleshooting assistant.
Your mission is to guide users through structured, evidence-based troubleshooting.

CRITICAL RULES:
1. Never claim to have run commands on the user's computer. The user runs diagnostic tests themselves.
2. Never request passwords, private keys, or API tokens.
3. For diagnostic tests, provide safe, read-only commands whenever possible (e.g., inspect, status, logs, version).
4. Explicitly warn about destructive actions, administrator privileges, data loss risks, or production impact.
5. Base reasoning on observable evidence and verified official documentation.
6. Provide ranked hypotheses with evidence scores (0-100%).
7. If conclusive evidence is found (e.g. from submitted test output), mark is_conclusive: true and provide a concrete step-by-step solution with rollback instructions.
8. Output MUST strictly match the requested JSON schema.
    `;

    const prompt = `
Investigation Context:
- Category: ${params.category || 'General Software Engineering'}
- User Description: ${params.cleanDescription}
- Environment OS: ${params.cleanEnvironment.os || 'Not specified'}
- Runtime/Version: ${params.cleanEnvironment.runtime || ''} ${params.cleanEnvironment.version || ''}
- Error Message: ${params.cleanEnvironment.error_message || 'None provided'}
- Logs/Context: ${params.cleanEnvironment.logs || 'None provided'}
- User Submitted Test Output: ${params.cleanTestOutput || 'None yet'}
- User Answers to Questions: ${JSON.stringify(params.answeredQuestions || {})}
- Number of Previous Investigation Turns: ${params.previousTurns?.length || 0}

Grounding Official Documentation:
${JSON.stringify(params.docReferences, null, 2)}

Respond with a complete, structured JSON object:
{
  "summary": "Concise technical diagnosis of the situation",
  "severity": "low" | "medium" | "high" | "critical",
  "category": "${params.category || 'General'}",
  "clarifying_questions": ["Targeted question 1", "Targeted question 2"],
  "hypotheses": [
    {
      "id": "hyp_1",
      "title": "Clear hypothesis title",
      "explanation": "Why this cause is plausible given the evidence",
      "likelihood_score": 85,
      "supporting_evidence": ["Evidence A", "Evidence B"]
    }
  ],
  "diagnostic_tests": [
    {
      "id": "test_1",
      "title": "Diagnostic test title",
      "command": "safe shell command for user to run",
      "is_safe": true,
      "requires_elevation": false,
      "explanation": "What this test measures",
      "expected_output_pattern": "What normal vs failing output looks like",
      "what_result_means": {
        "if_matches": "Meaning if pattern matches",
        "if_fails_or_differs": "Meaning if command outputs something else"
      }
    }
  ],
  "recommended_solution": [
    {
      "step_number": 1,
      "title": "Actionable step",
      "instructions": "Detailed instructions",
      "code_snippet": "optional code or config snippet",
      "language": "bash",
      "caution_notes": "cautions if any",
      "rollback_instructions": "how to undo"
    }
  ],
  "documentation_references": ${JSON.stringify(params.docReferences)},
  "is_conclusive": false,
  "safety_warnings": ["Always backup configuration before modifying."]
}
    `;

    const response = await ai.models.generateContent({
      model: ENV.GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    // Merge verified documentation references
    parsed.documentation_references = params.docReferences;

    return parsed as DiagnosticAssessment;
  }

  /**
   * Deterministic local diagnostic engine for offline testing and local evaluation
   * when GEMINI_API_KEY is not configured in the environment.
   */
  private static generateLocalDiagnosticAssessment(params: {
    cleanDescription: string;
    cleanEnvironment: EnvironmentInfo;
    category?: string;
    cleanTestOutput?: string;
    answeredQuestions?: Record<string, string>;
    previousTurns?: InvestigationTurn[];
    docReferences: any[];
  }): DiagnosticAssessment {
    const text = (params.cleanDescription + ' ' + (params.cleanEnvironment.error_message || '') + ' ' + (params.cleanTestOutput || '')).toLowerCase();
    
    // Pattern 1: Docker 137 / OOM
    if (text.includes('137') || text.includes('oom') || text.includes('killed')) {
      return {
        summary: 'Process or container terminated abruptly by Linux kernel Out-Of-Memory (OOM) killer with exit code 137 (SIGKILL).',
        severity: 'high',
        category: 'Docker & Deployment',
        is_conclusive: Boolean(params.cleanTestOutput),
        clarifying_questions: [
          'What is the configured memory limit for this container or host?',
          'Does memory usage increase gradually over time or jump immediately on startup?'
        ],
        hypotheses: [
          {
            id: 'hyp_oom_cgroup',
            title: 'Container Memory Cgroup Limit Exceeded',
            explanation: 'The application exceeded the hard memory limit configured in docker run or docker-compose.',
            likelihood_score: 90,
            supporting_evidence: [
              'Exit code 137 represents signal 9 (SIGKILL) issued by kernel',
              'Absence of standard language stack trace before process exit'
            ]
          },
          {
            id: 'hyp_v8_heap_mismatch',
            title: 'Runtime Heap Limit Exceeds Container Memory',
            explanation: 'The runtime default heap allocation exceeds the container cgroup boundary.',
            likelihood_score: 75,
            supporting_evidence: ['Common in Node.js and Java containerized runtimes']
          }
        ],
        diagnostic_tests: [
          {
            id: 'test_inspect_oom',
            title: 'Inspect Container State and OOMKilled Flag',
            command: 'docker inspect <container_name_or_id> --format="{{.State.ExitCode}} {{.State.OOMKilled}}"',
            is_safe: true,
            requires_elevation: false,
            explanation: 'Queries the Docker daemon for the exact termination state and kernel OOM flag.',
            expected_output_pattern: '137 true',
            what_result_means: {
              if_matches: 'Unambiguously confirms the container exceeded its memory limit.',
              if_fails_or_differs: 'If OOMKilled is false, the container was killed by an external SIGKILL or user command.'
            }
          },
          {
            id: 'test_dmesg_memory',
            title: 'Inspect Host Kernel OOM Logs',
            command: 'dmesg -T | grep -i -E "oom|killed process" | tail -n 10',
            is_safe: true,
            requires_elevation: true,
            explanation: 'Reads recent kernel messages for out of memory invocations.',
            expected_output_pattern: 'Out of memory: Killed process <pid>',
            what_result_means: {
              if_matches: 'Displays the specific PID and process name terminated by the kernel.',
              if_fails_or_differs: 'No kernel OOM events recorded in the current ring buffer.'
            }
          }
        ],
        recommended_solution: [
          {
            step_number: 1,
            title: 'Align Runtime Heap with Container Memory Ceiling',
            instructions: 'In your container startup command, restrict the heap allocation to approximately 75% of container memory.',
            code_snippet: 'CMD ["node", "--max-old-space-size=384", "dist/index.js"]',
            language: 'dockerfile',
            caution_notes: 'Leave at least 25% for native buffers, stack frames, and process overhead.',
            rollback_instructions: 'Remove the --max-old-space-size flag if container memory is increased.'
          },
          {
            step_number: 2,
            title: 'Adjust Docker Compose Resource Constraints',
            instructions: 'Increase the memory limit in docker-compose.yml or assign swap space.',
            code_snippet: `deploy:
  resources:
    limits:
      memory: 1024M`,
            language: 'yaml'
          }
        ],
        documentation_references: params.docReferences,
        safety_warnings: [
          'Increasing memory limits without addressing unbounded data leaks may simply delay the out-of-memory crash.'
        ]
      };
    }

    // Pattern 2: CORS Error
    if (text.includes('cors') || text.includes('access-control-allow-origin') || text.includes('preflight')) {
      return {
        summary: 'Cross-Origin Resource Sharing (CORS) restriction enforced by browser security policy.',
        severity: 'medium',
        category: 'HTTP & APIs',
        is_conclusive: Boolean(params.cleanTestOutput),
        clarifying_questions: [
          'What is the frontend origin (protocol, host, port) and backend API origin?',
          'Does the request send credentials (cookies or Authorization header)?'
        ],
        hypotheses: [
          {
            id: 'hyp_missing_cors_header',
            title: 'Server Missing Access-Control-Allow-Origin Header',
            explanation: 'The backend server does not include the requesting origin in its CORS headers.',
            likelihood_score: 88,
            supporting_evidence: [
              'Browser console indicates blocked cross-origin fetch',
              'Target origin differs in port or protocol'
            ]
          },
          {
            id: 'hyp_unhandled_options_preflight',
            title: 'Preflight OPTIONS Request Rejected',
            explanation: 'The server rejected or returned 404/405 for the preliminary HTTP OPTIONS request.',
            likelihood_score: 70,
            supporting_evidence: ['Occurs with custom headers (Authorization, X-Custom) or PUT/DELETE methods']
          }
        ],
        diagnostic_tests: [
          {
            id: 'test_preflight_curl',
            title: 'Simulate Preflight OPTIONS with curl',
            command: 'curl -i -X OPTIONS http://localhost:3001/api/health -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST"',
            is_safe: true,
            requires_elevation: false,
            explanation: 'Directly tests whether the backend responds with required CORS headers outside of the browser.',
            expected_output_pattern: 'HTTP/1.1 204.*Access-Control-Allow-Origin',
            what_result_means: {
              if_matches: 'Backend correctly handles preflight requests for this origin.',
              if_fails_or_differs: 'Backend missing CORS middleware or returning error on OPTIONS.'
            }
          }
        ],
        recommended_solution: [
          {
            step_number: 1,
            title: 'Configure Express CORS Middleware with Explicit Origin',
            instructions: 'Register cors middleware before all application routes with your exact client origin.',
            code_snippet: `import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));`,
            language: 'typescript'
          }
        ],
        documentation_references: params.docReferences,
        safety_warnings: [
          'Never use origin: "*" when requests send cookies or Authorization credentials.'
        ]
      };
    }

    // Pattern 3: PostgreSQL connection limit
    if (text.includes('connection') && (text.includes('postgres') || text.includes('remaining connection slots') || text.includes('pool'))) {
      return {
        summary: 'Database connection exhaustion: all non-replication connection slots are occupied.',
        severity: 'critical',
        category: 'PostgreSQL & Databases',
        is_conclusive: Boolean(params.cleanTestOutput),
        clarifying_questions: [
          'How many application instances or container replicas are connected to PostgreSQL?',
          'Are database connections pooled or opened per request?'
        ],
        hypotheses: [
          {
            id: 'hyp_connection_leak',
            title: 'Unclosed Client Connections or Orphaned Transactions',
            explanation: 'Endpoints open database connections without releasing them back to the pool in finally blocks.',
            likelihood_score: 85,
            supporting_evidence: ['Sudden spike in active connections reaching max_connections']
          }
        ],
        diagnostic_tests: [
          {
            id: 'test_pg_connections',
            title: 'Query Current Active and Idle Connections',
            command: 'psql -U postgres -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"',
            is_safe: true,
            requires_elevation: false,
            explanation: 'Summarizes connection counts by current state (active, idle, idle in transaction).',
            expected_output_pattern: 'idle.*active',
            what_result_means: {
              if_matches: 'A high count of "idle in transaction" indicates application connection leaks.',
              if_fails_or_differs: 'Connections may be consumed by external tools or backups.'
            }
          }
        ],
        recommended_solution: [
          {
            step_number: 1,
            title: 'Set idle_in_transaction_session_timeout',
            instructions: 'Configure PostgreSQL to terminate leaked transactions automatically.',
            code_snippet: `ALTER SYSTEM SET idle_in_transaction_session_timeout = '30000';
SELECT pg_reload_conf();`,
            language: 'sql'
          }
        ],
        documentation_references: params.docReferences,
        safety_warnings: [
          'Terminating active transactions will abort in-flight database writes.'
        ]
      };
    }

    // Default General Technical Problem Assessment
    return {
      summary: `Systematic technical assessment for: ${params.cleanDescription.slice(0, 120)}...`,
      severity: 'medium',
      category: params.category || 'Software & Environment',
      is_conclusive: false,
      clarifying_questions: [
        'What was the exact command, request, or user action that triggered this failure?',
        'Did this configuration previously succeed, and if so, what changed recently?',
        'Can this issue be reliably reproduced on an isolated environment?'
      ],
      hypotheses: [
        {
          id: 'hyp_config_mismatch',
          title: 'Environment or Configuration Parameter Discrepancy',
          explanation: 'The executing process may be missing required environment variables or using conflicting library versions.',
          likelihood_score: 75,
          supporting_evidence: ['Common across development and containerized runtimes']
        },
        {
          id: 'hyp_dependency_conflict',
          title: 'Runtime Dependency or Interface Incompatibility',
          explanation: 'A dependent package or service is unreachable or returned an unexpected format.',
          likelihood_score: 60,
          supporting_evidence: ['Often observed after upgrades or fresh installations']
        }
      ],
      diagnostic_tests: [
        {
          id: 'test_verify_env',
          title: 'Verify Environment Variables and Runtime State',
          command: 'node -v || python --version || docker --version',
          is_safe: true,
          requires_elevation: false,
          explanation: 'Checks the exact installed runtime version to establish baseline compatibility.',
          expected_output_pattern: 'version [0-9]+',
          what_result_means: {
            if_matches: 'Confirms runtime is accessible and reports current version.',
            if_fails_or_differs: 'Indicates the runtime is missing from system PATH.'
          }
        }
      ],
      recommended_solution: [
        {
          step_number: 1,
          title: 'Collect Baseline Diagnostic Evidence',
          instructions: 'Run the recommended diagnostic test above, inspect the output, and submit the result back into the investigation timeline.',
          caution_notes: 'Verify logs for private tokens or keys before submission.'
        }
      ],
      documentation_references: params.docReferences,
      safety_warnings: [
        'Always backup code, database data, and configuration before executing write or reset commands.'
      ]
    };
  }
}
