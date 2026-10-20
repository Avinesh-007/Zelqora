import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Terminal, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight, 
  Layers, 
  Cpu, 
  HelpCircle, 
  Sliders, 
  Search,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AdSlot } from '../components/ads/AdSlot';
import { api } from '../services/api';
import { Guide } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [quickInput, setQuickInput] = useState('');
  const [featuredGuides, setFeaturedGuides] = useState<Guide[]>([]);

  useEffect(() => {
    api.getPublishedGuides()
      .then(res => {
        setFeaturedGuides(res.guides.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    navigate('/troubleshoot', { state: { initialDescription: quickInput.trim() } });
  };

  const categories = [
    { name: 'Docker & Containers', count: 'Exit codes, OOM 137, cgroups', icon: '🐳' },
    { name: 'Node.js & Express', count: 'Heap memory, event loop, CORS', icon: '🟢' },
    { name: 'Python & Virtualenvs', count: 'ModuleNotFoundError, pip, venv', icon: '🐍' },
    { name: 'React & Frontend', count: 'Hydration mismatches, hooks, SSR', icon: '⚛️' },
    { name: 'PostgreSQL & Databases', count: 'Max connections, locks, pools', icon: '🐘' },
    { name: 'Git & Deployment', count: 'Merge conflicts, reflog, rebases', icon: '📦' }
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>AI Troubleshooting Platform Built on Verifiable Evidence</span>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Investigate Technical Failures with Evidence-Based AI.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Zelqora diagnoses complex software defects through adaptive follow-up questions, safe read-only tests, ranked hypotheses, and verified official documentation.
            </p>
          </div>

          {/* Quick Problem Launcher */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleQuickSubmit} className="relative flex flex-col sm:flex-row gap-2.5 p-2 bg-white rounded-2xl border border-slate-300 shadow-md">
              <div className="relative flex-1 flex items-center pl-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={quickInput}
                  onChange={e => setQuickInput(e.target.value)}
                  placeholder="Describe your error (e.g. Docker exit code 137 or CORS header blocked)..."
                  className="w-full pl-3 pr-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
              </div>
              <Button type="submit" size="md" variant="primary" className="shrink-0">
                Start Investigation
              </Button>
            </form>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Quick Starters:</span>
              <button 
                type="button" 
                onClick={() => setQuickInput('Docker container exits with status code 137 under load')} 
                className="hover:text-blue-600 underline underline-offset-2"
              >
                Docker 137 OOM
              </button>
              <span>&bull;</span>
              <button 
                type="button" 
                onClick={() => setQuickInput('CORS policy error blocking React fetch from Express backend')} 
                className="hover:text-blue-600 underline underline-offset-2"
              >
                CORS Origin Blocked
              </button>
              <span>&bull;</span>
              <button 
                type="button" 
                onClick={() => setQuickInput('PostgreSQL connection exhaustion: remaining connection slots reserved')} 
                className="hover:text-blue-600 underline underline-offset-2"
              >
                Postgres Connection Pool
              </button>
            </div>
          </div>

          {/* Core Trust Highlights */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Server Execution</span>
              </div>
              <p className="text-slate-500 text-[11px]">Safe commands; tests run only on your machine.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Ranked Hypotheses</span>
              </div>
              <p className="text-slate-500 text-[11px]">Plausible causes weighted by evidence probability.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Verified Docs Only</span>
              </div>
              <p className="text-slate-500 text-[11px]">Official URLs from Node, Docker, React, Postgres.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Gemini 2.5 Engine</span>
              </div>
              <p className="text-slate-500 text-[11px]">Structured JSON schema diagnostic reasoning.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Technical Problem Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Supported Diagnostic Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Targeted diagnostic knowledge bases grounded in official documentation and verified recovery procedures.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to="/troubleshoot"
              className="group p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all flex items-start gap-4"
            >
              <div className="text-2xl p-2.5 rounded-lg bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                {cat.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {cat.count}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* The 4-Step Diagnostic Workflow */}
      <section className="bg-slate-900 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Systematic Troubleshooting
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              How Zelqora Reaches Conclusive Diagnoses
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              No guesswork or superficial hallucinated tips. We follow a strict evidence-driven diagnostic protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3">
              <span className="text-xs font-mono font-bold text-blue-400">01 / INTAKE</span>
              <h3 className="text-base font-bold text-white">Intake & Context</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You supply the symptoms, runtime, logs, and configuration. Secrets are redacted automatically before AI reasoning.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3">
              <span className="text-xs font-mono font-bold text-blue-400">02 / HYPOTHESES</span>
              <h3 className="text-base font-bold text-white">Ranked Hypotheses</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The engine ranks probable failure causes by probability, cross-referencing known error patterns in official documentation.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3">
              <span className="text-xs font-mono font-bold text-blue-400">03 / SAFE TESTS</span>
              <h3 className="text-base font-bold text-white">Diagnostic Tests</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You receive safe, read-only inspection commands to run on your environment, with clear explanations of expected outputs.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3">
              <span className="text-xs font-mono font-bold text-blue-400">04 / RESOLUTION</span>
              <h3 className="text-base font-bold text-white">Step-by-Step Fix</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Once test outputs isolate the exact root cause, you receive verified corrective steps complete with rollback instructions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Troubleshooting Guides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Troubleshooting Guides
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Peer-reviewed technical guides with reproducible commands, tested fixes, and authoritative documentation links.
            </p>
          </div>
          <Link to="/guides">
            <Button size="sm" variant="outline" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Guides
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredGuides.map(guide => (
            <Link
              key={guide.id}
              to={`/guides/${guide.slug}`}
              className="group p-6 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="blue">{guide.category}</Badge>
                  <span className="text-[11px] text-slate-400">
                    Reviewed {new Date(guide.last_reviewed_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {guide.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">By {guide.author_name}</span>
                <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Read Guide <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Grounding in Official Documentation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card padding="lg" className="border-slate-200 bg-slate-50/70">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Badge variant="purple">Official Documentation RAG</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Every Diagnosis Grounded in Official Technical Manuals
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                AI diagnostic engines can hallucinate commands or outdated parameters. Zelqora mitigates this risk by querying an approved registry of official technical documentation sources.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                When Zelqora recommends an option, you can click directly to the verified official documentation page on <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">nodejs.org</code>, <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">docs.docker.com</code>, <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">react.dev</code>, or <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">postgresql.org</code>.
              </p>
              <div className="pt-2">
                <Link to="/docs/sources">
                  <Button size="sm" variant="outline" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Explore Approved Sources Directory
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-600">Docker Documentation</span>
                <div className="font-semibold text-slate-900">Resource Constraints & Memory Limits</div>
                <div className="text-slate-500 truncate text-[11px]">https://docs.docker.com/engine/containers/resource_constraints/</div>
              </div>
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-600">Node.js Official Manual</span>
                <div className="font-semibold text-slate-900">Process Memory Usage & V8 Flags</div>
                <div className="text-slate-500 truncate text-[11px]">https://nodejs.org/docs/latest/api/process.html</div>
              </div>
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-600">MDN Web Standards</span>
                <div className="font-semibold text-slate-900">Cross-Origin Resource Sharing (CORS)</div>
                <div className="text-slate-500 truncate text-[11px]">https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Methodology & Limitations Transparency */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <span>Methodology & Honest Technical Limitations</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Troubleshooting is an iterative, hypothesis-testing science. Complex defects with intermittent concurrency races, memory corruptions, or proprietary hardware flaws cannot always be conclusively pinpointed in a single turn. Zelqora prioritizes safe, non-destructive exploration and transparency over false certainty.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/methodology" className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2">
              Read our full Diagnostic Methodology & Safety Rules &rarr;
            </Link>
            <Link to="/editorial-policy" className="text-slate-600 hover:text-slate-900 font-medium">
              Editorial Policy
            </Link>
          </div>
        </div>
      </section>

      {/* Policy-Compliant Isolated AdSlot (disabled by default) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlot format="horizontal" />
      </div>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Ready to troubleshoot your technical problem?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Start a diagnostic session right now. No credit card required. Works with or without registration.
        </p>
        <div>
          <Link to="/troubleshoot">
            <Button size="lg" variant="primary">
              Launch Diagnostic Workspace
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
};
