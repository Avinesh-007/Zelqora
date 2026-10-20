import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, ShieldCheck, Cpu, Menu, X, User as UserIcon, LogOut, BookOpen, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

export const Header: React.FC = () => {
  const { user, logout, login, register } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [engineStatus, setEngineStatus] = useState<{ mode: string; live: boolean }>({
    mode: 'Checking...',
    live: false
  });

  useEffect(() => {
    api.getHealth()
      .then(res => {
        setEngineStatus({
          mode: res.ai_engine.api_key_configured ? 'Gemini 2.5 Live' : 'Deterministic Engine',
          live: res.ai_engine.api_key_configured
        });
      })
      .catch(() => {
        setEngineStatus({ mode: 'Diagnostic Engine', live: false });
      });
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      setAuthModalOpen(false);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const navLinks = [
    { label: 'Workspace', path: '/troubleshoot' },
    { label: 'Guides', path: '/guides' },
    { label: 'Docs Registry', path: '/docs/sources' },
    { label: 'Methodology', path: '/methodology' },
    { label: 'About', path: '/about' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    Zelqora
                  </span>
                  <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    Troubleshoot
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(link => {
                  const isActive = location.pathname === link.path || 
                    (link.path !== '/' && location.pathname.startsWith(link.path));
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-blue-600 bg-blue-50/70 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Header: Engine indicator, Auth, and Primary Action */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Engine Status indicator */}
              <div 
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-600"
                title={engineStatus.live ? 'Connected directly to Google Gemini API' : 'Operating with local verified diagnostic engine'}
              >
                <span className={`w-2 h-2 rounded-full ${engineStatus.live ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                <span>{engineStatus.mode}</span>
              </div>

              {/* Auth button or User info */}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium px-2 py-1 bg-slate-100 rounded-md truncate max-w-[150px]">
                    {user.email}
                  </span>
                  {user.role === 'editor' || user.role === 'admin' ? (
                    <Link to="/editorial">
                      <Button size="sm" variant="outline">
                        Editorial
                      </Button>
                    </Link>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => logout()}
                    icon={<LogOut className="w-3.5 h-3.5" />}
                    title="Sign out"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }}
                  icon={<UserIcon className="w-3.5 h-3.5" />}
                >
                  Sign in
                </Button>
              )}

              <Link to="/troubleshoot">
                <Button size="sm" variant="primary">
                  Start Investigation
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex sm:hidden items-center gap-2">
              <Link to="/troubleshoot">
                <Button size="sm" variant="primary">
                  Investigate
                </Button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <div className="space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/adsense-readiness"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
              >
                AdSense Readiness
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              {user ? (
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">Signed in as <span className="font-semibold text-slate-800">{user.email}</span></div>
                  <Button
                    size="md"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <Button
                  size="md"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }}
                >
                  Sign in or Register
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authMode === 'login' ? 'Sign in to Zelqora' : 'Create an Account'}
        description={authMode === 'login' 
          ? 'Access your private troubleshooting history and save investigations.'
          : 'Save your investigations across devices and manage your diagnostic history.'}
      >
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {authError}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="developer@example.com"
          />

          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            helperText={authMode === 'register' ? 'Minimum 8 characters' : undefined}
          />

          <Button
            type="submit"
            className="w-full"
            loading={authSubmitting}
          >
            {authMode === 'login' ? 'Sign in' : 'Create account'}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => {
                setAuthError('');
                setAuthMode(authMode === 'login' ? 'register' : 'login');
              }}
            >
              {authMode === 'login' 
                ? "Don't have an account? Create one" 
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
