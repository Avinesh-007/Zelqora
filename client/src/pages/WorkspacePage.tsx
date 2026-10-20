import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Terminal, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Menu, 
  X, 
  HelpCircle,
  ShieldCheck,
  Send,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { Investigation, InvestigationTurn, EnvironmentInfo } from '../types';
import { ProblemIntakeForm } from '../components/investigation/ProblemIntakeForm';
import { HypothesisList } from '../components/investigation/HypothesisList';
import { DiagnosticTestCard } from '../components/investigation/DiagnosticTestCard';
import { SolutionSteps } from '../components/investigation/SolutionSteps';
import { DocReferences } from '../components/investigation/DocReferences';
import { VerificationControls } from '../components/investigation/VerificationControls';
import { HistorySidebar } from '../components/investigation/HistorySidebar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export const WorkspacePage: React.FC = () => {
  const location = useLocation();
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [activeInvestigation, setActiveInvestigation] = useState<Investigation | null>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [engineMode, setEngineMode] = useState<string>('local_diagnostic_engine');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.listInvestigations();
      setInvestigations(res.investigations);

      if (location.state?.initialDescription) {
        setActiveInvestigation(null);
      } else if (res.investigations.length > 0 && !activeInvestigation) {
        loadInvestigation(res.investigations[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadInvestigation = async (id: string) => {
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getInvestigation(id);
      setActiveInvestigation(res.investigation);
      setSidebarOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load investigation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateInvestigation = async (data: {
    title: string;
    category: string;
    description: string;
    environment: EnvironmentInfo;
  }) => {
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.createInvestigation(data);
      setActiveInvestigation(res.investigation);
      setEngineMode(res.diagnostic_engine_mode);
      await loadHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start diagnostic investigation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitEvidence = async (testOutput: string) => {
    if (!activeInvestigation) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.submitTurn(activeInvestigation.id, {
        test_output: testOutput
      });
      setActiveInvestigation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          updated_at: new Date().toISOString(),
          turns: [...(prev.turns || []), res.turn]
        };
      });
      setEngineMode(res.diagnostic_engine_mode);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze diagnostic evidence.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRollback = async (turnIndex: number) => {
    if (!activeInvestigation) return;
    setActionLoading(true);
    try {
      const res = await api.rollbackInvestigation(activeInvestigation.id, turnIndex);
      setActiveInvestigation(res.investigation);
    } catch (err: any) {
      setErrorMessage(err.message || 'Rollback failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (notes: string) => {
    if (!activeInvestigation) return;
    setActionLoading(true);
    try {
      const res = await api.resolveInvestigation(activeInvestigation.id, 'resolved', notes);
      setActiveInvestigation(res.investigation);
      await loadHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update resolution.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAbandon = async (notes: string) => {
    if (!activeInvestigation) return;
    setActionLoading(true);
    try {
      const res = await api.resolveInvestigation(activeInvestigation.id, 'abandoned', notes);
      setActiveInvestigation(res.investigation);
      await loadHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to mark as unresolved.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteInvestigation(id);
      if (activeInvestigation?.id === id) {
        setActiveInvestigation(null);
      }
      await loadHistory();
    } catch (err: any) {
      alert(err.message || 'Failed to delete investigation.');
    }
  };

  const latestTurn: InvestigationTurn | undefined = activeInvestigation?.turns?.[
    (activeInvestigation?.turns?.length || 1) - 1
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-100/60">
      
      {/* Desktop History Sidebar */}
      <div className="hidden md:block w-80 shrink-0 border-r border-slate-200 bg-white">
        <HistorySidebar
          investigations={investigations}
          selectedId={activeInvestigation?.id || null}
          onSelect={loadInvestigation}
          onNew={() => setActiveInvestigation(null)}
          onDelete={handleDelete}
          loading={loadingHistory}
        />
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-80 max-w-full bg-white h-full z-10 shadow-xl">
            <div className="p-3 border-b flex justify-end">
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <HistorySidebar
              investigations={investigations}
              selectedId={activeInvestigation?.id || null}
              onSelect={loadInvestigation}
              onNew={() => {
                setActiveInvestigation(null);
                setSidebarOpen(false);
              }}
              onDelete={handleDelete}
              loading={loadingHistory}
            />
          </div>
        </div>
      )}

      {/* Main Diagnostic Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Mobile Toolbar */}
        <div className="md:hidden flex items-center justify-between p-3 bg-white border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 p-1.5 rounded-lg border border-slate-200 bg-slate-50"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>History ({investigations.length})</span>
          </button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveInvestigation(null)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Issue
          </Button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="m-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Intake view when no active session selected */}
          {!activeInvestigation ? (
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Diagnose a Technical Problem
                </h1>
                <p className="text-xs text-slate-500">
                  Enter the details of your technical issue below. You will receive ranked probable causes, safe diagnostic tests, and step-by-step guidance.
                </p>
              </div>

              <ProblemIntakeForm
                onSubmit={handleCreateInvestigation}
                loading={actionLoading}
                initialDescription={location.state?.initialDescription || ''}
              />
            </div>
          ) : (
            /* Active Investigation View */
            <div className="space-y-6">
              
              {/* Honest Notice for Offline Fallback Mode */}
              {engineMode === 'local_diagnostic_engine' && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-blue-950">Local Pattern Diagnostic Mode:</span>
                    <p className="text-blue-800 leading-relaxed text-[11px]">
                      This diagnosis is generated using verified offline diagnostic patterns because no Gemini API key is configured on the server. For live generative reasoning, set <code>GEMINI_API_KEY</code> in the server <code>.env</code> file.
                    </p>
                  </div>
                </div>
              )}

              {/* Investigation Header */}
              <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {activeInvestigation.category}
                    </span>
                    <Badge variant={activeInvestigation.status === 'resolved' ? 'green' : 'blue'}>
                      {activeInvestigation.status === 'resolved' ? 'Resolved' : 'Active Diagnosis'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Created {new Date(activeInvestigation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {activeInvestigation.title}
                </h1>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <strong>Initial Issue:</strong> {activeInvestigation.initial_description}
                </p>

                {/* Progress Stepper */}
                <div className="pt-2 flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-700">Diagnostic Step:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {activeInvestigation.turns?.map((turn, tIdx) => (
                      <span
                        key={turn.id}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          tIdx === (activeInvestigation.turns?.length || 1) - 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Step {turn.turn_index}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Latest Turn Assessment Details */}
              {latestTurn && (
                <div className="space-y-6">
                  
                  {/* Summary Callout */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 text-slate-900 space-y-1.5 shadow-2xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-blue-600" />
                      <span>Diagnostic Summary (Step {latestTurn.turn_index})</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-slate-800">
                      {latestTurn.assessment.summary}
                    </p>
                  </div>

                  {/* Clarifying Questions */}
                  {latestTurn.assessment.clarifying_questions && latestTurn.assessment.clarifying_questions.length > 0 && (
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-amber-950 space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                        <span>Questions to Help Narrow Down the Cause:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-xs text-amber-900">
                        {latestTurn.assessment.clarifying_questions.map((q, qIdx) => (
                          <li key={qIdx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 1. Ranked Hypotheses */}
                  <HypothesisList hypotheses={latestTurn.assessment.hypotheses} />

                  {/* 2. Recommended Diagnostic Tests with Output Submitter */}
                  {activeInvestigation.status === 'active' && (
                    <DiagnosticTestCard
                      tests={latestTurn.assessment.diagnostic_tests}
                      onSubmitEvidence={handleSubmitEvidence}
                      submitting={actionLoading}
                    />
                  )}

                  {/* 3. Recommended Solution Steps */}
                  <SolutionSteps
                    steps={latestTurn.assessment.recommended_solution}
                    isConclusive={latestTurn.assessment.is_conclusive}
                  />

                  {/* 4. Official Documentation References */}
                  <DocReferences references={latestTurn.assessment.documentation_references} />

                  {/* 5. Verification & Resolution Controls */}
                  <VerificationControls
                    currentTurnIndex={latestTurn.turn_index}
                    totalTurns={activeInvestigation.turns?.length || 1}
                    status={activeInvestigation.status}
                    resolutionNotes={activeInvestigation.resolution_notes}
                    onResolve={handleResolve}
                    onAbandon={handleAbandon}
                    onRollback={handleRollback}
                    onNewInvestigation={() => setActiveInvestigation(null)}
                    loading={actionLoading}
                  />

                </div>
              )}

            </div>
          )}

        </div>
      </div>

    </div>
  );
};
