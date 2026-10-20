import Database from 'better-sqlite3';
import { Guide } from '../types/index.js';

export type SeedGuide = Omit<Guide, 'id' | 'created_at' | 'updated_at'>;

export const SEED_GUIDES: SeedGuide[] = [
  {
    slug: 'docker-exit-code-137-oomkilled',
    title: 'Troubleshooting Docker Container Exit Code 137 (OOMKilled) in Node.js & Python Services',
    summary: 'Identify, diagnose, and resolve container termination with exit code 137 caused by Linux kernel out-of-memory killer cgroup constraints.',
    category: 'Docker & Deployment',
    symptoms: [
      'Container abruptly stops without logging an unhandled exception or shutdown stack trace.',
      'docker inspect returns "ExitCode": 137 and "OOMKilled": true.',
      'Kernel dmesg displays "Out of memory: Killed process" or "Memory cgroup out of memory".'
    ],
    environment_prereqs: [
      'Docker Engine 20.10+ or Docker Desktop on Linux / macOS / WSL2',
      'Containerized workloads with defined memory limits (--memory or compose deploy.resources)'
    ],
    likely_causes: [
      {
        cause: 'Container Memory Constraint Exceeded',
        explanation: 'The container exceeded its configured memory limit in docker run (--memory=512m) or docker-compose.yml. When physical RAM + swap limit is exhausted, the Linux kernel invokes the OOM killer on the highest badness process.'
      },
      {
        cause: 'Node.js or Python V8/Heap Limit Misalignment',
        explanation: 'Node.js V8 defaults to ~1.4GB - 4GB depending on host machine architecture. In a container restricted to 512MB, V8 does not automatically downscale unless configured with --max-old-space-size.'
      },
      {
        cause: 'Application Memory Leak or Unbounded In-Memory Buffers',
        explanation: 'Streaming large file uploads into buffer arrays or maintaining uncleared in-memory caches leads to monotonic memory growth until cgroup enforcement.'
      }
    ],
    diagnostic_steps: [
      {
        step: 'Check container exit code and OOM status flag',
        command: 'docker inspect <container_id_or_name> --format="ExitCode: {{.State.ExitCode}}, OOMKilled: {{.State.OOMKilled}}"',
        interpretation: 'If ExitCode is 137 and OOMKilled is true, termination was unequivocally caused by exceeding memory allocations.'
      },
      {
        step: 'Inspect host kernel memory events',
        command: 'dmesg -T | grep -i -E "oom|killed process"',
        interpretation: 'Confirms whether the host Linux kernel issued SIGKILL (signal 9 + 128 = 137) to the container process.'
      },
      {
        step: 'Monitor real-time memory usage and percentage',
        command: 'docker stats --no-stream',
        interpretation: 'Shows current memory utilization against total limit for all running containers.'
      }
    ],
    verified_solutions: [
      {
        title: 'Align Node.js V8 Heap Size with Container Cgroup Memory',
        steps: [
          'Calculate safe heap space: reserve 25-30% for Node.js native bindings, buffers, and OS overhead.',
          'Add --max-old-space-size flag to your start command in Dockerfile or entrypoint script.'
        ],
        code_snippet: 'CMD ["node", "--max-old-space-size=384", "dist/index.js"]',
        language: 'dockerfile',
        rollback: 'Revert Dockerfile CMD to node dist/index.js and increase container resource limits in compose.'
      },
      {
        title: 'Adjust Docker Compose Resource Limits',
        steps: [
          'Locate the service definition in compose.yaml or docker-compose.yml.',
          'Adjust limits.memory and set appropriate reservations to prevent eviction.'
        ],
        code_snippet: `services:
  api:
    image: my-service:latest
    deploy:
      resources:
        limits:
          memory: 1024M
        reservations:
          memory: 512M`,
        language: 'yaml'
      }
    ],
    warnings: [
      'Do not blindly allocate unlimited memory (--memory=0) in production clusters, as an unchecked memory leak can crash the entire host machine.',
      'Check database query limits: returning thousands of unpaginated records directly into application memory is the leading trigger of sudden OOM spikes.'
    ],
    documentation_references: [
      {
        title: 'Docker Runtime Options: Resource Constraints',
        url: 'https://docs.docker.com/engine/containers/resource_constraints/#limit-a-containers-access-to-memory',
        source_name: 'Docker Official Documentation',
        relevant_excerpt: 'Exit code 137 indicates the container received signal 9 (SIGKILL) from the OOM killer.',
        verified: true
      },
      {
        title: 'Node.js CLI Flags: --max-old-space-size',
        url: 'https://nodejs.org/docs/latest/api/cli.html#--max-old-space-sizesize-in-megabytes',
        source_name: 'Node.js Official Documentation',
        relevant_excerpt: 'Sets the maximum memory size of V8\'s old memory section in megabytes.',
        verified: true
      }
    ],
    status: 'published',
    author_name: 'Zelqora Systems Engineering',
    last_reviewed_at: '2026-03-15T00:00:00.000Z'
  },
  {
    slug: 'resolving-cors-errors-react-express',
    title: 'Resolving CORS Policy "No Access-Control-Allow-Origin" Errors Between React and Express',
    summary: 'Systematically diagnose Cross-Origin Resource Sharing (CORS) header failures, preflight OPTIONS rejection, and credentialed cookie handling.',
    category: 'HTTP & APIs',
    symptoms: [
      'Browser console error: "Access to fetch at http://localhost:3001/api/data from origin http://localhost:5173 has been blocked by CORS policy".',
      'Network tab shows preflight OPTIONS request failing with 404 or 405 status code.',
      'Cookies or Authorization headers omitted from browser requests.'
    ],
    environment_prereqs: [
      'Frontend: React, Vite, Next.js, or browser fetch/axios running on origin A (e.g. localhost:5173)',
      'Backend: Node.js Express running on origin B (e.g. localhost:3001)'
    ],
    likely_causes: [
      {
        cause: 'Missing or Incomplete CORS Middleware on Backend',
        explanation: 'Express routes execute without sending the required Access-Control-Allow-Origin response header matching the requesting origin.'
      },
      {
        cause: 'Credential Mode Mismatch (Wildcard Origin with Cookies)',
        explanation: 'When fetch requests include credentials: "include", browsers reject responses containing Access-Control-Allow-Origin: *; the exact matching origin must be explicitly reflected.'
      },
      {
        cause: 'CORS Middleware Placed After Route Definitions',
        explanation: 'Express middlewares execute in strict registration order. If app.use(cors()) is declared after route handlers, preflights and errors bypass CORS headers.'
      }
    ],
    diagnostic_steps: [
      {
        step: 'Test manual preflight OPTIONS request via curl',
        command: 'curl -i -X OPTIONS http://localhost:3001/api/health -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET"',
        interpretation: 'Look for HTTP/1.1 204 or 200 with Access-Control-Allow-Origin: http://localhost:5173 in headers. If 404 or header missing, Express is not answering preflights.'
      },
      {
        step: 'Verify Request Headers in Browser DevTools Network Panel',
        command: 'Inspect request -> Headers -> Request Headers: Origin & Sec-Fetch-Mode: cors',
        interpretation: 'Verifies the exact origin string the browser sends.'
      }
    ],
    verified_solutions: [
      {
        title: 'Proper Express CORS Middleware Setup with Explicit Origin and Credentials',
        steps: [
          'Install cors package: npm install cors @types/cors',
          'Register cors middleware before any route handlers or static file middleware.',
          'Specify exact origin array or dynamic validator function.'
        ],
        code_snippet: `import express from 'express';
import cors from 'cors';

const app = express();

const allowedOrigins = ['http://localhost:5173', 'https://zelqora.example.com'];

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server or tools like curl without origin
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));`,
        language: 'typescript',
        rollback: 'Revert to single origin string: cors({ origin: "http://localhost:5173" })'
      },
      {
        title: 'Configure Vite Development Proxy to Eliminate Cross-Origin in Dev',
        steps: [
          'Add a proxy table in vite.config.ts to route /api requests to Express server.',
          'Frontend code fetches relative path /api/... instead of absolute http://localhost:3001.'
        ],
        code_snippet: `// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});`,
        language: 'typescript'
      }
    ],
    warnings: [
      'Never use cors({ origin: "*" }) when authentication cookies or Authorization tokens are required; modern browsers strictly reject wildcard origins with credentials.',
      'Ensure error handling middleware also retains CORS headers; otherwise, 500 errors will trigger misleading CORS errors in the browser instead of the real error.'
    ],
    documentation_references: [
      {
        title: 'MDN: Cross-Origin Resource Sharing (CORS)',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
        source_name: 'MDN Web Docs',
        relevant_excerpt: 'CORS is an HTTP-header based mechanism that allows a server to indicate any origins other than its own from which a browser should permit loading resources.',
        verified: true
      }
    ],
    status: 'published',
    author_name: 'Zelqora Security & API Team',
    last_reviewed_at: '2026-03-20T00:00:00.000Z'
  },
  {
    slug: 'postgresql-max-connections-exhausted',
    title: 'Fixing PostgreSQL "remaining connection slots are reserved for non-replication superuser connections"',
    summary: 'Diagnose connection leaks, configure pool sizing, and deploy connection pooling to resolve fatal PostgreSQL connection exhaustion.',
    category: 'PostgreSQL & Databases',
    symptoms: [
      'Application logs: "FATAL: remaining connection slots are reserved for non-replication superuser connections".',
      'New database client connections immediately rejected with error code 53300 (too_many_connections).',
      'API endpoints hang or fail with database timeout errors.'
    ],
    environment_prereqs: [
      'PostgreSQL 13, 14, 15, or 16',
      'Node.js (pg / prisma / typeorm / sequelize), Python (psycopg2 / SQLAlchemy), or Go backend'
    ],
    likely_causes: [
      {
        cause: 'Unpooled Application Connections (Opening New Connection Per Request)',
        explanation: 'Creating a new client instance on every incoming HTTP request without closing or releasing it quickly consumes the default max_connections limit (typically 100).'
      },
      {
        cause: 'Idle-in-Transaction Leaks',
        explanation: 'Transactions opened with BEGIN that do not execute COMMIT or ROLLBACK due to unhandled promise rejections or infinite loops hold connection locks indefinitely.'
      },
      {
        cause: 'Multi-Process Horizontal Scaling Without PgBouncer',
        explanation: 'Deploying multiple container replicas or serverless lambdas where each worker maintains its own pool of 20 connections easily exceeds PostgreSQL hardware capacity.'
      }
    ],
    diagnostic_steps: [
      {
        step: 'Query current connection counts by state and database',
        command: `psql -U postgres -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"`,
        interpretation: 'Look for large numbers of "idle in transaction" or "active" sessions approaching max_connections.'
      },
      {
        step: 'Identify longest running unclosed queries and transactions',
        command: `psql -U postgres -c "SELECT pid, now() - xact_start AS duration, query, state FROM pg_stat_activity WHERE state != 'idle' ORDER BY duration DESC LIMIT 5;"`,
        interpretation: 'Pinpoints specific queries holding transactions open for minutes or hours.'
      }
    ],
    verified_solutions: [
      {
        title: 'Implement Shared Connection Pool in Application Client',
        steps: [
          'Create a single singleton Pool instance instead of individual Client objects.',
          'Always release clients in try/finally blocks or use pool.query helper.'
        ],
        code_snippet: `import { Pool } from 'pg';

export const pool = new Pool({
  max: 20, // Maximum pool size per node instance
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  return res;
}`,
        language: 'typescript'
      },
      {
        title: 'Configure PostgreSQL idle_in_transaction_session_timeout',
        steps: [
          'Add a safety timeout in postgresql.conf to automatically terminate orphaned transactions after 30 seconds.',
          'Reload PostgreSQL configuration.'
        ],
        code_snippet: `ALTER SYSTEM SET idle_in_transaction_session_timeout = '30000';
SELECT pg_reload_conf();`,
        language: 'sql',
        rollback: `ALTER SYSTEM SET idle_in_transaction_session_timeout = '0';
SELECT pg_reload_conf();`
      }
    ],
    warnings: [
      'Do not arbitrarily raise max_connections to 1,000+ without evaluating server RAM and CPU cores; each PostgreSQL backend process consumes 5-10MB+ RAM and incurs context-switching overhead.',
      'Use transaction pooling (PgBouncer) when connecting serverless functions to PostgreSQL.'
    ],
    documentation_references: [
      {
        title: 'PostgreSQL Runtime Config: Connections and Authentication',
        url: 'https://www.postgresql.org/docs/current/runtime-config-connection.html',
        source_name: 'PostgreSQL Official Documentation',
        relevant_excerpt: 'max_connections determines the maximum number of concurrent connections to the database server.',
        verified: true
      }
    ],
    status: 'published',
    author_name: 'Zelqora Database Reliability Team',
    last_reviewed_at: '2026-03-25T00:00:00.000Z'
  },
  {
    slug: 'python-modulenotfounderror-virtualenv-vscode',
    title: 'Resolving Python "ModuleNotFoundError" and Virtualenv Interpreter Mismatches in VS Code',
    summary: 'Fix persistent ModuleNotFoundError when packages are installed with pip but the IDE or terminal executes a different Python interpreter.',
    category: 'Python & Tooling',
    symptoms: [
      'Terminal shows ModuleNotFoundError: No module named "fastapi" (or requests, pydantic, etc.).',
      'pip list shows the package is installed, but running python script.py fails.',
      'VS Code squiggly lines report "Import could not be resolved" while terminal execution works, or vice-versa.'
    ],
    environment_prereqs: [
      'Python 3.8 - 3.14 on Windows, macOS, or Linux',
      'VS Code or terminal virtualenv / venv'
    ],
    likely_causes: [
      {
        cause: 'Active Interpreter Divergence',
        explanation: 'pip installed the library into one Python environment (e.g. global /usr/bin/python3 or C:\\Python312), but the script is executing via another environment (.venv/bin/python).'
      },
      {
        cause: 'VS Code Selected Workspace Interpreter Differs from Terminal venv',
        explanation: 'VS Code Python Extension is configured to use the global system interpreter rather than the workspace .venv.'
      }
    ],
    diagnostic_steps: [
      {
        step: 'Check exact binary path of currently executing Python and pip',
        command: 'python -c "import sys; print(sys.executable)" && pip -V',
        interpretation: 'Verify if the path returned by sys.executable matches the location reported in pip -V.'
      },
      {
        step: 'Check sys.path module lookup directories',
        command: 'python -c "import sys; print(sys.path)"',
        interpretation: 'Displays all site-packages directories searched by Python at runtime.'
      }
    ],
    verified_solutions: [
      {
        title: 'Always Run pip Through python -m pip to Guarantee Environment Parity',
        steps: [
          'Never call bare pip or pip3 directly if multiple Python versions exist.',
          'Activate the virtual environment first, or invoke pip directly via the target python binary.'
        ],
        code_snippet: `# Windows
.venv\\Scripts\\activate
python -m pip install -r requirements.txt

# Linux / macOS
source .venv/bin/activate
python -m pip install -r requirements.txt`,
        language: 'bash'
      },
      {
        title: 'Select Matching Interpreter in VS Code',
        steps: [
          'Press Ctrl+Shift+P (or Cmd+Shift+P on Mac).',
          'Type "Python: Select Interpreter" and press Enter.',
          'Choose the interpreter that contains (venv) or (.venv): ./.venv/bin/python or .\\.venv\\Scripts\\python.exe.'
        ],
        code_snippet: `{
  // .vscode/settings.json
  "python.defaultInterpreterPath": "\${workspaceFolder}/.venv/bin/python"
}`,
        language: 'json'
      }
    ],
    warnings: [
      'Avoid running pip with sudo on Linux/macOS as it pollutes system-level package directories and breaks system package managers.',
      'On Windows, if PowerShell reports "running scripts is disabled", run python -m venv using the cmd subshell or set execution policy for the current user.'
    ],
    documentation_references: [
      {
        title: 'Python Official Docs: venv — Creation of virtual environments',
        url: 'https://docs.python.org/3/library/venv.html',
        source_name: 'Python 3 Official Documentation',
        relevant_excerpt: 'The venv module supports creating lightweight virtual environments, each with their own independent set of installed packages.',
        verified: true
      }
    ],
    status: 'published',
    author_name: 'Zelqora Python Specialist',
    last_reviewed_at: '2026-03-10T00:00:00.000Z'
  },
  {
    slug: 'nodejs-memory-leak-heap-exhaustion',
    title: 'Diagnosing Node.js Memory Leaks and Heap Exhaustion with Chrome DevTools and Core Dumps',
    summary: 'Capture heap snapshots, identify detached DOM or closure retention, and prevent process crashes from JavaScript heap out of memory.',
    category: 'Node.js',
    symptoms: [
      'Fatal error: "JavaScript heap out of memory".',
      'Process memory (RSS) monotonically increases over hours until container or OS kill.',
      'Frequent long Garbage Collection (GC) pauses causing API latency spikes.'
    ],
    environment_prereqs: [
      'Node.js 18, 20, 22, or 24 LTS',
      'Chrome or Chromium browser for DevTools heap inspection'
    ],
    likely_causes: [
      {
        cause: 'Global Arrays or Unbounded In-Memory Caches',
        explanation: 'Appending items to module-level arrays or maps without TTL or eviction keys prevents Garbage Collection.'
      },
      {
        cause: 'Uncleared Event Listeners and Timers',
        explanation: 'Calling emitter.on() or setInterval() inside per-request functions retains closures referencing req/res objects.'
      }
    ],
    diagnostic_steps: [
      {
        step: 'Run Node.js with DevTools inspector enabled',
        command: 'node --inspect=0.0.0.0:9229 server.js',
        interpretation: 'Navigate to chrome://inspect in browser, click "Open dedicated DevTools for Node", and take 2 Heap Snapshots 5 minutes apart.'
      },
      {
        step: 'Trigger automated heap snapshot upon out of memory',
        command: 'node --heapsnapshot-near-heap-limit=3 server.js',
        interpretation: 'Automatically writes a diagnostic .heapsnapshot file to disk right before V8 terminates.'
      }
    ],
    verified_solutions: [
      {
        title: 'Replace Unbounded Map with an LRU Cache',
        steps: [
          'Install a size-bounded LRU cache like lru-cache.',
          'Set explicit max items and ttl to guarantee eviction.'
        ],
        code_snippet: `import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 5000,
  ttl: 1000 * 60 * 15, // 15 minutes
});`,
        language: 'typescript'
      }
    ],
    warnings: [
      'Never enable --inspect on a publicly exposed production port without SSH tunneling or firewall restrictions.'
    ],
    documentation_references: [
      {
        title: 'Node.js Memory Management & Process Diagnostics',
        url: 'https://nodejs.org/docs/latest/api/process.html#processmemoryusage',
        source_name: 'Node.js Official Documentation',
        relevant_excerpt: 'Returns an object describing the memory usage of the Node.js process measured in bytes.',
        verified: true
      }
    ],
    status: 'published',
    author_name: 'Zelqora Core Engineering',
    last_reviewed_at: '2026-03-28T00:00:00.000Z'
  },
  {
    slug: 'react-hydration-mismatch-errors',
    title: 'Resolving React Hydration Mismatch Errors Between SSR and Client-Side Mount',
    summary: 'Fix "Hydration failed because the initial UI does not match what was rendered on the server" errors in React SSR frameworks.',
    category: 'React & Frontend',
    symptoms: [
      'Console warning: "Hydration failed because the server-rendered HTML didn\'t match the client".',
      'Flickering or disappearing text elements on page load.',
      'Text content did not match. Server: "X" Client: "Y".'
    ],
    environment_prereqs: [
      'React 18 or 19 with Server-Side Rendering (Next.js, Remix, Vite SSR)'
    ],
    likely_causes: [
      {
        cause: 'Rendering Client-Specific State during Server Pass',
        explanation: 'Accessing window, localStorage, Date.now(), or Math.random() directly inside render causes server output to differ from browser output.'
      },
      {
        cause: 'Invalid HTML Nesting',
        explanation: 'Nesting <p> inside <p>, <div> inside <p>, or <tr> directly inside <table> causes the browser HTML parser to auto-correct tags before React hydrates.'
      }
    ],
    diagnostic_steps: [
      {
        step: 'Inspect React Hydration Diff in Browser DevTools',
        command: 'Check browser console for the specific element tag and text diff provided by React 18/19 hydration error boundary.',
        interpretation: 'Directly pinpoints the offending component and the exact mismatch string.'
      }
    ],
    verified_solutions: [
      {
        title: 'Use Mounted Guard for Client-Only Content',
        steps: [
          'Delay rendering dynamic browser-only content until useEffect has executed after hydration.'
        ],
        code_snippet: `import { useState, useEffect } from 'react';

export function ClientOnlyTimestamp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="skeleton">Loading...</span>;
  }

  return <span>{new Date().toLocaleTimeString()}</span>;
}`,
        language: 'typescript'
      }
    ],
    warnings: [
      'Do not rely excessively on suppressHydrationWarning; it hides genuine UI bugs and degrades client interactivity.'
    ],
    documentation_references: [
      {
        title: 'React Official Docs: hydrateRoot and handling different content',
        url: 'https://react.dev/reference/react-dom/client/hydrateRoot#handling-different-client-and-server-content',
        source_name: 'React Official Documentation',
        relevant_excerpt: 'If an intentional difference exists between server and client, pass suppressHydrationWarning={true} to the element.',
        verified: true
      }
    ],
    status: 'published',
    author_name: 'Zelqora Frontend Team',
    last_reviewed_at: '2026-04-01T00:00:00.000Z'
  }
];

export function seedGuides(db: Database.Database): void {
  const count = db.prepare('SELECT count(*) as count FROM guides').get() as { count: number };
  if (count.count > 0) {
    return;
  }

  const insert = db.prepare(`
    INSERT INTO guides (
      id, slug, title, summary, category, symptoms, environment_prereqs,
      likely_causes, diagnostic_steps, verified_solutions, warnings,
      documentation_references, status, author_name, last_reviewed_at,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?
    )
  `);

  const now = new Date().toISOString();

  const insertMany = db.transaction(() => {
    for (const guide of SEED_GUIDES) {
      const id = 'guide_' + Math.random().toString(36).substring(2, 11);
      insert.run(
        id,
        guide.slug,
        guide.title,
        guide.summary,
        guide.category,
        JSON.stringify(guide.symptoms),
        JSON.stringify(guide.environment_prereqs),
        JSON.stringify(guide.likely_causes),
        JSON.stringify(guide.diagnostic_steps),
        JSON.stringify(guide.verified_solutions),
        JSON.stringify(guide.warnings),
        JSON.stringify(guide.documentation_references),
        guide.status,
        guide.author_name,
        guide.last_reviewed_at,
        now,
        now
      );
    }
  });

  insertMany();
}
