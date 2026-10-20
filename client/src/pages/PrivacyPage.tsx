import React from 'react';
import { ShieldCheck, Lock, Eye, Database, Server } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Transparency & Data Rights
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last updated: October 2026 &bull; Truthful operational disclosure
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-8 leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>1. Overview & Core Privacy Principles</span>
          </h2>
          <p>
            At Zelqora, we recognize that troubleshooting technical systems often involves sharing runtime logs, environment configuration files, and error stack traces. We treat this data with rigorous confidentiality. We do not sell your personal data, nor do we use private customer troubleshooting logs for advertising profiling.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>2. Information We Collect</span>
          </h2>
          <p>We collect only the minimum information necessary to provide the troubleshooting service:</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-2">
            <li><strong>Account Data:</strong> If you register, we store your email address and a cryptographically hashed representation of your password (via bcrypt). We never store plaintext passwords.</li>
            <li><strong>Investigation Data:</strong> Problem descriptions, operating system, runtime versions, submitted diagnostic test outputs, and resolution summaries.</li>
            <li><strong>Guest Sessions:</strong> If you use Zelqora without logging in, a temporary guest UUID is maintained in your browser localStorage to allow you to continue your session across page refreshes.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>3. Automated Secret Redaction</span>
          </h2>
          <p>
            Before your logs or error descriptions are saved to our database or transmitted to our AI diagnostic engine, our server executes automated redaction algorithms to replace sensitive credentials:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-2">
            <li>AWS Access Keys (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">AKIA...</code>)</li>
            <li>GitHub Personal Access Tokens (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">ghp_...</code>)</li>
            <li>HTTP Bearer Tokens</li>
            <li>RSA / DSA / OpenSSH Private Keys</li>
            <li>Database Connection URIs containing plaintext passwords</li>
            <li>Common JSON/YAML secret, token, and password assignments</li>
          </ul>
          <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <strong>Important Limitation:</strong> Automated regex redaction is not an absolute guarantee. Users are strongly advised to manually sanitize internal IP addresses, proprietary company names, and sensitive customer data before submitting.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-600" />
            <span>4. Google Gemini API Data Transmission</span>
          </h2>
          <p>
            To generate structured hypotheses and test recommendations, redacted problem descriptions and sanitized test outputs are transmitted via encrypted HTTPS to the Google Gemini API (via the official <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">@google/genai</code> SDK).
          </p>
          <p>
            Per Google API developer policies, enterprise API data is processed according to Google Cloud terms and is not used to train public foundation models without explicit consent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            5. Cookies & Local Storage
          </h2>
          <p>
            Zelqora uses essential <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">HttpOnly</code>, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">SameSite=Lax</code> cookies exclusively for authentication sessions. We do not use third-party tracking cookies or social network beacons.
          </p>
          <p>
            If monetization or Google AdSense is enabled by the site operator in the future, standard advertising cookies (such as the Google DoubleClick cookie) may be deployed to serve relevant ads. You will be provided notice and controls per Google Publisher Policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            6. Data Retention & Your Deletion Rights
          </h2>
          <p>
            You have full control over your data:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-2">
            <li>You can delete individual investigations at any time directly from the Workspace History panel.</li>
            <li>You can request complete account and data deletion by contacting <span className="font-mono text-slate-800">security@zelqora.example.com</span>.</li>
          </ul>
        </section>

      </div>

    </div>
  );
};
