'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, Github, Sparkles, FileText, Network, Loader2 } from 'lucide-react';
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
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';


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
  size: number; // size is required for Treemap
  children?: RepoFile[];
};

const COLORS = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/80 backdrop-blur-sm border border-border/50 p-2 rounded-md shadow-lg text-sm">
        <p className="font-bold">{data.name}</p>
        <p className="text-muted-foreground">{data.path}</p>
        {data.type === 'file' && <p className="text-muted-foreground">Size: {data.size} bytes</p>}
      </div>
    );
  }
  return null;
};

function FileTreemap({ data }: { data: RepoFile[] }) {
    if (!data || data.length === 0) return null;
  
    return (
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={data}
          dataKey="size"
          ratio={4 / 3}
          stroke="#1E1E1E"
          fill="#8884d8"
          isAnimationActive={true}
        >
           <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    );
}

function AnalyzePageComponent() {
  const searchParams = useSearchParams();
  const repoUrlFromQuery = searchParams.get('repoUrl');
  const shouldAnalyze = searchParams.get('analyze');

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
          size: file.size || 0, // Default size to 0 for directories initially
        };
        if (node.type === 'dir') {
          node.children = await fetchFileTree(fullName, node.path);
          // Aggregate size from children
          node.size = node.children.reduce((acc, child) => acc + child.size, 1); // Add 1 to ensure dir has size
        } else {
          // For files, if size is 0, give it a small default to be visible
          if (node.size === 0) node.size = 1;
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

    const url = new URL(values.repoUrl);
    const fullName = url.pathname.slice(1).replace(/\/$/, '');;
    setRepoFullName(fullName);

    try {
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
  }, [repoUrlFromQuery, shouldAnalyze, form]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
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
                    <span>File Structure Visualization</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <FileTreemap data={fileTree} />
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
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyzePageComponent />
    </Suspense>
  )
}
