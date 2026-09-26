'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  FileCheck,
  Users,
  ArrowLeft,
  Building2,
  PlusCircle,
  LogOut,
  Lock,
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  Activity,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getPublicUrl } from '@/lib/domain';
import { getAdminDashboardApi } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isAuthenticated, isLoading, logout, isSeller, isAdmin, isAgent } = useAuth();
  const [pendingReviews, setPendingReviews] = useState<number>(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/en/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Fetch pending review count for live badge
  useEffect(() => {
    if (isAuthenticated && (isAdmin || isAgent)) {
      const token = localStorage.getItem('trh_auth_token');
      if (token) {
        getAdminDashboardApi(token)
          .then((stats) => {
            if (stats && typeof stats.underReviewProperties === 'number') {
              setPendingReviews(stats.underReviewProperties);
            }
          })
          .catch(() => {});
      }
    }
  }, [isAuthenticated, isAdmin, isAgent]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-9 h-9 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Authenticating Executive Session & Edge RBAC...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Navigation tabs based on role
  const adminTabs = [
    {
      href: '/dashboard',
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      href: '/dashboard/verification',
      label: '13-Doc Reviewer',
      icon: FileCheck,
      badge: pendingReviews > 0 ? pendingReviews : null,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      href: '/dashboard/properties',
      label: 'Land Inventory',
      icon: Building2,
      badge: null,
    },
    {
      href: '/dashboard/enquiries',
      label: 'Investor Enquiries',
      icon: Users,
      badge: null,
    },
  ];

  const agentTabs = [
    {
      href: '/dashboard',
      label: 'Broker Desk',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      href: '/dashboard/properties',
      label: 'Properties',
      icon: Building2,
      badge: null,
    },
    {
      href: '/dashboard/enquiries',
      label: 'Enquiries',
      icon: Users,
      badge: null,
    },
  ];

  const sellerTabs = [
    {
      href: '/dashboard/seller',
      label: 'My Submissions',
      icon: Building2,
      badge: null,
    },
    {
      href: '/en/list-property',
      label: 'Submit New Property',
      icon: PlusCircle,
      badge: null,
    },
  ];

  const tabs = isSeller ? sellerTabs : isAdmin ? adminTabs : agentTabs;

  // Prevent unauthorized cross-role access
  const isSellerAccessViolation =
    isSeller &&
    (pathname.startsWith('/dashboard/properties') ||
      pathname.startsWith('/dashboard/enquiries') ||
      pathname.startsWith('/dashboard/verification'));

  const isAgentAccessViolation =
    isAgent && pathname.startsWith('/dashboard/verification');

  const isAccessRestricted = isSellerAccessViolation || isAgentAccessViolation;

  // Extract initials for executive avatar
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'TR';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Executive App Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md text-white border-b border-slate-800 sticky top-0 z-40 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left Brand & Clearance Badges */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 hover:scale-105 transition-transform"
            >
              <Shield className="w-5 h-5 text-slate-950" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight truncate block text-white">
                  Telangana Realty Hub
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span className="hidden sm:inline">Director Clearance • L3</span>
                    <span className="sm:hidden">L3</span>
                  </span>
                )}
                {isAgent && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    <Briefcase className="w-3 h-3 text-blue-400" />
                    <span>Deal Advisor</span>
                  </span>
                )}
                {isSeller && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span>Landowner Portal</span>
                  </span>
                )}
              </div>

              {/* Subdomain & Edge Telemetry line */}
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Edge RBAC Active
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">admin.telanganarealty.in</span>
              </div>
            </div>
          </div>

          {/* Right Executive Profile & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* User Profile Card */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-xs">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-white truncate max-w-[130px]">
                  {user.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {user.role}
                </div>
              </div>
            </div>

            {/* Public Website Link */}
            <a
              href={getPublicUrl('/en')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors"
              title="Open Public Website"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Site</span>
            </a>

            {/* Sign Out */}
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace('/trh-internal-desk');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/50 transition-colors"
              title="End Secure Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 text-xs font-semibold overflow-x-auto scrollbar-none border-t border-slate-800/80 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isExact = pathname === tab.href;
            const isSub = tab.href !== '/dashboard' && tab.href !== '/en/list-property' && pathname.startsWith(tab.href + '/');
            const isActive = isExact || isSub;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black leading-tight ${tab.badgeColor || 'bg-amber-500 text-slate-950'}`}>
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
        {isAccessRestricted ? (
          <div className="bg-slate-900 rounded-2xl p-8 sm:p-12 border border-slate-800 shadow-xl text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">
                {isAgentAccessViolation
                  ? 'Lead Administrator Clearance Required'
                  : 'Access Restricted'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {isAgentAccessViolation
                  ? 'The 13-Document Verification Reviewer and legal deed clearance console is restricted strictly to Lead Platform Administrators. Deal Agents can manage listings and enquiries under the Properties desk.'
                  : 'This section is reserved for certified deal agents and platform administrators. Landowners and sellers have dedicated submission tools in the Seller Portal.'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={isAgentAccessViolation ? '/dashboard/properties' : '/dashboard/seller'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
              >
                <span>
                  {isAgentAccessViolation
                    ? 'Return to Properties Desk'
                    : 'Go to Seller Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* Subtle Platform Status Bar Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 text-slate-500 text-[11px] py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Telemetry: Telangana Land Records (Dharani & ROR 1-B) Synced</span>
          </div>
          <div>
            Session: Level-3 RBAC • admin.telanganarealty.in
          </div>
        </div>
      </footer>
    </div>
  );
}
