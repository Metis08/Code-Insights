'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ConnectToGithub } from '@/components/landing/ConnectToGithub';
import { GithubRepo, RepoList } from '@/components/landing/RepoList';

export default function Hero() {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'initial' | 'repos'>('initial');

  const handleReposFetched = (fetchedRepos: GithubRepo[]) => {
    setRepos(fetchedRepos);
    setLoading(false);
    if (fetchedRepos.length > 0) {
      setView('repos');
    } else {
      setError('No public repositories found for this user.');
    }
  };

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  };

  const handleBack = () => {
    setView('initial');
    setRepos([]);
    setError(null);
  }

  return (
    <section className="relative w-full py-32 md:py-40 lg:py-48 flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(137,44,220,0.3),rgba(255,255,255,0))]"></div>
      </div>

      <div className="container relative z-10 flex flex-col items-center text-center px-4 w-full">
        {view === 'initial' && (
          <>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-2">
              Understand Any Codebase in Minutes, Not Days.
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-neutral-300">
              AI-powered code analysis using Gemini. Import a GitHub repo and instantly get architecture summaries, documentation, and insights.
            </p>
            <div className="mt-8 w-full max-w-md">
              <ConnectToGithub 
                onReposFetched={handleReposFetched}
                onLoading={handleLoading}
                onError={handleError}
                isLoading={loading}
              />
               {error && <p className="mt-4 text-destructive">{error}</p>}
            </div>
             <div className="mt-4 text-neutral-400">or</div>
             <div className="mt-4">
              <Button asChild variant="outline" size="lg" className="bg-transparent text-primary-foreground font-bold text-lg px-8 py-6 rounded-full transition-shadow duration-300">
                <Link href="/analyze">Analyze a Repo by URL</Link>
              </Button>
            </div>
          </>
        )}
        
        {view === 'repos' && (
            <div className="w-full max-w-4xl">
                <Button onClick={handleBack} variant="ghost" className="mb-4">← Back to search</Button>
                <h2 className="text-3xl font-bold mb-4">Select a Repository</h2>
                <RepoList repos={repos} />
            </div>
        )}

      </div>
    </section>
  );
}
