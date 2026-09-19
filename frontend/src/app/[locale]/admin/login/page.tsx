'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Landmark,
  FileCheck,
} from 'lucide-react';
import { isValidLocale, Locale } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/api';

interface AdminLoginPageProps {
  params: { locale: string };
}

function AdminLoginFormContent({ params }: AdminLoginPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const isTe = locale === 'te';

  const { user, isAuthenticated, isLoading: authLoading, login, logout } = useAuth();

  // Internal Staff roles: ADMIN or AGENT
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'AGENT'>('ADMIN');
  const [identifier, setIdentifier] = useState('admin@telanganarealty.in');
  const [password, setPassword] = useState('Admin@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fillStaffRole = (role: 'ADMIN' | 'AGENT') => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'ADMIN') {
      setIdentifier('admin@telanganarealty.in');
      setPassword('Admin@1234');
    } else {
      setIdentifier('suresh.reddy@telanganarealty.in');
      setPassword('Agent@1234');
    }
  };

  const handleRoleRedirect = (role: UserRole) => {
    if (redirectUrl && redirectUrl.startsWith('/dashboard')) {
      if (role === 'AGENT' && redirectUrl.startsWith('/dashboard/verification')) {
        router.replace('/dashboard/properties');
        return;
      }
      router.replace(redirectUrl);
      return;
    }

    if (role === 'ADMIN') {
      router.replace('/dashboard/verification');
    } else {
      router.replace('/dashboard/properties');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please provide your staff email address or ID');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(identifier.trim(), password || undefined);

      if (result.role === 'SELLER') {
        logout();
        setErrorMessage('This console is restricted to internal staff. Landowners must sign in through the Public Seller Portal.');
        return;
      }

      setSuccessMessage(`Welcome, ${result.user.name}! Opening ${result.role === 'ADMIN' ? 'Lead Admin Console' : 'Deal Agent Desk'}...`);
      setTimeout(() => {
        handleRoleRedirect(result.role);
      }, 500);
    } catch (err: unknown) {
      setErrorMessage((err as Error)?.message || 'Staff authentication failed. Verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Restricted Internal Console • Authorized Personnel Only</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Telangana Realty Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Back-Office Operations, 13-Doc Verification & Mediation Desk
          </p>
        </div>

        {/* Auth Active Session Banner */}
        {isAuthenticated && user && user.role !== 'SELLER' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Active session: {user.name} ({user.role})</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleRoleRedirect(user.role)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Go to Workspace
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Staff Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => fillStaffRole('ADMIN')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'ADMIN'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillStaffRole('AGENT')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'AGENT'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Deal Advisor</span>
            </button>
          </div>

          {/* Role Clearance Notice */}
          <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              {selectedRole === 'ADMIN' ? (
                <span>
                  <strong className="text-amber-400">Executive Clearance:</strong> Review Dharani passbooks, approve/reject all 13 legal deeds, publish verified properties.
                </span>
              ) : (
                <span>
                  <strong className="text-blue-400">Advisor Clearance:</strong> Oversee buyer inquiries, schedule site visits, manage listings and landowner relations.
                </span>
              )}
            </div>
          </div>

          {/* Error / Success Notices */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Staff Corporate Email / ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@telanganarealty.in"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                selectedRole === 'ADMIN'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
              }`}
            >
              {isSubmitting ? (
                <span>Authenticating Staff Credentials...</span>
              ) : (
                <>
                  <span>Sign In to {selectedRole === 'ADMIN' ? 'Admin Reviewer' : 'Advisor Desk'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Fast-Fill Testing Station */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Quick Staff Credentials</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">256-bit AES Audited</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillStaffRole('ADMIN')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedRole === 'ADMIN'
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Director Siva</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">admin@telanganarealty.in</div>
              </button>

              <button
                type="button"
                onClick={() => fillStaffRole('AGENT')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedRole === 'AGENT'
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  <span>Advisor Suresh</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">suresh.reddy@telanganarealty.in</div>
              </button>
            </div>
          </div>
        </div>

        {/* Back Link to Public Marketplace */}
        <div className="text-center space-y-2">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Marketplace</span>
          </Link>
          <div className="text-[10px] text-slate-600">
            Telangana Real Estate Brokerage Platform • Internal Systems
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage({ params }: AdminLoginPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Loading Staff Console...</span>
          </div>
        </div>
      }
    >
      <AdminLoginFormContent params={params} />
    </Suspense>
  );
}
