'use client';

import React, { useState, Suspense } from 'react';
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
  Building2,
  FileCheck2,
  Landmark,
  Sparkles,
  HelpCircle,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { isValidLocale, Locale, getDictionary } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/api';

interface LoginPageProps {
  params: { locale: string };
}

type AuthTab = 'login' | 'register';

function PublicLoginFormContent({ params }: LoginPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const isTe = locale === 'te';
  const dict = getDictionary(locale);

  const { user, isAuthenticated, isLoading: authLoading, login, register, logout } = useAuth();

  const [mode, setMode] = useState<AuthTab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('9848011223');
  const [loginPassword, setLoginPassword] = useState('Seller@1234');

  // Register form state (Sellers)
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [regPassword, setRegPassword] = useState('');

  const isStaffIdentifier = loginIdentifier.toLowerCase().includes('@telanganarealty.in');

  const fillDemoSeller = () => {
    setLoginIdentifier('9848011223');
    setLoginPassword('Seller@1234');
    setErrorMessage(null);
  };

  const handleRoleRedirect = (role: UserRole) => {
    if (redirectUrl && redirectUrl.startsWith('/dashboard/seller')) {
      router.replace(redirectUrl);
      return;
    }
    router.replace('/dashboard/seller');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage(
        isTe ? 'దయచేసి ఫోన్ నంబర్ లేదా ఈమెయిల్ నమోదు చేయండి' : 'Please enter your phone number or email'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(loginIdentifier.trim(), loginPassword || undefined);

      if (result.role !== 'SELLER') {
        // Staff logged in via public portal - redirect them to their respective internal desk
        setSuccessMessage(
          isTe
            ? `స్టాఫ్ ఖాతా గుర్తించబడింది. వర్క్‌స్పేస్‌లోకి తీసుకెళ్తున్నాం...`
            : `Staff credentials detected. Opening authorized workspace...`
        );
        setTimeout(() => {
          if (result.role === 'ADMIN') router.replace('/dashboard/verification');
          else router.replace('/dashboard/properties');
        }, 500);
        return;
      }

      setSuccessMessage(
        isTe
          ? `స్వాగతం ${result.user.name}! సెల్లర్ పోర్టల్‌లోకి తీసుకెళ్తున్నాం...`
          : `Welcome, ${result.user.name}! Opening Seller Workspace...`
      );
      setTimeout(() => {
        handleRoleRedirect(result.role);
      }, 500);
    } catch (err: unknown) {
      setErrorMessage(
        (err as Error)?.message ||
          (isTe
            ? 'లాగిన్ విఫలమైంది. దయచేసి వివరాలు సరిచూసుకోండి.'
            : 'Authentication failed. Please verify credentials.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage(isTe ? 'దయచేసి మీ పూర్తి పేరును నమోదు చేయండి' : 'Please enter your full legal name');
      return;
    }

    const cleanPhone = regPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage(
        isTe
          ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి'
          : 'Please enter a valid 10-digit phone number'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedPhone = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone.slice(-10)}`;
      const formattedWhatsapp = sameAsPhone
        ? formattedPhone
        : regWhatsapp.trim()
        ? `+91${regWhatsapp.replace(/\D/g, '').slice(-10)}`
        : undefined;

      const result = await register({
        name: regName.trim(),
        phone: formattedPhone,
        email: regEmail.trim() || undefined,
        whatsapp: formattedWhatsapp,
        password: regPassword || undefined,
        role: 'SELLER',
      });

      setSuccessMessage(
        isTe
          ? `నమోదు విజయవంతమైంది! స్వాగతం ${result.user.name} గారు.`
          : `Account registered successfully! Welcome ${result.user.name}.`
      );

      setTimeout(() => {
        handleRoleRedirect('SELLER');
      }, 600);
    } catch (err: unknown) {
      setErrorMessage(
        (err as Error)?.message ||
          (isTe ? 'నమోదు విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.' : 'Registration failed. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Telangana Realty Hub • Verified Seller Portal</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isTe ? 'భూ యజమాని & సెల్లర్ పోర్టల్' : 'Landowner & Seller Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {isTe
              ? 'మీ ఆస్తి 13-పత్రాల ధరణి తనిఖీ స్థితి మరియు కొనుగోలుదారుల విచారణలను ట్రాక్ చేయండి.'
              : 'Track your 13-document Dharani verification status and direct buyer inquiries.'}
          </p>
        </div>

        {/* Existing Active Session Notice */}
        {isAuthenticated && user && (
          <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-sm text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {isTe ? `ప్రస్తుత సెషన్: ${user.name}` : `Signed in as: ${user.name}`} ({user.role})
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleRoleRedirect(user.role)}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                {isTe ? 'పోర్టల్‌కి వెళ్లండి' : 'Open Seller Dashboard'}
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                {isTe ? 'లాగ్ అవుట్' : 'Sign Out'}
              </button>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
          {/* Sign In vs Register Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isTe ? 'లాగిన్' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isTe ? 'కొత్త సెల్లర్ ఖాతా' : 'Create Account'}
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}



          {/* Mode 1: Sign In */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isTe ? 'మొబైల్ నంబర్ లేదా ఈమెయిల్' : 'Phone Number or Email'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="+91 98480 11223"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {isTe ? 'పాస్‌వర్డ్' : 'Password'}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {isTe ? 'లేదా OTP' : 'or Demo Password'}
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{isTe ? 'ధృవీకరిస్తున్నాం...' : 'Signing In...'}</span>
                ) : (
                  <>
                    <span>{isTe ? 'సెల్లర్ పోర్టల్‌లోకి ప్రవేశించండి' : 'Sign In to Seller Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Mode 2: Register Seller Account */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTe ? 'భూ యజమాని పూర్తి పేరు' : 'Full Legal Name (Pattadar)'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. K. Venkateshwara Rao"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTe ? 'మొబైల్ నంబర్' : 'Mobile Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="98480 11223"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTe ? 'ఈమెయిల్ (ఐచ్ఛికం)' : 'Email Address (Optional)'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="kvrao@gmail.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTe ? 'పాస్‌వర్డ్' : 'Account Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{isTe ? 'ఖాతా సృష్టిస్తున్నాం...' : 'Creating Seller Account...'}</span>
                ) : (
                  <>
                    <span>{isTe ? 'సెల్లర్ ఖాతా సృష్టించండి' : 'Create Seller Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Landowner Fill */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTe ? 'డెమో సెల్లర్ పరీక్ష' : 'Demo Seller Testing'}</span>
            </span>
            <button
              type="button"
              onClick={fillDemoSeller}
              className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Fill Landowner Rao (+91 98480 11223)</span>
            </button>
          </div>
        </div>

        {/* Legal Trust Footer */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>13-Doc Dharani Vetted</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5 text-emerald-600" />
              <span>Telangana SRO Compliant</span>
            </span>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-1">
            <Link href={`/${locale}`} className="hover:text-emerald-800 transition-colors">
              ← {isTe ? 'ప్రజా వెబ్‌సైట్' : 'Return to Public Website'}
            </Link>
            <span>•</span>
            {/* Discrete Link to Staff Portal */}
            <Link
              href={`/${locale}/admin/login`}
              className="hover:text-slate-900 font-medium inline-flex items-center gap-1 transition-colors text-slate-400 hover:text-slate-700"
            >
              <Briefcase className="w-3 h-3" />
              <span>{isTe ? 'సిబ్బంది పోర్టల్' : 'Internal Staff Portal'} &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommonPortalLoginPage({ params }: LoginPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Loading Portal...</span>
          </div>
        </div>
      }
    >
      <PublicLoginFormContent params={params} />
    </Suspense>
  );
}
