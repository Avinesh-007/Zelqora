import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  Terminal, 
  ShieldCheck, 
  TrendingUp, 
  BookOpen, 
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { Guide } from '../types';

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
      label: 'Python ModuleNotFoundError',
      text: 'Package is listed in pip list, but running python app.py throws "ModuleNotFoundError: No module named fastapi" in VS Code.'
    }
  ];

  const commonAreas = [
    {
      title: 'Docker & Containers',
      description: 'Exit code 137 OOM kills, port mappings, cgroups, compose networking.',
      slug: 'docker-exit-code-137-oomkilled'
    },
    {
      title: 'Node.js & JavaScript',
      description: 'Memory leaks, heap exhaustion, event loop lag, unhandled rejections.',
      slug: 'nodejs-memory-leak-heap-exhaustion'
    },
    {
      title: 'Python & Environments',
      description: 'Virtual environment mismatches, pip path issues, dependency conflicts.',
      slug: 'python-modulenotfounderror-virtualenv-vscode'
    },
    {
      title: 'HTTP APIs & CORS',
      description: 'Cross-origin headers, preflight OPTIONS requests, authorization cookies.',
      slug: 'resolving-cors-errors-react-express'
    },
    {
      title: 'PostgreSQL & Databases',
      description: 'Connection pool saturation, idle-in-transaction locks, query timeouts.',
      slug: 'postgresql-max-connections-exhausted'
    },
    {
      title: 'React & Frontend',
      description: 'Hydration mismatches, state closures, infinite re-render loops.',
      slug: 'resolving-cors-errors-react-express'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="pt-10 sm:pt-16 pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <span>Evidence-Based Technical Troubleshooting</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Find the cause. Fix the problem. Get back to work.
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Describe what's going wrong with your code, website, API, database, or development environment. Zelqora helps you investigate the cause, run safe diagnostic checks, and work through a solution step by step.
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
                  Diagnose a Problem
                </Button>
              </div>
            </form>
          </Card>

          {/* Example Problems (Clearly Identified as Examples) */}
          <div className="max-w-2xl mx-auto text-left space-y-2 pt-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Sample Problem Starters (click to try an example):
            </div>
            <div className="flex flex-wrap gap-2">
              {exampleStarters.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProblemDescription(ex.text)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 transition-colors text-left"
                >
                  <span className="text-slate-400 mr-1.5 font-mono text-[10px]">Example:</span>
                  <span className="font-medium text-slate-900">{ex.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 3 Core Workflow Principles (Clean, Helpful) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Ranked by Evidence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instead of giving one guess, Zelqora analyzes your environment to rank the most probable causes by likelihood, updating the ranking as you provide more details.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Safe Checks You Run</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We suggest read-only inspection commands for you to run locally. You review each command, run it yourself, and submit the output to confirm the diagnosis.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Official Documentation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every diagnosis references official manuals—Node.js, Docker, PostgreSQL, React, and Python—so you can verify the recommendations against trusted sources.
            </p>
          </div>

        </div>
      </section>

      {/* Common Technical Areas */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-left space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Common Technical Categories
          </h2>
          <p className="text-xs text-slate-500">
            Select a technical area or start a custom diagnostic session above.
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

      {/* Reviewed Troubleshooting Guides */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tested Troubleshooting Guides
            </h2>
            <p className="text-xs text-slate-500">
              Detailed walkthroughs for recurring software and deployment issues.
            </p>
          </div>
          <Link to="/guides">
            <Button size="sm" variant="outline" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              All Guides
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

      {/* Simple Bottom CTA */}
      <section className="max-w-3xl mx-auto px-4 text-center space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Have an active error in front of you?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Start a diagnostic session now. Describe what happened, run safe checks, and work toward a verified fix.
        </p>
        <Link to="/troubleshoot">
          <Button size="md" variant="primary">
            Diagnose a Problem Now
          </Button>
        </Link>
      </section>

    </div>
  );
};
