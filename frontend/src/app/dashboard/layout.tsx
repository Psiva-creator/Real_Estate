'use client';

import React, { useEffect } from 'react';
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
  UserCheck,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isAuthenticated, isLoading, logout, isSeller, isAdmin, isAgent } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/en/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Verifying Session & Role Permissions...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Define tabs based on role
  const adminTabs = [
    {
      href: '/dashboard/properties',
      label: 'Properties',
      icon: Building2,
    },
    {
      href: '/dashboard/enquiries',
      label: 'Enquiries',
      icon: Users,
    },
    {
      href: '/dashboard/verification',
      label: '13-Doc Reviewer',
      icon: FileCheck,
    },
  ];

  const agentTabs = [
    {
      href: '/dashboard/properties',
      label: 'Properties',
      icon: Building2,
    },
    {
      href: '/dashboard/enquiries',
      label: 'Enquiries',
      icon: Users,
    },
  ];

  const sellerTabs = [
    {
      href: '/dashboard/seller',
      label: 'My Submissions',
      icon: Building2,
    },
    {
      href: '/en/list-property',
      label: 'Submit New Property',
      icon: PlusCircle,
    },
  ];

  const tabs = isSeller ? sellerTabs : isAdmin ? adminTabs : agentTabs;

  // Prevent unauthorized access:
  // 1. Sellers blocked from internal broker desks and reviewer
  const isSellerAccessViolation =
    isSeller &&
    (pathname.startsWith('/dashboard/properties') ||
      pathname.startsWith('/dashboard/enquiries') ||
      pathname.startsWith('/dashboard/verification'));

  // 2. Agents blocked from Admin-only verification reviewer
  const isAgentAccessViolation =
    isAgent && pathname.startsWith('/dashboard/verification');

  const isAccessRestricted = isSellerAccessViolation || isAgentAccessViolation;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Back-Office / Portal Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Left Brand & Context */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm sm:text-base tracking-wide truncate block">
                Telangana Realty Hub{' '}
                <span className="text-emerald-400 font-mono text-xs ml-1.5 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 hidden sm:inline">
                  {isSeller
                    ? 'Seller Portal'
                    : isAdmin
                    ? 'Lead Admin Back-Office'
                    : 'Agent Back-Office'}
                </span>
              </span>
            </div>
          </div>

          {/* Right User State & Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
              <span className="font-medium text-white">{user.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                {user.role}
              </span>
            </div>

            <Link
              href="/en"
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Website</span>
              <span className="sm:hidden">Website</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                logout();
                router.replace('/en/login');
              }}
              className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-red-300 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-4 text-xs font-semibold overflow-x-auto scrollbar-none border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || (tab.href !== '/en/list-property' && pathname.startsWith(tab.href + '/'));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`py-3 border-b-2 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-colors px-1 ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
        {isAccessRestricted ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">
                {isAgentAccessViolation
                  ? 'Lead Administrator Clearance Required'
                  : 'Access Restricted'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isAgentAccessViolation
                  ? 'The 13-Document Verification Reviewer and legal deed clearance console is restricted strictly to Lead Platform Administrators. Deal Agents can manage listings and enquiries under the Properties desk.'
                  : 'This section is reserved for certified deal agents and platform administrators. Landowners and sellers have dedicated submission tools in the Seller Portal.'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={isAgentAccessViolation ? '/dashboard/properties' : '/dashboard/seller'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
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
    </div>
  );
}
