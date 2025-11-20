'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, Github, Sparkles, FileText, Network, Loader2, Folder, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateArchitectureSummary } from '@/ai/flows/generate-architecture-summary';
import { getRepoContents } from '@/actions/github';
import Header from '@/components/landing/Header';

const formSchema = z.object({
  repoUrl: z.string().url({ message: 'Please enter a valid GitHub repository URL.' }),
});

type AnalysisResult = {
  summary: string;
};

type RepoFile = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: RepoFile[];
};

const FileNode = ({ file }: { file: RepoFile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDir = file.type === 'dir';

  return (
    <div className="ml-4">
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded-md"
        onClick={() => isDir && setIsOpen(!isOpen)}
      >
        {isDir ? (
          <Folder className="w-4 h-4 text-primary" />
        ) : (
          <File className="w-4 h-4 text-muted-foreground" />
        )}
        <span>{file.name}</span>
      </div>
      {isDir && isOpen && file.children && (
        <div className="pl-4 border-l border-border/50">
          {file.children.sort((a,b) => {
            if (a.type === 'dir' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'dir') return 1;
            return a.name.localeCompare(b.name);
          }).map(child => (
            <FileNode key={child.path} file={child} />
          ))}
        </div>
      )}
    </div>
  );
};


function FileTree({ data }: { data: RepoFile[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="font-mono text-sm">
       {data.sort((a,b) => {
            if (a.type === 'dir' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'dir') return 1;
            return a.name.localeCompare(b.name);
          }).map(file => (
        <FileNode key={file.path} file={file} />
      ))}
    </div>
  );
}


function AnalyzePageComponent() {
  const searchParams = useSearchParams();
  const repoUrlFromQuery = searchParams.get('repoUrl');
  const shouldAnalyze = searchParams.get('analyze');
  const username = searchParams.get('username');

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [fileTree, setFileTree] = useState<RepoFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [repoFullName, setRepoFullName] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: repoUrlFromQuery || '',
    },
  });

  const fetchFileTree = async (fullName: string, path: string = ''): Promise<RepoFile[]> => {
    const result = await getRepoContents(fullName, path);
    if (result.error || !result.data) {
      console.error("Could not fetch repo contents:", result.error);
      return [];
    }

    const files: RepoFile[] = await Promise.all(
      result.data.map(async (file: any) => {
        const node: RepoFile = {
          name: file.name,
          path: file.path,
          type: file.type,
        };
        if (node.type === 'dir') {
          node.children = await fetchFileTree(fullName, node.path);
        }
        return node;
      })
    );

    return files;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);
    setFileTree([]);

    try {
        const url = new URL(values.repoUrl);
        const fullName = url.pathname.slice(1).replace(/\/$/, '');;
        setRepoFullName(fullName);

        const summaryPromise = generateArchitectureSummary({ repoUrl: values.repoUrl });
        const fileTreePromise = fetchFileTree(fullName);

        const [summaryResult, files] = await Promise.all([summaryPromise, fileTreePromise]);
        
        setAnalysisResult(summaryResult);
        setFileTree(files);

    } catch (error) {
        console.error('Analysis failed:', error);
        // You could show a toast notification here
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    if (repoUrlFromQuery) {
      form.setValue('repoUrl', repoUrlFromQuery);
      if (shouldAnalyze === 'true') {
        onSubmit({ repoUrl: repoUrlFromQuery });
      }
    }
  }, [repoUrlFromQuery, shouldAnalyze]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <Link href={username ? `/dashboard?username=${username}` : "/dashboard"} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Analyze a Repository</h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Enter a public GitHub repository URL to get started.
            </p>
          </div>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="w-6 h-6 text-primary" />
                <span>GitHub Repository</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="repoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repository URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://github.com/user/project"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="text-center mt-12">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg text-muted-foreground">
                Our AI is analyzing the repository. This may take a few moments...
              </p>
            </div>
          )}

          {analysisResult && (
             <Card className="mt-12 bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-6 h-6 text-primary" />
                    <span>Architecture Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none text-muted-foreground">
                  <p>{analysisResult.summary}</p>
                </CardContent>
              </Card>
          )}

          {fileTree.length > 0 && (
             <Card className="mt-8 bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    <span>File Structure</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <FileTree data={fileTree} />
                </CardContent>
              </Card>
          )}

        </div>
      </main>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense>
      <AnalyzePageComponent />
    </Suspense>
  )
}
