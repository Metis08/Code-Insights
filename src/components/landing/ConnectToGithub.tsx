'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getReposForUser } from '@/actions/github';
import { Loader2, Github } from 'lucide-react';
import { GithubRepo } from './RepoList';

type ConnectToGithubProps = {
  onReposFetched: (repos: GithubRepo[]) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string) => void;
  isLoading: boolean;
};

export function ConnectToGithub({ onReposFetched, onLoading, onError, isLoading }: ConnectToGithubProps) {
  const [username, setUsername] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedUsername = localStorage.getItem('github_username');
    if (savedUsername) {
        setUsername(savedUsername);
    }
  }, []);

  const handleFetch = async () => {
    if (!username) {
      onError('Please enter a GitHub username.');
      return;
    }
    onLoading(true);
    localStorage.setItem('github_username', username);
    const result = await getReposForUser(username);
    if (result.error) {
      onError(result.error);
    } else if (result.data) {
      onReposFetched(result.data);
    }
    onLoading(false);
  };

  if (!isClient) {
    // Render a placeholder or nothing on the server to avoid hydration mismatch
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
        <div className="relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username"
                className="pl-10 h-12 text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                disabled={isLoading}
            />
        </div>
      <Button onClick={handleFetch} disabled={isLoading} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-full shadow-[0_0_20px_theme(colors.primary)] transition-shadow duration-300 hover:shadow-[0_0_30px_theme(colors.primary)]">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Fetching...
          </>
        ) : (
          'Fetch Repositories'
        )}
      </Button>
    </div>
  );
}
