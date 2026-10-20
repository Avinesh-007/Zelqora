import React, { useState, useEffect } from 'react';
import { 
  FileEdit, 
  CheckCircle, 
  AlertCircle, 
  ShieldAlert, 
  Plus, 
  Clock, 
  User, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { Guide, GuideStatus } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';

export const EditorialAdminPage: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Status transition modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [newStatus, setNewStatus] = useState<GuideStatus>('in_review');
  const [techAccuracy, setTechAccuracy] = useState(false);
  const [sourcesVerified, setSourcesVerified] = useState(false);
  const [testedInEnv, setTestedInEnv] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Draft Modal
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [draftSlug, setDraftSlug] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSummary, setDraftSummary] = useState('');
  const [draftCategory, setDraftCategory] = useState('Node.js');
  const [draftSymptoms, setDraftSymptoms] = useState('');
  const [draftCauses, setDraftCauses] = useState('');
  const [draftSteps, setDraftSteps] = useState('');
  const [draftSolutions, setDraftSolutions] = useState('');
  const [draftDocUrl, setDraftDocUrl] = useState('https://nodejs.org/docs/latest/api/errors.html');
  const [draftDocTitle, setDraftDocTitle] = useState('Node.js Errors Documentation');

  useEffect(() => {
    loadEditorialGuides();
  }, [statusFilter]);

  const loadEditorialGuides = async () => {
    setLoading(true);
    try {
      const filter = statusFilter === 'All' ? undefined : (statusFilter as GuideStatus);
      const res = await api.getEditorialGuides(filter);
      setGuides(res.guides);
    } catch (err: any) {
      console.error('Failed to load editorial guides:', err);
    } finally {
      setLoading(false);
    }
  };

  const openStatusTransition = (guide: Guide) => {
    setSelectedGuide(guide);
    setNewStatus(guide.status === 'draft' ? 'in_review' : guide.status === 'in_review' ? 'approved' : 'published');
    setTechAccuracy(false);
    setSourcesVerified(false);
    setTestedInEnv(false);
    setReviewerName('');
    setErrorMsg(null);
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuide) return;
    setErrorMsg(null);

    try {
      const checklist = newStatus === 'published' ? {
        technical_accuracy_verified: techAccuracy,
        sources_verified: sourcesVerified,
        tested_in_environment: testedInEnv,
        reviewed_by: reviewerName.trim() || 'Senior Staff Reviewer'
      } : undefined;

      await api.updateGuideStatus(selectedGuide.id, newStatus, checklist);
      setStatusModalOpen(false);
      await loadEditorialGuides();
    } catch (err: any) {
      setErrorMsg(err.message || 'Status transition failed.');
    }
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await api.createGuideDraft({
        slug: draftSlug.trim(),
        title: draftTitle.trim(),
        summary: draftSummary.trim(),
        category: draftCategory,
        symptoms: draftSymptoms.split('\n').filter(s => s.trim().length > 0),
        environment_prereqs: ['Node.js LTS', 'Linux / Windows'],
        likely_causes: [{ cause: 'Diagnostic Identified Root Cause', explanation: draftCauses }],
        diagnostic_steps: [{ step: 'Inspect system state', command: 'node -v', interpretation: draftSteps }],
        verified_solutions: [{ title: 'Resolution Steps', steps: [draftSolutions] }],
        warnings: ['Always backup data before modifying configurations.'],
        documentation_references: [
          {
            title: draftDocTitle,
            url: draftDocUrl,
            source_name: 'Official Documentation',
            verified: true
          }
        ],
        author_name: 'Zelqora Editorial Team',
        status: 'draft'
      });

      setDraftModalOpen(false);
      await loadEditorialGuides();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create draft.');
    }
  };

  const getStatusBadgeVariant = (st: GuideStatus): 'slate' | 'amber' | 'blue' | 'green' | 'rose' | 'purple' => {
    switch (st) {
      case 'draft': return 'slate';
      case 'in_review': return 'amber';
      case 'approved': return 'blue';
      case 'published': return 'green';
      case 'needs_review': return 'rose';
      case 'archived': return 'purple';
      default: return 'slate';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Editorial Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <FileEdit className="w-4 h-4" />
            <span>Editorial Workflow & Quality Control</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Technical Guides Editorial Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Strict publication gatekeeper preventing unreviewed AI hallucinations from being published publicly.
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => setDraftModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          New Guide Draft
        </Button>
      </div>

      {/* Editorial Guardrail Callout */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold">Automated Publication Policy Guardrail:</div>
          <p className="text-[11px] leading-relaxed text-blue-900">
            Per Zelqora Editorial Policy: Draft guides <strong>cannot</strong> be transitioned directly to "Published". They must advance through <strong>In Review</strong> and <strong>Approved</strong>, accompanied by verified technical accuracy checks and official documentation links.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['All', 'draft', 'in_review', 'approved', 'published', 'needs_review', 'archived'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
              statusFilter === status
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Guides Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Title & Slug</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Last Reviewed</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Loading guides...</td>
                </tr>
              ) : guides.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">No guides found in this state.</td>
                </tr>
              ) : (
                guides.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                      <div>{g.title}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">/guides/{g.slug}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{g.category}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(g.status)}>
                        {g.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{g.author_name}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                      {new Date(g.last_reviewed_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openStatusTransition(g)}
                      >
                        Change Status
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Transition Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Editorial Guide Status"
        description={selectedGuide ? `Guide: ${selectedGuide.title}` : ''}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Publication Status:
            </label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as GuideStatus)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft (Unreviewed)</option>
              <option value="in_review">In Review (Peer Technical Review)</option>
              <option value="approved">Approved (Awaiting Release)</option>
              <option value="published">Published (Public Catalog)</option>
              <option value="needs_review">Needs Review (Stale / Flagged)</option>
              <option value="archived">Archived (Deprecated)</option>
            </select>
          </div>

          {/* Verification Checklist if target is 'published' */}
          {newStatus === 'published' && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3 text-xs text-amber-950">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                <span>Mandatory Publication Verification Checklist</span>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={techAccuracy}
                  onChange={e => setTechAccuracy(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <span>Technical Accuracy: Diagnoses and commands verified against reality.</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sourcesVerified}
                  onChange={e => setSourcesVerified(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <span>Documentation Grounds: Every reference URL belongs to approved registry.</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={testedInEnv}
                  onChange={e => setTestedInEnv(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Practical Testing: Solutions tested on local or containerized environment.</span>
              </label>

              <Input
                label="Reviewer Name / Sign-off"
                placeholder="Senior Technical Reviewer"
                value={reviewerName}
                onChange={e => setReviewerName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Save Status Transition
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Draft Modal */}
      <Modal
        isOpen={draftModalOpen}
        onClose={() => setDraftModalOpen(false)}
        title="Create New Troubleshooting Guide Draft"
        description="Creates an editorial draft. Drafts cannot be published directly without peer review."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateDraft} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="URL Slug (lowercase, hyphens)"
              placeholder="e.g. resolving-nginx-502-bad-gateway"
              value={draftSlug}
              onChange={e => setDraftSlug(e.target.value)}
              required
            />
            <Input
              label="Category"
              placeholder="e.g. Node.js & Express"
              value={draftCategory}
              onChange={e => setDraftCategory(e.target.value)}
              required
            />
          </div>

          <Input
            label="Guide Title"
            placeholder="e.g. Resolving Nginx 502 Bad Gateway with Node.js Upstream"
            value={draftTitle}
            onChange={e => setDraftTitle(e.target.value)}
            required
          />

          <Textarea
            label="Summary"
            placeholder="Concise problem statement and fix summary..."
            rows={2}
            value={draftSummary}
            onChange={e => setDraftSummary(e.target.value)}
            required
          />

          <Textarea
            label="Symptoms (One per line)"
            placeholder="502 Bad Gateway in browser\nNginx error.log: connect() failed (111: Connection refused)"
            rows={2}
            value={draftSymptoms}
            onChange={e => setDraftSymptoms(e.target.value)}
            required
          />

          <Textarea
            label="Likely Root Causes"
            placeholder="Node.js process crashed or not listening on configured port 3000..."
            rows={2}
            value={draftCauses}
            onChange={e => setDraftCauses(e.target.value)}
            required
          />

          <Textarea
            label="Diagnostic Steps & Commands"
            placeholder="curl -i http://127.0.0.1:3000/health to verify if upstream process answers..."
            rows={2}
            value={draftSteps}
            onChange={e => setDraftSteps(e.target.value)}
            required
          />

          <Textarea
            label="Verified Solution Steps"
            placeholder="Start process with systemd or PM2 to ensure auto-restart upon memory exhaustion..."
            rows={2}
            value={draftSolutions}
            onChange={e => setDraftSolutions(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Documentation Reference URL"
              value={draftDocUrl}
              onChange={e => setDraftDocUrl(e.target.value)}
              helperText="Must be from approved docs domain (e.g. nodejs.org, react.dev)"
              required
            />
            <Input
              label="Documentation Title"
              value={draftDocTitle}
              onChange={e => setDraftDocTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDraftModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Create Draft
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
