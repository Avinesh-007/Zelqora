import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Terminal, 
  ShieldCheck, 
  TrendingUp, 
  BookOpen, 
  CheckCircle2,
  XCircle,
  HelpCircle,
  Cpu,
  Layers,
  RotateCcw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { Guide } from '../types';
import { SEO } from '../components/common/SEO';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [problemDescription, setProblemDescription] = useState('');
  const [featuredGuides, setFeaturedGuides] = useState<Guide[]>([]);

  useEffect(() => {
    api.getPublishedGuides()
      .then(res => {
        setFeaturedGuides(res.guides.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  const handleStartDiagnosing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;
    navigate('/troubleshoot', { state: { initialDescription: problemDescription.trim() } });
  };

  const exampleStarters = [
    {
      label: 'Docker Exit 137 (OOMKilled)',
      text: 'Our backend Docker container stops abruptly under heavy traffic. docker inspect reports exit code 137 without an application stack trace.'
    },
    {
      label: 'CORS Origin Blocked',
      text: 'Browser fetch request from localhost:5173 to localhost:3001 is blocked with "No Access-Control-Allow-Origin header is present".'
    },
    {
      label: 'PostgreSQL Connection Exhaustion',
      text: 'PostgreSQL rejects new application queries with "FATAL: remaining connection slots are reserved for non-replication superuser connections".'
    },
    {
      label: 'Python ModuleNotFoundError on Windows',
      text: 'Package is listed in pip list, but running python app.py throws "ModuleNotFoundError: No module named fastapi" in VS Code on Windows.'
    }
  ];

  const commonAreas = [
    {
      title: 'Docker & Containers',
      description: 'Exit code 137 OOM kills, resource limits, bridge networking, and compose mounts.',
      category: 'Docker & Deployment'
    },
    {
      title: 'Node.js & JavaScript',
      description: 'Heap memory exhaustion, unhandled promise rejections, event loop lag, and connection resets.',
      category: 'Node.js'
    },
    {
      title: 'Python & Environments',
      description: 'Virtual environment interpreter path conflicts, pip vs system package collisions, and Windows execution policies.',
      category: 'Python & Tooling'
    },
    {
      title: 'HTTP APIs & CORS',
      description: 'Missing preflight OPTIONS handling, credentialed cookie rejections, and reverse proxy timeouts.',
      category: 'HTTP & APIs'
    },
    {
      title: 'PostgreSQL & Databases',
      description: 'Max connection slot exhaustion, uncommitted idle-in-transaction locks, and query timeouts.',
      category: 'PostgreSQL & Databases'
    },
    {
      title: 'React & Frontend',
      description: 'Hydration mismatches between SSR and browser mounts, stale state closures, and infinite render cascades.',
      category: 'React & Frontend'
    }
  ];

  const workflowSteps = [
    {
      number: '01',
      title: 'Describe & Sanitize',
      description: 'Provide your error message, command output, or symptom. Automated redaction algorithms filter tokens and credentials before processing.'
    },
    {
      number: '02',
      title: 'Ranked Hypotheses',
      description: 'Review the most plausible causes ordered by evidence and likelihood, highlighting what details are still missing.'
    },
    {
      number: '03',
      title: 'Run Safe Local Checks',
      description: 'Execute suggested read-only diagnostic commands on your machine and paste the output to update the diagnosis.'
    },
    {
      number: '04',
      title: 'Step-by-Step Fix',
      description: 'Follow an ordered solution backed by official documentation, complete with rollback instructions if you need to undo changes.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      <SEO
        title="Zelqora — Solve Technical Problems with Clarity"
        description="Describe your technical issue, investigate the likely cause, and work through a clear solution with guided diagnostic checks."
        canonicalPath="/"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Zelqora',
          url: 'https://zelqora.example.com',
          description: 'Technical troubleshooting platform with adaptive diagnostic checks and verified documentation grounding.'
        }}
      />
      
      {/* Hero Section */}
      <section className="pt-10 sm:pt-16 pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <span>Evidence-Based Technical Troubleshooting</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Solve technical problems with clarity.
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Describe your technical issue, investigate the likely cause, and work through a clear solution with guided diagnostic checks.
            </p>
          </div>

          {/* Primary Problem Input Card */}
          <Card padding="md" className="border-slate-300 shadow-sm text-left max-w-2xl mx-auto mt-4">
            <form onSubmit={handleStartDiagnosing} className="space-y-3">
              <label htmlFor="problem-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                What technical problem are you experiencing?
              </label>

              <textarea
                id="problem-input"
                rows={3}
                value={problemDescription}
                onChange={e => setProblemDescription(e.target.value)}
                placeholder="Paste an error message or describe what failed (e.g., container exited with code 137, or CORS policy blocked fetch request)..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                required
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Private and sanitized. Do not include passwords or secret keys.</span>
                </span>

                <Button type="submit" size="md" variant="primary" className="w-full sm:w-auto shrink-0">
                  Diagnose My Problem
                </Button>
              </div>
            </form>
          </Card>

          {/* Example Problems (Clearly Identified as Examples) */}
          <div className="max-w-2xl mx-auto text-left space-y-2 pt-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Sample Problem Starters (click to test an example):
            </div>
            <div className="flex flex-wrap gap-2">
              {exampleStarters.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProblemDescription(ex.text)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 transition-colors text-left"
                >
                  <span className="text-blue-600 font-semibold mr-1.5 font-mono text-[10px]">Example:</span>
                  <span className="font-medium text-slate-900">{ex.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* How Troubleshooting Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How Troubleshooting Works on Zelqora
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A systematic, safe approach modeled after real systems engineering investigation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map(step => (
            <div 
              key={step.number}
              className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 relative shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {step.number}
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What Zelqora Can and Cannot Do (Honest Operational Scope) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-xs">
          <div className="text-left space-y-1 border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              What Zelqora Can and Cannot Do
            </h2>
            <p className="text-xs text-slate-500">
              Clear expectations build reliable engineering trust. Here is how our diagnostic platform operates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* What it Can Do */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>What Zelqora Does</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">&bull;</span>
                  <span><strong>Ranks probable causes:</strong> Evaluates your symptoms against known failure modes and ranks hypotheses by supporting evidence.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">&bull;</span>
                  <span><strong>Suggests safe diagnostic checks:</strong> Provides non-destructive inspection commands for you to run in your terminal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">&bull;</span>
                  <span><strong>Adapts to your test results:</strong> Updates probabilities and eliminates ruled-out hypotheses when you submit command outputs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">&bull;</span>
                  <span><strong>References official documentation:</strong> Grounded in verified documentation from Docker, Node.js, Python, PostgreSQL, and React.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">&bull;</span>
                  <span><strong>Provides rollback guidance:</strong> Explains how to safely revert changes if a suggested fix does not resolve the issue.</span>
                </li>
              </ul>
            </div>

            {/* What it Cannot Do */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>What Zelqora Does Not Do</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5">&bull;</span>
                  <span><strong>Zero remote execution:</strong> We never run code, commands, or scripts on your computer or servers. You inspect and execute everything yourself.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5">&bull;</span>
                  <span><strong>No credential storage:</strong> We never ask for passwords, private keys, or API credentials. Automated filters scrub them before analysis.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5">&bull;</span>
                  <span><strong>No universal guarantee:</strong> We cannot promise every software defect can be resolved, especially intermittent hardware faults or closed-source proprietary bugs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5">&bull;</span>
                  <span><strong>No fabricated answers:</strong> If live AI analysis is unavailable, we use transparent offline diagnostic pattern matching and inform you honestly.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Common Technical Areas */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-left space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Supported Problem Domains
          </h2>
          <p className="text-xs text-slate-500">
            Explore frequent failure categories or begin an investigation with your specific error message.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {commonAreas.map((area, idx) => (
            <Link
              key={idx}
              to="/troubleshoot"
              className="group p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all space-y-1.5"
            >
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                <span>{area.title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {area.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Practical Troubleshooting Guides */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Practical Troubleshooting Guides
            </h2>
            <p className="text-xs text-slate-500">
              In-depth, tested walkthroughs for common developer errors and infrastructure failures.
            </p>
          </div>
          <Link to="/guides">
            <Button size="sm" variant="outline" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              Browse All Guides
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredGuides.map(guide => (
            <Link
              key={guide.id}
              to={`/guides/${guide.slug}`}
              className="group p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant="blue">{guide.category}</Badge>
                <span className="text-[11px] text-slate-400">
                  Reviewed {new Date(guide.last_reviewed_at).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                  {guide.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>By {guide.author_name}</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Read Guide &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Clear Bottom CTA */}
      <section className="max-w-3xl mx-auto px-4 text-center space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Facing a technical bug or crash right now?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Start a diagnostic session now. Describe what happened, run safe checks, and work toward a verified fix.
        </p>
        <Link to="/troubleshoot">
          <Button size="md" variant="primary">
            Diagnose My Problem
          </Button>
        </Link>
      </section>

    </div>
  );
};
