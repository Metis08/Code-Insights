'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getReposForUser } from '@/actions/github';
import { GithubRepo } from '@/components/landing/RepoList';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RepoTable } from '@/components/dashboard/RepoTable';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function DashboardContent() {
    const searchParams = useSearchParams();
    const username = searchParams.get('username');
    const [repos, setRepos] = useState<GithubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            setError("No username provided.");
        }
    }, [username]);

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold">Repositories</h2>
                    <p className="text-muted-foreground">A list of your repositories being analyzed by Code Insights.</p>
                </div>
                <Button>
                    Add Repository
                </Button>
            </div>
            {loading ? (
                 <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                 </div>
            ) : error ? (
                <div className="text-destructive">{error}</div>
            ) : (
                <RepoTable repos={repos} />
            )}
        </DashboardLayout>
    );
}


export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div></DashboardLayout>}>
            <DashboardContent />
        </Suspense>
    )
}
