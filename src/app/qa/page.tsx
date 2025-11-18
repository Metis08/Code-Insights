'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, Sparkles, Loader2, HelpCircle, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { answerRepoQuestion } from '@/ai/flows/answer-repo-question';
import Header from '@/components/landing/Header';

const formSchema = z.object({
  repoUrl: z.string().url({ message: 'Please enter a valid GitHub repository URL.' }),
  question: z.string().min(10, { message: 'Please ask a more detailed question.' }),
});

type QAResult = {
  answer: string;
};

function QAPageComponent() {
  const searchParams = useSearchParams();
  const repoUrlFromQuery = searchParams.get('repoUrl');

  const [qaResult, setQAResult] = useState<QAResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: repoUrlFromQuery || '',
      question: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setQAResult(null);
    setCurrentQuestion(values.question);
    try {
      const result = await answerRepoQuestion(values);
      setQAResult(result);
    } catch (error) {
      console.error('Q&A failed:', error);
      // You could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (repoUrlFromQuery) {
      form.setValue('repoUrl', repoUrlFromQuery);
    }
  }, [repoUrlFromQuery, form]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Ask a Question</h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Get AI-powered answers about a specific GitHub repository.
            </p>
          </div>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-primary" />
                <span>Repository Q&amp;A</span>
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
                            className="text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Question</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., What is the main purpose of this repository? How is authentication handled?"
                            {...field}
                            className="text-base min-h-[100px]"
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
                        Getting Answer...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Ask AI
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
                Our AI is thinking... This may take a few moments.
              </p>
            </div>
          )}

          {qaResult && (
            <Card className="mt-12 bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-xl">
                  <HelpCircle className="w-6 h-6 text-muted-foreground" />
                  <span>{currentQuestion}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none text-muted-foreground">
                 <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/20 rounded-full">
                        <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <p>{qaResult.answer}</p>
                </div>
              </CardContent>
            </Card>
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
