import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  Lock,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Wrench,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

interface RoleOption {
  role: Role;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  features: string[];
  demoEmail: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'Admin',
    title: 'Admin',
    description: 'Full system access, user & role management, and global system configuration.',
    icon: ShieldCheck,
    badge: 'Full Access',
    features: ['All 6 Hub Modules', 'User & Role Provisioning', 'Audit & Scorecard Overrides'],
    demoEmail: 'sarah.connor@automotive-tier1.com',
  },
  {
    role: 'Purchasing Manager',
    title: 'Purchasing Manager',
    description:
      'Manage supplier accreditation, master data, commercial agreements, and onboarding pipeline.',
    icon: ShoppingBag,
    badge: 'Commercial Lead',
    features: ['Supplier Approval Pipeline', 'Master Data Hub', 'Commercial SQA Agreements'],
    demoEmail: 'r.chen@automotive-tier1.com',
  },
  {
    role: 'Supplier Quality Engineer',
    title: 'Supplier Quality Engineer',
    description: 'Performance monitoring, compliance audits, SCAR tracking, and corrective actions (CAPA).',
    icon: Wrench,
    badge: 'Technical & Quality',
    features: ['Live PPM & OTD Scorecards', 'VDA 6.3 / CoP Audits', '8D CAR Incident Logging'],
    demoEmail: 'j.doe@automotive-tier1.com',
  },
  {
    role: 'Executive Viewer',
    title: 'Executive Viewer',
    description: 'Access to read-only high-level dashboards, Fleet PPM KPIs, and standards library.',
    icon: Eye,
    badge: 'Executive Oversight',
    features: ['Executive Fleet Dashboard', 'Standards & Benchmark Library', 'Read-only Safe Mode'],
    demoEmail: 'm.johnson@automotive-tier1.com',
  },
];

const DEMO_PASSWORD = 'CopDemo2026!';

export const RoleLogin: React.FC = () => {
  const { signIn, signUp } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<Role>('Admin');
  const [email, setEmail] = useState(ROLES[0].demoEmail);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSelectRole = (option: RoleOption) => {
    setSelectedRole(option.role);
    setError(null);
    setInfo(null);
    if (mode === 'signin') {
      setEmail(option.demoEmail);
      setPassword(DEMO_PASSWORD);
    }
  };

  const switchMode = (next: 'signin' | 'signup') => {
    setMode(next);
    setError(null);
    setInfo(null);
    if (next === 'signin') {
      const option = ROLES.find(r => r.role === selectedRole) ?? ROLES[0];
      setEmail(option.demoEmail);
      setPassword(DEMO_PASSWORD);
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setError('Enter both an email address and a password.');
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Choose a password of at least 8 characters.');
      return;
    }

    setIsAuthenticating(true);
    try {
      if (mode === 'signin') {
        const { error: signInError } = await signIn(email, password);
        if (signInError) setError(signInError);
        // On success the auth listener swaps this screen out for the workspace.
      } else {
        const { error: signUpError, needsConfirmation } = await signUp(email, password, {
          name: fullName.trim() || email.split('@')[0],
          role: selectedRole,
        });
        if (signUpError) {
          setError(signUpError);
        } else if (needsConfirmation) {
          setInfo(`Account created for ${email}. Confirm the email we sent, then sign in.`);
          setMode('signin');
        }
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1320] text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Subtle background grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10 bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top micro bar */}
      <div className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] border border-slate-800 flex items-center justify-center text-teal-400">
            <span className="font-semibold text-xs">CoP</span>
          </div>
          <div>
            <span className="font-semibold text-xs tracking-tight text-slate-900 dark:text-white">
              Tier-1 Automotive Compliance
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-2 hidden sm:inline">
              IATF 16949 / VDA 6.3 Standard
            </span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          <span>Supabase Auth Active</span>
        </div>
      </div>

      {/* Main Login Workspace */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 sm:p-8 max-w-5xl mx-auto w-full my-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8 max-w-2xl"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0F172A] text-teal-400 mb-3 border border-slate-800">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2">
            Supplier CoP Management Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Conformity of Production &amp; Quality Compliance Management.{' '}
            {mode === 'signin'
              ? 'Pick a role to load its demo credentials, then sign in.'
              : 'Choose the role your new account should be provisioned with.'}
          </p>
        </motion.div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
          {ROLES.map((item, idx) => {
            const isSelected = selectedRole === item.role;
            const IconComponent = item.icon;

            return (
              <motion.div
                key={item.role}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                onClick={() => handleSelectRole(item)}
                className={`group relative p-5 rounded-2xl cursor-pointer border transition-all text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-[#1E293B] border-teal-500 shadow-xs ring-1 ring-teal-500/30'
                    : 'bg-white dark:bg-[#1E293B]/70 hover:bg-white dark:hover:bg-[#1E293B] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-teal-600 group-hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3
                        className={`text-sm font-semibold transition-colors ${
                          isSelected
                            ? 'text-teal-700 dark:text-teal-300'
                            : 'text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Role feature pills */}
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {item.features.map(feat => (
                        <span
                          key={feat}
                          className="inline-flex items-center text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-teal-600 dark:text-teal-400" />
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-3.5 right-3.5">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Credentials card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-md bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs p-5 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </h2>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(['signin', 'signup'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                    mode === m
                      ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {m === 'signin' ? 'Sign in' : 'Sign up'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'signup' && (
            <label className="block">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Full name</span>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Alex Fischer"
                autoComplete="name"
                className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
              />
            </label>
          )}

          <label className="block">
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Work email</span>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@automotive-tier1.com"
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Password</span>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </label>

          {error && (
            <div className="flex items-start gap-2 text-[11px] text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 mt-px flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="flex items-start gap-2 text-[11px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 mt-px flex-shrink-0" />
              <span>{info}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full px-7 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            {isAuthenticating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{mode === 'signin' ? 'Launching Workspace...' : 'Provisioning Account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? `Enter as ${selectedRole}` : `Create ${selectedRole} account`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            {mode === 'signin' ? (
              <>
                Demo accounts are pre-seeded — password{' '}
                <span className="font-mono text-slate-500 dark:text-slate-300">{DEMO_PASSWORD}</span>. Access is
                enforced by Supabase Row Level Security.
              </>
            ) : (
              <>New accounts are provisioned with the selected role via a Postgres signup trigger.</>
            )}
          </p>
        </motion.form>
      </div>

      {/* Footer */}
      <div className="relative z-10 w-full text-center py-3 text-slate-400 dark:text-slate-500 text-xs border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs">
        © 2026 Automotive Supply Chain Hub • Conformity of Production (CoP) Tier-1 Management System
      </div>
    </div>
  );
};
