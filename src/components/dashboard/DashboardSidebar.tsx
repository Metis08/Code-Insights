'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Search, FileText, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Repositories', icon: Package },
  { href: '/analyze', label: 'Analysis', icon: Search },
  { href: '/docs', label: 'Documentation', icon: FileText },
  { href: '/qa', label: 'Q&A', icon: MessageSquare },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#1A1A1A] p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg"></div>
        <span className="font-bold text-xl">Code Insights</span>
      </div>
      <nav className="flex flex-col gap-2">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href) && (link.href !== '/' || pathname === '/') && (link.href !== '/dashboard' || pathname === '/dashboard');
          return(
          <Button
            key={link.href}
            variant={isActive ? 'secondary' : 'ghost'}
            asChild
            className="justify-start"
          >
            <Link href={link.href}>
              <link.icon className="mr-3 h-5 w-5" />
              {link.label}
            </Link>
          </Button>
        )})}
      </nav>
    </aside>
  );
}
