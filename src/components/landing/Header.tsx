import { Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Code className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Code Insights</span>
        </a>
        <nav className="flex items-center gap-4">
          <Button asChild>
            <Link href="/analyze">Analyze a Repo</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}