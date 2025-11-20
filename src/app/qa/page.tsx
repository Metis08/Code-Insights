'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Loader2, HelpCircle, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { answerRepoQuestion } from '@/ai/flows/answer-repo-question';
import Header from '@/components/landing/Header';
import { ConnectToGithub } from '@/components/landing/ConnectToGithub';
import { GithubRepo } from '@/components/landing/RepoList';

type QAMessage = {
  role: 'user' | 'bot';
  content: string;
};

type QAResult = {
  answer: string;
};

function QAPageComponent() {
  const searchParams = useSearchParams();
  const repoUrlFromQuery = searchParams.get('repoUrl');
  const username = searchParams.get('username');

  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'initial' | 'repos' | 'chat'>('initial');

  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    if (repoUrlFromQuery) {
      handleRepoUrl(repoUrlFromQuery);
    } else if (username) {
      setView('initial');
    }
  }, [repoUrlFromQuery, username]);

  const handleRepoUrl = async (url: string) => {
    const urlParts = url.replace(/\/$/, "").split('/');
    const repoName = urlParts.pop() || '';
    const owner = urlParts.pop() || '';
    if (!owner || !repoName) {
      setError('Invalid GitHub URL');
      return;
    }
    const fullName = `${owner}/${repoName}`;
    
    const repoRes = await fetch(`https://api.github.com/repos/${fullName}`);
    if(!repoRes.ok) {
        setError("Could not fetch repository details from GitHub.");
        return;
    }
    const repoData = await repoRes.json();
    
    handleRepoSelected({
      id: repoData.id,
      name: repoData.name,
      full_name: repoData.full_name,
      description: repoData.description,
      html_url: repoData.html_url,
      stargazers_count: repoData.stargazers_count,
      forks_count: repoData.forks_count,
      language: repoData.language,
      updated_at: repoData.updated_at,
    });
  }

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

  const handleRepoSelected = (repo: GithubRepo) => {
    setSelectedRepo(repo);
    setView('chat');
  };
  
  const handleBackToSearch = () => {
    setView('initial');
    setRepos([]);
    setError(null);
  }

  const handleBackToRepos = () => {
    setView(repos.length > 0 ? 'repos' : 'initial');
    setMessages([]);
    setQuestion('');
  }

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !selectedRepo) return;

    const newMessages: QAMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);
    setQuestion('');
    setIsAnswering(true);

    try {
      const result = await answerRepoQuestion({
        repoUrl: selectedRepo.html_url,
        question: question,
      });
      setMessages([...newMessages, { role: 'bot', content: result.answer }]);
    } catch (error) {
      console.error('Q&A failed:', error);
      setMessages([...newMessages, { role: 'bot', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          {username && view !== 'chat' && (
             <Link href={`/dashboard?username=${username}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>
          )}
          {view === 'initial' && (
            <>
               <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Repository Q&amp;A</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                  First, find a repository to ask questions about.
                </p>
              </div>
              <div className="mt-8 w-full max-w-md mx-auto">
                <ConnectToGithub
                  onReposFetched={handleReposFetched}
                  onLoading={handleLoading}
                  onError={handleError}
                  isLoading={loading}
                />
                {error && <p className="mt-4 text-destructive text-center">{error}</p>}
                 <div className="mt-4 text-neutral-400 text-center">or</div>
                 <div className="mt-4 text-center">
                  <Button asChild variant="outline">
                    <Link href="/analyze">Analyze a Repo by URL</Link>
                  </Button>
                </div>
              </div>
            </>
          )}

          {view === 'repos' && (
            <div>
              <h2 className="text-3xl font-bold mb-4 text-left">Select a Repository to Chat With</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                {repos.map((repo) => (
                    <Card key={repo.id} onClick={() => handleRepoSelected(repo)} className="h-full flex flex-col hover:border-primary transition-colors cursor-pointer text-left">
                        <CardHeader>
                        <CardTitle>{repo.name}</CardTitle>
                        <CardContent className="p-0 pt-2">
                            <p className="text-sm text-muted-foreground line-clamp-2">{repo.description}</p>
                        </CardContent>
                        </CardHeader>
                    </Card>
                ))}
              </div>
            </div>
          )}

          {view === 'chat' && selectedRepo && (
            <div>
              {username && (
                <Link href={`/dashboard?username=${username}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              )}
               <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <HelpCircle className="w-6 h-6 text-primary" />
                        <span>Q&amp;A for: <span className="font-mono bg-muted px-2 py-1 rounded">{selectedRepo.full_name}</span></span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[50vh] overflow-y-auto pr-4 flex flex-col gap-4">
                    {messages.length === 0 && (
                      <div className="flex-grow flex items-center justify-center">
                        <p className="text-muted-foreground">Ask a question to get started.</p>
                      </div>
                    )}
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                         {msg.role === 'bot' && <Bot className="w-6 h-6 text-primary flex-shrink-0" />}
                         <div className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                           <p className="text-sm">{msg.content}</p>
                         </div>
                         {msg.role === 'user' && <User className="w-6 h-6 text-muted-foreground flex-shrink-0" />}
                      </div>
                    ))}
                    {isAnswering && (
                        <div className="flex items-start gap-4">
                            <Bot className="w-6 h-6 text-primary flex-shrink-0" />
                            <div className="rounded-lg px-4 py-2 bg-secondary">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        </div>
                    )}
                  </div>
                  <form onSubmit={handleAskQuestion} className="mt-4 flex items-center gap-2">
                    <Input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask about authentication, data models, etc."
                      disabled={isAnswering}
                      className="text-base"
                    />
                    <Button type="submit" disabled={isAnswering || !question.trim()}>
                      {isAnswering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span className="sr-only">Ask</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


export default function QAPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QAPageComponent />
    </Suspense>
  )
}
