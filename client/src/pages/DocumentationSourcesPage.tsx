import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, ShieldCheck, Search, Filter } from 'lucide-react';
import { api } from '../services/api';
import { DocSource } from '../types';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { SEO } from '../components/common/SEO';

export const DocumentationSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<DocSource[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDocSources()
      .then(res => {
        setSources(res.sources);
      })
      .catch(err => {
        console.error('Failed to load documentation sources:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = sources.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.verified_topics.some(t => t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SEO
        title="Official Technical Documentation Registry — Zelqora"
        description="Explore the curated, verified documentation sources and official domains that ground Zelqora's diagnostic recommendations."
        canonicalPath="/docs/sources"
      />
      
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Official Technical Documentation Registry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Approved Grounding Sources
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Zelqora strictly restricts all AI citations and diagnostic references to approved, official technical documentation domains. We never cite unverified forums, low-quality aggregators, or hallucinated URLs.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documentation sources and topics..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Sources Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading documentation registry...</div>
      ) : (
        <div className="space-y-6">
          {filtered.map(src => (
            <Card key={src.id} padding="lg" className="border-slate-200 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="blue">{src.category}</Badge>
                    <span className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Approved Domain</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{src.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{src.description}</p>
                </div>

                <a
                  href={src.base_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                >
                  <span>Manual Base</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Verified Topics for this source */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Indexed & Grounded Topics:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {src.verified_topics.map((top, topIdx) => (
                    <a
                      key={topIdx}
                      href={top.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-2xs transition-all space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900 group-hover:text-blue-600">
                        <span>{top.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                        {top.summary}
                      </p>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {top.url}
                      </div>
                    </a>
                  ))}
                </div>
              </div>

            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
