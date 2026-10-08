import type { Metadata } from 'next';
import React from 'react';
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';

export const metadata: Metadata = {
  title: 'Internal Advisory Desk | Telangana Realty Hub',
  description: 'Confidential administrative and broker advisory terminal.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
