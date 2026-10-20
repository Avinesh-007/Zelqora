import React from 'react';
import { CheckSquare, AlertTriangle, RotateCcw } from 'lucide-react';
import { SolutionStep } from '../../types';
import { CopyButton } from '../ui/CopyButton';

interface SolutionStepsProps {
  steps?: SolutionStep[];
  isConclusive?: boolean;
}

export const SolutionSteps: React.FC<SolutionStepsProps> = ({ steps, isConclusive }) => {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-600" />
          <span>Recommended Solution Action Plan</span>
        </h3>
        {isConclusive && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            High Confidence Resolution
          </span>
        )}
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl border border-slate-200 bg-white space-y-3.5 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {step.step_number || idx + 1}
              </span>
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-slate-900">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.instructions}
                </p>
              </div>
            </div>

            {/* Code Snippet Box */}
            {step.code_snippet && (
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 sm:p-3.5 mt-2">
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                  <span>{step.language || 'code'}</span>
                  <CopyButton textToCopy={step.code_snippet} label="Copy Snippet" />
                </div>
                <pre className="text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap select-all">
                  {step.code_snippet}
                </pre>
              </div>
            )}

            {/* Caution & Rollback */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              {step.caution_notes && (
                <div className="flex items-start gap-2 text-amber-800 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    <strong>Caution:</strong> {step.caution_notes}
                  </span>
                </div>
              )}

              {step.rollback_instructions && (
                <div className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    <strong>Rollback Instructions:</strong> {step.rollback_instructions}
                  </span>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
