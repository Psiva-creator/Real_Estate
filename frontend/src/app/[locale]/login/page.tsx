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
  Briefcase,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Landmark,
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
  const roleQuery = searchParams.get('role')?.toUpperCase();

  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const isTe = locale === 'te';
  const dict = getDictionary(locale);

  const { user, isAuthenticated, isLoading: authLoading, login, register, logout } = useAuth();

  // Role Selection: Default to role in URL or 'SELLER'
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    roleQuery === 'ADMIN' ? 'ADMIN' : roleQuery === 'AGENT' ? 'AGENT' : 'SELLER'
  );

  const [mode, setMode] = useState<AuthTab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state (Sellers only)
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [regPassword, setRegPassword] = useState('');

  // Auto-fill on role switch if empty or preset
  useEffect(() => {
    if (selectedRole === 'ADMIN') {
      setMode('login');
    }
  }, [selectedRole]);

  // Route after login based on RBAC
  const handleRoleRedirect = (role: UserRole) => {
    if (redirectUrl && redirectUrl.startsWith('/dashboard')) {
      // Role permission guard on redirect
      if (role === 'SELLER' && !redirectUrl.startsWith('/dashboard/seller')) {
        router.replace(`/${locale}/dashboard/seller`);
        return;
      }
      if (role === 'AGENT' && redirectUrl.startsWith('/dashboard/seller')) {
        router.replace(`/${locale}/dashboard/properties`);
        return;
      }
      router.replace(redirectUrl);
      return;
    }

    if (role === 'SELLER') {
      router.replace(`/${locale}/dashboard/seller`);
    } else if (role === 'ADMIN') {
      router.replace(`/${locale}/dashboard/verification`);
    } else {
      router.replace(`/${locale}/dashboard/properties`);
    }
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
      setSuccessMessage(
        isTe
          ? `స్వాగతం ${result.user.name}! ${result.role} పోర్టల్‌లోకి తీసుకెళ్తున్నాం...`
          : `Welcome, ${result.user.name}! Opening ${result.role} Workspace...`
      );
      setTimeout(() => {
        handleRoleRedirect(result.role);
      }, 500);
    } catch (err: unknown) {
      const msg =
        (err as Error)?.message ||
        (isTe
          ? 'లాగిన్ విఫలమైంది. దయచేసి వివరాలు సరిచూసుకోండి.'
          : 'Authentication failed. Please verify credentials.');
      setErrorMessage(msg);
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
          : 'Please enter a valid 10-digit mobile number'
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
        password: regPassword.trim() || undefined,
        role: 'SELLER',
      });

      setSuccessMessage(
        isTe
          ? `సెల్లర్ ఖాతా విజయవంతంగా సృష్టించబడింది, ${result.user.name}! పోర్టల్‌లోకి తీసుకెళ్తున్నాం...`
          : `Seller account registered successfully, ${result.user.name}! Redirecting to seller portal...`
      );
      setTimeout(() => {
        handleRoleRedirect(result.role);
      }, 600);
    } catch (err: unknown) {
      const msg =
        (err as Error)?.message ||
        (isTe ? 'నమోదు విఫలమైంది. దయచేసి వివరాలు సరిచూసుకోండి.' : 'Registration failed. Please check your details.');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Role Fast-Fill Handlers
  const fillRoleCredentials = (role: UserRole) => {
    setSelectedRole(role);
    setMode('login');
    setErrorMessage(null);
    if (role === 'ADMIN') {
      setLoginIdentifier('admin@telanganarealty.in');
      setLoginPassword('Admin@1234');
    } else if (role === 'AGENT') {
      setLoginIdentifier('suresh.reddy@telanganarealty.in');
      setLoginPassword('Admin@1234');
    } else {
      setLoginIdentifier('9848011223');
      setLoginPassword('Admin@1234');
    }
  };

  // Role Meta Configuration
  const roleConfig = {
    SELLER: {
      title: isTe ? 'భూ యజమాని / విక్రేత లాగిన్' : 'Property Seller & Owner Portal',
      subtitle: isTe
        ? 'మీ 13 డాక్యుమెంట్ల పరిశీలన స్థితి, కొనుగోలుదారుల ఆసక్తి మరియు డీల్ పురోగతిని పర్యవేక్షించండి.'
        : 'Track your 13-document verification status, view verified buyer inquiries, and manage mediated deals.',
      color: 'emerald',
      icon: Building2,
      badge: isTe ? 'సెల్లర్ వర్క్‌స్పేస్' : 'Seller Workspace',
      idPlaceholder: isTe ? 'మొబైల్ నంబర్ (ఉదా. 9848011223) లేదా ఈమెయిల్' : 'Mobile (e.g. 9848011223) or Email',
      idType: 'tel/email',
      allowRegister: true,
    },
    AGENT: {
      title: isTe ? 'రియల్టీ ఏజెంట్ & ఫీల్డ్ అడ్వైజర్' : 'Realty Agent & Field Advisor',
      subtitle: isTe
        ? 'అప్పగించిన లీడ్స్, సైట్ సందర్శనలు మరియు డాక్యుమెంట్ ప్రాథమిక తనిఖీలను నిర్వహించండి.'
        : 'Manage assigned leads, coordinate verified site inspections, and mediate property deals.',
      color: 'blue',
      icon: Briefcase,
      badge: isTe ? 'ఏజెంట్ బ్యాక్-ఆఫీస్' : 'Agent Back-Office',
      idPlaceholder: isTe ? 'కార్పొరేట్ ఈమెయిల్ (suresh.reddy@telanganarealty.in)' : 'Work Email (suresh.reddy@telanganarealty.in)',
      idType: 'email',
      allowRegister: false,
    },
    ADMIN: {
      title: isTe ? 'లీడ్ డైరెక్టర్ & ఎగ్జిక్యూటివ్ అడ్మిన్' : 'Executive Director & Compliance Admin',
      subtitle: isTe
        ? '13 డాక్యుమెంట్ గేట్ ఆమోదం, సేల్ డీడ్ల లీగల్ ఆడిట్, బ్రోకరేజ్ కమిషన్లు మరియు పూర్తి సిస్టమ్ నియంత్రణ.'
        : 'Final 13-document legal gate sign-off, title audit log, broker commission splits, and platform oversight.',
      color: 'amber',
      icon: ShieldCheck,
      badge: isTe ? 'ఎగ్జిక్యూటివ్ అడ్మిన్' : 'Executive Governance',
      idPlaceholder: isTe ? 'అడ్మిన్ ఈమెయిల్ (admin@telanganarealty.in)' : 'Master Admin Email (admin@telanganarealty.in)',
      idType: 'email',
      allowRegister: false,
    },
  };

  const activeMeta = roleConfig[selectedRole];

  return (
    <div className="min-h-screen bg-slate-900/5 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center selection:bg-emerald-200">
      <div className="max-w-lg w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs mx-auto">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>{isTe ? '100% చట్టబద్ధమైన రెవెన్యూ ధృవీకరణ పోర్టల్' : '100% Legally Verified Brokerage Portal'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {dict.auth?.portalTitle || 'Telangana Realty Hub'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {dict.auth?.portalSubtitle ||
              'Unified role-based authentication for Verified Land & Apartment Sellers, Deal Agents, and Directors.'}
          </p>
        </div>

        {/* If already authenticated */}
        {isAuthenticated && user && !authLoading ? (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {isTe ? 'మీరు ఇప్పటికే లాగిన్ అయి ఉన్నారు' : 'Active Session Verified'}
              </h3>
              <p className="text-sm font-medium text-slate-700">{user.name}</p>
              <p className="text-xs text-slate-500 font-mono">{user.email || user.phone}</p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>
                    {user.role === 'SELLER'
                      ? isTe
                        ? 'ధృవీకరించబడిన విక్రేత (Seller)'
                        : 'Verified Land / Flat Seller'
                      : user.role === 'ADMIN'
                      ? isTe
                        ? 'లీడ్ డైరెక్టర్ (Admin)'
                        : 'Lead Director / Admin'
                      : isTe
                      ? 'రియల్టీ ఏజెంట్ (Agent)'
                      : 'Senior Advisory Agent'}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleRoleRedirect(user.role)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all"
              >
                <span>{isTe ? 'నా వర్క్‌స్పేస్‌కి వెళ్లండి' : 'Open My Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{dict.nav?.logout || 'Log Out'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Container */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
            {/* 1. Role Selection Grid */}
            <div className="p-3 bg-slate-50/80 border-b border-slate-200">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-1 flex items-center justify-between">
                <span>{isTe ? 'మీ పాత్రను ఎంచుకోండి' : 'Select Access Portal'}</span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  RBAC Enabled
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* Seller Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('SELLER');
                    setErrorMessage(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all relative ${
                    selectedRole === 'SELLER'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2
                      className={`w-4 h-4 ${selectedRole === 'SELLER' ? 'text-emerald-700' : 'text-slate-400'}`}
                    />
                    {selectedRole === 'SELLER' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <div className="text-xs font-bold mt-1.5">{isTe ? 'విక్రేత' : 'Seller'}</div>
                  <div className="text-[10px] text-slate-500 truncate">Land & Flat</div>
                </button>

                {/* Agent Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('AGENT');
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all relative ${
                    selectedRole === 'AGENT'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Briefcase
                      className={`w-4 h-4 ${selectedRole === 'AGENT' ? 'text-blue-700' : 'text-slate-400'}`}
                    />
                    {selectedRole === 'AGENT' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <div className="text-xs font-bold mt-1.5">{isTe ? 'ఏజెంట్' : 'Agent'}</div>
                  <div className="text-[10px] text-slate-500 truncate">Advisor</div>
                </button>

                {/* Admin Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('ADMIN');
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all relative ${
                    selectedRole === 'ADMIN'
                      ? 'border-amber-600 bg-amber-50/70 text-amber-950 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck
                      className={`w-4 h-4 ${selectedRole === 'ADMIN' ? 'text-amber-700' : 'text-slate-400'}`}
                    />
                    {selectedRole === 'ADMIN' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    )}
                  </div>
                  <div className="text-xs font-bold mt-1.5">{isTe ? 'డైరెక్టర్' : 'Director'}</div>
                  <div className="text-[10px] text-slate-500 truncate">Admin Gate</div>
                </button>
              </div>
            </div>

            {/* 2. Role Banner */}
            <div
              className={`px-6 py-4 border-b ${
                selectedRole === 'SELLER'
                  ? 'bg-emerald-50/40 border-emerald-100'
                  : selectedRole === 'AGENT'
                  ? 'bg-blue-50/40 border-blue-100'
                  : 'bg-amber-50/40 border-amber-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'SELLER'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedRole === 'AGENT'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <activeMeta.icon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{activeMeta.title}</h2>
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">{activeMeta.subtitle}</p>
                </div>
              </div>
            </div>

            {/* 3. Mode Switcher (For Sellers: Sign In vs Register) */}
            {activeMeta.allowRegister && (
              <div className="flex border-b border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                    mode === 'login'
                      ? 'border-emerald-700 text-emerald-800 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50/50'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{dict.auth?.signInTab || 'Sign In to Portal'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                    mode === 'register'
                      ? 'border-emerald-700 text-emerald-800 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800 bg-slate-50/50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{dict.auth?.registerTab || 'New Seller Registration'}</span>
                </button>
              </div>
            )}

            {/* 4. Form Content */}
            <div className="p-6 sm:p-7 space-y-4">
              {/* Alert Feedback */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form Views */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      {selectedRole === 'SELLER'
                        ? isTe
                          ? 'ఫోన్ నంబర్ లేదా ఈమెయిల్'
                          : 'Mobile Number or Email'
                        : isTe
                        ? 'కార్పొరేట్ ఈమెయిల్ చిరునామా'
                        : 'Official Corporate Email'}
                      <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        {selectedRole === 'SELLER' ? (
                          <Phone className="w-4 h-4" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder={activeMeta.idPlaceholder}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        {dict.auth?.passwordLabel || 'Password / Access Code'}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            isTe
                              ? 'యాక్సెస్ సహాయం కోసం +91 94400 12345 నంబరులో అడ్వైజరీ టీమ్‌ను సంప్రదించండి.'
                              : 'For password recovery, please contact the Lead Director at advisory@telanganarealty.in or +91 94400 12345.'
                          )
                        }
                        className="text-[11px] font-medium text-emerald-700 hover:underline"
                      >
                        {isTe ? 'సహాయం కావాలా?' : 'Need Help?'}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder={isTe ? 'పాస్‌వర్డ్ నమోదు చేయండి' : 'Enter your password'}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                        disabled={isSubmitting}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Security Status */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                      />
                      <span>{isTe ? 'నన్ను గుర్తుంచుకో' : 'Remember this workstation'}</span>
                    </label>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>256-Bit SSL</span>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                      selectedRole === 'SELLER'
                        ? 'bg-emerald-800 hover:bg-emerald-700'
                        : selectedRole === 'AGENT'
                        ? 'bg-blue-800 hover:bg-blue-700'
                        : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{isTe ? 'ప్రామాణీకరిస్తోంది...' : 'Authenticating Credentials...'}</span>
                      </div>
                    ) : (
                      <>
                        <span>
                          {isTe
                            ? `${selectedRole} పోర్టల్‌లోకి లాగిన్ అవ్వండి`
                            : `Sign In to ${selectedRole} Portal`}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Registration Form for Sellers */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {isTe ? 'పూర్తి పేరు (సేల్ డీడ్ ప్రకారం)' : 'Full Legal Name (as per Sale Deed)'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. K. Venkateshwara Rao"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {isTe ? 'మొబైల్ నంబర్ (OTP ధృవీకరణ కోసం)' : 'Mobile Phone (for Verification)'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {isTe ? 'ఈమెయిల్ చిరునామా (ఐచ్ఛికం)' : 'Email Address (Optional)'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="seller@example.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {dict.auth?.passwordLabel || 'Account Password'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create a secure password"
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

                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {isTe
                        ? 'ఖాతా పూర్తయిన వెంటనే 13 డాక్యుమెంట్ల అప్‌లోడ్ పోర్టల్ ప్రారంభమవుతుంది.'
                        : 'Immediate access to the 13-document legal verification uploader.'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>{isTe ? 'నమోదు అవుతోంది...' : 'Creating Seller Account...'}</span>
                    ) : (
                      <>
                        <span>{isTe ? 'సెల్లర్ ఖాతా సృష్టించండి' : 'Register Seller Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 5. Production 1-Click Fast-Fill Testing Station */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isTe ? 'త్వరిత డెమో యాక్సెస్' : '1-Click Role Fast-Fill'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Password: Admin@1234</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Admin Fast-Fill */}
                  <button
                    type="button"
                    onClick={() => fillRoleCredentials('ADMIN')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50/80 hover:border-amber-300 text-left transition-all group"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-amber-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Director</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate mt-0.5">Siva (Admin)</div>
                  </button>

                  {/* Agent Fast-Fill */}
                  <button
                    type="button"
                    onClick={() => fillRoleCredentials('AGENT')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/80 hover:border-blue-300 text-left transition-all group"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-blue-900">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      <span>Advisor</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate mt-0.5">Suresh (Agent)</div>
                  </button>

                  {/* Seller Fast-Fill */}
                  <button
                    type="button"
                    onClick={() => fillRoleCredentials('SELLER')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/80 hover:border-emerald-300 text-left transition-all group"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-emerald-900">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Seller</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate mt-0.5">Rao (Owner)</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legal Trust Footer */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dharani & HMDA Vetted</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5 text-emerald-600" />
              <span>Telangana SRO Compliant</span>
            </span>
          </div>

          <div className="pt-1">
            <Link
              href={`/${locale}`}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors inline-flex items-center gap-1"
            >
              <span>← {isTe ? 'ప్రజా వెబ్‌సైట్‌కి తిరిగి వెళ్లండి' : 'Return to Public Marketplace'}</span>
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
        <div className="min-h-screen bg-slate-100 py-14 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Loading Role Portal...</span>
          </div>
        </div>
      }
    >
      <LoginFormContent params={params} />
    </Suspense>
  );
}
