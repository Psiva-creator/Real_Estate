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
import { getPublicUrl } from '@/lib/domain';

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

    // Direct staff to Executive Command Center
    router.replace('/dashboard');
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

      setSuccessMessage(`Access Granted: Welcome, ${result.user.name}. Opening ${result.role === 'ADMIN' ? 'Executive Command Center' : 'Broker Desk'}...`);
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
    <div className="min-h-screen bg-[#FAF8F5] text-[#191512] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Warm ambient luxury glow matching main portal */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-b from-[#EDE6DA]/70 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[450px] h-[300px] bg-gradient-to-t from-[#EDE6DA]/50 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        {/* Security Badge & Title */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1EA] border border-[#E8E2D9] text-[#5C4026] text-[11px] font-semibold tracking-wider uppercase shadow-xs">
            <Lock className="w-3.5 h-3.5 text-[#8C653E]" />
            <span>Confidential Internal Terminal</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#191512] tracking-wider uppercase">
            Telangana Realty Hub
          </h1>
          <p className="text-[10px] sm:text-xs font-medium text-[#8C653E] tracking-[0.16em] uppercase">
            Platform Legal Scrutiny &amp; Operations Console
          </p>
        </div>

        {/* Existing Active Staff Session */}
        {isAuthenticated && user && user.role !== 'SELLER' && (
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-4.5 text-center space-y-3 shadow-sm">
            <div className="flex items-center justify-center gap-2 text-[#059669] text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>Active Terminal Session: {user.name} ({user.role})</span>
            </div>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => handleRoleRedirect(user.role)}
                className="px-4 py-2 rounded-xl bg-[#191512] hover:bg-[#8C653E] text-[#FAF8F5] font-bold text-xs transition-all shadow-sm"
              >
                Access Desk
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="px-3.5 py-2 rounded-xl bg-[#F5F1EA] hover:bg-[#EDE6DA] border border-[#E8E2D9] text-[#574F48] text-xs font-semibold transition-all"
              >
                Terminate Session
              </button>
            </div>
          </div>
        )}

        {/* Main Terminal Box */}
        <div className="bg-white/95 backdrop-blur-xl border border-[#E8E2D9] rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_-10px_rgba(25,21,18,0.06)] space-y-6">
          {/* Target Role Selector */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F5F1EA] rounded-2xl border border-[#E8E2D9]">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('ADMIN');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedRole === 'ADMIN'
                  ? 'bg-[#201512] text-[#FBF8F3] border border-[#201512] shadow-sm'
                  : 'bg-[#FBF8F3] text-[#201512] border border-[#E2CFB6] hover:border-[#C79A6B]/50 hover:text-[#201512]'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 transition-colors ${selectedRole === 'ADMIN' ? 'text-[#C79A6B]' : 'text-[#8C653E]'}`} />
              <span>Lead Director</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('AGENT');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedRole === 'AGENT'
                  ? 'bg-[#201512] text-[#FBF8F3] border border-[#201512] shadow-sm'
                  : 'bg-[#FBF8F3] text-[#201512] border border-[#E2CFB6] hover:border-[#C79A6B]/50 hover:text-[#201512]'
              }`}
            >
              <Briefcase className={`w-4 h-4 transition-colors ${selectedRole === 'AGENT' ? 'text-[#C79A6B]' : 'text-[#8C653E]'}`} />
              <span>Deal Advisor</span>
            </button>
          </div>

          <div className="text-[11px] text-[#574F48] bg-[#F5F1EA]/80 p-3.5 rounded-xl border border-[#E8E2D9] flex items-start gap-2.5 leading-relaxed">
            <Shield className="w-4 h-4 text-[#8C653E] shrink-0 mt-0.5" />
            <div>
              {selectedRole === 'ADMIN' ? (
                <span>
                  <strong className="text-[#191512]">Director Clearance:</strong> Authorizes legal scrutiny and verification approval for Dharani Passbooks, Pahani, Form 1B, and HMDA layouts.
                </span>
              ) : (
                <span>
                  <strong className="text-[#191512]">Advisor Clearance:</strong> Manages verified property listings, client enquiry mediation, and scheduled site visits.
                </span>
              )}
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Secure Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#5C4026] uppercase tracking-wider mb-1.5">
                Staff Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C653E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={selectedRole === 'ADMIN' ? 'admin@telanganarealty.in' : 'advisor@telanganarealty.in'}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#FAF8F5] border border-[#E2CFB6] focus:border-[#8C653E] focus:bg-white focus:ring-2 focus:ring-[#8C653E]/15 rounded-xl text-sm text-[#191512] placeholder-[#A89F95] font-mono transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C4026] uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C653E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E2CFB6] focus:border-[#8C653E] focus:bg-white focus:ring-2 focus:ring-[#8C653E]/15 rounded-xl text-sm text-[#191512] placeholder-[#A89F95] transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C653E] hover:text-[#5C4026] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md hover:shadow-lg bg-[#201512] hover:bg-[#2F211C] text-[#FBF8F3] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[#C79A6B]" />
                  <span>Authenticate &amp; Open Terminal</span>
                  <ArrowRight className="w-4 h-4 text-[#C79A6B] ml-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Legal & Navigation Links */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs font-semibold">
            <Link
              href={`/${locale}/login`}
              className="text-[#8C653E] hover:text-[#5C4026] transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Unified Role Portal &amp; Seller Login
            </Link>
            <span className="text-[#E8E2D9]">•</span>
            <Link
              href={getPublicUrl(`/${locale}`)}
              className="text-[#574F48] hover:text-[#191512] transition-colors"
            >
              Public Website
            </Link>
          </div>
          <div className="text-[10px] tracking-widest uppercase text-[#8C653E]/80 font-medium">
            Telangana Realty Hub • Monitored &amp; Protected by Edge Security
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
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-[#8C653E]">
            <div className="w-8 h-8 border-2 border-[#8C653E] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold tracking-wider uppercase">Loading Terminal...</span>
          </div>
        </div>
      }
    >
      <InternalDeskContent params={params} />
    </Suspense>
  );
}
