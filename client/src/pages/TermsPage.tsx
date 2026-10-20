import React from 'react';
import { AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Legal Agreement & Terms of Service
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Terms of Use
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last updated: October 2026 &bull; Read carefully before using the diagnostic platform
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-8 leading-relaxed">
        
        <Card padding="md" className="border-amber-200 bg-amber-50/50 space-y-2 text-amber-950">
          <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Essential Diagnostic Disclaimer</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Zelqora provides AI-assisted technical troubleshooting advice, diagnostic test recommendations, and reference links to official documentation. Zelqora <strong>never promises or guarantees</strong> that every technical issue, bug, or infrastructure malfunction can be resolved. All diagnostic commands and configuration changes must be reviewed by you before execution.
          </p>
        </Card>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the Zelqora website, API endpoints, or troubleshooting workspace, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree with any part of these terms, you must discontinue using the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            2. User Responsibility & Command Review
          </h2>
          <p>
            You acknowledge and agree that:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-2">
            <li>You are solely responsible for reviewing any shell commands, script snippets, or configuration alterations recommended by the diagnostic engine before executing them on your computer, cluster, or server.</li>
            <li>You must maintain independent, verified backups of all databases, configuration files, and source code before executing state-changing procedures.</li>
            <li>Zelqora does not remotely execute code on your machine and cannot verify your specific hardware or production safety policies.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            3. Prohibited Activities
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-2">
            <li>Submit malicious shell scripts, malware, exploits, or unredacted confidential credentials belonging to third parties.</li>
            <li>Circumvent or attempt to circumvent API rate limiters, security headers, or authentication tokens.</li>
            <li>Use automated scrapers to mass-harvest technical troubleshooting guides without attribution.</li>
            <li>Attempt prompt injection or server-side request forgery (SSRF) attacks against documentation retrieval services.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            4. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law, Zelqora and its developers shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from lost data, system downtime, production interruptions, or corrupted configurations arising out of the use of our diagnostic recommendations.
          </p>
        </section>

      </div>

    </div>
  );
};
