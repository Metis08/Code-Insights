'use client';

import { Code, HelpCircle, FileText, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/analyze', text: 'Analyze a Repo' },
    { href: '/docs', text: 'Documentation', icon: <FileText className="mr-2 h-4 w-4" /> },
    { href: '/qa', text: 'Repo Q&A', icon: <HelpCircle className="mr-2 h-4 w-4" /> },
    { href: '/suggest', text: 'Suggest Repos', icon: <Compass className="mr-2 h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Code className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline-block">Code Insights</span>
        </Link>
        <nav className="flex items-center gap-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname === link.href ? "secondary" : "ghost"}
              asChild
              className="hidden md:flex"
            >
              <Link href={link.href}>
                {link.icon}
                {link.text}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
