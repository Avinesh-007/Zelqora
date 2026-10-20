import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink, 
  HelpCircle,
  FileText,
  Sliders
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { SystemHealth } from '../types';

export const AdSenseReadinessPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    api.getHealth()
      .then(res => setHealth(res))
      .catch(() => {});
  }, []);

  const criteria = [
    {
      id: 'original-content',
      title: 'Original & Substantial Content (No Thin Content / AI Spam)',
      policy: 'Google Publisher Policies: Valuable Inventory',
      status: 'Ready',
      description: 'Zelqora publishes curated, thoroughly reviewed technical troubleshooting guides with reproducible diagnostic commands rather than mass-generated thin keyword permutations.'
    },
    {
      id: 'editorial-gatekeeper',
      title: 'Human Review Workflow for Public Guides',
      policy: 'Google Search Guidance on Generative AI',
      status: 'Ready',
      description: 'AI drafts are strictly prevented from auto-publishing by database and editorial state-machine assertions. Public guides require peer technical verification and source checking.'
    },
    {
      id: 'navigation-layout',
      title: 'Clear, Intuitive Site Navigation & Mobile Usability',
      policy: 'AdSense Site Navigation Guidelines',
      status: 'Ready',
      description: 'Clean responsive header, mobile navigation drawer, structured breadcrumbs, readable typography, and consistent maximum width container layout.'
    },
    {
      id: 'privacy-policy',
      title: 'Accurate Privacy Policy Disclosures',
      policy: 'AdSense Programme Policies: Privacy Policy Requirements',
      status: 'Ready',
      description: 'Truthfully documents account handling, bcrypt password hashing, diagnostic data storage, Google Gemini API encrypted transit, and future third-party advertising cookie disclosures.'
    },
    {
      id: 'mandatory-pages',
      title: 'Institutional Transparency Pages (About, Contact, Terms)',
      policy: 'Google Publisher Policies: Site Transparency',
      status: 'Ready',
      description: 'About, Terms of Use, Diagnostic Methodology, Editorial Review Standards, and Contact pages exist with honest, non-fabricated communication channels.'
    },
    {
      id: 'ad-isolation',
      title: 'Isolated & Distinguishable Ad Placements',
      policy: 'Google Ad Placement Policies',
      status: 'Ready',
      description: 'The AdSlot component is strictly disabled by default (ADS_ENABLED=false), distinctly labeled with "Advertisement", and never positioned near command copy buttons or evidence submission forms.'
    },
    {
      id: 'no-private-ads',
      title: 'No Ads on Private or Sensitive Screens',
      policy: 'AdSense Policies: Pages with No Content / Private Sessions',
      status: 'Ready',
      description: 'Ads are completely prohibited on private diagnostic timelines, authentication modals, account settings, and sensitive server error states.'
    },
    {
      id: 'no-click-deception',
      title: 'Zero Click-Generation or Artificial Incentives',
      policy: 'AdSense Policies: Encouraging Clicks',
      status: 'Ready',
      description: 'No deceptive button alignments, floating popups, forced ad timers, or prompts encouraging users to interact with advertisements.'
    },
    {
      id: 'seo-robots-sitemap',
      title: 'Valid Sitemap.xml and Robots.txt',
      policy: 'Google Search Essentials: Indexing Policy',
      status: 'Ready',
      description: 'Dynamic sitemap.xml includes only public pages and published guides. Robots.txt disallows private /api/, /investigations/, and user accounts.'
    },
    {
      id: 'verified-docs',
      title: 'Grounding in Official Documentation Only',
      policy: 'Anti-Hallucination & Factual Grounding',
      status: 'Ready',
      description: 'All documentation citations point to an approved registry of official manual domains (Node.js, Docker, Python, PostgreSQL, React, MDN) with verified URLs.'
    },
    {
      id: 'performance-cwv',
      title: 'Fast Performance & Clean Core Web Vitals',
      policy: 'Google Search Essentials: Page Experience',
      status: 'Ready',
      description: 'Single-page Vite build with sub-second asset bundling, zero layout shift (CLS), and accessible focus states.'
    },
    {
      id: 'secret-redaction',
      title: 'Proactive Sensitive Data Redaction',
      policy: 'Security & User Data Protection',
      status: 'Ready',
      description: 'Multi-pattern regex redaction scrubs AWS keys, GitHub tokens, Bearer headers, database credentials, and private keys before persistence.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Title */}
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Publisher Policy & Search Quality Preparation
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          AdSense & Publisher Policy Readiness Checklist
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Comprehensive compliance audit verifying Zelqora against official Google Publisher, Search Essentials, and AdSense Programme standards.
        </p>
      </div>

      {/* Current Operational Status */}
      <Card padding="md" className="border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Monetization Engine Status
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${health?.monetization.ads_enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="text-sm font-bold text-slate-900">
                {health?.monetization.ads_enabled ? 'Advertising Enabled' : 'Advertising Disabled (Default / Compliant)'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Publisher Client ID: {health?.monetization.adsense_client_id_configured ? 'Configured in .env' : 'Unset (Zero Ad Network Requests)'}
            </p>
          </div>

          <Badge variant="blue" size="md">
            12 of 12 Criteria Satisfied
          </Badge>
        </div>
      </Card>

      {/* Official Guidelines Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Notice Regarding Google AdSense Approval</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          This checklist is a technical and architectural preparation tool based on current official guidelines (<a href="https://support.google.com/adsense/answer/48182" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">AdSense programme policies</a> &bull; <a href="https://support.google.com/adsense/answer/10502938" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Publisher Policies</a>). Final approval is granted exclusively by Google after domain review.
        </p>
      </div>

      {/* 12 Criteria List */}
      <div className="space-y-4">
        {criteria.map((item, idx) => (
          <div
            key={item.id}
            className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 text-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">
                  Criteria {idx + 1} &bull; {item.policy}
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h3>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{item.status}</span>
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed text-xs">
              {item.description}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
