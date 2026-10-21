import React from 'react';
import { ShieldCheck, Lock, Eye, Database, Server } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { SEO } from '../components/common/SEO';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <SEO
        title="Privacy Policy — Zelqora Technical Troubleshooting"
        description="Learn how Zelqora handles technical diagnostic inputs, automated secret redaction, external AI processing, and your data deletion rights."
        canonicalPath="/privacy"
      />
      
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
            5. Cookies & Local Storage Technologies
          </h2>
          <p>
            Zelqora uses essential <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">HttpOnly</code>, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">SameSite=Lax</code> cookies exclusively to maintain secure authentication sessions. We also store a random anonymous guest token in your browser's local storage so you can refresh or return to your active troubleshooting investigations without losing progress.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            6. Third-Party Vendors & Advertising Disclosures
          </h2>
          <p>
            We may partner with third-party vendors, including Google, to serve relevant advertisements across the website to support platform operations:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
            <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites on the Internet.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve ads to users based on their visits to Zelqora and other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising at any time by visiting <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Google Ads Settings</a>.</li>
            <li>Alternatively, users can opt out of third-party vendor cookies for personalized advertising by visiting the <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Network Advertising Initiative / AboutAds Opt-Out Page</a>.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            7. Data Retention & User Deletion Rights (GDPR & CCPA)
          </h2>
          <p>
            You retain full rights and control over your data:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-2">
            <li>You can delete individual investigations at any time directly from the Workspace History panel.</li>
            <li>You can export or request complete account and data deletion at any time by submitting a request through our <a href="/contact" className="text-blue-600 hover:underline font-medium">Contact Form</a> or by emailing our official contact at <a href="mailto:aviavinesh1785@gmail.com" className="text-blue-600 hover:underline font-medium">aviavinesh1785@gmail.com</a>.</li>
            <li>We do not sell, rent, or trade your personal information or technical troubleshooting input to data brokers.</li>
          </ul>
        </section>

      </div>

    </div>
  );
};
