'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, FileCheck, Users, ArrowLeft, Building2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Back-Office Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm sm:text-base tracking-wide truncate block">
                Telangana Realty Hub{' '}
                <span className="text-emerald-400 font-mono text-xs ml-1.5 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 hidden sm:inline">
                  Agent Back-Office
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              href="/en"
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Portal</span>
              <span className="sm:hidden">Portal</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Navigation Tabs — scrollable on mobile */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-4 text-xs font-semibold overflow-x-auto scrollbar-none border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
