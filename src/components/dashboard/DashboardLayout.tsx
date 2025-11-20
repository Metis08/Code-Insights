'use client';

import React from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import Header from '../landing/Header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6 overflow-auto">
            {children}
        </div>
      </main>
    </div>
  );
}
