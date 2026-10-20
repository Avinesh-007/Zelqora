import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, FileText, ExternalLink, HelpCircle, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">Zelqora</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              An evidence-driven technical troubleshooting platform combining adaptive diagnostic questioning, verifiable tests, and official documentation grounding.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Execution on User Machines</span>
              </span>
            </div>
          </div>

          {/* Diagnostic Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3.5">
              Troubleshooting Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/troubleshoot" className="hover:text-white transition-colors">
                  Diagnostic Workspace
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-white transition-colors">
                  Reviewed Technical Guides
                </Link>
              </li>
              <li>
                <Link to="/docs/sources" className="hover:text-white transition-colors">
                  Approved Docs Registry
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-white transition-colors">
                  Investigation Methodology
                </Link>
              </li>
              <li>
                <Link to="/adsense-readiness" className="hover:text-white transition-colors text-blue-400 font-medium">
                  AdSense Policy Checklist
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial & Policies */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3.5">
              Standards & Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/editorial-policy" className="hover:text-white transition-colors">
                  Editorial Review Standards
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy & Data Handling
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Use & Disclaimers
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Zelqora Engineering
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Diagnostic Safety Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Diagnostic Safety Notice
            </h4>
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Sanitize Sensitive Data</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                While automated redaction removes common credentials and keys, always review command outputs and logs before submitting. Never submit production credentials.
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              Zelqora never claims that every software or infrastructure defect can be resolved.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} Zelqora. Built with real Gemini AI, SQLite persistence, and verified official documentation.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/privacy" className="hover:text-slate-300">Privacy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-slate-300">Terms</Link>
            <span>&bull;</span>
            <Link to="/editorial-policy" className="hover:text-slate-300">Editorial</Link>
            <span>&bull;</span>
            <Link to="/contact" className="hover:text-slate-300">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
