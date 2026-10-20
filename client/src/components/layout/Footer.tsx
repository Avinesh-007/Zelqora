import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

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
              A structured technical troubleshooting platform helping engineers, developers, and administrators understand and fix software problems safely.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Commands Run Locally by You</span>
              </span>
            </div>
          </div>

          {/* Diagnostic Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3.5">
              Tools & Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/troubleshoot" className="hover:text-white transition-colors">
                  Diagnose an Issue
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-white transition-colors">
                  Troubleshooting Guides
                </Link>
              </li>
              <li>
                <Link to="/docs/sources" className="hover:text-white transition-colors">
                  Official Documentation
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-white transition-colors">
                  Diagnostic Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Policies */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3.5">
              Trust & Standards
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Zelqora
                </Link>
              </li>
              <li>
                <Link to="/editorial-policy" className="hover:text-white transition-colors">
                  Editorial Standards
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety Reminder */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Safety Reminder
            </h4>
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Review Before Running</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Always review suggested shell commands before executing them on your machine. Never share passwords, private keys, or confidential production credentials.
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              Zelqora provides structured diagnostic reasoning and cannot guarantee that every software defect can be resolved.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} Zelqora. Focused on safe, evidence-based technical troubleshooting.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/privacy" className="hover:text-slate-300">Privacy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-slate-300">Terms</Link>
            <span>&bull;</span>
            <Link to="/methodology" className="hover:text-slate-300">Methodology</Link>
            <span>&bull;</span>
            <Link to="/contact" className="hover:text-slate-300">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
