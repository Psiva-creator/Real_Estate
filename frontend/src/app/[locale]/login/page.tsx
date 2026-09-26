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

    if (role === 'SELLER') {
      router.replace('/dashboard/seller');
    } else if (role === 'ADMIN') {
      router.replace('/dashboard/verification');
    } else {
      router.replace('/dashboard/properties');
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
      accentBorder: 'border-[#2D6A4F]/40',
      accentBg: 'bg-[#F2F7F4]',
      accentBadge: 'bg-[#E8F2EC] text-[#1B4332] border-[#C2DBCB]',
      accentText: 'text-[#1B4332]',
      dotBg: 'bg-[#2D6A4F]',
      btnBg: 'bg-[#191512] hover:bg-[#2D6A4F]',
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
      accentBorder: 'border-[#1D4E89]/40',
      accentBg: 'bg-[#F0F4F9]',
      accentBadge: 'bg-[#E5EDF6] text-[#0F2D54] border-[#BFD3E8]',
      accentText: 'text-[#0F2D54]',
      dotBg: 'bg-[#1D4E89]',
      btnBg: 'bg-[#191512] hover:bg-[#1D4E89]',
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
      accentBorder: 'border-[#8C653E]/40',
      accentBg: 'bg-[#FAF5EE]',
      accentBadge: 'bg-[#F5ECE0] text-[#5C4026] border-[#E5D2BC]',
      accentText: 'text-[#5C4026]',
      dotBg: 'bg-[#8C653E]',
      btnBg: 'bg-[#191512] hover:bg-[#8C653E]',
    },
  };

  const activeMeta = roleConfig[selectedRole];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#191512] py-12 sm:py-20 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
      {/* Subtle atmospheric architectural texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#191512_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#EFE9E0]/50 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-xl w-full mx-auto space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1EA] border border-[#E8E2D9] text-[#8C653E] text-[11px] font-semibold tracking-[0.2em] uppercase shadow-xs mx-auto">
            <Shield className="w-3.5 h-3.5 text-[#8C653E]" />
            <span>{isTe ? '100% చట్టబద్ధమైన రెవెన్యూ ధృవీకరణ పోర్టల్' : '100% Legally Verified Brokerage Portal'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#191512] tracking-tight">
            {dict.auth?.portalTitle || 'Telangana Realty Hub'}
          </h1>

          <p className="text-xs sm:text-sm text-[#574F48] max-w-md mx-auto leading-relaxed">
            {dict.auth?.portalSubtitle ||
              'Unified role-based authentication for Verified Land & Apartment Sellers, Deal Agents, and Directors.'}
          </p>
        </div>

        {/* If already authenticated */}
        {isAuthenticated && user && !authLoading ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_12px_40px_-10px_rgba(25,21,18,0.08)] border border-[#E8E2D9] text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#FAF5EE] text-[#8C653E] border border-[#E8E2D9] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#191512]">
                {isTe ? 'మీరు ఇప్పటికే లాగిన్ అయి ఉన్నారు' : 'Active Session Verified'}
              </h3>
              <p className="text-sm font-semibold text-[#191512]">{user.name}</p>
              <p className="text-xs text-[#8C827A] font-mono">{user.email || user.phone}</p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-semibold bg-[#FAF8F5] text-[#5C4026] border border-[#E8E2D9]">
                  <UserCheck className="w-3.5 h-3.5 text-[#8C653E]" />
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
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#191512] hover:bg-[#8C653E] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
              >
                <span>{isTe ? 'నా వర్క్‌స్పేస్‌కి వెళ్లండి' : 'Open My Workspace'}</span>
                <ArrowRight className="w-4 h-4 text-[#C5A880]" />
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-full border border-[#E8E2D9] text-[#574F48] hover:text-[#191512] hover:bg-[#FAF8F5] text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{dict.nav?.logout || 'Log Out'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Container */
          <div className="bg-white rounded-3xl shadow-[0_12px_40px_-10px_rgba(25,21,18,0.08)] border border-[#E8E2D9] overflow-hidden">
            
            {/* 1. Role Selection Grid (3 Roles) */}
            <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#E8E2D9]">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#8C827A] mb-3 px-1 flex items-center justify-between">
                <span>{isTe ? 'మీ పాత్రను ఎంచుకోండి' : 'Select Access Portal'}</span>
                <span className="text-[10px] font-mono font-semibold text-[#8C653E] bg-[#F5F1EA] px-2.5 py-0.5 rounded-full border border-[#E8E2D9]">
                  RBAC Protocol
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                
                {/* Seller Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('SELLER');
                    setErrorMessage(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 relative ${
                    selectedRole === 'SELLER'
                      ? 'border-[#2D6A4F]/60 bg-[#F2F7F4] text-[#1B4332] shadow-xs ring-1 ring-[#2D6A4F]/20'
                      : 'border-[#E8E2D9] bg-white hover:bg-[#FAF8F5] text-[#574F48]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2
                      className={`w-4 h-4 ${selectedRole === 'SELLER' ? 'text-[#2D6A4F]' : 'text-[#8C827A]'}`}
                    />
                    {selectedRole === 'SELLER' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
                    )}
                  </div>
                  <div className="text-xs font-bold mt-2 font-serif">{isTe ? 'విక్రేత' : 'Seller'}</div>
                  <div className="text-[10px] text-[#8C827A] font-mono truncate">Land & Flat</div>
                </button>

                {/* Agent Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('AGENT');
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 relative ${
                    selectedRole === 'AGENT'
                      ? 'border-[#1D4E89]/60 bg-[#F0F4F9] text-[#0F2D54] shadow-xs ring-1 ring-[#1D4E89]/20'
                      : 'border-[#E8E2D9] bg-white hover:bg-[#FAF8F5] text-[#574F48]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Briefcase
                      className={`w-4 h-4 ${selectedRole === 'AGENT' ? 'text-[#1D4E89]' : 'text-[#8C827A]'}`}
                    />
                    {selectedRole === 'AGENT' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1D4E89]" />
                    )}
                  </div>
                  <div className="text-xs font-bold mt-2 font-serif">{isTe ? 'ఏజెంట్' : 'Agent'}</div>
                  <div className="text-[10px] text-[#8C827A] font-mono truncate">Advisor</div>
                </button>

                {/* Admin Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('ADMIN');
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 relative ${
                    selectedRole === 'ADMIN'
                      ? 'border-[#8C653E]/60 bg-[#FAF5EE] text-[#5C4026] shadow-xs ring-1 ring-[#8C653E]/20'
                      : 'border-[#E8E2D9] bg-white hover:bg-[#FAF8F5] text-[#574F48]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck
                      className={`w-4 h-4 ${selectedRole === 'ADMIN' ? 'text-[#8C653E]' : 'text-[#8C827A]'}`}
                    />
                    {selectedRole === 'ADMIN' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8C653E]" />
                    )}
                  </div>
                  <div className="text-xs font-bold mt-2 font-serif">{isTe ? 'డైరెక్టర్' : 'Director'}</div>
                  <div className="text-[10px] text-[#8C827A] font-mono truncate">Admin Gate</div>
                </button>
              </div>
            </div>

            {/* 2. Role Description Banner */}
            <div className={`px-6 sm:px-8 py-4 border-b border-[#E8E2D9] ${activeMeta.accentBg}`}>
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${activeMeta.accentBorder} bg-white shadow-xs`}
                >
                  <activeMeta.icon className={`w-4 h-4 ${activeMeta.accentText}`} />
                </div>
                <div>
                  <h2 className="text-sm font-serif font-bold text-[#191512]">{activeMeta.title}</h2>
                  <p className="text-xs text-[#574F48] mt-0.5 leading-relaxed">{activeMeta.subtitle}</p>
                </div>
              </div>
            </div>

            {/* 3. Mode Switcher (For Sellers: Sign In vs Register) */}
            {activeMeta.allowRegister && (
              <div className="flex border-b border-[#E8E2D9] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-3.5 text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${
                    mode === 'login'
                      ? 'border-[#191512] text-[#191512] bg-white font-bold'
                      : 'border-transparent text-[#8C827A] hover:text-[#191512] bg-[#FAF8F5]/60'
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
                  className={`flex-1 py-3.5 text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${
                    mode === 'register'
                      ? 'border-[#191512] text-[#191512] bg-white font-bold'
                      : 'border-transparent text-[#8C827A] hover:text-[#191512] bg-[#FAF8F5]/60'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{dict.auth?.registerTab || 'New Seller Registration'}</span>
                </button>
              </div>
            )}

            {/* 4. Form Content */}
            <div className="p-6 sm:p-8 space-y-5">
              {/* Alert Feedback */}
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

              {/* Form Views */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#191512]">
                      {selectedRole === 'SELLER'
                        ? isTe
                          ? 'ఫోన్ నంబర్ లేదా ఈమెయిల్'
                          : 'Mobile Number or Email'
                        : isTe
                        ? 'కార్పొరేట్ ఈమెయిల్ చిరునామా'
                        : 'Official Corporate Email'}
                      <span className="text-[#8C653E] ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C827A]">
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
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs sm:text-sm text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E] focus:border-[#8C653E] focus:bg-white transition-all"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-[#191512]">
                        {dict.auth?.passwordLabel || 'Password / Access Code'}
                        <span className="text-[#8C653E] ml-0.5">*</span>
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
                        className="text-[11px] font-medium text-[#8C653E] hover:underline"
                      >
                        {isTe ? 'సహాయం కావాలా?' : 'Need Help?'}
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
                        placeholder={isTe ? 'పాస్‌వర్డ్ నమోదు చేయండి' : 'Enter your password'}
                        className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs sm:text-sm text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E] focus:border-[#8C653E] focus:bg-white transition-all"
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

                  {/* Remember Me & Security Status */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-[#574F48]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-[#E8E2D9] text-[#191512] focus:ring-[#8C653E]"
                      />
                      <span>{isTe ? 'నన్ను గుర్తుంచుకో' : 'Remember this workstation'}</span>
                    </label>
                    <span className="text-[#8C827A] text-[11px] flex items-center gap-1 font-mono">
                      <Lock className="w-3 h-3 text-[#8C653E]" />
                      <span>256-Bit SSL</span>
                    </span>
                  </div>

                  {/* Sign-In Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 px-6 rounded-full text-white font-semibold text-xs uppercase tracking-widest shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] ${activeMeta.btnBg}`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{isTe ? 'ప్రామాణీకరిస్తోంది...' : 'Authenticating Credentials...'}</span>
                      </div>
                    ) : (
                      <>
                        <span>
                          {isTe
                            ? `${selectedRole} పోర్టల్‌లోకి లాగిన్ అవ్వండి`
                            : `Sign In to ${selectedRole} Portal`}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Registration Form for Sellers */
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
                      {isTe ? 'మొబైల్ నంబర్ (OTP ధృవీకరణ కోసం)' : 'Mobile Phone (for Verification)'}{' '}
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
                      {dict.auth?.passwordLabel || 'Account Password'}{' '}
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
                        placeholder="Create a secure password"
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
                        ? 'ఖాతా పూర్తయిన వెంటనే 13 డాక్యుమెంట్ల అప్‌లోడ్ పోర్టల్ ప్రారంభమవుతుంది.'
                        : 'Immediate access to the 13-document legal verification uploader.'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-full bg-[#191512] hover:bg-[#8C653E] text-white font-semibold text-xs uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
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

              {/* 5. Production 1-Click Fast-Fill Testing Station */}
              <div className="pt-6 border-t border-[#E8E2D9]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#8C827A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8C653E]" />
                    <span>{isTe ? 'త్వరిత డెమో యాక్సెస్' : '1-Click Role Fast-Fill'}</span>
                  </span>
                  <span className="text-[10px] text-[#8C827A] font-mono">Password: Admin@1234</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* Admin Fast-Fill */}
                  <button
                    type="button"
                    onClick={() => fillRoleCredentials('ADMIN')}
                    className="p-3 rounded-2xl border border-[#E8E2D9] bg-[#FAF8F5] hover:bg-[#FAF5EE] hover:border-[#8C653E]/40 text-left transition-all group shadow-xs"
                  >
                    <div className="flex items-center gap-1 text-xs font-serif font-bold text-[#191512] group-hover:text-[#5C4026]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8C653E]" />
                      <span>Director</span>
                    </div>
                    <div className="text-[10px] text-[#8C827A] font-mono truncate mt-0.5">Siva (Admin)</div>
                  </button>

                  {/* Agent Fast-Fill */}
                  <button
                    type="button"
                    onClick={() => fillRoleCredentials('AGENT')}
                    className="p-3 rounded-2xl border border-[#E8E2D9] bg-[#FAF8F5] hover:bg-[#F0F4F9] hover:border-[#1D4E89]/40 text-left transition-all group shadow-xs"
                  >
                    <div className="flex items-center gap-1 text-xs font-serif font-bold text-[#191512] group-hover:text-[#0F2D54]">
                      <Briefcase className="w-3.5 h-3.5 text-[#1D4E89]" />
                      <span>Advisor</span>
                    </div>
                    <div className="text-[10px] text-[#8C827A] font-mono truncate mt-0.5">Suresh (Agent)</div>
                  </button>

                  {/* Seller Fast-Fill */}
                  <button
                    type="button"
                    onClick={() => fillRoleCredentials('SELLER')}
                    className="p-3 rounded-2xl border border-[#E8E2D9] bg-[#FAF8F5] hover:bg-[#F2F7F4] hover:border-[#2D6A4F]/40 text-left transition-all group shadow-xs"
                  >
                    <div className="flex items-center gap-1 text-xs font-serif font-bold text-[#191512] group-hover:text-[#1B4332]">
                      <Building2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>Seller</span>
                    </div>
                    <div className="text-[10px] text-[#8C827A] font-mono truncate mt-0.5">Rao (Owner)</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legal Trust Footer & Return Link */}
        <div className="text-center space-y-3 pt-2">
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

          <div className="pt-1">
            <Link
              href={`/${locale}`}
              className="text-xs font-semibold text-[#574F48] hover:text-[#8C653E] transition-colors inline-flex items-center gap-1.5 uppercase tracking-wider"
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
