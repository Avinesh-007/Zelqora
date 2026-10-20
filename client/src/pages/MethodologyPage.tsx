import React from 'react';
import { Layers, Terminal, ShieldCheck, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Scientific Engineering Process
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Diagnostic Methodology & Limitations
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          How Zelqora isolates technical defects, avoids hallucinated solutions, and prioritizes production safety.
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-8 leading-relaxed">
        
        {/* Core Principles */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>The 10-Step Adaptive Diagnostic Protocol</span>
          </h2>
          <p>
            Unlike generic AI chat interfaces that guess fixes immediately, Zelqora follows an iterative, hypothesis-testing diagnostic framework modeled after senior site reliability engineering (SRE) incident investigation:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <span className="font-bold text-slate-900">1. Problem Intake</span>
              <p className="text-xs text-slate-500">Collecting symptom descriptions, error strings, and runtime versions.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <span className="font-bold text-slate-900">2. Secret Redaction</span>
              <p className="text-xs text-slate-500">Stripping API keys, tokens, and DB passwords before analysis.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <span className="font-bold text-slate-900">3. Initial Assessment</span>
              <p className="text-xs text-slate-500">Categorizing severity, affected subsystems, and blast radius.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <span className="font-bold text-slate-900">4. Clarifying Questions</span>
              <p className="text-xs text-slate-500">Targeted questions to isolate the operating context.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <span className="font-bold text-slate-900">5. Ranked Hypotheses</span>
              <p className="text-xs text-slate-500">Formulating causes weighted by evidence probability (0-100%).</p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <span className="font-bold text-slate-900">6. Safe Diagnostic Tests</span>
              <p className="text-xs text-slate-500">Prescribing read-only commands with expected output interpretations.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <span className="font-bold text-slate-900">7. Evidence Ingestion</span>
              <p className="text-xs text-slate-500">User submits actual terminal output and observed behavior.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <span className="font-bold text-slate-900">8. Updated Analysis</span>
              <p className="text-xs text-slate-500">Revising probabilities or identifying conclusive root causes.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <span className="font-bold text-slate-900">9. Verified Action Plan</span>
              <p className="text-xs text-slate-500">Providing step-by-step fix with rollback procedures.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
              <span className="font-bold text-slate-900">10. Verification & Summary</span>
              <p className="text-xs text-slate-500">Confirming the issue is resolved and archiving session notes.</p>
            </div>
          </div>
        </section>

        {/* Safety Rules */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Safety Invariants</span>
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
            <li><strong>Read-Only First:</strong> Always prescribe inspection and query commands before state-changing write operations.</li>
            <li><strong>Elevation Warnings:</strong> Clearly highlight when commands require <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">sudo</code>, root privileges, or container restarts.</li>
            <li><strong>Rollback Instructions:</strong> Every proposed configuration change or script must provide an explicit undo procedure.</li>
            <li><strong>No Credential Ingestion:</strong> Zelqora will never request passwords, private keys, or secret tokens.</li>
          </ul>
        </section>

        {/* Realistic Limitations */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Known Technical Limitations</span>
          </h2>
          <p>
            Transparency is central to engineering trust. Zelqora acknowledges clear operational boundaries:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-2">
            <li><strong>Intermittent Concurrency Bugs:</strong> Race conditions and thread deadlocks that cannot be deterministically reproduced require distributed tracing tools rather than static prompt reasoning.</li>
            <li><strong>Hardware Degradation:</strong> Failing disk sectors, overheating CPUs, and silent network packet drops cannot be fixed by software configuration adjustments.</li>
            <li><strong>Closed-Source Proprietary Blobs:</strong> Without public documentation or observable telemetry, diagnostic hypotheses remain speculative.</li>
          </ul>
        </section>

      </div>

    </div>
  );
};
