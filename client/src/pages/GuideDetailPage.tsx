import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  ShieldCheck, 
  Calendar, 
  User, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { Guide } from '../types';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CopyButton } from '../components/ui/CopyButton';
import { Button } from '../components/ui/Button';

export const GuideDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getGuideBySlug(slug)
      .then(res => {
        setGuide(res.guide);
      })
      .catch(err => {
        setError(err.message || 'Guide not found.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading troubleshooting guide...
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Guide Not Found</h1>
        <p className="text-xs text-slate-500">{error || 'This guide does not exist or has not been published.'}</p>
        <Link to="/guides">
          <Button size="sm" variant="outline">
            Return to Guides Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <div>
        <Link 
          to="/guides" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Troubleshooting Guides</span>
        </Link>
      </div>

      {/* Guide Header */}
      <header className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="blue">{guide.category}</Badge>
          <span className="text-xs text-slate-400">&bull;</span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Reviewed {new Date(guide.last_reviewed_at).toLocaleDateString()}</span>
          </span>
          <span className="text-xs text-slate-400">&bull;</span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{guide.author_name}</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {guide.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {guide.summary}
        </p>
      </header>

      {/* 1. Symptoms & Error Messages */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Observed Symptoms & Error Messages</span>
        </h2>
        <div className="space-y-2">
          {guide.symptoms.map((symptom, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-rose-50/50 border border-rose-200 text-xs font-mono text-rose-900 flex items-start gap-2">
              <span className="text-rose-500 font-bold shrink-0">&bull;</span>
              <span>{symptom}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Environment Prerequisites */}
      {guide.environment_prereqs && guide.environment_prereqs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            Applicable Environments & Prerequisites
          </h2>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {guide.environment_prereqs.map((prereq, idx) => (
              <li key={idx}>{prereq}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 3. Likely Causes */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          Root Causes & Failure Mechanisms
        </h2>
        <div className="space-y-3">
          {guide.likely_causes.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
              <h3 className="text-sm font-bold text-slate-900">{item.cause}</h3>
              <p className="text-slate-600 leading-relaxed">{item.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Diagnostic Steps */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          <span>Diagnostic Procedures & Output Interpretation</span>
        </h2>
        <div className="space-y-4">
          {guide.diagnostic_steps.map((diag, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
              <div className="font-semibold text-sm text-slate-900">
                Step {idx + 1}: {diag.step}
              </div>

              {diag.command && (
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                    <span>Shell Command</span>
                    <CopyButton textToCopy={diag.command} label="Copy" />
                  </div>
                  <pre className="font-mono text-blue-300 overflow-x-auto whitespace-pre-wrap select-all">
                    {diag.command}
                  </pre>
                </div>
              )}

              <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <strong>How to interpret:</strong> {diag.interpretation}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Verified Solutions */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Verified Solutions & Action Plan</span>
        </h2>
        <div className="space-y-4">
          {guide.verified_solutions.map((sol, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-3 text-xs">
              <h3 className="text-base font-bold text-slate-900">
                Solution {idx + 1}: {sol.title}
              </h3>

              <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                {sol.steps.map((st, stIdx) => (
                  <li key={stIdx} className="leading-relaxed">{st}</li>
                ))}
              </ol>

              {sol.code_snippet && (
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                    <span>{sol.language || 'code'}</span>
                    <CopyButton textToCopy={sol.code_snippet} label="Copy Snippet" />
                  </div>
                  <pre className="font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap select-all">
                    {sol.code_snippet}
                  </pre>
                </div>
              )}

              {sol.rollback && (
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-start gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span><strong>Rollback:</strong> {sol.rollback}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. Warnings */}
      {guide.warnings && guide.warnings.length > 0 && (
        <section className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Important Warnings & Production Precautions</span>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {guide.warnings.map((w, idx) => (
              <li key={idx} className="leading-relaxed">{w}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 7. Authoritative Documentation References */}
      {guide.documentation_references && guide.documentation_references.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Official Documentation References</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {guide.documentation_references.map((ref, idx) => (
              <a
                key={idx}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {ref.source_name}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {ref.title}
                </div>
                {ref.relevant_excerpt && (
                  <p className="text-slate-500 text-[11px] line-clamp-2">
                    {ref.relevant_excerpt}
                  </p>
                )}
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {ref.url}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Troubleshoot CTA at bottom of guide */}
      <div className="p-6 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          Encountering a variation of this problem?
        </h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Start an interactive diagnostic investigation in the Zelqora workspace with your specific environment logs and versions.
        </p>
        <Link to="/troubleshoot">
          <Button size="md" variant="primary">
            Investigate This Problem in Workspace
          </Button>
        </Link>
      </div>

    </article>
  );
};
