import React, { useState } from 'react';
import { Terminal, Shield, AlertTriangle, Send, CheckCircle, HelpCircle } from 'lucide-react';
import { DiagnosticTest } from '../../types';
import { CopyButton } from '../ui/CopyButton';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { Badge } from '../ui/Badge';

interface DiagnosticTestCardProps {
  tests: DiagnosticTest[];
  onSubmitEvidence: (testOutput: string) => Promise<void>;
  submitting: boolean;
}

export const DiagnosticTestCard: React.FC<DiagnosticTestCardProps> = ({
  tests,
  onSubmitEvidence,
  submitting
}) => {
  const [selectedTestId, setSelectedTestId] = useState<string>(tests[0]?.id || '');
  const [terminalOutput, setTerminalOutput] = useState('');

  if (!tests || tests.length === 0) {
    return null;
  }

  const activeTest = tests.find(t => t.id === selectedTestId) || tests[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalOutput.trim()) return;
    await onSubmitEvidence(terminalOutput.trim());
    setTerminalOutput('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-600" />
          <span>Recommended Diagnostic Tests ({tests.length})</span>
        </h3>
        <span className="text-xs text-slate-500 font-medium">Execute on your machine</span>
      </div>

      {/* Test Tabs if multiple */}
      {tests.length > 1 && (
        <div className="flex border-b border-slate-200 gap-2">
          {tests.map((test, idx) => (
            <button
              key={test.id || idx}
              type="button"
              onClick={() => setSelectedTestId(test.id)}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                selectedTestId === test.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Test #{idx + 1}: {test.title.slice(0, 24)}...
            </button>
          ))}
        </div>
      )}

      {/* Selected Test Detail */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-slate-900">{activeTest.title}</h4>
            <p className="text-xs text-slate-600 mt-1">{activeTest.explanation}</p>
          </div>

          <div className="flex items-center gap-2">
            {activeTest.is_safe ? (
              <Badge variant="green" icon={<Shield className="w-3 h-3" />}>
                Safe Read-Only Command
              </Badge>
            ) : (
              <Badge variant="amber" icon={<AlertTriangle className="w-3 h-3" />}>
                Caution: State-Changing
              </Badge>
            )}
            {activeTest.requires_elevation && (
              <Badge variant="rose">Sudo / Admin Required</Badge>
            )}
          </div>
        </div>

        {/* Command Box */}
        {activeTest.command && (
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 sm:p-3.5">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
              <span className="text-[11px] font-mono text-slate-400">Terminal Command</span>
              <CopyButton textToCopy={activeTest.command} label="Copy Command" />
            </div>
            <pre className="text-xs sm:text-sm font-mono text-blue-300 overflow-x-auto whitespace-pre-wrap select-all">
              {activeTest.command}
            </pre>
          </div>
        )}

        {/* Expected Output Interpretation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-900">
            <div className="font-semibold flex items-center gap-1.5 mb-1 text-emerald-800">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>If output matches:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              {activeTest.what_result_means.if_matches}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <div className="font-semibold flex items-center gap-1.5 mb-1 text-slate-800">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>If output fails or differs:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {activeTest.what_result_means.if_fails_or_differs}
            </p>
          </div>
        </div>

        {/* Submit Output Form */}
        <div className="pt-3 border-t border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              label="Submit Your Terminal Output / Findings"
              placeholder="Paste the command output, error logs, or observed result to advance the investigation..."
              rows={3}
              value={terminalOutput}
              onChange={e => setTerminalOutput(e.target.value)}
              helperText="Zelqora will update hypotheses and formulate conclusive steps based on your real test outcome."
              required
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="md"
                variant="primary"
                loading={submitting}
                icon={<Send className="w-4 h-4" />}
              >
                Submit Evidence & Update Diagnosis
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
