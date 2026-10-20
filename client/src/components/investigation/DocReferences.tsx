import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { DocumentationRef } from '../../types';
import { Badge } from '../ui/Badge';

interface DocReferencesProps {
  references?: DocumentationRef[];
}

export const DocReferences: React.FC<DocReferencesProps> = ({ references }) => {
  if (!references || references.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Official Documentation References ({references.length})</span>
        </h3>
        <span className="text-[11px] text-slate-500 font-medium">Verified sources only</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {references.map((ref, idx) => (
          <a
            key={idx}
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {ref.source_name}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Link</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 ml-0.5 transition-colors" />
              </span>
            </div>

            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {ref.title}
            </h4>

            {ref.relevant_excerpt && (
              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {ref.relevant_excerpt}
              </p>
            )}

            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-400 truncate">
              {ref.url}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
