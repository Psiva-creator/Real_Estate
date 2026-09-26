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
  ChevronRight,
  Landmark,
  ArrowUpRight,
  Compass,
  FileSpreadsheet,
  Activity,
  Layers,
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

  // Role Selection: Default to role in URL or 'ADMIN' if requested, otherwise 'SELLER'
  const initialRole: UserRole =
    roleQuery === 'ADMIN' ? 'ADMIN' : roleQuery === 'AGENT' ? 'AGENT' : 'SELLER';

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
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

  // Populate credentials on mount or roleQuery change
  useEffect(() => {
    if (roleQuery === 'ADMIN') {
      fillRoleCredentials('ADMIN');
    } else if (roleQuery === 'AGENT') {
      fillRoleCredentials('AGENT');
    } else if (roleQuery === 'SELLER') {
      fillRoleCredentials('SELLER');
    } else {
      fillRoleCredentials(initialRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleQuery]);

  // Route after login based on RBAC
  const handleRoleRedirect = (role: UserRole, targetOverride?: string) => {
    if (targetOverride) {
      router.replace(targetOverride);
      return;
    }

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

    // Default Destinations:
    // ADMIN -> /dashboard (Executive Command Center)
    // AGENT -> /dashboard/properties (or /dashboard/enquiries)
    // SELLER -> /dashboard/seller (Seller Submission Tracker)
    if (role === 'ADMIN') {
      router.replace('/dashboard');
    } else if (role === 'AGENT') {
      router.replace('/dashboard/properties');
    } else {
      router.replace('/dashboard/seller');
    }
  };

  // 1-Click Instant Watch Admin Panel handler
  const handleInstantWatchAdmin = async (targetPath = '/dashboard') => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const result = await login('admin@telanganarealty.in', 'Admin@1234');
      setSuccessMessage(
        isTe
          ? 'ఎగ్జిక్యూటివ్ క్లియరెన్స్ ఆమోదించబడింది! అడ్మిన్ ప్యానెల్ లోడ్ అవుతోంది...'
          : 'Lead Director clearance verified! Opening Executive Command Center...'
      );
      setTimeout(() => {
        handleRoleRedirect(result.role, targetPath);
      }, 400);
    } catch (err: unknown) {
      setErrorMessage((err as Error)?.message || 'Direct admin login failed. Please retry.');
    } finally {
      setIsSubmitting(false);
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
      }, 400);
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
      }, 500);
    } catch (err: unknown) {
      const msg =
        (err as Error)?.message ||
        (isTe ? 'నమోదు విఫలమైంది. దయచేసి వివరాలు సరిచూసుకోండి.' : 'Registration failed. Please check your details.');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role Meta Configuration
  const roleConfig = {
    ADMIN: {
      title: isTe ? 'లీడ్ డైరెక్టర్ & ఎగ్జిక్యూటివ్ అడ్మిన్' : 'Executive Director & Compliance Admin',
      subtitle: isTe
        ? 'ఎగ్జిక్యూటివ్ కమాండ్ సెంటర్, 13 డాక్యుమెంట్ ధరణి/HMDA లీగల్ గేట్ ఆమోదం మరియు డీల్ డెస్క్ పర్యవేక్షణ.'
        : 'Watch the Executive Command Center, 13-document Dharani legal audit gate, broker commission splits, and platform oversight.',
      color: 'amber',
      icon: ShieldCheck,
      badge: isTe ? 'అడ్మిన్ ప్యానెల్ (డైరెక్టర్)' : 'Watch Admin Panel',
      idPlaceholder: isTe ? 'అడ్మిన్ ఈమెయిల్ (admin@telanganarealty.in)' : 'Master Admin Email (admin@telanganarealty.in)',
      idType: 'email',
      allowRegister: false,
      accentBorder: 'border-[#8C653E]/40',
      accentBg: 'bg-[#FAF5EE]',
      accentBadge: 'bg-[#F5ECE0] text-[#5C4026] border-[#E5D2BC]',
      accentText: 'text-[#5C4026]',
      dotBg: 'bg-[#8C653E]',
      btnBg: 'bg-[#8C653E] hover:bg-[#704f2f]',
    },
    AGENT: {
      title: isTe ? 'రియల్టీ ఏజెంట్ & ఫీల్డ్ అడ్వైజర్' : 'Realty Agent & Field Advisor',
      subtitle: isTe
        ? 'అప్పగించిన లీడ్స్, సైట్ సందర్శనలు, క్లయింట్ విచారణలు మరియు ప్రాపర్టీ ఇన్వెంటరీ నిర్వహణ.'
        : 'Manage assigned leads, deal desk inquiries, verified site inspections, and property broker inventory.',
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
      btnBg: 'bg-[#1D4E89] hover:bg-[#143763]',
    },
    SELLER: {
      title: isTe ? 'భూ యజమాని / విక్రేత లాగిన్' : 'Property Seller & Owner Portal',
      subtitle: isTe
        ? 'మీ 13 డాక్యుమెంట్ల పరిశీలన స్థితి, కొనుగోలుదారుల ఆసక్తి మరియు 8-దశల ప్రాపర్టీ నమోదు.'
        : 'Track your 13-document verification status, view verified buyer inquiries, and manage mediated property deals.',
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
      btnBg: 'bg-[#2D6A4F] hover:bg-[#1f4a37]',
    },
  };

  const activeMeta = roleConfig[selectedRole];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#191512] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
      {/* Architectural subtle background accents */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#191512_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#EFE9E0]/50 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-2xl w-full mx-auto space-y-7 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1EA] border border-[#E8E2D9] text-[#8C653E] text-[11px] font-semibold tracking-[0.2em] uppercase shadow-xs mx-auto">
            <Shield className="w-3.5 h-3.5 text-[#8C653E]" />
            <span>{isTe ? '100% చట్టబద్ధమైన రెవెన్యూ ధృవీకరణ పోర్టల్' : 'Role-Based Authentication & Verification Portal'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#191512] tracking-tight">
            {dict.auth?.portalTitle || 'Telangana Realty Hub'}
          </h1>

          <p className="text-xs sm:text-sm text-[#574F48] max-w-lg mx-auto leading-relaxed">
            {dict.auth?.portalSubtitle ||
              'Unified access to the Executive Admin Panel, Deal Desk, 13-Document Legal Verification Reviewer, and Seller Portals.'}
          </p>
        </div>

        {/* ── Active Authenticated Session Screen ──────────────────────────── */}
        {isAuthenticated && user && !authLoading ? (
          <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-[0_12px_40px_-10px_rgba(25,21,18,0.08)] border border-[#E8E2D9] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8E2D9]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF5EE] text-[#8C653E] border border-[#E8E2D9] flex items-center justify-center shadow-inner shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-[#8C653E]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#191512]">{user.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#8C653E] text-white">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#8C827A] font-mono mt-0.5">{user.email || user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E8E2D9] text-[#574F48] hover:text-red-700 hover:bg-red-50 text-xs font-semibold tracking-wide uppercase transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{dict.nav?.logout || 'Log Out'}</span>
                </button>
              </div>
            </div>

            {/* Quick Access Tiles to Live Production Pages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8C827A]">
                  {isTe ? 'మీ అనుమతించబడిన పోర్టల్స్' : 'Your Permitted Role Portals'}
                </h4>
                <span className="text-[10px] text-[#8C653E] font-medium">1-Click Live Navigation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.role === 'ADMIN' && (
                  <>
                    <Link
                      href="/dashboard"
                      className="p-3.5 rounded-2xl border border-[#8C653E]/30 bg-[#FAF5EE] hover:bg-[#F5ECE0] transition-all group flex items-start gap-3"
                    >
                      <Activity className="w-5 h-5 text-[#8C653E] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#191512] flex items-center gap-1">
                          <span>Executive Command Center</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#8C653E] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[#574F48] truncate">/dashboard (Platform KPIs & GMV)</p>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard/verification"
                      className="p-3.5 rounded-2xl border border-[#8C653E]/30 bg-[#FAF5EE] hover:bg-[#F5ECE0] transition-all group flex items-start gap-3"
                    >
                      <ShieldCheck className="w-5 h-5 text-[#8C653E] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#191512] flex items-center gap-1">
                          <span>13-Doc Verification Desk</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#8C653E] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[#574F48] truncate">/dashboard/verification (Legal Gate)</p>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard/enquiries"
                      className="p-3.5 rounded-2xl border border-[#E8E2D9] bg-white hover:bg-[#FAF8F5] transition-all group flex items-start gap-3"
                    >
                      <FileSpreadsheet className="w-5 h-5 text-[#1D4E89] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#191512] flex items-center gap-1">
                          <span>Deal Desk & Pipeline</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#1D4E89] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[#574F48] truncate">/dashboard/enquiries (Leads & Visits)</p>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard/seller"
                      className="p-3.5 rounded-2xl border border-[#E8E2D9] bg-white hover:bg-[#FAF8F5] transition-all group flex items-start gap-3"
                    >
                      <Building2 className="w-5 h-5 text-[#2D6A4F] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#191512] flex items-center gap-1">
                          <span>Seller Portal View</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#2D6A4F] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[#574F48] truncate">/dashboard/seller (Owner View)</p>
                      </div>
                    </Link>
                  </>
                )}

                {user.role === 'AGENT' && (
                  <>
                    <Link
                      href="/dashboard/enquiries"
                      className="p-3.5 rounded-2xl border border-[#1D4E89]/30 bg-[#F0F4F9] hover:bg-[#E5EDF6] transition-all group flex items-start gap-3"
                    >
                      <FileSpreadsheet className="w-5 h-5 text-[#1D4E89] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#191512] flex items-center gap-1">
                          <span>Deal Desk & Pipeline</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#1D4E89] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[#574F48] truncate">/dashboard/enquiries</p>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard/properties"
                      className="p-3.5 rounded-2xl border border-[#E8E2D9] bg-white hover:bg-[#FAF8F5] transition-all group flex items-start gap-3"
                    >
                      <Layers className="w-5 h-5 text-[#1D4E89] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#191512] flex items-center gap-1">
                          <span>Verified Inventory Desk</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#1D4E89] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[#574F48] truncate">/dashboard/properties</p>
                      </div>
                    </Link>
                  </>
                )}

                {user.role === 'SELLER' && (
                  <>
                    <Link
                      href="/dashboard/seller"
                      className="p-3.5 rounded-2xl border border-[#2D6A4F]/30 bg-[#F2F7F4] hover:bg-[#E8F2EC] transition-all group flex items-start gap-3"
                    >
                      <Building2 className="w-5 h-5 text-[#2D6A4F] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#191512] flex items-center gap-1">
                          <span>Seller Portal Tracker</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#2D6A4F] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[#574F48] truncate">/dashboard/seller (13-Doc Tracker)</p>
                      </div>
                    </Link>

                    <Link
                      href={`/${locale}/list-property`}
                      className="p-3.5 rounded-2xl border border-[#E8E2D9] bg-white hover:bg-[#FAF8F5] transition-all group flex items-start gap-3"
                    >
                      <Compass className="w-5 h-5 text-[#8C653E] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#191512] flex items-center gap-1">
                          <span>8-Step Property Intake</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#8C653E] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[#574F48] truncate">/{locale}/list-property (Add Listing)</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E8E2D9]">
              <button
                type="button"
                onClick={() => handleRoleRedirect(user.role)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#191512] hover:bg-[#8C653E] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider shadow-sm transition-all"
              >
                <span>{isTe ? 'నా ప్రధాన వర్క్‌స్పేస్‌కి వెళ్లండి' : 'Open Primary Workspace'}</span>
                <ArrowRight className="w-4 h-4 text-[#C5A880]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  fillRoleCredentials('ADMIN');
                }}
                className="text-xs text-[#8C653E] hover:underline font-medium"
              >
                {isTe ? 'వేరే పాత్రతో లాగిన్ అవ్వండి (Switch Role)' : 'Switch Role / Explore Another Portal →'}
              </button>
            </div>
          </div>
        ) : (
          /* ── Unauthenticated Role Authentication Box ──────────────────── */
          <div className="bg-white rounded-3xl shadow-[0_12px_40px_-10px_rgba(25,21,18,0.08)] border border-[#E8E2D9] overflow-hidden">
            
            {/* 1. Role Selection Grid (Divided by Role) */}
            <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#E8E2D9]">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#8C827A] mb-3 px-1 flex items-center justify-between">
                <span>{isTe ? 'మీ పాత్రను ఎంచుకోండి (క్లిక్ చేస్తే వివరాలు నింపబడతాయి)' : 'Select Access Role (Auto-fills Credentials)'}</span>
                <span className="text-[10px] font-mono font-semibold text-[#8C653E] bg-[#F5F1EA] px-2.5 py-0.5 rounded-full border border-[#E8E2D9]">
                  RBAC Gate
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* Director Option (Primary Admin Focus) */}
                <button
                  type="button"
                  onClick={() => fillRoleCredentials('ADMIN')}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 relative group ${
                    selectedRole === 'ADMIN'
                      ? 'border-[#8C653E] bg-[#FAF5EE] text-[#5C4026] shadow-sm ring-2 ring-[#8C653E]/20'
                      : 'border-[#E8E2D9] bg-white hover:bg-[#FAF8F5] text-[#574F48]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck
                      className={`w-4 h-4 ${selectedRole === 'ADMIN' ? 'text-[#8C653E]' : 'text-[#8C827A]'}`}
                    />
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#8C653E] bg-amber-100/80 px-1.5 py-0.5 rounded-full border border-amber-200">
                      <Eye className="w-2.5 h-2.5" />
                      <span>{isTe ? 'అడ్మిన్' : 'Admin'}</span>
                    </span>
                  </div>
                  <div className="text-xs font-bold mt-2 font-serif text-[#191512]">
                    {isTe ? 'డైరెక్టర్' : 'Director'}
                  </div>
                  <div className="text-[10px] text-[#8C653E] font-medium truncate mt-0.5">
                    {isTe ? 'అడ్మిన్ ప్యానెల్' : 'Watch Admin'}
                  </div>
                </button>

                {/* Agent Option */}
                <button
                  type="button"
                  onClick={() => fillRoleCredentials('AGENT')}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 relative ${
                    selectedRole === 'AGENT'
                      ? 'border-[#1D4E89] bg-[#F0F4F9] text-[#0F2D54] shadow-sm ring-2 ring-[#1D4E89]/20'
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
                  <div className="text-xs font-bold mt-2 font-serif text-[#191512]">
                    {isTe ? 'ఏజెంట్' : 'Agent'}
                  </div>
                  <div className="text-[10px] text-[#8C827A] font-mono truncate mt-0.5">
                    Deal Advisor
                  </div>
                </button>

                {/* Seller Option */}
                <button
                  type="button"
                  onClick={() => fillRoleCredentials('SELLER')}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 relative ${
                    selectedRole === 'SELLER'
                      ? 'border-[#2D6A4F] bg-[#F2F7F4] text-[#1B4332] shadow-sm ring-2 ring-[#2D6A4F]/20'
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
                  <div className="text-xs font-bold mt-2 font-serif text-[#191512]">
                    {isTe ? 'విక్రేత' : 'Seller'}
                  </div>
                  <div className="text-[10px] text-[#8C827A] font-mono truncate mt-0.5">
                    Land & Flat
                  </div>
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
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-serif font-bold text-[#191512]">{activeMeta.title}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${activeMeta.accentBadge}`}>
                      {activeMeta.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#574F48] mt-1 leading-relaxed">{activeMeta.subtitle}</p>
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
              
              {/* Special Feature: Instant 1-Click "Watch Admin Panel" Action for Director */}
              {selectedRole === 'ADMIN' && (
                <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#8C653E]/30 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold font-serif text-[#5C4026]">
                      <Eye className="w-4 h-4 text-[#8C653E]" />
                      <span>{isTe ? 'అడ్మిన్ ప్యానెల్ ప్రత్యక్ష వీక్షణ' : 'Watch Live Executive Admin Panel'}</span>
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-[#8C653E] bg-white px-2 py-0.5 rounded-full border border-[#E5D2BC]">
                      1-Click Fast Access
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-[#574F48] leading-relaxed">
                    {isTe
                      ? 'ఎటువంటి పాస్‌వర్డ్ టైప్ చేయకుండా వెంటనే ఎగ్జిక్యూటివ్ కమాండ్ సెంటర్ (/dashboard), 13 డాక్యుమెంట్ల ధృవీకరణ డెస్క్ మరియు డీల్ పైప్‌లైన్‌ను వీక్షించండి.'
                      : 'Explore the Executive Command Center (/dashboard), 13-Document Dharani Legal Reviewer (/dashboard/verification), and Deal Desk instantly.'}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleInstantWatchAdmin('/dashboard')}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#8C653E] hover:bg-[#704f2f] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isTe ? '1-క్లిక్ అడ్మిన్ ప్యానెల్‌లోకి వెళ్లండి (/dashboard)' : '1-Click Watch Executive Admin Panel (/dashboard)'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </button>
                </div>
              )}

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
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs sm:text-sm text-[#191512] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-[#8C653E] focus:border-[#8C653E] focus:bg-white transition-all font-mono"
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
                              ? 'డెమో పాస్‌వర్డ్: Admin@1234. సహాయం కోసం: advisory@telanganarealty.in'
                              : 'Standard Platform Demo Password is Admin@1234. For assistance, contact advisory@telanganarealty.in.'
                          )
                        }
                        className="text-[11px] font-medium text-[#8C653E] hover:underline"
                      >
                        {isTe ? 'సహాయం కావాలా?' : 'Demo Password?'}
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
                        placeholder={isTe ? 'పాస్‌వర్డ్ నమోదు చేయండి' : 'Enter password'}
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

                  {/* Remember Me & Security Status */}
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
                      <span>256-Bit SSL Edge</span>
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
                          {selectedRole === 'ADMIN'
                            ? isTe
                              ? 'అడ్మిన్ ప్యానెల్‌లోకి ప్రవేశించండి (Sign In)'
                              : 'Sign In to Executive Admin Panel'
                            : isTe
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
                      {isTe ? 'మొబైల్ నంబర్ (ధృవీకరణ కోసం)' : 'Mobile Phone (for Verification)'}{' '}
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

              {/* 5. 1-Click Fast-Fill Station Bar */}
              <div className="pt-5 border-t border-[#E8E2D9]">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#8C827A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8C653E]" />
                    <span>{isTe ? 'త్వరిత డెమో నింపండి' : 'Fast-Fill Demo Station'}</span>
                  </span>
                  <span className="text-[10px] text-[#8C827A] font-mono">Password: Admin@1234</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* Admin Fast-Fill */}
                  <button
                    type="button"
                    onClick={() => fillRoleCredentials('ADMIN')}
                    className="p-2.5 rounded-2xl border border-[#E8E2D9] bg-[#FAF8F5] hover:bg-[#FAF5EE] hover:border-[#8C653E]/40 text-left transition-all group shadow-xs"
                  >
                    <div className="flex items-center gap-1 text-xs font-serif font-bold text-[#191512] group-hover:text-[#5C4026]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8C653E]" />
                      <span>Director</span>
                    </div>
                    <div className="text-[10px] text-[#8C653E] font-medium truncate mt-0.5">Watch Admin</div>
                  </button>

                  {/* Agent Fast-Fill */}
                  <button
                    type="button"
                    onClick={() => fillRoleCredentials('AGENT')}
                    className="p-2.5 rounded-2xl border border-[#E8E2D9] bg-[#FAF8F5] hover:bg-[#F0F4F9] hover:border-[#1D4E89]/40 text-left transition-all group shadow-xs"
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
                    className="p-2.5 rounded-2xl border border-[#E8E2D9] bg-[#FAF8F5] hover:bg-[#F2F7F4] hover:border-[#2D6A4F]/40 text-left transition-all group shadow-xs"
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

        {/* ── 📍 Role-Based Production Portals & Direct Links Directory ──── */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E8E2D9] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#E8E2D9] pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#8C653E]" />
              <h3 className="font-serif text-sm sm:text-base font-bold text-[#191512]">
                {isTe ? 'కీలక ప్రొడక్షన్ పేజీలు & రోల్ పోర్టల్స్' : 'Platform Portals & Live Production Pages'}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#8C827A]">
              Direct Role-Based Destinations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* 1. Executive Command Center */}
            <div className="p-3.5 rounded-2xl border border-[#8C653E]/20 bg-[#FAF5EE]/60 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#191512]">Executive Command Center</span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[#8C653E] text-white">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-[#574F48] truncate">
                  Admin Dashboard: KPIs, GMV & Platform Oversight
                </p>
                <div className="text-[10px] font-mono text-[#8C653E]">/dashboard</div>
              </div>
              <button
                type="button"
                onClick={() => handleInstantWatchAdmin('/dashboard')}
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#8C653E] hover:bg-[#704f2f] text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                title="Watch Admin Panel"
              >
                <span>Watch</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* 2. 13-Document Verification Reviewer */}
            <div className="p-3.5 rounded-2xl border border-[#8C653E]/20 bg-[#FAF5EE]/60 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#191512]">13-Doc Legal Reviewer</span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[#8C653E] text-white">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-[#574F48] truncate">
                  Dharani Passbooks, Pahani & HMDA Audit Gate
                </p>
                <div className="text-[10px] font-mono text-[#8C653E]">/dashboard/verification</div>
              </div>
              <button
                type="button"
                onClick={() => handleInstantWatchAdmin('/dashboard/verification')}
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#8C653E] hover:bg-[#704f2f] text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                title="Review Legal Documents"
              >
                <span>Watch</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* 3. Deal Desk & Lead Pipeline */}
            <div className="p-3.5 rounded-2xl border border-[#1D4E89]/20 bg-[#F0F4F9]/60 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#191512]">Deal Desk & Pipeline</span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[#1D4E89] text-white">
                    Agent / Admin
                  </span>
                </div>
                <p className="text-[11px] text-[#574F48] truncate">
                  Buyer Inquiries & Scheduled Field Visits
                </p>
                <div className="text-[10px] font-mono text-[#1D4E89]">/dashboard/enquiries</div>
              </div>
              <button
                type="button"
                onClick={() => handleInstantWatchAdmin('/dashboard/enquiries')}
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#1D4E89] hover:bg-[#143763] text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                title="Access Deal Desk"
              >
                <span>Watch</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* 4. Seller Portal Tracker */}
            <div className="p-3.5 rounded-2xl border border-[#2D6A4F]/20 bg-[#F2F7F4]/60 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#191512]">Seller Portal Tracker</span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[#2D6A4F] text-white">
                    Seller
                  </span>
                </div>
                <p className="text-[11px] text-[#574F48] truncate">
                  Owner Submission Tracker & Status
                </p>
                <div className="text-[10px] font-mono text-[#2D6A4F]">/dashboard/seller</div>
              </div>
              <Link
                href="/dashboard/seller"
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#2D6A4F] hover:bg-[#1f4a37] text-white text-[11px] font-bold transition-colors flex items-center gap-1"
              >
                <span>Open</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* 5. Seller Onboarding Form (8-Step Intake) */}
            <div className="p-3.5 rounded-2xl border border-[#E8E2D9] bg-white flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#191512]">8-Step Intake Form</span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-slate-800 text-white">
                    Public
                  </span>
                </div>
                <p className="text-[11px] text-[#574F48] truncate">
                  Property Intake & 13-Doc Upload Wizard
                </p>
                <div className="text-[10px] font-mono text-slate-600">/{locale}/list-property</div>
              </div>
              <Link
                href={`/${locale}/list-property`}
                className="shrink-0 px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] bg-[#FAF8F5] hover:bg-[#F5F1EA] text-[#191512] text-[11px] font-bold transition-colors flex items-center gap-1"
              >
                <span>Open</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* 6. Property Discovery & Interactive Map */}
            <div className="p-3.5 rounded-2xl border border-[#E8E2D9] bg-white flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#191512]">Property Discovery Map</span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-slate-800 text-white">
                    Public
                  </span>
                </div>
                <p className="text-[11px] text-[#574F48] truncate">
                  Verified Land, Flat & Villa Interactive GIS
                </p>
                <div className="text-[10px] font-mono text-slate-600">/{locale}/properties</div>
              </div>
              <Link
                href={`/${locale}/properties`}
                className="shrink-0 px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] bg-[#FAF8F5] hover:bg-[#F5F1EA] text-[#191512] text-[11px] font-bold transition-colors flex items-center gap-1"
              >
                <span>Open</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Legal Trust Footer & Return Link */}
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
