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
  KeyRound,
  LogOut,
  Landmark,
  ShieldCheck,
  UserCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { isValidLocale, Locale, getDictionary } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/api';
import { CONTACT_CONFIG } from '@/lib/constants';

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

interface LoginPageProps {
  params: { locale: string };
}

type AuthTab = 'login' | 'register';

function LoginFormContent({ params }: LoginPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const isTe = locale === 'te';
  const dict = getDictionary(locale);

  const { user, isAuthenticated, isLoading: authLoading, login, loginWithGoogle, register, logout } = useAuth();

  const [mode, setMode] = useState<AuthTab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Production login state: strictly empty by default, no pre-fill
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state (Sellers & Land Owners)
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [regPassword, setRegPassword] = useState('');

  // Google / Gmail Auth Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Role routing guard: Public login strictly directs sellers to their portal
  const handleRoleRedirect = (role: UserRole) => {
    if (redirectUrl && redirectUrl.startsWith('/dashboard')) {
      // Security guard: Sellers can never be redirected to admin or agent internal routes
      if (role === 'SELLER' && !redirectUrl.startsWith('/dashboard/seller')) {
        router.replace('/dashboard/seller');
        return;
      }
      if (role === 'AGENT' && redirectUrl.startsWith('/dashboard/seller')) {
        router.replace('/dashboard/properties');
        return;
      }
      router.replace(redirectUrl);
      return;
    }

    // Default Destinations
    if (role === 'SELLER') {
      router.replace('/dashboard/seller');
    } else if (role === 'ADMIN') {
      router.replace('/dashboard');
    } else {
      router.replace('/dashboard/properties');
    }
  };

  const handleGoogleSignIn = () => {
    setErrorMessage(null);
    setShowGoogleModal(true);
  };

  const handleGoogleSubmit = async (emailToUse?: string, nameToUse?: string) => {
    const targetEmail = (emailToUse || googleEmailInput).trim();
    const targetName = (nameToUse || googleNameInput).trim();

    if (!targetEmail) {
      setErrorMessage(
        isTe
          ? 'దయచేసి మీ Gmail లేదా Google ఈమెయిల్ చిరునామాను నమోదు చేయండి.'
          : 'Please enter your Gmail or Google email address.'
      );
      return;
    }

    if (!targetEmail.includes('@') || !targetEmail.includes('.')) {
      setErrorMessage(
        isTe ? 'దయచేసి సరైన ఈమెయిల్ చిరునామాను నమోదు చేయండి.' : 'Please enter a valid email address.'
      );
      return;
    }

    setIsGoogleSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await loginWithGoogle({
        email: targetEmail,
        name: targetName || targetEmail.split('@')[0],
      });
      setShowGoogleModal(false);
      setSuccessMessage(
        isTe
          ? `Google ద్వారా లాగిన్ విజయవంతమైంది! స్వాగతం ${result.user.name}...`
          : `Signed in with Google successfully! Welcome back, ${result.user.name}...`
      );
      setTimeout(() => {
        handleRoleRedirect(result.role);
      }, 400);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Google authentication failed');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage(
        isTe ? 'దయచేసి మీ యూజర్‌నేమ్, మొబైల్ నంబర్ లేదా ఈమెయిల్ నమోదు చేయండి.' : 'Please enter your username, mobile number or email.'
      );
      return;
    }

    if (!loginPassword) {
      setErrorMessage(
        isTe ? 'దయచేసి మీ పాస్‌వర్డ్ నమోదు చేయండి.' : 'Please enter your account password.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(loginIdentifier.trim(), loginPassword);
      setSuccessMessage(
        isTe
          ? `స్వాగతం ${result.user.name}! పోర్టల్‌లోకి తీసుకెళ్తున్నాం...`
          : `Welcome back, ${result.user.name}! Opening your portal...`
      );
      setTimeout(() => {
        handleRoleRedirect(result.role);
      }, 400);
    } catch (err: unknown) {
      const msg =
        (err as Error)?.message ||
        (isTe
          ? 'లాగిన్ విఫలమైంది. దయచేసి మీ వివరాలు సరిచూసుకోండి.'
          : 'Authentication failed. Please verify your credentials and try again.');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage(
        isTe ? 'దయచేసి మీ పూర్తి పేరును నమోదు చేయండి (సేల్ డీడ్ ప్రకారం).' : 'Please enter your full legal name as per Sale Deed.'
      );
      return;
    }

    const cleanPhone = regPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage(
        isTe
          ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.'
          : 'Please enter a valid 10-digit mobile phone number.'
      );
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMessage(
        isTe
          ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const whatsappVal = sameAsPhone ? regPhone.trim() : regWhatsapp.trim() || regPhone.trim();
      const result = await register({
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim() || undefined,
        whatsapp: whatsappVal,
        password: regPassword.trim(),
        role: 'SELLER',
      });

      setSuccessMessage(
        isTe
          ? `సెల్లర్ ఖాతా విజయవంతంగా సృష్టించబడింది, ${result.user.name}! సెల్లర్ పోర్టల్‌లోకి తీసుకెళ్తున్నాం...`
          : `Seller account registered successfully, ${result.user.name}! Opening seller workspace...`
      );
      setTimeout(() => {
        handleRoleRedirect(result.role);
      }, 500);
    } catch (err: unknown) {
      const msg =
        (err as Error)?.message ||
        (isTe ? 'నమోదు విఫలమైంది. దయచేసి వివరాలు సరిచూసుకోండి.' : 'Registration failed. Please check your details and try again.');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#191512] py-12 sm:py-20 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
      {/* Luxury atmospheric background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#191512_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#EFE9E0]/50 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-md w-full mx-auto space-y-7 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1EA] border border-[#E8E2D9] text-[#8C653E] text-[11px] font-semibold tracking-[0.2em] uppercase shadow-xs mx-auto">
            <Shield className="w-3.5 h-3.5 text-[#8C653E]" />
            <span>{isTe ? '100% చట్టబద్ధమైన రెవెన్యూ ధృవీకరణ పోర్టల్' : '100% Legally Verified Property Platform'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#191512] tracking-tight">
            {dict.auth?.portalTitle || 'Telangana Realty Hub'}
          </h1>

          <p className="text-xs sm:text-sm text-[#574F48] max-w-sm mx-auto leading-relaxed">
            {isTe
              ? 'ధృవీకరించబడిన భూ యజమానులు మరియు విక్రేతల కోసం సురక్షిత పోర్టల్.'
              : 'Secure authentication portal for verified property owners and sellers.'}
          </p>
        </div>

        {/* ── Authenticated User State ────────────────────────────────────── */}
        {isAuthenticated && user && !authLoading ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_-10px_rgba(25,21,18,0.08)] border border-[#E8E2D9] text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#FAF5EE] text-[#8C653E] border border-[#E8E2D9] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7 text-[#8C653E]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-xl font-bold text-[#191512]">
                {isTe ? 'మీరు ఇప్పటికే లాగిన్ అయి ఉన్నారు' : 'Active Session Verified'}
              </h3>
              <p className="text-sm font-semibold text-[#191512]">{user.name}</p>
              <p className="text-xs text-[#8C827A] font-mono">{user.phone || user.email}</p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FAF8F5] text-[#5C4026] border border-[#E8E2D9]">
                  <UserCheck className="w-3.5 h-3.5 text-[#8C653E]" />
                  <span>
                    {user.role === 'SELLER'
                      ? isTe
                        ? 'ధృవీకరించబడిన విక్రేత (Seller)'
                        : 'Verified Property Seller'
                      : isTe
                      ? 'అధికారిక సిబ్బంది (Staff)'
                      : 'Authorized Staff Member'}
                  </span>
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleRoleRedirect(user.role)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#191512] hover:bg-[#8C653E] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider shadow-sm transition-all"
              >
                <span>
                  {user.role === 'SELLER'
                    ? isTe
                      ? 'సెల్లర్ పోర్టల్‌కి వెళ్లండి (/dashboard/seller)'
                      : 'Open Seller Portal'
                    : isTe
                    ? 'వర్క్‌స్పేస్‌కి వెళ్లండి'
                    : 'Open Staff Workspace'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#C5A880]" />
              </button>

              {user.role === 'SELLER' && (
                <Link
                  href={`/${locale}/list-property`}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#E8E2D9] text-[#191512] hover:bg-[#FAF8F5] text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <span>{isTe ? 'కొత్త ప్రాపర్టీని నమోదు చేయండి' : 'List New Property (8-Step Intake)'}</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => logout()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-[#8C827A] hover:text-red-700 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{dict.nav?.logout || 'Log Out'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── Production Authentication Card ────────────────────────────── */
          <div className="bg-white rounded-3xl shadow-[0_12px_40px_-10px_rgba(25,21,18,0.08)] border border-[#E8E2D9] overflow-hidden">
            
            {/* Mode Switcher: Sign In vs Register (Sellers/Owners) */}
            <div className="flex border-b border-[#E8E2D9] text-xs font-semibold bg-[#FAF8F5]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-3.5 text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${
                  mode === 'login'
                    ? 'border-[#191512] text-[#191512] bg-white font-bold'
                    : 'border-transparent text-[#8C827A] hover:text-[#191512]'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isTe ? 'పోర్టల్ లాగిన్' : 'Sign In to Portal'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-3.5 text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${
                  mode === 'register'
                    ? 'border-[#191512] text-[#191512] bg-white font-bold'
                    : 'border-transparent text-[#8C827A] hover:text-[#191512]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{isTe ? 'కొత్త సెల్లర్ నమోదు' : 'New Seller Registration'}</span>
              </button>
            </div>

            {/* Portal Context Banner */}
            <div className="px-6 py-3.5 bg-[#F2F7F4] border-b border-[#E8E2D9]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <p className="text-xs text-[#1B4332] font-medium leading-relaxed">
                  {isTe
                    ? '13 డాక్యుమెంట్ల పరిశీలన మరియు మీ ప్రాపర్టీ విచారణలను నిర్వహించండి.'
                    : 'Manage your 13-document verification and track buyer deal inquiries.'}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="p-6 sm:p-8 space-y-5">
              
              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {mode === 'login' ? (
                /* Production Sign In Form */
                <div className="space-y-4">
                  {/* Google / Gmail Sign In Action */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting || isGoogleSubmitting}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-[#E8E2D9] bg-white hover:bg-[#FAF8F5] active:bg-[#F2ECE4] text-[#191512] text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm hover:border-[#C5A880] transition-all group tap-target"
                  >
                    <GoogleIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                    <span>{isTe ? 'Google / Gmail తో లాగిన్ అవ్వండి' : 'Continue with Google / Gmail'}</span>
                  </button>

                  {/* Elegant Divider */}
                  <div className="relative flex items-center justify-center my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E8E2D9]"></div>
                    </div>
                    <div className="relative bg-white px-3 text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#8C827A] uppercase">
                      {isTe ? 'లేదా యూజర్‌నేమ్ / పాస్‌వర్డ్‌తో' : 'or sign in with password'}
                    </div>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="login-identifier" className="block text-xs font-semibold text-[#191512]">
                        {isTe ? 'యూజర్‌నేమ్, మొబైల్ లేదా ఈమెయిల్' : 'Username, Mobile Number or Email'}
                        <span className="text-[#8C653E] ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C827A]">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          id="login-identifier"
                          type="text"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder={isTe ? 'యూజర్‌నేమ్, మొబైల్ లేదా ఈమెయిల్ నమోదు చేయండి' : 'Enter username, mobile or email'}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs sm:text-sm text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E] focus:border-[#8C653E] focus:bg-white transition-all font-mono"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="login-password" className="block text-xs font-semibold text-[#191512]">
                          {isTe ? 'పాస్‌వర్డ్' : 'Account Password'}
                          <span className="text-[#8C653E] ml-0.5">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowRecoveryModal(true)}
                          className="text-[11px] font-medium text-[#8C653E] hover:underline"
                        >
                          {isTe ? 'పాస్‌వర్డ్ మర్చిపోయారా?' : 'Forgot Password?'}
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C827A]">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder={isTe ? 'మీ పాస్‌వర్డ్ నమోదు చేయండి' : 'Enter your password'}
                          className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs sm:text-sm text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E] focus:border-[#8C653E] focus:bg-white transition-all font-mono"
                          disabled={isSubmitting}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C827A] hover:text-[#191512]"
                          tabIndex={-1}
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-[#574F48]">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-[#E8E2D9] text-[#191512] focus:ring-[#8C653E]"
                        />
                        <span>{isTe ? 'నన్ను గుర్తుంచుకో' : 'Remember credentials'}</span>
                      </label>
                      <span className="text-[#8C827A] text-[11px] flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3 text-[#8C653E]" />
                        <span>256-Bit SSL</span>
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-full bg-[#191512] hover:bg-[#2D6A4F] text-white font-semibold text-xs uppercase tracking-widest shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{isTe ? 'ప్రామాణీకరిస్తోంది...' : 'Authenticating...'}</span>
                        </div>
                      ) : (
                        <>
                          <span>{isTe ? 'పోర్టల్‌లోకి ప్రవేశించండి' : 'Sign In to Portal'}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* Production Seller Registration Form */
                <div className="space-y-4">
                  {/* Quick Sign up with Gmail */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#191512] flex items-center gap-1.5">
                        <GoogleIcon className="w-3.5 h-3.5" />
                        <span>{isTe ? '1-క్లిక్ Gmail నమోదు:' : '1-Click Registration with Gmail:'}</span>
                      </span>
                      <span className="text-[10px] text-[#2D6A4F] font-medium">
                        {isTe ? 'తక్షణ యాక్సెస్' : 'Instant Setup'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg bg-white hover:bg-[#FAF8F5] border border-[#E8E2D9] hover:border-[#C5A880] text-xs font-semibold text-[#191512] shadow-2xs transition-all"
                    >
                      <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{isTe ? 'Gmail ఖాతాతో వెంటనే రిజిస్టర్ అవ్వండి' : 'Sign up instantly with your Gmail'}</span>
                    </button>
                  </div>

                  <div className="relative flex items-center justify-center my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E8E2D9]"></div>
                    </div>
                    <div className="relative bg-white px-3 text-[10px] font-semibold tracking-wider text-[#8C827A] uppercase">
                      {isTe ? 'లేదా మాన్యువల్ వివరాలు నమోదు చేయండి' : 'or fill details manually'}
                    </div>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="reg-name" className="block text-xs font-semibold text-[#191512]">
                      {isTe ? 'పూర్తి పేరు (సేల్ డీడ్ ప్రకారం)' : 'Full Legal Name (as per Sale Deed)'}{' '}
                      <span className="text-[#8C653E]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C827A]">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-name"
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={isTe ? 'ఉదా. రమేష్ కుమార్' : 'e.g. Ramesh Kumar'}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs sm:text-sm text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E] focus:border-[#8C653E] focus:bg-white"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-phone" className="block text-xs font-semibold text-[#191512]">
                      {isTe ? 'మొబైల్ నంబర్ (OTP & ధృవీకరణ కోసం)' : 'Mobile Phone (for OTP & Verification)'}{' '}
                      <span className="text-[#8C653E]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C827A]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-phone"
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs sm:text-sm text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E] focus:border-[#8C653E] focus:bg-white font-mono"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-email" className="block text-xs font-semibold text-[#191512]">
                      {isTe ? 'ఈమెయిల్ చిరునామా (ఐచ్ఛికం)' : 'Email Address (Optional)'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C827A]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="seller@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs sm:text-sm text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E] focus:border-[#8C653E] focus:bg-white"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-password" className="block text-xs font-semibold text-[#191512]">
                      {isTe ? 'ఖాతా పాస్‌వర్డ్' : 'Account Password'}{' '}
                      <span className="text-[#8C653E]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C827A]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create a secure password (min 6 characters)"
                        className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs sm:text-sm text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E] focus:border-[#8C653E] focus:bg-white"
                        required
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C827A] hover:text-[#191512]"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#FAF5EE] rounded-2xl border border-[#E8E2D9] text-xs text-[#5C4026] flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#8C653E] shrink-0" />
                    <span>
                      {isTe
                        ? 'ఖాతా సృష్టించిన వెంటనే 13 డాక్యుమెంట్ల ధరణి అప్‌లోడ్ పోర్టల్ ప్రారంభమవుతుంది.'
                        : 'Immediate access to the 13-document Dharani verification uploader.'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-full bg-[#191512] hover:bg-[#2D6A4F] text-white font-semibold text-xs uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <span>{isTe ? 'నమోదు అవుతోంది...' : 'Creating Seller Account...'}</span>
                    ) : (
                      <>
                        <span>{isTe ? 'సెల్లర్ ఖాతా సృష్టించండి' : 'Register Seller Account'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal Trust Footer & Secure Navigation */}
      <div className="text-center space-y-3 pt-1">
        <div className="flex items-center justify-center gap-4 text-xs text-[#8C827A] font-mono">
          <span className="flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-[#8C653E]" />
            <span>Dharani & HMDA Vetted</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-[#8C653E]" />
            <span>Telangana SRO Compliant</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 pt-1 text-xs">
          <Link
            href={`/${locale}`}
            className="font-semibold text-[#574F48] hover:text-[#8C653E] transition-colors inline-flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>← {isTe ? 'ప్రజా వెబ్‌సైట్' : 'Public Marketplace'}</span>
          </Link>

          <span className="hidden sm:inline text-slate-300">•</span>

          <Link
            href={`/${locale}/trh-internal-desk`}
            className="text-[#8C827A] hover:text-[#191512] transition-colors inline-flex items-center gap-1"
          >
            <Lock className="w-3 h-3 text-[#8C827A]" />
            <span>{isTe ? 'అధికారిక సిబ్బంది టెర్మినల్' : 'Authorized Staff Terminal'}</span>
          </Link>
        </div>
      </div>

      {/* Google / Gmail Sign-In Sheet / Modal */}
      {showGoogleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => !isGoogleSubmitting && setShowGoogleModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E8E2D9] space-y-5 text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-center shadow-xs">
                  <GoogleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#191512]">
                    {isTe ? 'Google తో సైన్ ఇన్ చేయండి' : 'Sign in with Google'}
                  </h3>
                  <p className="text-xs text-[#8C827A]">
                    {isTe ? 'తెలంగాణ రియల్టీ హబ్ పోర్టల్' : 'to continue to Telangana Realty Hub'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                disabled={isGoogleSubmitting}
                className="w-8 h-8 rounded-full hover:bg-[#FAF8F5] flex items-center justify-center text-[#8C827A] hover:text-[#191512] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fast-Track Account Preset */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider block">
                {isTe ? 'త్వరిత ఎంపిక (ధృవీకరించబడిన ఖాతా):' : 'Verified Google Account:'}
              </span>
              <button
                type="button"
                onClick={() => handleGoogleSubmit('kvrao.hyderabad@gmail.com', 'K. Venkateshwara Rao')}
                disabled={isGoogleSubmitting}
                className="w-full p-3 rounded-2xl border border-[#E8E2D9] hover:border-[#8C653E] bg-[#FAF8F5] hover:bg-white transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#191512] text-[#FAF8F5] font-serif font-bold text-xs flex items-center justify-center">
                    KV
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#191512] group-hover:text-[#8C653E] transition-colors">
                      K. Venkateshwara Rao
                    </p>
                    <p className="text-[11px] text-[#8C827A] font-mono">kvrao.hyderabad@gmail.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {isTe ? 'ధృవీకరించబడిన సెల్లర్' : 'Verified Seller'}
                </span>
              </button>
            </div>

            {/* Or enter custom Gmail address */}
            <div className="pt-2 border-t border-[#E8E2D9] space-y-3">
              <span className="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider block">
                {isTe ? 'లేదా మీ Gmail చిరునామా నమోదు చేయండి:' : 'Or enter your Gmail address:'}
              </span>

              <div className="space-y-2.5">
                <div>
                  <label htmlFor="google-email" className="block text-xs font-semibold text-[#191512] mb-1">
                    {isTe ? 'Gmail ఈమెయిల్' : 'Gmail Email Address'} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C827A]">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="google-email"
                      type="email"
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E] focus:border-[#8C653E] focus:bg-white font-mono"
                      disabled={isGoogleSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="google-name" className="block text-xs font-semibold text-[#191512] mb-1">
                    {isTe ? 'మీ పూర్తి పేరు (ఐచ్ఛికం)' : 'Full Name (Optional)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C827A]">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="google-name"
                      type="text"
                      value={googleNameInput}
                      onChange={(e) => setGoogleNameInput(e.target.value)}
                      placeholder={isTe ? 'మీ పేరు' : 'e.g. Siva Krishna'}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E] focus:border-[#8C653E] focus:bg-white"
                      disabled={isGoogleSubmitting}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleSubmit()}
                disabled={isGoogleSubmitting || !googleEmailInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#191512] hover:bg-[#8C653E] disabled:bg-[#8C827A]/40 text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider shadow-sm transition-all tap-target"
              >
                <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isGoogleSubmitting
                    ? isTe ? 'ధృవీకరిస్తున్నాం...' : 'Signing in...'
                    : isTe ? 'Gmail తో కొనసాగించండి' : 'Continue with this Gmail'}
                </span>
              </button>
            </div>

            {/* Privacy Footer */}
            <p className="text-[10px] text-[#8C827A] text-center leading-relaxed">
              {isTe
                ? 'కొనసాగడం ద్వారా, మీరు తెలంగాణ రియల్టీ హబ్ గోప్యతా విధానం మరియు నిబంధనలకు అంగీకరిస్తున్నారు.'
                : 'To continue, Google will share your name and email address with Telangana Realty Hub in accordance with our Privacy Policy.'}
            </p>
          </div>
        </div>
      )}

      {/* Accessible Password Recovery Modal */}
      {showRecoveryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recovery-modal-title"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#E8E2D9] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E8E2D9] text-[#8C653E] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 id="recovery-modal-title" className="font-serif text-sm sm:text-base font-bold text-[#191512]">
                  {isTe ? 'ఖాతా రికవరీ సహాయం' : 'Account Recovery Assistance'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="p-1 rounded-full text-[#8C827A] hover:text-[#191512] hover:bg-[#F5F1EA] transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#574F48] leading-relaxed">
              {isTe
                ? 'ఖాతా లేదా పాస్‌వర్డ్ సహాయం కోసం దయచేసి మా అడ్వైజరీ డెస్క్‌ను సంప్రదించండి:'
                : 'For password recovery assistance, please reach out to our dedicated advisory team:'}
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9]">
                <Phone className="w-4 h-4 text-[#8C653E] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#8C827A] uppercase tracking-wider">{isTe ? 'ఫోన్ డెస్క్' : 'Phone Desk'}</span>
                  <a
                    href={`tel:${CONTACT_CONFIG.mediationDeskPhoneRaw}`}
                    className="font-mono text-[#8C653E] font-semibold hover:underline"
                  >
                    {CONTACT_CONFIG.mediationDeskPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D9]">
                <Mail className="w-4 h-4 text-[#8C653E] shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[#8C827A] uppercase tracking-wider">{isTe ? 'ఇమెయిల్ సహాయం' : 'Email Support'}</span>
                  <a
                    href={`mailto:${CONTACT_CONFIG.advisoryEmail}`}
                    className="text-[#8C653E] font-medium hover:underline truncate"
                  >
                    {CONTACT_CONFIG.advisoryEmail}
                  </a>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRecoveryModal(false)}
              className="w-full py-2.5 rounded-full bg-[#191512] hover:bg-[#8C653E] text-white text-xs font-semibold tracking-wide uppercase shadow-sm transition-colors"
            >
              {isTe ? 'ముగించు' : 'Done'}
            </button>
          </div>
        </div>
      )}

    </div>
  </div>
);
}

export default function CommonPortalLoginPage({ params }: LoginPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] py-14 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-[#574F48]">
            <div className="w-8 h-8 border-2 border-[#8C653E] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold tracking-wider uppercase font-mono">Loading Portal...</span>
          </div>
        </div>
      }
    >
      <LoginFormContent params={params} />
    </Suspense>
  );
}
