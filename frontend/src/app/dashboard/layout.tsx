import React from 'react';
import Link from 'next/link';
import { Shield, FileCheck, Users, ArrowLeft, Building2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Back-Office Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base tracking-wide">
                Telangana Realty Hub <span className="text-emerald-400 font-mono text-xs ml-1.5 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">Agent Back-Office</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/en"
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Portal</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 text-xs font-semibold overflow-x-auto">
          <Link
            href="/dashboard/properties"
            className="py-3 border-b-2 border-emerald-500 text-emerald-400 flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            <span>13-Doc Verification Reviewer</span>
          </Link>
          <Link
            href="/dashboard/enquiries"
            className="py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Lead & Enquiry Pipeline</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
