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
import ThemeToggle from '@/components/common/ThemeToggle';

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
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-[#5A382B]">
          <div className="w-9 h-9 border-2 border-[#C79A6B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8B624C]">
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
      badgeColor: 'bg-[#C79A6B] text-[#201512]',
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
    <div className="min-h-screen bg-[#FAF8F5] text-[#201512] flex flex-col font-sans selection:bg-[#C79A6B]/30 selection:text-[#201512]">
      {/* Top Executive App Bar */}
      <header className="bg-[#FAF8F5]/95 backdrop-blur-md text-[#201512] border-b border-[#E2CFB6] sticky top-0 z-40 shrink-0 shadow-[0_2px_12px_-4px_rgba(32,21,18,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left Brand & Clearance Badges */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-xl bg-[#201512] border border-[#201512] flex items-center justify-center shadow-sm shrink-0 hover:bg-[#3A241C] transition-colors"
            >
              <Shield className="w-5 h-5 text-[#C79A6B]" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm sm:text-base tracking-wider uppercase truncate block text-[#201512]">
                  Telangana Realty Hub
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F5F0E8] text-[#5A382B] border border-[#C79A6B]/50">
                    <ShieldCheck className="w-3 h-3 text-[#C79A6B]" />
                    <span className="hidden sm:inline">Director Clearance • L3</span>
                    <span className="sm:hidden">L3</span>
                  </span>
                )}
                {isAgent && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F5F0E8] text-[#5A382B] border border-[#C79A6B]/50">
                    <Briefcase className="w-3 h-3 text-[#C79A6B]" />
                    <span>Deal Advisor</span>
                  </span>
                )}
                {isSeller && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F5F0E8] text-[#5A382B] border border-[#C79A6B]/50">
                    <span>Landowner Portal</span>
                  </span>
                )}
              </div>

              {/* Subdomain & Edge Telemetry line */}
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#8B624C] font-sans mt-0.5">
                <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Edge RBAC Active
                </span>
                <span className="text-[#E2CFB6]">•</span>
                <span className="text-[#8B624C]">admin.telanganarealty.in</span>
              </div>
            </div>
          </div>

          {/* Right Executive Profile & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle Icon */}
            <ThemeToggle className="p-2" />

            {/* User Profile Card */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#F5F0E8] border border-[#E2CFB6]">
              <div className="w-7 h-7 rounded-lg bg-[#201512] text-[#FBF8F3] border border-[#C79A6B]/40 flex items-center justify-center font-bold text-xs">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-[#201512] truncate max-w-[130px]">
                  {user.name}
                </div>
                <div className="text-[10px] font-mono text-[#8B624C] truncate">
                  {user.role}
                </div>
              </div>
            </div>

            {/* Public Website Link */}
            <a
              href={getPublicUrl('/en')}
              className="inline-flex items-center gap-1.5 text-xs text-[#5A382B] hover:text-[#201512] px-3 py-2 rounded-xl bg-[#F5F0E8] hover:bg-[#E2CFB6] border border-[#E2CFB6] transition-colors"
              title="Open Public Website"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#8B624C]" />
              <span className="hidden sm:inline">Public Site</span>
            </a>

            {/* Sign Out */}
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace('/trh-internal-desk');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#8B624C] hover:text-red-700 px-3 py-2 rounded-xl bg-[#F5F0E8] hover:bg-red-50 border border-[#E2CFB6] hover:border-red-200 transition-colors"
              title="End Secure Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 sm:gap-2 text-xs font-semibold overflow-x-auto scrollbar-none border-t border-[#E2CFB6]/70 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isExact = pathname === tab.href;
            const isSub = tab.href !== '/dashboard' && tab.href !== '/en/list-property' && pathname.startsWith(tab.href + '/');
            const isActive = isExact || isSub;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#201512] text-[#FBF8F3] font-bold border border-[#201512] shadow-sm'
                    : 'text-[#5A382B] hover:text-[#201512] hover:bg-[#F5F0E8] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#C79A6B]' : 'text-[#8B624C]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black leading-tight ${tab.badgeColor || 'bg-[#C79A6B] text-[#201512]'}`}>
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
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#E2CFB6] shadow-sm text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F0E8] border border-[#E2CFB6] text-[#8B624C] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-[#8B624C]" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-xl font-bold text-[#201512]">
                {isAgentAccessViolation
                  ? 'Lead Administrator Clearance Required'
                  : 'Access Restricted'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A382B] leading-relaxed">
                {isAgentAccessViolation
                  ? 'The 13-Document Verification Reviewer and legal deed clearance console is restricted strictly to Lead Platform Administrators. Deal Agents can manage listings and enquiries under the Properties desk.'
                  : 'This section is reserved for certified deal agents and platform administrators. Landowners and sellers have dedicated submission tools in the Seller Portal.'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={isAgentAccessViolation ? '/dashboard/properties' : '/dashboard/seller'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#201512] hover:bg-[#3A241C] text-[#FBF8F3] font-bold text-xs transition-colors shadow-sm"
              >
                <span>
                  {isAgentAccessViolation
                    ? 'Return to Properties Desk'
                    : 'Go to Seller Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#C79A6B]" />
              </Link>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* Deep Espresso Luxury Footer */}
      <footer className="border-t border-[#3A241C] bg-[#201512] text-[#E2CFB6] text-[11px] py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-sans">
            <Activity className="w-3.5 h-3.5 text-[#C79A6B]" />
            <span className="text-[#FBF8F3]">Telemetry: Telangana Land Records (Dharani & ROR 1-B) Synced</span>
          </div>
          <div className="font-sans text-[#E2CFB6]">
            Session: Level-3 RBAC • admin.telanganarealty.in
          </div>
        </div>
      </footer>
    </div>
  );
}
