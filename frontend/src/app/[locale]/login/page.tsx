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
} from 'lucide-react';
import { isValidLocale, Locale, getDictionary } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/api';

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

  const { user, isAuthenticated, isLoading: authLoading, login, register, logout } = useAuth();

  const [mode, setMode] = useState<AuthTab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage(
        isTe ? 'దయచేసి మీ మొబైల్ నంబర్ లేదా ఈమెయిల్ నమోదు చేయండి.' : 'Please enter your registered mobile number or email.'
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
                <span>{isTe ? 'సెల్లర్ లాగిన్' : 'Sign In to Portal'}</span>
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
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#191512]">
                      {isTe ? 'మొబైల్ నంబర్ లేదా ఈమెయిల్' : 'Registered Mobile Number or Email'}
                      <span className="text-[#8C653E] ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C827A]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder={isTe ? 'ఉదా. 98480 12345 లేదా ఈమెయిల్' : 'e.g. 9848011223 or email'}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs sm:text-sm text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E] focus:border-[#8C653E] focus:bg-white transition-all font-mono"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-[#191512]">
                        {isTe ? 'పాస్‌వర్డ్' : 'Account Password'}
                        <span className="text-[#8C653E] ml-0.5">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            isTe
                              ? 'ఖాతా లేదా పాస్‌వర్డ్ సహాయం కోసం దయచేసి advisory@telanganarealty.in లేదా +91 94400 12345 ను సంప్రదించండి.'
                              : 'For password recovery assistance, please contact the advisory desk at advisory@telanganarealty.in or +91 94400 12345.'
                          )
                        }
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
                        <span>{isTe ? 'సెల్లర్ పోర్టల్‌లోకి ప్రవేశించండి' : 'Sign In to Seller Portal'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Production Seller Registration Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#191512]">
                      {isTe ? 'పూర్తి పేరు (సేల్ డీడ్ ప్రకారం)' : 'Full Legal Name (as per Sale Deed)'}{' '}
                      <span className="text-[#8C653E]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C827A]">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. K. Venkateshwara Rao"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs sm:text-sm text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E] focus:border-[#8C653E] focus:bg-white"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#191512]">
                      {isTe ? 'మొబైల్ నంబర్ (OTP & ధృవీకరణ కోసం)' : 'Mobile Phone (for OTP & Verification)'}{' '}
                      <span className="text-[#8C653E]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C827A]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
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
                    <label className="block text-xs font-semibold text-[#191512]">
                      {isTe ? 'ఈమెయిల్ చిరునామా (ఐచ్ఛికం)' : 'Email Address (Optional)'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C827A]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
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
                    <label className="block text-xs font-semibold text-[#191512]">
                      {isTe ? 'ఖాతా పాస్‌వర్డ్' : 'Account Password'}{' '}
                      <span className="text-[#8C653E]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C827A]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
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
