'use client';

import React, { Suspense } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import Header from '../landing/Header';
import { Loader2 } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6 overflow-auto">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
