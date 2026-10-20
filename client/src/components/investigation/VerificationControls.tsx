import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, AlertCircle, PlusCircle, HelpCircle, ChevronDown, ChevronUp, FileText, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Input';

interface VerificationControlsProps {
  currentTurnIndex: number;
  totalTurns: number;
  status: 'active' | 'resolved' | 'abandoned';
  resolutionNotes?: string;
  onResolve: (notes: string) => Promise<void>;
  onAbandon?: (notes: string) => Promise<void>;
  onRollback: (turnIndex: number) => Promise<void>;
  onNewInvestigation: () => void;
  loading: boolean;
}

export const VerificationControls: React.FC<VerificationControlsProps> = ({
  currentTurnIndex,
  totalTurns,
  status,
  resolutionNotes,
  onResolve,
  onAbandon,
  onRollback,
  onNewInvestigation,
  loading
}) => {
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [abandonModalOpen, setAbandonModalOpen] = useState(false);
  const [rollbackModalOpen, setRollbackModalOpen] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [notes, setNotes] = useState('');
  const [abandonNotes, setAbandonNotes] = useState('');
  const [targetRollbackTurn, setTargetRollbackTurn] = useState(Math.max(1, currentTurnIndex - 1));

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onResolve(notes.trim() || 'Issue confirmed resolved via suggested steps.');
    setResolveModalOpen(false);
  };

  const handleAbandonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onAbandon) {
      await onAbandon(abandonNotes.trim() || 'Investigation marked as unresolved. Requires further reproduction.');
    }
    setAbandonModalOpen(false);
  };

  const handleRollbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRollback(targetRollbackTurn);
    setRollbackModalOpen(false);
  };

  if (status === 'resolved') {
    return (
      <div className="p-5 rounded-xl border border-emerald-300 bg-emerald-50/70 text-emerald-950 space-y-3">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Investigation Marked as Resolved</span>
        </div>
        {resolutionNotes && (
          <p className="text-xs text-emerald-900 leading-relaxed bg-white/70 p-3 rounded-lg border border-emerald-200">
            <strong>Resolution Summary:</strong> {resolutionNotes}
          </p>
        )}
        <div className="pt-1 flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onNewInvestigation}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Start Another Investigation
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'abandoned') {
    return (
      <div className="p-5 rounded-xl border border-amber-300 bg-amber-50/70 text-amber-950 space-y-3">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span>Investigation Marked as Unresolved</span>
        </div>
        {resolutionNotes && (
          <p className="text-xs text-amber-900 leading-relaxed bg-white/70 p-3 rounded-lg border border-amber-200">
            <strong>Session Notes:</strong> {resolutionNotes}
          </p>
        )}
        <div className="space-y-2 text-xs text-amber-900">
          <p className="font-semibold">Suggested Next Steps to Try:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
            <li>Isolate a minimal reproducible sample outside your main project structure.</li>
            <li>Inspect verbose runtime logs or system event logs for secondary stack traces.</li>
            <li>Consult the official documentation references linked in this investigation.</li>
          </ul>
        </div>
        <div className="pt-1 flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onNewInvestigation}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Start New Investigation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Problem Verification & Resolution
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Did the diagnostic tests or solution steps resolve the technical failure?
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {totalTurns > 1 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRollbackModalOpen(true)}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                disabled={loading}
              >
                Rollback Step
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNextSteps(!showNextSteps)}
              icon={showNextSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            >
              Still Unresolved?
            </Button>

            <Button
              size="sm"
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
              onClick={() => setResolveModalOpen(true)}
              icon={<CheckCircle2 className="w-4 h-4" />}
              disabled={loading}
            >
              Mark as Resolved
            </Button>
          </div>
        </div>

        {/* Unresolved Next Steps Guide */}
        {showNextSteps && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Recommended Next Steps if the Issue Persists</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-900 block">1. Submit Fresh Test Output</span>
                <p className="text-slate-600 leading-relaxed">
                  Run the diagnostic commands above and paste the full output or exit code into the test results box above to generate an updated diagnosis.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-900 block">2. Create a Minimal Reproduction</span>
                <p className="text-slate-600 leading-relaxed">
                  Isolate the failing function, query, or configuration into a standalone script. Stripping external factors often reveals hidden variables.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-900 block">3. Enable Verbose Logging</span>
                <p className="text-slate-600 leading-relaxed">
                  Run your runtime with debug flags (e.g. <code className="bg-white px-1 rounded border">DEBUG=*</code> or <code className="bg-white px-1 rounded border">--trace-warnings</code>) or inspect system event logs.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-900 block">4. Revert Experimental Edits</span>
                <p className="text-slate-600 leading-relaxed">
                  If preliminary tweaks didn't fix the issue, roll them back first so untested changes don't compound the problem.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-slate-500">
                You can save your current session notes and return later.
              </p>
              {onAbandon && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAbandonModalOpen(true)}
                  className="text-xs text-slate-600 hover:text-slate-900"
                >
                  Mark as Unresolved / Need More Info
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Mark Issue as Resolved"
        description="Summarize what solved the problem so you can reference it in your investigation history."
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4">
          <Textarea
            label="Resolution Summary & Fix Applied"
            placeholder="e.g. Set --max-old-space-size=384 in Dockerfile; container now runs stably without OOM 137."
            rows={4}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResolveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Confirm Resolved
            </Button>
          </div>
        </form>
      </Modal>

      {/* Abandon / Unresolved Modal */}
      <Modal
        isOpen={abandonModalOpen}
        onClose={() => setAbandonModalOpen(false)}
        title="Mark Investigation as Unresolved"
        description="Document what you tried and what was observed so you can resume the investigation later."
      >
        <form onSubmit={handleAbandonSubmit} className="space-y-4">
          <Textarea
            label="What was attempted & current status"
            placeholder="e.g. Ran memory profiling; container still crashes under peak load. Need to inspect host cgroups next."
            rows={4}
            value={abandonNotes}
            onChange={e => setAbandonNotes(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAbandonModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Save as Unresolved
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rollback Modal */}
      <Modal
        isOpen={rollbackModalOpen}
        onClose={() => setRollbackModalOpen(false)}
        title="Rollback Investigation to Prior Turn"
        description="Revert newer turns if a test output was misinterpreted or if you want to explore a different diagnostic path."
      >
        <form onSubmit={handleRollbackSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Turn to Rollback To:
            </label>
            <select
              value={targetRollbackTurn}
              onChange={e => setTargetRollbackTurn(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: totalTurns - 1 }, (_, i) => i + 1).map(t => (
                <option key={t} value={t}>Turn {t}</option>
              ))}
            </select>
            <p className="text-xs text-rose-600 mt-2">
              Note: Turns after Turn {targetRollbackTurn} will be safely pruned from the timeline.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRollbackModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={loading}
            >
              Confirm Rollback
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
