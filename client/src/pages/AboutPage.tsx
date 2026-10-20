import React from 'react';
import { Activity, ShieldCheck, Terminal, CheckCircle2, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <SEO
        title="About Zelqora — Technical Troubleshooting Platform"
        description="Learn about Zelqora's mission, evidence-based diagnostic methodology, zero remote execution safety policy, and operational boundaries."
        canonicalPath="/about"
      />
      
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Platform Overview
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About Zelqora
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Zelqora is an evidence-driven technical troubleshooting platform built to help developers, sysadmins, and engineers diagnose and resolve real technical failures systematically.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        
        {/* Core Purpose */}
        <Card padding="lg" className="border-slate-200 space-y-3 bg-white shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Why Zelqora Was Built</span>
          </h2>
          <p>
            When technical infrastructure breaks—whether a container exits unexpectedly with code 137, an API request is blocked by CORS headers, a database connection pool runs out of sockets, or a Python virtual environment fails on Windows—traditional search engines often return outdated forum threads, and generic chatbots frequently suggest hallucinated flags or destructive commands.
          </p>
          <p>
            Zelqora replaces open-ended guesswork with an <strong>adaptive diagnostic investigation</strong>: you describe the problem, receive safe diagnostic tests to run on your own machine, submit test results, and follow a clear, verifiable remediation step by step.
          </p>
        </Card>

        {/* What Users Can Expect */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            What You Can Expect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Evidence-Ranked Hypotheses</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rather than claiming single-cause certainty, Zelqora presents plausible causes ranked by supporting evidence and identifies what information is still missing.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Remote Execution</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zelqora never runs arbitrary code or scripts on your system. Diagnostic checks are provided as readable commands for you to inspect and run in your own terminal.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <RotateCcw className="w-4 h-4" />
                <span>Step-by-Step Fixes & Rollbacks</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Remediation instructions include rollback guidance where appropriate, so you know how to safely undo configuration changes if an issue persists.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <Terminal className="w-4 h-4" />
                <span>Credential Privacy & Redaction</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our server actively scrubs common token, API key, and password formats from submitted logs and prompts before analysis to safeguard your environment.
              </p>
            </div>
          </div>
        </div>

        {/* Limitations & Honesty */}
        <Card padding="lg" className="border-slate-200 space-y-3 bg-white shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Honest Technical Boundaries</span>
          </h2>
          <p>
            We believe trust comes from honest communication about limitations:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-1">
            <li><strong>No Guarantee of Universal Resolution:</strong> Complex software systems have unique edge cases; we help isolate causes, but cannot promise every bug can be fixed remotely.</li>
            <li><strong>Self-Executed Actions:</strong> You remain in total control of your environment. Always review commands before running them.</li>
            <li><strong>Offline Fallbacks:</strong> If external AI services are unavailable, Zelqora uses verified offline diagnostic pattern matching and explicitly informs you of the fallback mode.</li>
          </ul>
        </Card>

        {/* Action Link */}
        <div className="pt-2 flex items-center justify-between p-6 rounded-xl bg-slate-100 border border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ready to troubleshoot?</h3>
            <p className="text-xs text-slate-500 mt-0.5">Describe your error message or failure symptom to begin an investigation.</p>
          </div>
          <Link to="/workspace">
            <Button size="md" variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
              Diagnose a Problem
            </Button>
          </Link>
        </div>

      </div>

    </div>
  );
};
