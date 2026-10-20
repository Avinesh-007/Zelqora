import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Terminal } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto">
        <HelpCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold text-slate-400">404 — PAGE NOT FOUND</span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Diagnostic Route Unreachable
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The requested path does not match any public troubleshooting guide, tool, or documentation directory.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Link to="/">
          <Button size="md" variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/troubleshoot">
          <Button size="md" variant="primary" icon={<Terminal className="w-4 h-4" />}>
            Open Workspace
          </Button>
        </Link>
      </div>
    </div>
  );
};
