'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getReposForUser } from '@/actions/github';
import { GithubRepo } from '@/components/landing/RepoList';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RepoTable } from '@/components/dashboard/RepoTable';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddRepoForm } from '@/components/landing/AddRepoForm';

function DashboardContent() {
    const searchParams = useSearchParams();
    const username = searchParams.get('username');
    const [repos, setRepos] = useState<GithubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (username) {
            setLoading(true);
            getReposForUser(username)
                .then(result => {
                    if (result.error) {
                        setError(result.error);
                    } else if (result.data) {
                        setRepos(result.data);
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
            setError("No username found in URL. Please go back and enter a username.");
        }
    }, [username]);

    const handleRepoAdded = async (repoUrl: string) => {
        try {
            const url = new URL(repoUrl);
            const pathParts = url.pathname.slice(1).split('/');
            const owner = pathParts[0];
            const repo = pathParts[1];

            if (!owner || !repo) {
                throw new Error("Invalid GitHub URL");
            }

            const fullName = `${owner}/${repo}`;
            
            // The data from getRepoContents is an array of files, not repo details.
            // We need to fetch repo details specifically.
            const repoRes = await fetch(`https://api.github.com/repos/${fullName}`);
            if(!repoRes.ok) {
                setError("Could not fetch repository details from GitHub.");
                return;
            }
            const repoData = await repoRes.json();
            
            const newRepo: GithubRepo = {
                id: repoData.id,
                name: repoData.name,
                full_name: repoData.full_name,
                description: repoData.description,
                html_url: repoData.html_url,
                stargazers_count: repoData.stargazers_count,
                forks_count: repoData.forks_count,
                language: repoData.language,
                updated_at: repoData.updated_at,
            };

            // Avoid adding duplicates
            if (!repos.some(r => r.id === newRepo.id)) {
                 setRepos(prevRepos => [newRepo, ...prevRepos]);
            }
            setIsDialogOpen(false);
        } catch (e: any) {
            setError(e.message || "Failed to add repository.");
        }
    }

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold">Repositories</h2>
                    <p className="text-muted-foreground">A list of your repositories being analyzed by Code Insights.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Add External Repository</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add External Repository</DialogTitle>
                    </DialogHeader>
                    <AddRepoForm onRepoAdded={handleRepoAdded} />
                  </DialogContent>
                </Dialog>
            </div>
            {loading ? (
                 <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                 </div>
            ) : error ? (
                <div className="text-destructive">{error}</div>
            ) : (
                <RepoTable repos={repos} username={username} />
            )}
        </DashboardLayout>
    );
}


export default function DashboardPage() {
    return (
        <Suspense>
            <DashboardContent />
        </Suspense>
    )
}
