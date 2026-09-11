import React from 'react';

export default function PropertiesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 overflow-x-hidden">
      {/* Page header skeleton */}
      <div className="space-y-3 animate-pulse">
        <div className="h-3 w-24 bg-slate-200 rounded" />
        <div className="h-8 w-64 bg-slate-200 rounded" />
        <div className="h-4 w-96 bg-slate-200 rounded" />
      </div>

      {/* Filter bar skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4 animate-pulse">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="h-11 flex-1 bg-slate-100 rounded-xl" />
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-slate-100 rounded-xl" />
            <div className="h-9 w-28 bg-slate-100 rounded-xl" />
            <div className="h-9 w-28 bg-slate-100 rounded-xl" />
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="space-y-1.5">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex gap-3">
            <div className="h-9 w-32 bg-slate-200 rounded-xl" />
            <div className="h-9 w-28 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Results count skeleton */}
      <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-[16/10] w-full bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-slate-200 rounded-lg" />
                  <div className="h-5 w-24 bg-slate-100 rounded-lg" />
                </div>
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-6 w-1/3 bg-slate-200 rounded" />
                  <div className="h-8 w-1/3 bg-slate-100 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map skeleton */}
        <div className="hidden lg:block lg:col-span-5">
          <div className="bg-slate-900 rounded-2xl h-[480px] animate-pulse border border-slate-800">
            <div className="h-12 bg-slate-800 rounded-t-2xl border-b border-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
