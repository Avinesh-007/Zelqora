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
    environment?: EnvironmentInfo;
    category?: string;
    submittedTestOutput?: string;
    testOutput?: string;
    answeredQuestions?: Record<string, string>;
    previousTurns?: InvestigationTurn[];
  }): Promise<{ assessment: DiagnosticAssessment; mode: 'gemini_live' | 'local_diagnostic_engine' }> {
    // 1. Redact secrets from all inputs
    const cleanDescription = RedactionService.redact(params.description || '').redactedText;
    const cleanEnvironment = RedactionService.redactObject(params.environment || {}) || {};
    const rawTestOutput = params.submittedTestOutput || params.testOutput;
    const cleanTestOutput = rawTestOutput 
      ? RedactionService.redact(rawTestOutput).redactedText 
      : undefined;

    // 2. Retrieve verified official documentation references strictly matching problem concepts
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
   * Invokes Google Gemini via official @google/genai SDK with structured schema and calibrated rules.
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
1. RELEVANT COMMANDS ONLY: Diagnostic tests MUST directly inspect the specific service, process, port, file, or error mentioned by the user. NEVER suggest arbitrary, composite, or unrelated commands (like chaining multiple runtimes).
2. OPERATING SYSTEM PARITY: Check the user's OS. If on Windows, provide native PowerShell or CMD commands (avoid bash 'grep', 'tail', 'dmesg', and avoid bash '&&' which fails on standard Windows PowerShell). If on Linux or macOS, provide POSIX shell commands.
3. BEGINNER-FRIENDLY ONE STEP AT A TIME: Present diagnostic tests sequentially (step_order: 1) with clear, simple instructions and explicit expected output.
4. QUALITATIVE LIKELIHOOD LABELS: Do NOT output arbitrary confidence percentages. Use qualitative likelihood: "likely" | "possible" | "unlikely" | "confirmed". Always explain the remaining uncertainty in "uncertainty_reason".
5. SECURITY SAFETY FIRST: Avoid recommending security-sensitive system changes (such as changing system-wide execution policies, disabling CORS security guards, or binding debuggers to 0.0.0.0). When security risks exist, explain them clearly and provide safer, local alternatives first.
6. EVIDENCE-DRIVEN VERIFICATION: When user submits test output, evaluate if the output confirms or refutes the hypothesis. NEVER claim a cause is confirmed without actual supporting evidence in the test output. If the test output contradicts the cause or is inconclusive, update the diagnosis honestly.
7. GROUNDING: Base reasoning on observable evidence and verified official documentation. Output MUST strictly match the requested JSON schema.
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
  "clarifying_questions": ["Targeted question 1"],
  "hypotheses": [
    {
      "id": "hyp_1",
      "title": "Clear hypothesis title",
      "explanation": "Why this cause is plausible given the evidence",
      "likelihood": "likely" | "possible" | "unlikely" | "confirmed",
      "uncertainty_reason": "What specific evidence is still needed to verify or rule out this hypothesis",
      "supporting_evidence": ["Evidence A"],
      "refuting_evidence": []
    }
  ],
  "diagnostic_tests": [
    {
      "id": "test_1",
      "step_order": 1,
      "title": "Step 1: Diagnostic test title",
      "command": "safe OS-appropriate command for user to run",
      "is_safe": true,
      "requires_elevation": false,
      "explanation": "What this test measures in plain language",
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
      "instructions": "Detailed, beginner-friendly instructions",
      "code_snippet": "optional code snippet",
      "language": "bash",
      "is_security_sensitive": false,
      "safer_alternative": "safer alternative if applicable",
      "caution_notes": "cautions if any",
      "rollback_instructions": "how to safely undo this change"
    }
  ],
  "documentation_references": ${JSON.stringify(params.docReferences)},
  "is_conclusive": false,
  "uncertainty_summary": "Plain explanation of current uncertainty and next steps",
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
    const rawText = (params.cleanDescription + ' ' + (params.cleanEnvironment.error_message || '')).toLowerCase();
    const testOut = (params.cleanTestOutput || '').toLowerCase();
    const osLower = (params.cleanEnvironment.os || '').toLowerCase();
    const isWindows = osLower.includes('win') || osLower.includes('powershell');

    // =========================================================================
    // Pattern 1: Docker Exit Code 137 / OOMKilled
    // =========================================================================
    if (rawText.includes('137') || rawText.includes('oom') || (rawText.includes('docker') && rawText.includes('killed'))) {
      const hasPositiveOomEvidence = testOut.includes('137 true') || testOut.includes('oomkilled: true') || testOut.includes('oomkilled": true') || testOut.includes('out of memory: killed');
      const hasNegativeOomEvidence = testOut.includes('137 false') || testOut.includes('oomkilled: false') || testOut.includes('oomkilled": false') || testOut.includes('exitcode: 0');
      const hasOutput = Boolean(params.cleanTestOutput && params.cleanTestOutput.trim().length > 0);

      // Evaluate evidence strictly
      const isConclusive = hasPositiveOomEvidence;

      const hypotheses: DiagnosticAssessment['hypotheses'] = [
        {
          id: 'hyp_oom_cgroup',
          title: 'Container Memory Cgroup Limit Exceeded',
          explanation: 'The container exceeded its configured RAM limit, triggering the Linux kernel out-of-memory killer to terminate the process.',
          likelihood: hasPositiveOomEvidence ? 'confirmed' : (hasNegativeOomEvidence ? 'unlikely' : 'likely'),
          uncertainty_reason: hasPositiveOomEvidence 
            ? undefined 
            : (hasNegativeOomEvidence ? 'Ruled out by test output showing OOMKilled was false.' : 'Awaiting confirmation of container State.OOMKilled flag via docker inspect.'),
          supporting_evidence: hasPositiveOomEvidence 
            ? ['User test output verified OOMKilled: true with exit code 137']
            : ['Exit code 137 represents signal 9 (SIGKILL) issued by kernel', 'Absence of standard language stack trace before process exit'],
          refuting_evidence: hasNegativeOomEvidence ? ['User test output reported OOMKilled: false'] : []
        },
        {
          id: 'hyp_external_sigkill',
          title: 'External Process Kill or Host Shutdown',
          explanation: 'The container was stopped by an explicit docker stop timeout, host restart, or external process termination.',
          likelihood: hasNegativeOomEvidence ? 'likely' : 'possible',
          uncertainty_reason: hasPositiveOomEvidence ? 'Superseded by confirmed OOM evidence.' : 'Plausible if container was stopped without exceeding memory limits.',
          supporting_evidence: hasNegativeOomEvidence ? ['Exit code 137 with OOMKilled: false indicates an external SIGKILL was sent'] : ['Exit code 137 can occur after 10-second docker stop timeout'],
          refuting_evidence: hasPositiveOomEvidence ? ['Kernel OOM event confirmed'] : []
        }
      ];

      return {
        summary: isConclusive
          ? 'Confirmed: Container was killed by Linux kernel OOM killer after exceeding configured memory limit.'
          : (hasNegativeOomEvidence
            ? 'Refuted OOM: Container exit code 137 was NOT caused by memory exhaustion (OOMKilled is false). Investigating external kill signals.'
            : 'Container terminated with exit code 137. Inspecting whether termination was caused by memory limits or external signals.'),
        severity: isConclusive ? 'high' : 'medium',
        category: 'Docker & Deployment',
        is_conclusive: isConclusive,
        uncertainty_summary: isConclusive
          ? undefined
          : (hasNegativeOomEvidence
            ? 'The submitted test output shows OOMKilled was false. Check orchestrator stop signals, container health checks, or manual stops.'
            : 'Uncertainty remains until the docker inspect test is executed locally and the OOMKilled flag is verified.'),
        clarifying_questions: [
          'What is the configured memory limit for this container (--memory flag or compose deploy.resources)?',
          'Does memory usage climb gradually over minutes (leak) or spike immediately upon a specific request?'
        ],
        hypotheses,
        diagnostic_tests: [
          {
            id: 'test_inspect_oom',
            step_order: 1,
            title: 'Step 1: Check Container State and OOMKilled Flag',
            command: 'docker inspect <container_name_or_id> --format="{{.State.ExitCode}} {{.State.OOMKilled}}"',
            is_safe: true,
            requires_elevation: false,
            explanation: 'Queries the Docker daemon for the exact termination state and kernel OOM flag. Replace <container_name_or_id> with your container name or ID.',
            expected_output_pattern: '137 true',
            what_result_means: {
              if_matches: 'Confirms the container exceeded memory limit and was killed by Linux kernel OOM.',
              if_fails_or_differs: 'If OOMKilled is false, the container was killed by an external stop or timeout, NOT memory exhaustion.'
            }
          }
        ],
        recommended_solution: isConclusive ? [
          {
            step_number: 1,
            title: 'Step 1: Constrain Runtime Heap Below Container Memory Limit',
            instructions: 'In your Dockerfile or container startup script, set the runtime maximum heap to approximately 75% of container RAM, reserving 25% for native bindings and OS overhead.',
            code_snippet: 'CMD ["node", "--max-old-space-size=384", "dist/index.js"]',
            language: 'dockerfile',
            caution_notes: 'Leave at least 25% headroom for native buffers, stack frames, and process memory.',
            rollback_instructions: 'Remove the --max-old-space-size flag if container memory is increased.'
          },
          {
            step_number: 2,
            title: 'Step 2: Adjust Container Resource Limit in Docker Compose',
            instructions: 'Increase the hard memory limit in your compose configuration to allocate sufficient RAM.',
            code_snippet: `deploy:
  resources:
    limits:
      memory: 1024M
    reservations:
      memory: 512M`,
            language: 'yaml'
          }
        ] : undefined,
        documentation_references: params.docReferences,
        safety_warnings: [
          'Increasing memory limits without addressing unbounded data leaks will only delay the out-of-memory crash.'
        ]
      };
    }

    // =========================================================================
    // Pattern 2: CORS / Access-Control-Allow-Origin
    // =========================================================================
    if (rawText.includes('cors') || rawText.includes('access-control') || rawText.includes('preflight')) {
      const hasCorsErrorEvidence = testOut.includes('access-control-allow-origin') === false || testOut.includes('404') || testOut.includes('405') || testOut.includes('blocked');
      const hasPositiveCorsHeader = testOut.includes('access-control-allow-origin:');
      const hasOutput = Boolean(params.cleanTestOutput && params.cleanTestOutput.trim().length > 0);

      const isConclusive = hasOutput && hasCorsErrorEvidence && !hasPositiveCorsHeader;

      const hypotheses: DiagnosticAssessment['hypotheses'] = [
        {
          id: 'hyp_missing_cors_header',
          title: 'Server Missing Access-Control-Allow-Origin Header',
          explanation: 'The backend API does not return the requesting origin in its CORS headers, prompting the browser security sandbox to block the response.',
          likelihood: isConclusive ? 'confirmed' : 'likely',
          uncertainty_reason: isConclusive ? undefined : 'Requires simulating preflight OPTIONS request to verify server response headers.',
          supporting_evidence: isConclusive 
            ? ['Preflight curl test confirmed server does not return Access-Control-Allow-Origin header']
            : ['Browser console indicates blocked cross-origin fetch', 'Target origin differs in port or protocol']
        },
        {
          id: 'hyp_unhandled_options_preflight',
          title: 'Preflight OPTIONS Request Rejected with 404 or 405',
          explanation: 'The server does not answer HTTP OPTIONS requests, which browsers automatically dispatch before credentialed or non-simple requests.',
          likelihood: 'possible',
          uncertainty_reason: 'Awaiting preflight check output.',
          supporting_evidence: ['Non-simple headers or custom methods trigger browser preflight checks']
        }
      ];

      const curlCmd = isWindows
        ? 'curl.exe -i -X OPTIONS http://localhost:3001/api/health -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET"'
        : 'curl -i -X OPTIONS http://localhost:3001/api/health -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET"';

      return {
        summary: isConclusive
          ? 'Confirmed: Backend API does not respond with required CORS headers for the requesting origin.'
          : 'Cross-Origin Resource Sharing (CORS) restriction enforced by browser security policy.',
        severity: 'medium',
        category: 'HTTP & APIs',
        is_conclusive: isConclusive,
        uncertainty_summary: isConclusive ? undefined : 'Uncertainty remains until a preflight request tests the backend outside the browser.',
        clarifying_questions: [
          'What is the frontend origin (protocol, host, port) and backend API origin?',
          'Does the request send credentials (cookies or Authorization header)?'
        ],
        hypotheses,
        diagnostic_tests: [
          {
            id: 'test_preflight_curl',
            step_order: 1,
            title: 'Step 1: Simulate Preflight OPTIONS with curl',
            command: curlCmd,
            is_safe: true,
            requires_elevation: false,
            explanation: 'Directly tests whether the backend responds with required CORS headers outside the browser. Adjust host/port to your actual backend.',
            expected_output_pattern: 'HTTP/1.1 200 (or 204) with Access-Control-Allow-Origin: http://localhost:5173',
            what_result_means: {
              if_matches: 'Backend correctly handles preflight requests for this origin.',
              if_fails_or_differs: 'Backend is missing CORS middleware or returning error on OPTIONS.'
            }
          }
        ],
        recommended_solution: [
          {
            step_number: 1,
            title: 'Step 1: Configure Express CORS Middleware with Explicit Origin',
            instructions: 'Register cors middleware before all application routes with your exact client origin. Do NOT use origin: "*" when requests transmit cookies or credentials.',
            code_snippet: `import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));`,
            language: 'typescript',
            is_security_sensitive: false,
            rollback_instructions: 'Remove cors middleware or restore previous origin whitelist.'
          }
        ],
        documentation_references: params.docReferences,
        safety_warnings: [
          'Never use origin: "*" when requests send cookies or Authorization credentials; modern browsers strictly reject wildcard origins with credentials.'
        ]
      };
    }

    // =========================================================================
    // Pattern 3: PostgreSQL Connection Exhaustion
    // =========================================================================
    if (rawText.includes('connection slots') || (rawText.includes('postgres') && (rawText.includes('connection') || rawText.includes('max_connections')))) {
      const hasHighIdleEvidence = testOut.includes('idle in transaction') || testOut.includes('53300');
      const hasOutput = Boolean(params.cleanTestOutput && params.cleanTestOutput.trim().length > 0);
      const isConclusive = hasOutput && hasHighIdleEvidence;

      return {
        summary: isConclusive
          ? 'Confirmed: PostgreSQL connection slots exhausted due to uncommitted idle-in-transaction connections.'
          : 'Database connection exhaustion: all non-replication connection slots are occupied.',
        severity: 'critical',
        category: 'PostgreSQL & Databases',
        is_conclusive: isConclusive,
        uncertainty_summary: isConclusive ? undefined : 'Requires querying pg_stat_activity to distinguish application connection leaks from traffic spikes.',
        clarifying_questions: [
          'How many application instances or container replicas are connected to PostgreSQL?',
          'Are database connections pooled or opened per incoming request?'
        ],
        hypotheses: [
          {
            id: 'hyp_connection_leak',
            title: 'Unclosed Client Connections or Orphaned Transactions',
            explanation: 'Endpoints open database connections without releasing them back to the pool in finally blocks.',
            likelihood: isConclusive ? 'confirmed' : 'likely',
            uncertainty_reason: isConclusive ? undefined : 'Awaiting query of connection counts by state.',
            supporting_evidence: isConclusive 
              ? ['Database reports high idle-in-transaction connection count'] 
              : ['Sudden spike in active connections reaching max_connections']
          }
        ],
        diagnostic_tests: [
          {
            id: 'test_pg_connections',
            step_order: 1,
            title: 'Step 1: Query Connection Counts by State',
            command: 'psql -U postgres -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"',
            is_safe: true,
            requires_elevation: false,
            explanation: 'Summarizes connection counts by current state (active, idle, idle in transaction).',
            expected_output_pattern: 'idle.*active',
            what_result_means: {
              if_matches: 'A high count of "idle in transaction" indicates application connection leaks.',
              if_fails_or_differs: 'Connections may be consumed by external tools, backups, or replica pools.'
            }
          }
        ],
        recommended_solution: [
          {
            step_number: 1,
            title: 'Step 1: Set idle_in_transaction_session_timeout',
            instructions: 'Configure PostgreSQL to terminate leaked transactions automatically after 30 seconds.',
            code_snippet: `ALTER SYSTEM SET idle_in_transaction_session_timeout = '30000';
SELECT pg_reload_conf();`,
            language: 'sql',
            is_security_sensitive: false,
            rollback_instructions: `ALTER SYSTEM SET idle_in_transaction_session_timeout = '0'; SELECT pg_reload_conf();`
          }
        ],
        documentation_references: params.docReferences,
        safety_warnings: [
          'Terminating active transactions will abort in-flight database writes. Review application commit blocks.'
        ]
      };
    }

    // =========================================================================
    // Pattern 4: Python ModuleNotFoundError & Virtualenv / Windows
    // =========================================================================
    if (rawText.includes('modulenotfounderror') || rawText.includes('no module named') || (rawText.includes('python') && rawText.includes('pip')) || rawText.includes('virtualenv') || rawText.includes('venv') || rawText.includes('executionpolicy') || rawText.includes('execution policy') || rawText.includes('virtual environment')) {
      const hasDivergenceEvidence = (testOut.includes('python.exe') && testOut.includes('.venv') === false && testOut.includes('lib\\site-packages')) || testOut.includes('mismatch') || (testOut.includes('sys.executable') && testOut.includes('site-packages'));
      const hasOutput = Boolean(params.cleanTestOutput && params.cleanTestOutput.trim().length > 0);
      const isConclusive = hasOutput && hasDivergenceEvidence;

      const pythonCmd1 = isWindows
        ? 'python -c "import sys; print(sys.executable)"'
        : 'python3 -c "import sys; print(sys.executable)"';

      const pythonCmd2 = isWindows
        ? 'python -m pip -V'
        : 'python3 -m pip -V';

      return {
        summary: isConclusive
          ? 'Confirmed: Python is executing with global system interpreter instead of the project virtual environment.'
          : 'Python package import failure or virtual environment interpreter path divergence.',
        severity: 'medium',
        category: 'Python & Tooling',
        is_conclusive: isConclusive,
        uncertainty_summary: isConclusive ? undefined : 'Awaiting comparison between sys.executable path and pip installation directory.',
        clarifying_questions: [
          'Which command was used to install the package (pip, poetry, conda, pipenv)?',
          'Are you running this script in VS Code, PyCharm, or a standalone terminal?'
        ],
        hypotheses: [
          {
            id: 'hyp_interpreter_divergence',
            title: 'Active Interpreter Divergence from Target Environment',
            explanation: 'The package was installed into one Python environment (e.g. .venv), but the script executes via a different python binary (e.g. system Python).',
            likelihood: isConclusive ? 'confirmed' : 'likely',
            uncertainty_reason: isConclusive ? undefined : 'Requires checking sys.executable against pip -V output.',
            supporting_evidence: isConclusive 
              ? ['User test output confirmed active python executable differs from pip environment']
              : ['Package appears in pip list but import fails during script execution']
          }
        ],
        diagnostic_tests: [
          {
            id: 'test_check_python_binary',
            step_order: 1,
            title: 'Step 1: Inspect Executable Path of Active Python',
            command: pythonCmd1,
            is_safe: true,
            requires_elevation: false,
            explanation: 'Prints the exact binary path of the Python interpreter running your code. In a virtualenv, this path must be inside your .venv directory.',
            expected_output_pattern: isWindows ? '...\\.venv\\Scripts\\python.exe' : '.../.venv/bin/python',
            what_result_means: {
              if_matches: 'Confirms Python is executing inside the project virtual environment.',
              if_fails_or_differs: 'Python is running via the global system interpreter, causing ModuleNotFoundError.'
            }
          },
          {
            id: 'test_check_pip_path',
            step_order: 2,
            title: 'Step 2: Inspect Active pip Target Path',
            command: pythonCmd2,
            is_safe: true,
            requires_elevation: false,
            explanation: 'Prints the directory that pip installs packages into.',
            expected_output_pattern: 'site-packages',
            what_result_means: {
              if_matches: 'Shows the site-packages directory where packages are placed.',
              if_fails_or_differs: 'pip is not available on PATH.'
            }
          }
        ],
        recommended_solution: [
          {
            step_number: 1,
            title: 'Step 1: Execute Directly with Virtual Environment Binary (Safest — No Policy Changes)',
            instructions: isWindows
              ? 'Run pip and your script directly using the virtual environment python executable. This bypasses the need for script activation and requires zero system execution policy changes.'
              : 'Run pip and your script directly using the virtual environment python binary.',
            code_snippet: isWindows
              ? `# Install package directly into virtual environment:
.\\.venv\\Scripts\\python.exe -m pip install <package_name>

# Run your application directly with the virtualenv:
.\\.venv\\Scripts\\python.exe app.py`
              : `# Install package directly into virtual environment:
./.venv/bin/python -m pip install <package_name>

# Run your application directly:
./.venv/bin/python app.py`,
            language: 'bash',
            is_security_sensitive: false,
            safer_alternative: 'Running the binary directly is the safest method because it requires no system-wide policy adjustments.'
          },
          {
            step_number: 2,
            title: 'Step 2: Temporary Process-Scoped Shell Activation (Alternative)',
            instructions: isWindows
              ? 'If you prefer activating the environment in PowerShell and see "PSSecurityException: running scripts is disabled", do NOT modify machine-wide execution policies. Instead, bypass execution policy only for this single process.'
              : 'Activate the virtual environment in your current shell.',
            code_snippet: isWindows
              ? `# Temporary single-process activation (does not alter system security):
powershell -ExecutionPolicy Bypass -File .\\.venv\\Scripts\\Activate.ps1

# Or use standard Command Prompt (cmd.exe):
.\\.venv\\Scripts\\activate.bat`
              : `source .venv/bin/activate`,
            language: 'bash',
            is_security_sensitive: true,
            caution_notes: 'PowerShell execution policies are a safety feature protecting against untrusted scripts. Avoid Set-ExecutionPolicy Unrestricted or machine-wide modifications.'
          }
        ],
        documentation_references: params.docReferences,
        safety_warnings: [
          'Avoid using "sudo pip install" or altering machine-wide execution policies; use local virtual environments.'
        ]
      };
    }

    // =========================================================================
    // Pattern 5: Node.js Heap Out of Memory
    // =========================================================================
    if (rawText.includes('heap out of memory') || rawText.includes('javascript heap') || rawText.includes('heap_size_limit')) {
      const hasHeapStats = testOut.includes('heap_limit_mb') || testOut.includes('heap_size_limit');
      const hasOutput = Boolean(params.cleanTestOutput && params.cleanTestOutput.trim().length > 0);
      const isConclusive = hasOutput && hasHeapStats;

      return {
        summary: isConclusive
          ? 'Confirmed: V8 old space heap limit reached during execution.'
          : 'Node.js V8 JavaScript heap exhaustion: process ran out of allocated memory for object allocation.',
        severity: 'critical',
        category: 'Node.js',
        is_conclusive: isConclusive,
        uncertainty_summary: isConclusive ? undefined : 'Awaiting verification of current heap threshold.',
        clarifying_questions: [
          'Does memory grow monotonically over time (leak) or spike suddenly on a single batch operation?',
          'What is the physical RAM capacity of the host machine or container?'
        ],
        hypotheses: [
          {
            id: 'hyp_v8_heap_limit',
            title: 'V8 Old Space Heap Allocation Ceiling Exceeded',
            explanation: 'Bulk payload parsing or large data transformations exceeded the default V8 heap allocation.',
            likelihood: isConclusive ? 'confirmed' : 'likely',
            uncertainty_reason: isConclusive ? undefined : 'Awaiting execution of v8.getHeapStatistics check.',
            supporting_evidence: isConclusive 
              ? ['Submitted memory statistics show heap ceiling reached'] 
              : ['Exit logs report JavaScript heap out of memory']
          }
        ],
        diagnostic_tests: [
          {
            id: 'test_inspect_v8_heap',
            step_order: 1,
            title: 'Step 1: Check Current V8 Heap Size Limit',
            command: 'node -e "const v8 = require(\'v8\'); console.log(\'heap_limit_mb:\', Math.round(v8.getHeapStatistics().heap_size_limit / 1024 / 1024))"',
            is_safe: true,
            requires_elevation: false,
            explanation: 'Queries the V8 engine for the active heap limit in megabytes.',
            expected_output_pattern: 'heap_limit_mb: [0-9]+',
            what_result_means: {
              if_matches: 'Confirms current maximum heap threshold in MB.',
              if_fails_or_differs: 'Command syntax error or unsupported Node version.'
            }
          }
        ],
        recommended_solution: [
          {
            step_number: 1,
            title: 'Step 1: Increase V8 Heap Ceiling via CLI Flag',
            instructions: 'Raise max-old-space-size to 4096MB (4GB) for your script or build process.',
            code_snippet: 'node --max-old-space-size=4096 server.js',
            language: 'bash',
            is_security_sensitive: false,
            rollback_instructions: 'Remove --max-old-space-size flag.'
          }
        ],
        documentation_references: params.docReferences,
        safety_warnings: [
          'Setting --max-old-space-size higher than physical host RAM will cause the OS kernel to terminate the entire process abruptly.'
        ]
      };
    }

    // =========================================================================
    // Pattern 6: 502 Bad Gateway / Reverse Proxy ECONNREFUSED
    // =========================================================================
    if (rawText.includes('502') || rawText.includes('bad gateway') || rawText.includes('econnrefused')) {
      const hasConnectionRefused = testOut.includes('econnrefused') || testOut.includes('failed to connect') || testOut.includes('connection refused');
      const hasOutput = Boolean(params.cleanTestOutput && params.cleanTestOutput.trim().length > 0);
      const isConclusive = hasOutput && hasConnectionRefused;

      return {
        summary: isConclusive
          ? 'Confirmed: Upstream backend service is not running or rejecting connections on target port.'
          : 'Reverse proxy / gateway connection failure: upstream backend service is unreachable or not accepting connections.',
        severity: 'high',
        category: 'HTTP & APIs',
        is_conclusive: isConclusive,
        uncertainty_summary: isConclusive ? undefined : 'Requires verifying direct backend listener on 127.0.0.1.',
        clarifying_questions: [
          'Is the backend process running and listening on the exact port specified in the reverse proxy config?',
          'Is the backend bound to 127.0.0.1 (IPv4), ::1 (IPv6), or 0.0.0.0 (all interfaces)?'
        ],
        hypotheses: [
          {
            id: 'hyp_upstream_stopped',
            title: 'Upstream Application Process Stopped or Not Listening',
            explanation: 'The reverse proxy forwarded the request, but no backend listener accepted connections on the target port.',
            likelihood: isConclusive ? 'confirmed' : 'likely',
            uncertainty_reason: isConclusive ? undefined : 'Awaiting direct curl check to local backend port.',
            supporting_evidence: isConclusive 
              ? ['Submitted curl test confirmed connection refused to backend port'] 
              : ['502 Bad Gateway response received from reverse proxy']
          }
        ],
        diagnostic_tests: [
          {
            id: 'test_check_backend_port',
            step_order: 1,
            title: 'Step 1: Test Direct Backend Port Connection',
            command: isWindows ? 'curl.exe -i http://127.0.0.1:3001/api/health' : 'curl -i http://127.0.0.1:3001/api/health',
            is_safe: true,
            requires_elevation: false,
            explanation: 'Tests direct connection to the backend bypassing the reverse proxy. Adjust port to your backend.',
            expected_output_pattern: 'HTTP/1.1 200',
            what_result_means: {
              if_matches: 'Backend is running correctly; problem is reverse proxy routing or address resolution.',
              if_fails_or_differs: 'Backend process is stopped, crashed, or bound to a different port.'
            }
          }
        ],
        recommended_solution: [
          {
            step_number: 1,
            title: 'Step 1: Use Explicit 127.0.0.1 Instead of "localhost" in Proxy Upstream',
            instructions: 'In your Nginx or reverse proxy configuration, change proxy_pass http://localhost:PORT to proxy_pass http://127.0.0.1:PORT to prevent IPv6 resolution mismatches.',
            code_snippet: `location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}`,
            language: 'nginx'
          }
        ],
        documentation_references: params.docReferences,
        safety_warnings: [
          'Do not expose internal backend ports directly to the public internet.'
        ]
      };
    }

    // =========================================================================
    // Pattern 7: Default General Technical Problem Assessment (Targeted & Safe)
    // =========================================================================
    // Check if user specified a specific runtime
    const runtimeLower = (params.cleanEnvironment.runtime || '').toLowerCase();
    let diagnosticCmd = '';
    let testTitle = '';
    let testExplanation = '';
    let expectedOutput = '';

    if (runtimeLower.includes('node') || rawText.includes('npm') || rawText.includes('node')) {
      diagnosticCmd = 'node -v';
      testTitle = 'Step 1: Verify Installed Node.js Version';
      testExplanation = 'Checks the exact installed Node.js runtime version to verify environment readiness.';
      expectedOutput = 'v20.x or v22.x LTS';
    } else if (runtimeLower.includes('python') || rawText.includes('python') || rawText.includes('pip')) {
      diagnosticCmd = isWindows ? 'python --version' : 'python3 --version';
      testTitle = 'Step 1: Verify Installed Python Version';
      testExplanation = 'Checks the exact installed Python runtime version on your system PATH.';
      expectedOutput = 'Python 3.x.x';
    } else if (runtimeLower.includes('docker') || rawText.includes('docker')) {
      diagnosticCmd = 'docker --version';
      testTitle = 'Step 1: Verify Docker Daemon & Client Version';
      testExplanation = 'Checks if the Docker CLI is installed and accessible on your system PATH.';
      expectedOutput = 'Docker version 2x.x';
    } else if (params.cleanEnvironment.error_message) {
      // User provided a specific error message: test inspecting recent application exit state
      diagnosticCmd = isWindows 
        ? 'Get-Process | Select-Object -First 5' 
        : 'ps aux | head -n 5';
      testTitle = 'Step 1: Verify Process State and Execution Baseline';
      testExplanation = 'Checks system process table to verify whether the failing application is active or stopped.';
      expectedOutput = 'List of active processes';
    } else {
      // Conservative, targeted baseline check
      diagnosticCmd = isWindows ? 'echo %PATH%' : 'echo $PATH';
      testTitle = 'Step 1: Verify System PATH Execution Baseline';
      testExplanation = 'Inspects system execution PATH to check for missing runtime binary locations.';
      expectedOutput = 'System PATH string';
    }

    return {
      summary: `Systematic technical assessment for: ${params.cleanDescription.slice(0, 120)}...`,
      severity: 'medium',
      category: params.category || 'Software & Environment',
      is_conclusive: false,
      uncertainty_summary: 'Preliminary intake: awaiting specific runtime version and error details from the diagnostic test.',
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
          likelihood: 'possible',
          uncertainty_reason: 'Awaiting execution of baseline diagnostic check to inspect runtime status.',
          supporting_evidence: ['Common across development and containerized runtimes'],
          refuting_evidence: []
        },
        {
          id: 'hyp_dependency_conflict',
          title: 'Runtime Dependency or Interface Incompatibility',
          explanation: 'A dependent package or service is unreachable or returned an unexpected format.',
          likelihood: 'possible',
          uncertainty_reason: 'Awaiting error trace to pinpoint the specific failing call.',
          supporting_evidence: ['Often observed after upgrades or fresh installations'],
          refuting_evidence: []
        }
      ],
      diagnostic_tests: [
        {
          id: 'test_targeted_baseline',
          step_order: 1,
          title: testTitle,
          command: diagnosticCmd,
          is_safe: true,
          requires_elevation: false,
          explanation: testExplanation,
          expected_output_pattern: expectedOutput,
          what_result_means: {
            if_matches: 'Confirms baseline runtime is accessible on system PATH.',
            if_fails_or_differs: 'Indicates the runtime or process is missing from system PATH.'
          }
        }
      ],
      recommended_solution: [
        {
          step_number: 1,
          title: 'Step 1: Collect Baseline Diagnostic Evidence',
          instructions: 'Run the single recommended diagnostic test above, inspect the output, and submit the result back into the timeline.',
          is_security_sensitive: false,
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
