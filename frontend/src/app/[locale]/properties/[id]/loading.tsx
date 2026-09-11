import React from 'react';

export default function PropertyDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 pb-24 lg:pb-12 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="h-4 w-44 bg-slate-200 rounded" />
        <div className="h-6 w-36 bg-slate-100 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Gallery skeleton */}
          <div className="space-y-3">
            <div className="aspect-[16/10] w-full rounded-2xl bg-slate-200" />
            <div className="flex gap-2.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-24 aspect-[16/10] rounded-xl bg-slate-200 shrink-0" />
              ))}
            </div>
          </div>

          {/* Title/badges skeleton */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-lg bg-slate-200" />
              <div className="h-6 w-32 rounded-lg bg-slate-100" />
              <div className="h-6 w-24 rounded-lg bg-slate-100" />
            </div>
            <div className="h-4 w-48 bg-slate-100 rounded" />
            <div className="h-8 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 rounded" />
          </div>

          {/* Specs skeleton */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="h-6 w-40 bg-slate-200 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-16 bg-slate-100 rounded-xl" />
              ))}
            </div>
          </div>

          {/* 13-docs skeleton */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-7 w-56 bg-slate-200 rounded" />
              <div className="h-6 w-24 bg-slate-100 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-16 bg-slate-50 border border-slate-200 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Map skeleton */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-14 bg-slate-100 rounded-xl" />
              ))}
            </div>
            <div className="h-72 bg-slate-900/10 rounded-xl border border-slate-200" />
          </div>
        </div>

        {/* Right column: action card skeleton */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg space-y-6">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-100 rounded" />
              <div className="h-10 w-36 bg-slate-200 rounded" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
            </div>
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <div className="h-12 w-full bg-emerald-100 rounded-xl" />
              <div className="h-11 w-full bg-slate-100 rounded-xl" />
              <div className="h-10 w-full bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-100" />
                <div className="space-y-1">
                  <div className="h-3 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-40 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
