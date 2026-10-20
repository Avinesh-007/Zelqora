import React from 'react';
import { HelpCircle, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { Hypothesis } from '../../types';
import { Badge } from '../ui/Badge';

interface HypothesisListProps {
  hypotheses: Hypothesis[];
}

export const HypothesisList: React.FC<HypothesisListProps> = ({ hypotheses }) => {
  if (!hypotheses || hypotheses.length === 0) {
    return null;
  }

  // Sort by likelihood descending
  const sorted = [...hypotheses].sort((a, b) => b.likelihood_score - a.likelihood_score);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>Ranked Hypotheses ({hypotheses.length})</span>
        </h3>
        <span className="text-[11px] text-slate-500 italic">
          Ranked by supporting evidence probability
        </span>
      </div>

      <div className="space-y-3">
        {sorted.map((hyp, idx) => {
          const isHighest = idx === 0;
          let scoreVariant: 'green' | 'blue' | 'amber' = 'blue';
          if (hyp.likelihood_score >= 80) scoreVariant = 'green';
          else if (hyp.likelihood_score < 60) scoreVariant = 'amber';

          return (
            <div
              key={hyp.id || idx}
              className={`p-4 rounded-xl border transition-all ${
                isHighest 
                  ? 'bg-blue-50/30 border-blue-200 shadow-2xs' 
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2.5">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isHighest ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
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

                <Badge variant={scoreVariant} size="md" className="shrink-0 font-bold">
                  {hyp.likelihood_score}% Match
                </Badge>
              </div>

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
            </div>
          );
        })}
      </div>
    </div>
  );
};
