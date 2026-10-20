import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Trash2, Plus, ArrowRight } from 'lucide-react';
import { Investigation } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface HistorySidebarProps {
  investigations: Investigation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  investigations,
  selectedId,
  onSelect,
  onNew,
  onDelete,
  loading
}) => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      
      {/* Top Action */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Investigation History
          </h3>
          <span className="text-[11px] text-slate-500">
            {investigations.length} {investigations.length === 1 ? 'session' : 'sessions'}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onNew}
          icon={<Plus className="w-3.5 h-3.5" />}
          title="Start new troubleshooting session"
        >
          New
        </Button>
      </div>

      {/* Investigation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
        {investigations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 space-y-2">
            <Clock className="w-6 h-6 mx-auto text-slate-300" />
            <p>No previous troubleshooting sessions found.</p>
          </div>
        ) : (
          investigations.map(inv => {
            const isSelected = inv.id === selectedId;
            const isResolved = inv.status === 'resolved';

            return (
              <div
                key={inv.id}
                onClick={() => onSelect(inv.id)}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 border border-blue-200 shadow-2xs'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {inv.category || 'General'}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {isResolved ? (
                      <Badge variant="green" size="sm">Resolved</Badge>
                    ) : (
                      <Badge variant="blue" size="sm">Active</Badge>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this investigation and its timeline?')) {
                          onDelete(inv.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all rounded"
                      title="Delete investigation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-slate-900 mt-2 line-clamp-2">
                  {inv.title}
                </h4>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(inv.updated_at).toLocaleDateString()}</span>
                  <span className="text-blue-600 font-medium opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
