import React from 'react';
import { ShieldAlert, CheckCircle2, FileCheck, RefreshCw, Mail } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { SEO } from '../components/common/SEO';

export const EditorialPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <SEO
        title="Editorial Standards & Review Policy — Zelqora"
        description="Learn how Zelqora verifies troubleshooting guides through empirical testing, official documentation grounding, and strict human technical review."
        canonicalPath="/editorial-policy"
      />
      
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Content Integrity & Quality Standards
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Editorial Standards & Review Policy
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          How Zelqora researches, verifies, and updates public technical troubleshooting guides.
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-8 leading-relaxed">
        
        {/* Core Principle: No Auto-Publishing */}
        <Card padding="md" className="border-blue-200 bg-blue-50/50 space-y-2 text-blue-950">
          <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>Strict Human Review Gatekeeper</span>
          </div>
          <p className="text-xs text-blue-900 leading-relaxed">
            <strong>AI-generated drafts are never published automatically to our public catalog.</strong> Every permanent troubleshooting guide published on Zelqora must pass multi-step peer technical review, empirical command verification, and official source linking.
          </p>
        </Card>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            <span>1. Mandatory Publication Standards</span>
          </h2>
          <p>
            Before any guide transitions from <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">draft</code> to <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">published</code>, it must meet four criteria:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
            <li><strong>Technical Reproducibility:</strong> All commands, flags, and error patterns must reflect real operating system, container, and language behaviors.</li>
            <li><strong>Official Source Verification:</strong> Every external reference must point directly to approved official technical documentation (e.g. Node.js, Docker, Python, PostgreSQL, React, MDN).</li>
            <li><strong>Substantial Originality:</strong> We strictly prohibit duplicating verbatim documentation pages or mass-generating thin programmatic keyword variations for every permutation of an error message.</li>
            <li><strong>Practical Rollback Advice:</strong> Every guide must provide instructions on how to undo or revert the proposed remediation if the system behaves unexpectedly.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-600" />
            <span>2. Lifecycle & Stale Content Review</span>
          </h2>
          <p>
            Software platforms evolve rapidly. Deprecated flags, runtime API changes, and version upgrades can make older advice inaccurate. Zelqora maintains an active review cycle:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
            <li>Guides display an explicit <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">Last Reviewed Date</code> so readers know the exact temporal baseline of the instructions.</li>
            <li>Guides that reach major version deprecation (e.g., Node.js LTS shifts or Docker CLI syntax changes) are marked as <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">needs_review</code> or moved to <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">archived</code>.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>3. Submitting Corrections & Feedback</span>
          </h2>
          <p>
            If you identify a technical inaccuracy, broken command, or outdated flag in any published Zelqora guide, please notify our editorial staff at <span className="font-mono text-slate-800">editorial@zelqora.example.com</span>. We review and verify all reported corrections against official source releases within 3 business days.
          </p>
        </section>

      </div>

    </div>
  );
};
