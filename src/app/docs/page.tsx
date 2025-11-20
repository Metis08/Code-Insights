'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2, FileCode, Folder, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { generateFileByFileDocumentation } from '@/ai/flows/generate-file-by-file-documentation';
import { getRepoContents } from '@/actions/github';
import Header from '@/components/landing/Header';
import { ConnectToGithub } from '@/components/landing/ConnectToGithub';
import { GithubRepo } from '@/components/landing/RepoList';

type RepoFile = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  documentation?: string;
  children?: RepoFile[];
  isGenerating?: boolean;
};

function DocsPageComponent() {
  const searchParams = useSearchParams();
  const repoUrlFromQuery = searchParams.get('repoUrl');
  const username = searchParams.get('username');

  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'initial' | 'repos' | 'docs'>('initial');
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    if (repoUrlFromQuery) {
      handleRepoUrl(repoUrlFromQuery);
    } else if (username) {
      // If there's a username but no repo, stay in initial view but be ready to show repos
      setView('initial');
    }
  }, [repoUrlFromQuery, username]);


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

  const handleRepoUrl = async (url: string) => {
    const urlParts = url.replace(/\/$/, "").split('/');
    const repoName = urlParts.pop() || '';
    const owner = urlParts.pop() || '';
    if (!owner || !repoName) {
      setError('Invalid GitHub URL');
      return;
    }
    const fullName = `${owner}/${repoName}`;
    
    // Quick fetch to get basic repo info to display
    const repoRes = await fetch(`https://api.github.com/repos/${fullName}`);
    if(!repoRes.ok) {
        setError("Could not fetch repository details from GitHub.");
        return;
    }
    const repoData = await repoRes.json();
    
    await handleRepoSelected({
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

  const handleRepoSelected = async (repo: GithubRepo) => {
    setSelectedRepo(repo);
    setView('docs');
    setLoadingDocs(true);
    const result = await getRepoContents(repo.full_name);
    if (result.data) {
      const repoFiles: RepoFile[] = result.data.map((file: any) => ({
        name: file.name,
        path: file.path,
        type: file.type,
        children: file.type === 'dir' ? [] : undefined,
      })).sort((a: RepoFile, b: RepoFile) => {
        if (a.type === 'dir' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'dir') return 1;
        return a.name.localeCompare(b.name);
      });
      setFiles(repoFiles);
    } else {
      setError(result.error || 'Could not fetch repository files.');
    }
    setLoadingDocs(false);
  };
  
  const handleBackToSearch = () => {
    setView('initial');
    setRepos([]);
    setError(null);
  }

  const handleBackToRepos = () => {
    setView(repos.length > 0 ? 'repos' : 'initial');
    setFiles([]);
  }
  
  const fetchAndSetFileContent = async (file: RepoFile): Promise<string | null> => {
    if (!selectedRepo) return null;
    if (file.content) return file.content;
    const result = await getRepoContents(selectedRepo.full_name, file.path);
    if (result.data && result.data.content) {
      const content = atob(result.data.content);
      // Not updating state here directly to avoid re-renders inside the generating function
      return content;
    }
    return null;
  }
  
  const updateFileState = (path: string, newProps: Partial<RepoFile>) => {
    setFiles(currentFiles => {
      const updateRecursively = (files: RepoFile[]): RepoFile[] => {
        return files.map(f => {
          if (f.path === path) {
            return { ...f, ...newProps };
          }
          if (f.children) {
            return { ...f, children: updateRecursively(f.children) };
          }
          return f;
        });
      };
      return updateRecursively(currentFiles);
    });
  }

  const handleGenerateDoc = async (file: RepoFile) => {
    if (file.documentation || file.isGenerating) return;

    updateFileState(file.path, { isGenerating: true });

    try {
      const fileContent = await fetchAndSetFileContent(file);
      if (!fileContent) {
        throw new Error('Could not fetch file content.');
      }
      
      const result = await generateFileByFileDocumentation({
        fileName: file.name,
        fileContent: fileContent,
      });
      
      updateFileState(file.path, { documentation: result.documentation, isGenerating: false, content: fileContent });

    } catch (error) {
      console.error('Documentation generation failed:', error);
      updateFileState(file.path, { documentation: 'Failed to generate documentation.', isGenerating: false });
    }
  };


  const FileTree = ({ fileList }: { fileList: RepoFile[] }) => (
    <Accordion type="multiple" className="w-full">
      {fileList.map((file) => (
        <div key={file.path}>
          {file.type === 'file' ? (
            <AccordionItem value={file.path}>
              <AccordionTrigger onClick={() => handleGenerateDoc(file)}>
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-primary" />
                  <span>{file.name}</span>
                  {file.isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm prose-invert max-w-none text-muted-foreground p-4 bg-secondary rounded-b-md">
                {file.isGenerating && <p>Generating documentation...</p>}
                {file.documentation ? <div dangerouslySetInnerHTML={{ __html: file.documentation }} /> : <p>Click to generate documentation...</p>}
              </AccordionContent>
            </AccordionItem>
          ) : (
            <AccordionItem value={file.path} className="border-b-0">
               <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4"/> {file.name}
                </div>
               </AccordionTrigger>
               <AccordionContent>
                 {/* Placeholder for fetching directory contents */}
                 <div className="pl-4 text-muted-foreground italic">Directory support coming soon.</div>
               </AccordionContent>
            </AccordionItem>
          )}
        </div>
      ))}
    </Accordion>
  );


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          {username && view !== 'docs' && (
             <Link href={`/dashboard?username=${username}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>
          )}

          {view === 'initial' && (
            <>
               <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Repository Documentation</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                  Select a repository to generate its documentation.
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
              <h2 className="text-3xl font-bold mb-4 text-left">Select a Repository for Documentation</h2>
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

          {view === 'docs' && selectedRepo && (
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
                        <BookOpen className="w-6 h-6 text-primary" />
                        <span>Documentation for: <span className="font-mono bg-muted px-2 py-1 rounded">{selectedRepo.full_name}</span></span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingDocs ? (
                     <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                        <p className="ml-4 text-muted-foreground">Loading repository files...</p>
                     </div>
                  ) : (
                    <div className="h-[60vh] overflow-y-auto pr-4">
                      <FileTree fileList={files} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense>
      <DocsPageComponent />
    </Suspense>
  )
}
