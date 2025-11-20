'use client';

import React from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border/40 px-6">
            <div>
                <h1 className="text-xl font-bold">Repositories</h1>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost">Features</Button>
                <Button variant="ghost">How It Works</Button>
                <Button>Go to My Repos</Button>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
        </header>
        <div className="flex-1 p-6 overflow-auto">
            {children}
        </div>
      </main>
    </div>
  );
}
