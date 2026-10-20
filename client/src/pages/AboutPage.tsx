import React from 'react';
import { Activity, ShieldCheck, Cpu, Terminal, Users, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Our Mission & Architecture
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About Zelqora
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Zelqora is an evidence-driven technical troubleshooting platform built for software developers, systems engineers, and DevOps practitioners.
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
        
        <Card padding="lg" className="border-slate-200 space-y-3 bg-white">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Why Zelqora Was Built</span>
          </h2>
          <p>
            When technical infrastructure breaks—whether a container terminates with exit code 137, an API blocks requests due to CORS, or database connection pools saturate—traditional search engines return outdated forum threads, and conversational chatbots often hallucinate non-existent flags or suggest destructive operations.
          </p>
          <p>
            Zelqora replaces open-ended guesswork with an <strong>adaptive diagnostic workflow</strong>: intake &rarr; ranked hypotheses &rarr; safe diagnostic tests &rarr; user evidence submission &rarr; verified resolution.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Remote Execution Policy</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zelqora strictly does not execute commands on user computers or servers. All diagnostic tests are provided as clear, inspected shell commands for you to review and run yourself.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>Automated Secret Redaction</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              User logs, stack traces, and configurations are filtered through multi-pattern secret redaction algorithms to strip API keys, private keys, database credentials, and authorization tokens before analysis.
            </p>
          </div>
        </div>

        <Card padding="lg" className="border-slate-200 space-y-3 bg-white">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <span>Technical Foundation</span>
          </h2>
          <p>
            The platform is built on modern web engineering standards:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
            <li><strong>Frontend:</strong> React 19, TypeScript, Tailwind CSS, Vite, and Lucide icons.</li>
            <li><strong>Backend:</strong> Node.js, Express, TypeScript, and SQLite in WAL mode.</li>
            <li><strong>AI Diagnostics:</strong> Official supported Google Gemini SDK (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">@google/genai</code>) with strict schema validation.</li>
            <li><strong>Editorial System:</strong> Multi-stage verification gatekeeper ensuring unreviewed AI drafts cannot be published publicly.</li>
          </ul>
        </Card>

      </div>

    </div>
  );
};
