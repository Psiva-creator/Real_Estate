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
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { isValidLocale, Locale } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/api';

interface InternalDeskPageProps {
  params: { locale: string };
}

function InternalDeskContent({ params }: InternalDeskPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;

  const { user, isAuthenticated, login, logout } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'AGENT'>('ADMIN');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setErrorMessage('Corporate staff email is required.');
      return;
    }

    if (!password) {
      setErrorMessage('Security password is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(identifier.trim(), password);

      if (result.role === 'SELLER') {
        logout();
        setErrorMessage('Access Denied. This terminal is strictly restricted to certified directors and deal advisors.');
        return;
      }

      setSuccessMessage(`Access Granted: Welcome, ${result.user.name}. Opening ${result.role === 'ADMIN' ? '13-Doc Verification Reviewer' : 'Broker Desk'}...`);
      setTimeout(() => {
        handleRoleRedirect(result.role);
      }, 500);
    } catch (err: unknown) {
      setErrorMessage((err as Error)?.message || 'Authentication failed. Access denied.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle radial security glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[450px] h-[250px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        {/* Security Badge & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/30 text-amber-400 text-[11px] font-bold tracking-wider uppercase">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Confidential Internal Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Telangana Realty Hub
          </h1>
          <p className="text-xs text-slate-400">
            Platform Legal Review & Operations Console
          </p>
        </div>

        {/* Existing Active Staff Session */}
        {isAuthenticated && user && user.role !== 'SELLER' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Active Terminal Session: {user.name} ({user.role})</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleRoleRedirect(user.role)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Access Desk
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Terminate Session
              </button>
            </div>
          </div>
        )}

        {/* Main Terminal Box */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Target Role Selector */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('ADMIN');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'ADMIN'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Lead Director</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('AGENT');
                setErrorMessage(null);
              }}
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

          <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/70 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              {selectedRole === 'ADMIN' ? (
                <span>
                  <strong className="text-amber-400">Director Clearance:</strong> Authorizes legal scrutiny and verification approval for Dharani Passbooks, Pahani, Form 1B, and HMDA layouts.
                </span>
              ) : (
                <span>
                  <strong className="text-blue-400">Advisor Clearance:</strong> Manages verified property listings, client enquiry mediation, and scheduled site visits.
                </span>
              )}
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Secure Login Form (No Pre-filled values, No 1-click buttons) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Staff Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={selectedRole === 'ADMIN' ? 'admin@telanganarealty.in' : 'advisor@telanganarealty.in'}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono transition-colors"
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
                  placeholder="Enter security password"
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
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate & Open Terminal</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Legal & Security Warning Footer */}
        <div className="text-center space-y-2">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </Link>
          <div className="text-[10px] text-slate-600">
            Strictly Private • Monitored & Protected by Edge Security
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InternalDeskPage({ params }: InternalDeskPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Loading Terminal...</span>
          </div>
        </div>
      }
    >
      <InternalDeskContent params={params} />
    </Suspense>
  );
}
