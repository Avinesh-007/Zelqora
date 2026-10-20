import React, { useState } from 'react';
import { Terminal, Shield, AlertTriangle, Send, CheckCircle, HelpCircle, Laptop } from 'lucide-react';
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
  const [selectedOs, setSelectedOs] = useState<'windows' | 'linux' | 'macos'>('windows');
  const [terminalOutput, setTerminalOutput] = useState('');

  if (!tests || tests.length === 0) {
    return null;
  }

  const activeTest = tests.find(t => t.id === selectedTestId) || tests[0];

  // Pick OS-specific command if available, otherwise fallback to primary command
  const activeCommand = activeTest.os_specific_commands?.[selectedOs] || activeTest.command;

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
              Step {test.step_order || idx + 1}: {test.title.replace(/^Step \d+:\s*/i, '').slice(0, 24)}...
            </button>
          ))}
        </div>
      )}

      {/* Selected Test Detail */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                Step {activeTest.step_order || 1} of {tests.length}
              </span>
              <h4 className="text-base font-bold text-slate-900">{activeTest.title}</h4>
            </div>
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

        {/* Beginner-friendly Step Guidance */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs text-slate-700 space-y-1">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            Beginner-Friendly Instructions:
          </span>
          <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-1 text-[11px]">
            <li>Open your terminal (PowerShell / CMD on Windows, or Bash on macOS/Linux).</li>
            <li>Run the exact command shown below.</li>
            <li>Observe the output and compare with the expected result pattern.</li>
            <li>Paste your terminal output into the form below to refine the diagnostic reasoning.</li>
          </ol>
        </div>

        {/* OS Selector Tabs if OS specific commands exist */}
        {activeTest.os_specific_commands && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5" /> OS Syntax:
            </span>
            {(['windows', 'linux', 'macos'] as const).map(os => (
              <button
                key={os}
                type="button"
                onClick={() => setSelectedOs(os)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedOs === os
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {os === 'windows' ? 'Windows' : os === 'linux' ? 'Linux' : 'macOS'}
              </button>
            ))}
          </div>
        )}

        {/* Command Box */}
        {activeCommand && (
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 sm:p-3.5">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
              <span className="text-[11px] font-mono text-slate-400">
                Terminal Command {activeTest.os_specific_commands ? `(${selectedOs})` : ''}
              </span>
              <CopyButton textToCopy={activeCommand} label="Copy Command" />
            </div>
            <pre className="text-xs sm:text-sm font-mono text-blue-300 overflow-x-auto whitespace-pre-wrap select-all">
              {activeCommand}
            </pre>
          </div>
        )}

        {/* Expected Output Pattern */}
        {activeTest.expected_output_pattern && (
          <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-200 text-xs flex items-center gap-2">
            <span className="font-semibold text-blue-900 shrink-0">Expected Result Pattern:</span>
            <code className="font-mono text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200 text-[11px] overflow-x-auto">
              {activeTest.expected_output_pattern}
            </code>
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
              helperText="Zelqora will evaluate the evidence and update likelihoods or confirm causes based on your actual test outcome."
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
