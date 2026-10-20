import React from 'react';
import { HelpCircle, CheckCircle2, TrendingUp, XCircle, ShieldCheck } from 'lucide-react';
import { Hypothesis } from '../../types';
import { Badge } from '../ui/Badge';

interface HypothesisListProps {
  hypotheses: Hypothesis[];
}

export const HypothesisList: React.FC<HypothesisListProps> = ({ hypotheses }) => {
  if (!hypotheses || hypotheses.length === 0) {
    return null;
  }

  // Qualitative priority order
  const getLikelihoodRank = (hyp: Hypothesis): number => {
    switch (hyp.likelihood) {
      case 'confirmed': return 4;
      case 'likely': return 3;
      case 'possible': return 2;
      case 'unlikely': return 1;
      default:
        if (hyp.likelihood_score !== undefined) {
          if (hyp.likelihood_score >= 80) return 3;
          if (hyp.likelihood_score >= 50) return 2;
          return 1;
        }
        return 2;
    }
  };

  const getLikelihoodBadge = (hyp: Hypothesis) => {
    switch (hyp.likelihood) {
      case 'confirmed':
        return (
          <Badge variant="green" size="md" className="shrink-0 font-bold" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Confirmed by Evidence
          </Badge>
        );
      case 'likely':
        return (
          <Badge variant="blue" size="md" className="shrink-0 font-bold" icon={<TrendingUp className="w-3.5 h-3.5" />}>
            Likely Cause
          </Badge>
        );
      case 'possible':
        return (
          <Badge variant="amber" size="md" className="shrink-0 font-medium">
            Possible Cause
          </Badge>
        );
      case 'unlikely':
        return (
          <Badge variant="slate" size="md" className="shrink-0 font-medium text-slate-500" icon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}>
            Refuted / Unlikely
          </Badge>
        );
      default:
        return (
          <Badge variant="blue" size="md" className="shrink-0 font-medium">
            Investigating
          </Badge>
        );
    }
  };

  // Sort by qualitative likelihood rank descending
  const sorted = [...hypotheses].sort((a, b) => getLikelihoodRank(b) - getLikelihoodRank(a));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>Ranked Hypotheses ({hypotheses.length})</span>
        </h3>
        <span className="text-[11px] text-slate-500 italic">
          Ranked by supporting evidence and qualitative likelihood
        </span>
      </div>

      <div className="space-y-3">
        {sorted.map((hyp, idx) => {
          const isConfirmed = hyp.likelihood === 'confirmed';
          const isRefuted = hyp.likelihood === 'unlikely';

          return (
            <div
              key={hyp.id || idx}
              className={`p-4 rounded-xl border transition-all ${
                isConfirmed
                  ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                  : isRefuted
                  ? 'bg-slate-50/60 border-slate-200 opacity-75'
                  : idx === 0
                  ? 'bg-blue-50/30 border-blue-200 shadow-2xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2.5">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isConfirmed 
                      ? 'bg-emerald-600 text-white' 
                      : isRefuted
                      ? 'bg-slate-300 text-slate-600'
                      : idx === 0 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {hyp.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {hyp.explanation}
                    </p>
                  </div>
                </div>

                {getLikelihoodBadge(hyp)}
              </div>

              {/* Uncertainty Reason Note */}
              {hyp.uncertainty_reason && (
                <div className="mt-2.5 flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-700">Remaining Uncertainty:</strong> {hyp.uncertainty_reason}
                  </span>
                </div>
              )}

              {/* Supporting Evidence Pills */}
              {hyp.supporting_evidence && hyp.supporting_evidence.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
                    Supporting Evidence:
                  </span>
                  {hyp.supporting_evidence.map((ev, evIdx) => (
                    <span
                      key={evIdx}
                      className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{ev}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Refuting Evidence Pills */}
              {hyp.refuting_evidence && hyp.refuting_evidence.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-500 mr-1">
                    Refuting Evidence:
                  </span>
                  {hyp.refuting_evidence.map((rev, revIdx) => (
                    <span
                      key={revIdx}
                      className="inline-flex items-center gap-1 text-[11px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200"
                    >
                      <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>{rev}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
