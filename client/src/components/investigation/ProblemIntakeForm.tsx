import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Sparkles, Terminal, Sliders } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Card } from '../ui/Card';
import { EnvironmentInfo } from '../../types';

interface ProblemIntakeFormProps {
  onSubmit: (data: {
    title: string;
    category: string;
    description: string;
    environment: EnvironmentInfo;
  }) => Promise<void>;
  loading: boolean;
}

const CATEGORIES = [
  'Docker & Containers',
  'Node.js & JavaScript',
  'Python & Virtualenvs',
  'React & Frontend',
  'PostgreSQL & Databases',
  'HTTP APIs & CORS',
  'Git & Version Control',
  'Deployment & Cloud',
  'Other Software Defect'
];

const STARTER_PROBLEMS = [
  {
    title: 'Docker container exits with status code 137 under load',
    category: 'Docker & Containers',
    description: 'Our backend container abruptly stops after running heavy reports. docker inspect shows exit code 137 without any application stack trace in the logs.',
    os: 'Ubuntu 22.04 LTS / Docker 24',
    runtime: 'Node.js',
    version: 'v20.10.0',
    error_message: 'Container exited with status 137'
  },
  {
    title: 'CORS policy error blocking React fetch from Express backend',
    category: 'HTTP APIs & CORS',
    description: 'When our React client at localhost:5173 calls localhost:3001/api/data with credentials, the browser console shows "Access to fetch at http://localhost:3001 from origin http://localhost:5173 has been blocked by CORS policy".',
    os: 'macOS Sonoma',
    runtime: 'Express & React',
    version: 'Express 4.19, React 18',
    error_message: 'No "Access-Control-Allow-Origin" header is present on the requested resource'
  },
  {
    title: 'PostgreSQL connection exhaustion: remaining connection slots reserved',
    category: 'PostgreSQL & Databases',
    description: 'Database queries suddenly fail in production with "FATAL: remaining connection slots are reserved for non-replication superuser connections" when traffic spikes.',
    os: 'Linux (Debian 12)',
    runtime: 'PostgreSQL',
    version: 'PostgreSQL 16',
    error_message: 'FATAL: remaining connection slots are reserved for non-replication superuser connections'
  },
  {
    title: 'Python ModuleNotFoundError for installed package in VS Code',
    category: 'Python & Virtualenvs',
    description: 'pip list shows the library is installed, but running python app.py throws ModuleNotFoundError: No module named "fastapi". VS Code squiggly lines also appear.',
    os: 'Windows 11',
    runtime: 'Python',
    version: 'Python 3.12',
    error_message: 'ModuleNotFoundError: No module named "fastapi"'
  }
];

export const ProblemIntakeForm: React.FC<ProblemIntakeFormProps> = ({ onSubmit, loading }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [showEnvFields, setShowEnvFields] = useState(false);

  // Environment Fields
  const [os, setOs] = useState('');
  const [runtime, setRuntime] = useState('');
  const [version, setVersion] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [logs, setLogs] = useState('');
  const [configContext, setConfigContext] = useState('');

  const applyStarter = (starter: typeof STARTER_PROBLEMS[0]) => {
    setTitle(starter.title);
    setCategory(starter.category);
    setDescription(starter.description);
    setOs(starter.os);
    setRuntime(starter.runtime);
    setVersion(starter.version);
    setErrorMessage(starter.error_message);
    setShowEnvFields(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    await onSubmit({
      title: title.trim() || 'Technical Troubleshooting Session',
      category,
      description: description.trim(),
      environment: {
        os: os.trim() || undefined,
        runtime: runtime.trim() || undefined,
        version: version.trim() || undefined,
        error_message: errorMessage.trim() || undefined,
        logs: logs.trim() || undefined,
        config_context: configContext.trim() || undefined
      }
    });
  };

  return (
    <Card padding="lg" className="border-slate-300 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Header & Starters */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-600" />
              <span>Describe the Technical Issue</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Step 1 of Adaptive Diagnostic</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Provide the problem symptoms, error messages, and observations. Zelqora will formulate ranked hypotheses, check verified official docs, and prescribe safe tests.
          </p>

          {/* Quick Problem Starters */}
          <div className="space-y-1.5 mb-6">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Try an example troubleshooting starter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {STARTER_PROBLEMS.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyStarter(starter)}
                  className="text-left text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-200 text-slate-700 transition-colors"
                >
                  <span className="font-medium text-slate-900">{starter.title.split(':')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Core Intake Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Investigation Title / Problem Summary"
              placeholder="e.g. Docker container exits with code 137 OOMKilled"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <Textarea
          label="Detailed Problem Description & Observed Symptoms"
          placeholder="Describe what occurred, how the failure manifests, and what behavior was expected instead..."
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />

        {/* Expandable Optional Environment Fields */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
          <button
            type="button"
            onClick={() => setShowEnvFields(!showEnvFields)}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-slate-700 hover:bg-slate-100/70 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>Optional Environment & Context Fields (OS, Runtime, Error, Logs)</span>
            </span>
            {showEnvFields ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showEnvFields && (
            <div className="p-4 pt-2 border-t border-slate-200 bg-white space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Operating System"
                  placeholder="e.g. Ubuntu 22.04, Windows 11, macOS"
                  value={os}
                  onChange={e => setOs(e.target.value)}
                />
                <Input
                  label="Runtime / Framework"
                  placeholder="e.g. Node.js, Python, PostgreSQL"
                  value={runtime}
                  onChange={e => setRuntime(e.target.value)}
                />
                <Input
                  label="Version"
                  placeholder="e.g. v20.10.0, 3.12, 16.2"
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                />
              </div>

              <Input
                label="Exact Error Message or Exception String"
                placeholder="e.g. FATAL: remaining connection slots are reserved for non-replication superuser connections"
                value={errorMessage}
                onChange={e => setErrorMessage(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Textarea
                  label="Relevant Log Excerpt (Sanitized)"
                  placeholder="Paste stack traces or log lines here..."
                  rows={3}
                  value={logs}
                  onChange={e => setLogs(e.target.value)}
                />
                <Textarea
                  label="Configuration Excerpt"
                  placeholder="e.g. compose.yaml, tsconfig.json, postgresql.conf snippet..."
                  rows={3}
                  value={configContext}
                  onChange={e => setConfigContext(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Privacy & Redaction Warning Alert */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold">Confidentiality Notice:</span>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Zelqora automatically filters known API keys, AWS credentials, tokens, and database passwords before analysis. Always ensure private proprietary business secrets are sanitized before submitting.
            </p>
          </div>
        </div>

        {/* Submission Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            loading={loading}
            className="w-full sm:w-auto"
          >
            Start Diagnostic Investigation
          </Button>
        </div>

      </form>
    </Card>
  );
};
