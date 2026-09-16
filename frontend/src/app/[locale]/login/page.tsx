'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  Lock,
  Mail,
  Phone,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  FileCheck2,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { isValidLocale, Locale, getDictionary } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';

interface LoginPageProps {
  params: { locale: string };
}

function LoginFormContent({ params }: LoginPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const isTe = locale === 'te';
  const dict = getDictionary(locale);

  const { user, isAuthenticated, isLoading: authLoading, login, register, logout } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [regPassword, setRegPassword] = useState('');

  // Route after login based on role
  const handleRoleRedirect = (role: string) => {
    if (redirectUrl && redirectUrl.startsWith('/dashboard')) {
      // If seller tries to access admin-only tab, redirect to seller dashboard
      if (role === 'SELLER' && !redirectUrl.startsWith('/dashboard/seller')) {
        router.replace('/dashboard/seller');
        return;
      }
      router.replace(redirectUrl);
      return;
    }

    if (role === 'SELLER') {
      router.replace('/dashboard/seller');
    } else {
      router.replace('/dashboard/properties');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage(isTe ? 'దయచేసి ఫోన్ నంబర్ లేదా ఈమెయిల్ నమోదు చేయండి' : 'Please enter your phone number or email');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(loginIdentifier.trim(), loginPassword || undefined);
      setSuccessMessage(
        isTe
          ? `స్వాగతం ${result.user.name}! పోర్టల్‌లోకి తీసుకెళ్తున్నాం...`
          : `Welcome back, ${result.user.name}! Redirecting to dashboard...`
      );
      setTimeout(() => {
        handleRoleRedirect(result.role);
      }, 500);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || (isTe ? 'లాగిన్ విఫలమైంది. దయచేసి వివరాలు సరిచూసుకోండి.' : 'Login failed. Please verify credentials.');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage(isTe ? 'దయచేసి మీ పూర్తి పేరును నమోదు చేయండి' : 'Please enter your full name');
      return;
    }

    if (!regPhone.trim() || regPhone.trim().replace(/\D/g, '').length < 10) {
      setErrorMessage(isTe ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    try {
      const whatsappVal = sameAsPhone ? regPhone.trim() : (regWhatsapp.trim() || regPhone.trim());
      const result = await register({
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim() || undefined,
        whatsapp: whatsappVal,
        password: regPassword.trim() || undefined,
        role: 'SELLER',
      });

      setSuccessMessage(
        isTe
          ? `ఖాతా విజయవంతంగా సృష్టించబడింది, ${result.user.name}! సెల్లర్ డ్యాష్‌బోర్డ్‌లోకి తీసుకెళ్తున్నాం...`
          : `Seller account registered successfully, ${result.user.name}! Redirecting to seller dashboard...`
      );
      setTimeout(() => {
        handleRoleRedirect(result.role);
      }, 600);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || (isTe ? 'నమోదు విఫలమైంది. దయచేసి వివరాలు సరిచూసుకోండి.' : 'Registration failed. Please check your details.');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setMode('login');
    setLoginIdentifier('admin@telanganarealty.in');
    setLoginPassword('Admin@1234');
    setErrorMessage(null);
  };

  const fillDemoAgent = () => {
    setMode('login');
    setLoginIdentifier('suresh.reddy@telanganarealty.in');
    setLoginPassword('Admin@1234');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 sm:py-14 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-slate-900 text-white shadow-md mx-auto">
            <Shield className="w-6 h-6 text-emerald-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {dict.auth?.portalTitle || 'Telangana Realty Hub Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            {dict.auth?.portalSubtitle ||
              'One unified portal for Verified Land & Apartment Sellers, Deal Agents, and Administrators.'}
          </p>
        </div>

        {/* If already logged in */}
        {isAuthenticated && user && !authLoading ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isTe ? 'మీరు ఇప్పటికే లాగిన్ అయి ఉన్నారు' : 'You are currently signed in'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {user.name} ({user.phone || user.email})
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>
                    {user.role === 'SELLER'
                      ? isTe
                        ? 'ధృవీకరించబడిన విక్రేత (Seller)'
                        : 'Seller Account'
                      : user.role === 'ADMIN'
                      ? isTe
                        ? 'లీడ్ అడ్మినిస్ట్రేటర్ (Admin)'
                        : 'Admin Back-Office'
                      : isTe
                      ? 'రియల్టీ ఏజెంట్ (Agent)'
                      : 'Agent Back-Office'}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleRoleRedirect(user.role)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
              >
                <span>{isTe ? 'డ్యాష్‌బోర్డ్‌కి వెళ్లండి' : 'Continue to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{dict.nav.logout || 'Log Out'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Card */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-3.5 text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${
                  mode === 'login'
                    ? 'border-emerald-800 text-emerald-800 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>{dict.auth?.signInTab || 'Sign In'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-3.5 text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${
                  mode === 'register'
                    ? 'border-emerald-800 text-emerald-800 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>{dict.auth?.registerTab || 'Register as Seller'}</span>
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              {/* Alert Messages */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Login Form */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      {dict.auth?.identifierLabel || 'Phone Number or Email Address'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder={dict.auth?.identifierPlaceholder || 'e.g. 9848012345 or user@example.com'}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        {dict.auth?.passwordLabel || 'Password'}
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder={dict.auth?.passwordPlaceholder || 'Enter password'}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>{dict.auth?.loggingIn || 'Signing in...'}</span>
                    ) : (
                      <>
                        <span>{dict.auth?.loginButton || 'Sign In to Portal'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {dict.auth?.nameLabel || 'Full Legal Name'} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={dict.auth?.namePlaceholder || 'e.g. K. Venkatesh Rao'}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {dict.auth?.phoneLabel || 'Mobile Number'} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder={dict.auth?.phonePlaceholder || '10-digit mobile number'}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {dict.auth?.emailLabel || 'Email Address (Optional)'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder={dict.auth?.emailPlaceholder || 'seller@example.com'}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {dict.auth?.passwordLabel || 'Password'} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder={dict.auth?.passwordPlaceholder || 'Set an account password'}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {isTe
                        ? 'నమోదు చేసుకున్న వెంటనే మీ సెల్లర్ డ్యాష్‌బోర్డ్ సిద్ధమవుతుంది.'
                        : 'Registers you immediately as a Verified Land/Flat Seller.'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>{dict.auth?.registering || 'Registering account...'}</span>
                    ) : (
                      <>
                        <span>{dict.auth?.registerButton || 'Create Seller Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Quick Demo Credentials Assistant */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {dict.auth?.demoCredentials || 'Quick Demo Credentials'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-left transition-colors group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                      Lead Admin
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">admin@telanganarealty.in</div>
                  </button>
                  <button
                    type="button"
                    onClick={fillDemoAgent}
                    className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-left transition-colors group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                      Deal Agent
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">suresh.reddy@telanganarealty.in</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Back Link */}
        <div className="text-center">
          <Link
            href={`/${locale}`}
            className="text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors"
          >
            ← {isTe ? 'ప్రజా వెబ్‌సైట్‌కి తిరిగి వెళ్లండి' : 'Return to Public Website'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CommonPortalLoginPage({ params }: LoginPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 py-14 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Loading Portal...</span>
          </div>
        </div>
      }
    >
      <LoginFormContent params={params} />
    </Suspense>
  );
}
