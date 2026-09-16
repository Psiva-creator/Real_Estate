'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DashboardRootPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/en/login?redirect=/dashboard');
      return;
    }

    if (user?.role === 'SELLER') {
      router.replace('/dashboard/seller');
    } else {
      router.replace('/dashboard/properties');
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
        <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
        <span>Redirecting to your authorized workspace...</span>
      </div>
    </div>
  );
}
