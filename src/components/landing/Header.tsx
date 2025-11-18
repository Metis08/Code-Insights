import { Code, HelpCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-center relative">
        <Link href="/" className="mr-auto flex items-center gap-2 md:absolute md:left-4">
          <Code className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline-block">Code Insights</span>
        </Link>
        <nav className="flex items-center gap-4">
           <Button variant="ghost" asChild>
            <Link href="/analyze">Analyze a Repo</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/docs">
              <FileText className="mr-2 h-4 w-4" />
              Documentation
            </Link>
          </Button>
          <Button asChild>
            <Link href="/qa">
              <HelpCircle className="mr-2 h-4 w-4" />
              Repo Q&A
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
