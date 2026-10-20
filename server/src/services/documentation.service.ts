import { DocSource, DocumentationRef } from '../types/index.js';

/**
 * Approved Official Documentation Registry
 * Every entry has been verified against official documentation domains.
 * No arbitrary or untrusted domains are permitted.
 */
export const APPROVED_DOC_SOURCES: DocSource[] = [
  {
    id: 'nodejs',
    name: 'Node.js Official Documentation',
    category: 'Node.js',
    base_url: 'https://nodejs.org/docs/latest/api/',
    search_pattern: 'https://nodejs.org/docs/latest/api/{topic}.html',
    description: 'Core Node.js runtime APIs, event loop, child processes, buffer, errors, and memory management.',
    verified_topics: [
      {
        topic: 'errors',
        title: 'Node.js Errors and Exception Handling',
        url: 'https://nodejs.org/docs/latest/api/errors.html',
        summary: 'Standard JavaScript errors, system errors (ECONNREFUSED, EADDRINUSE, ETIMEDOUT), and assertion errors.'
      },
      {
        topic: 'http',
        title: 'Node.js HTTP & HTTPS API',
        url: 'https://nodejs.org/docs/latest/api/http.html',
        summary: 'Server lifecycle, headers, CORS preflight handling, timeouts, and request listeners.'
      },
      {
        topic: 'process',
        title: 'Node.js Process & Memory Management',
        url: 'https://nodejs.org/docs/latest/api/process.html',
        summary: 'Process exit codes, memoryUsage() heap inspection, unhandledRejections, and signal handling.'
      },
      {
        topic: 'cluster',
        title: 'Node.js Cluster and Worker Threads',
        url: 'https://nodejs.org/docs/latest/api/worker_threads.html',
        summary: 'Offloading CPU-intensive tasks to worker threads to prevent event loop blocking.'
      }
    ]
  },
  {
    id: 'python',
    name: 'Python 3 Official Documentation',
    category: 'Python',
    base_url: 'https://docs.python.org/3/',
    search_pattern: 'https://docs.python.org/3/library/{topic}.html',
    description: 'Python language reference, standard library, virtual environments, and exceptions.',
    verified_topics: [
      {
        topic: 'exceptions',
        title: 'Python Built-in Exceptions',
        url: 'https://docs.python.org/3/library/exceptions.html',
        summary: 'ModuleNotFoundError, ImportError, TypeError, KeyError, and standard exception hierarchies.'
      },
      {
        topic: 'venv',
        title: 'Python Creation of Virtual Environments (venv)',
        url: 'https://docs.python.org/3/library/venv.html',
        summary: 'Creation of lightweight virtual environments with their own site directories and package isolation.'
      },
      {
        topic: 'asyncio',
        title: 'Python Asynchronous I/O (asyncio)',
        url: 'https://docs.python.org/3/library/asyncio.html',
        summary: 'Coroutines, event loops, tasks, and concurrency debugging in Python.'
      }
    ]
  },
  {
    id: 'react',
    name: 'React Official Documentation',
    category: 'React',
    base_url: 'https://react.dev/',
    search_pattern: 'https://react.dev/reference/react/{topic}',
    description: 'Modern React hooks, component lifecycle, hydration error troubleshooting, and state management.',
    verified_topics: [
      {
        topic: 'useEffect',
        title: 'React Synchronizing with Effects (useEffect)',
        url: 'https://react.dev/reference/react/useEffect',
        summary: 'Connecting components to external systems, cleanup functions, and avoiding infinite re-render loops.'
      },
      {
        topic: 'hydration',
        title: 'React Hydration Mismatch Errors',
        url: 'https://react.dev/reference/react-dom/client/hydrateRoot#handling-different-client-and-server-content',
        summary: 'Resolving differences between server-rendered HTML and client initial render.'
      },
      {
        topic: 'useState',
        title: 'React State Management (useState)',
        url: 'https://react.dev/reference/react/useState',
        summary: 'State setter closures, batching, and updater functions for stale state prevention.'
      }
    ]
  },
  {
    id: 'docker',
    name: 'Docker Official Documentation',
    category: 'Docker',
    base_url: 'https://docs.docker.com/',
    search_pattern: 'https://docs.docker.com/engine/reference/{topic}',
    description: 'Docker engine, container lifecycle, memory limits, exit codes (e.g. 137 OOMKilled), and compose.',
    verified_topics: [
      {
        topic: 'oomkilled',
        title: 'Docker Runtime Options: Memory Limits and OOMKilled',
        url: 'https://docs.docker.com/engine/containers/resource_constraints/#limit-a-containers-access-to-memory',
        summary: 'Container exit code 137 signifies OOM (Out Of Memory) killer termination by Linux kernel cgroups.'
      },
      {
        topic: 'networking',
        title: 'Docker Container Networking',
        url: 'https://docs.docker.com/engine/network/',
        summary: 'Bridge networks, port forwarding (-p), host networking, and container-to-container DNS resolution.'
      },
      {
        topic: 'compose',
        title: 'Docker Compose Specification',
        url: 'https://docs.docker.com/compose/compose-file/',
        summary: 'Multi-container applications, environment substitution, depends_on order, and volume mounts.'
      }
    ]
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL Official Documentation',
    category: 'PostgreSQL',
    base_url: 'https://www.postgresql.org/docs/current/',
    search_pattern: 'https://www.postgresql.org/docs/current/{topic}.html',
    description: 'PostgreSQL server administration, connection pools, locks, query planner, and error codes.',
    verified_topics: [
      {
        topic: 'connections',
        title: 'PostgreSQL Connection Limits (max_connections)',
        url: 'https://www.postgresql.org/docs/current/runtime-config-connection.html',
        summary: 'Managing connection exhaustion, reserved superuser slots, and configuring connection poolers like PgBouncer.'
      },
      {
        topic: 'locks',
        title: 'PostgreSQL Explicit Locking & Deadlocks',
        url: 'https://www.postgresql.org/docs/current/explicit-locking.html',
        summary: 'Table-level and row-level locks, deadlock detection timeouts, and lock queue inspection.'
      },
      {
        topic: 'performance',
        title: 'PostgreSQL EXPLAIN & Query Optimization',
        url: 'https://www.postgresql.org/docs/current/using-explain.html',
        summary: 'Analyzing sequential scans, index lookups, memory work_mem allocation, and query execution plans.'
      }
    ]
  },
  {
    id: 'typescript',
    name: 'TypeScript Official Handbook',
    category: 'TypeScript',
    base_url: 'https://www.typescriptlang.org/docs/',
    search_pattern: 'https://www.typescriptlang.org/docs/handbook/{topic}.html',
    description: 'Type system, compiler options (tsconfig.json), module resolution, and type narrowing.',
    verified_topics: [
      {
        topic: 'compiler-options',
        title: 'TypeScript tsconfig.json Compiler Options',
        url: 'https://www.typescriptlang.org/tsconfig',
        summary: 'moduleResolution (bundler, node16, nodenext), strictNullChecks, and target ECMAScript standards.'
      },
      {
        topic: 'narrowing',
        title: 'TypeScript Type Narrowing & Guards',
        url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
        summary: 'Discriminated unions, typeof guards, instanceof checks, and assertion functions.'
      }
    ]
  },
  {
    id: 'mdn',
    name: 'MDN Web Docs',
    category: 'Web Standards',
    base_url: 'https://developer.mozilla.org/en-US/docs/Web/',
    search_pattern: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/{topic}',
    description: 'Web standards, HTTP status codes, CORS headers, Fetch API, and DOM APIs.',
    verified_topics: [
      {
        topic: 'cors',
        title: 'MDN: Cross-Origin Resource Sharing (CORS)',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
        summary: 'Access-Control-Allow-Origin, preflight OPTIONS requests, allowed headers, and credential mode.'
      },
      {
        topic: 'status-codes',
        title: 'MDN: HTTP Response Status Codes',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status',
        summary: 'Interpretation and resolution for 400 Bad Request, 401 Unauthorized, 403 Forbidden, 500, and 502/504 errors.'
      }
    ]
  },
  {
    id: 'fastapi',
    name: 'FastAPI Official Documentation',
    category: 'FastAPI',
    base_url: 'https://fastapi.tiangolo.com/',
    search_pattern: 'https://fastapi.tiangolo.com/tutorial/{topic}/',
    description: 'FastAPI async request handling, Pydantic data validation, dependency injection, and middleware.',
    verified_topics: [
      {
        topic: 'cors',
        title: 'FastAPI CORS (Cross-Origin Resource Sharing)',
        url: 'https://fastapi.tiangolo.com/tutorial/cors/',
        summary: 'Adding CORSMiddleware, configuring allow_origins, allow_credentials, and allowed HTTP methods.'
      },
      {
        topic: 'dependencies',
        title: 'FastAPI Dependencies & DB Sessions',
        url: 'https://fastapi.tiangolo.com/tutorial/dependencies/',
        summary: 'Yield dependencies, automatic database session cleanup, and exception propagation.'
      }
    ]
  },
  {
    id: 'git',
    name: 'Git SCM Official Documentation',
    category: 'Git',
    base_url: 'https://git-scm.com/docs/',
    search_pattern: 'https://git-scm.com/docs/{topic}',
    description: 'Git distributed version control, conflict resolution, rebase, merge, reflog, and bisect.',
    verified_topics: [
      {
        topic: 'git-merge',
        title: 'Git Merge Conflicts and Resolution',
        url: 'https://git-scm.com/docs/git-merge',
        summary: 'Conflict markers (<<<<<<<, =======, >>>>>>>), 3-way merges, and git checkout --ours/--theirs.'
      },
      {
        topic: 'git-reflog',
        title: 'Git Reflog: Recovering Lost Commits',
        url: 'https://git-scm.com/docs/git-reflog',
        summary: 'Tracking local HEAD history to safely recover branches lost via hard reset or rebase mistakes.'
      }
    ]
  },
  {
    id: 'sqlite',
    name: 'SQLite Official Documentation',
    category: 'SQLite',
    base_url: 'https://www.sqlite.org/docs.html',
    search_pattern: 'https://www.sqlite.org/{topic}.html',
    description: 'SQLite zero-configuration database engine, WAL mode, locking, and busy timeouts.',
    verified_topics: [
      {
        topic: 'wal',
        title: 'SQLite Write-Ahead Logging (WAL)',
        url: 'https://www.sqlite.org/wal.html',
        summary: 'PRAGMA journal_mode=WAL enables concurrent readers and single writer without blocking.'
      },
      {
        topic: 'locking',
        title: 'SQLite Locking and Concurrency',
        url: 'https://www.sqlite.org/lockingv3.html',
        summary: 'Resolving SQLITE_BUSY errors via busy_timeout and transactional locks.'
      }
    ]
  }
];

export class DocumentationService {
  private static allowedDomains = [
    'nodejs.org',
    'docs.python.org',
    'react.dev',
    'docs.docker.com',
    'www.postgresql.org',
    'postgresql.org',
    'www.typescriptlang.org',
    'typescriptlang.org',
    'developer.mozilla.org',
    'fastapi.tiangolo.com',
    'git-scm.com',
    'www.sqlite.org',
    'sqlite.org',
    'docs.npmjs.com',
    'learn.microsoft.com',
    'docs.oracle.com'
  ];

  /**
   * Validates whether a given URL belongs to an approved documentation domain.
   * Protects against SSRF, open redirect, and hallucinated malicious URLs.
   */
  public static isApprovedUrl(urlStr: string): boolean {
    try {
      const parsed = new URL(urlStr);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return false;
      }
      return this.allowedDomains.some(domain => 
        parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  }

  /**
   * Search and retrieve official documentation references matching problem keywords,
   * category, or error messages. Strictly excludes unrelated topics.
   */
  public static search(query: string, category?: string, limit: number = 4): DocumentationRef[] {
    const qLower = query.toLowerCase();
    const catLower = (category || '').toLowerCase();
    const results: { ref: DocumentationRef; score: number }[] = [];

    // Common generic words that should not count as specific topic matches
    const stopWords = new Set([
      'the', 'and', 'with', 'for', 'from', 'when', 'into', 'that', 'this', 'what',
      'which', 'does', 'been', 'have', 'more', 'code', 'file', 'make', 'help', 'user',
      'work', 'page', 'error', 'failed', 'issue', 'problem', 'test', 'run', 'using',
      'container', 'system', 'application', 'service', 'server', 'client', 'running',
      'start', 'docker', 'python', 'node', 'react', 'postgres', 'postgresql', 'sqlite', 'git'
    ]);

    const words = qLower
      .split(/[^a-zA-Z0-9_.-]+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    for (const source of APPROVED_DOC_SOURCES) {
      const isSourceCategoryMatch = catLower && source.category.toLowerCase().includes(catLower);
      const isSourceIdMatch = qLower.includes(source.id) || qLower.includes(source.category.toLowerCase());

      for (const topic of source.verified_topics) {
        let topicScore = 0;
        const topicKey = topic.topic.toLowerCase();
        const titleLower = topic.title.toLowerCase();
        const summaryLower = topic.summary.toLowerCase();

        // 1. Specific technical keyword matches against the topic itself
        for (const word of words) {
          if (topicKey === word) {
            topicScore += 30;
          } else if (topicKey.includes(word)) {
            topicScore += 20;
          }
          if (titleLower.includes(` ${word} `) || titleLower.startsWith(`${word} `) || titleLower.endsWith(` ${word}`)) {
            topicScore += 16;
          } else if (titleLower.includes(word)) {
            topicScore += 8;
          }
          if (summaryLower.includes(word)) {
            topicScore += 4;
          }
        }

        // 2. High-precision technical phrase and error signature matches
        if ((qLower.includes('137') || qLower.includes('oom')) && topicKey.includes('oom')) {
          topicScore += 50;
        }
        if ((qLower.includes('cors') || qLower.includes('access-control') || qLower.includes('preflight')) && topicKey.includes('cors')) {
          topicScore += 50;
        }
        if ((qLower.includes('connection slots') || qLower.includes('max_connections') || (qLower.includes('postgres') && qLower.includes('pool'))) && topicKey.includes('connections')) {
          topicScore += 50;
        }
        if ((qLower.includes('modulenotfound') || qLower.includes('no module named') || qLower.includes('venv') || qLower.includes('virtualenv')) && (topicKey.includes('venv') || topicKey.includes('exceptions'))) {
          topicScore += 50;
        }
        if (qLower.includes('hydration') && topicKey.includes('hydration')) {
          topicScore += 50;
        }
        if ((qLower.includes('heap') || qLower.includes('heap_size_limit') || qLower.includes('max-old-space-size')) && (topicKey.includes('process') || topicKey.includes('memory'))) {
          topicScore += 45;
        }
        if ((qLower.includes('git merge') || qLower.includes('conflict') || qLower.includes('merge conflict')) && topicKey.includes('merge')) {
          topicScore += 50;
        }
        if (qLower.includes('reflog') && topicKey.includes('reflog')) {
          topicScore += 50;
        }
        if ((qLower.includes('econnrefused') || qLower.includes('502') || qLower.includes('bad gateway') || qLower.includes('status code')) && topicKey.includes('status-codes')) {
          topicScore += 45;
        }

        // CRITICAL: Only consider topics with direct, genuine match with the problem (>= 20 score)
        // Source relevance acts only as a booster for genuinely matching topics
        if (topicScore >= 20) {
          if (isSourceCategoryMatch) topicScore += 10;
          if (isSourceIdMatch) topicScore += 5;

          results.push({
            ref: {
              title: topic.title,
              url: topic.url,
              source_name: source.name,
              relevant_excerpt: topic.summary,
              verified: true
            },
            score: topicScore
          });
        }
      }
    }

    // Sort by relevance score descending and deduplicate by URL
    results.sort((a, b) => b.score - a.score);
    const seenUrls = new Set<string>();
    const deduplicated: DocumentationRef[] = [];

    for (const item of results) {
      if (!seenUrls.has(item.ref.url)) {
        seenUrls.add(item.ref.url);
        deduplicated.push(item.ref);
        if (deduplicated.length >= limit) break;
      }
    }

    return deduplicated;
  }

  /**
   * Returns all approved sources for public documentation directory.
   */
  public static getAllSources(): DocSource[] {
    return APPROVED_DOC_SOURCES;
  }
}
