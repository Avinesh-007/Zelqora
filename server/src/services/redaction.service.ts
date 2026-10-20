/**
 * Zelqora Secret Redaction Service
 * Strips known tokens, API keys, private keys, database credentials,
 * and authentication secrets before data is stored or passed to the AI model.
 */

interface RedactionResult {
  redactedText: string;
  hasRedactions: boolean;
  redactedCount: number;
  detectedTypes: string[];
}

export class RedactionService {
  private static patterns: { type: string; regex: RegExp; replacement: string }[] = [
    // AWS Access Key ID
    {
      type: 'AWS Access Key',
      regex: /(?:AKIA|ASIA|AROA)[0-9A-Z]{16}/g,
      replacement: '[REDACTED_AWS_KEY]'
    },
    // GitHub Tokens (Personal access tokens, OAuth tokens, App tokens)
    {
      type: 'GitHub Token',
      regex: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,255}|github_pat_[A-Za-z0-9_]{40,255}/g,
      replacement: '[REDACTED_GITHUB_TOKEN]'
    },
    // Generic Bearer Token
    {
      type: 'Bearer Token',
      regex: /(?:bearer\s+)[a-zA-Z0-9_\-\.]{20,}/gi,
      replacement: 'Bearer [REDACTED_BEARER_TOKEN]'
    },
    // Standard Private Keys
    {
      type: 'Private Key',
      regex: /-----BEGIN(?: [A-Z0-9_-]+)? PRIVATE KEY-----[\s\S]*?-----END(?: [A-Z0-9_-]+)? PRIVATE KEY-----/g,
      replacement: '[REDACTED_PRIVATE_KEY]'
    },
    // Database connection string with password (postgres, mysql, mongodb, redis, etc.)
    {
      type: 'Database Connection URI with Credentials',
      regex: /(?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis|amqp):\/\/([^:]+):([^@]+)@/gi,
      replacement: '$1:[REDACTED_PASSWORD]@'
    },
    // JWT Tokens
    {
      type: 'JSON Web Token (JWT)',
      regex: /\beyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_\-]+/g,
      replacement: '[REDACTED_JWT_TOKEN]'
    },
    // Common API Key assignment in env, JSON or headers
    {
      type: 'API Key Assignment',
      regex: /(?:api_?key|secret|token|auth_?token|client_?secret|access_?token)\s*(?::|=)\s*["']?([a-zA-Z0-9_\-\.]{16,})["']?/gi,
      replacement: '$1: "[REDACTED_API_KEY]"'
    },
    // Common password fields in JSON, YAML or CLI flags
    {
      type: 'Password Assignment',
      regex: /(?:password|passwd|pwd)\s*(?::|=|--password\s+)["']?([^\s"']{4,})["']?/gi,
      replacement: 'password: "[REDACTED_PASSWORD]"'
    },
    // Generic high entropy hex/base64 strings labeled as key
    {
      type: 'Secret Hex String',
      regex: /(?:secret_key|private_key|app_secret)\s*(?::|=)\s*["']?[0-9a-fA-F]{32,64}["']?/gi,
      replacement: 'secret_key: "[REDACTED_SECRET]"'
    }
  ];

  /**
   * Redacts sensitive secrets from raw user-provided text, logs, configs, or code.
   */
  public static redact(text: string): RedactionResult {
    if (!text || typeof text !== 'string') {
      return {
        redactedText: text || '',
        hasRedactions: false,
        redactedCount: 0,
        detectedTypes: []
      };
    }

    let result = text;
    let totalCount = 0;
    const detected = new Set<string>();

    for (const pattern of this.patterns) {
      const matches = result.match(pattern.regex);
      if (matches && matches.length > 0) {
        totalCount += matches.length;
        detected.add(pattern.type);
        result = result.replace(pattern.regex, pattern.replacement);
      }
    }

    return {
      redactedText: result,
      hasRedactions: totalCount > 0,
      redactedCount: totalCount,
      detectedTypes: Array.from(detected)
    };
  }

  /**
   * Recursively redacts strings inside an object or array.
   */
  public static redactObject<T>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      if (typeof obj === 'string') {
        return this.redact(obj).redactedText as unknown as T;
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.redactObject(item)) as unknown as T;
    }

    const output: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'string') {
        output[key] = this.redact(val).redactedText;
      } else if (val && typeof val === 'object') {
        output[key] = this.redactObject(val);
      } else {
        output[key] = val;
      }
    }

    return output as T;
  }
}
