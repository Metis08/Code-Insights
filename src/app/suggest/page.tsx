'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, Compass, Sparkles, Loader2, Star, GitFork, BookText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { suggestSimilarRepos } from '@/ai/flows/suggest-similar-repos';
import Header from '@/components/landing/Header';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  repoUrl: z.string().url({ message: 'Please enter a valid GitHub repository URL.' }),
});

type RepoDetails = {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
};

type Suggestion = {
  details: RepoDetails;
  reason: string;
};

async function getRepoDetails(fullName: string): Promise<RepoDetails | null> {
    try {
        const response = await fetch(`https://api.github.com/repos/${fullName}`);
        if (!response.ok) {
            // Silently fail if repo is not found (e.g. 404 error)
            return null;
        }
        const data = await response.json();
        return {
            id: data.id,
            name: data.name,
            full_name: data.full_name,
            description: data.description,
            html_url: data.html_url,
            stargazers_count: data.stargazers_count,
            forks_count: data.forks_count,
            language: data.language,
        };
    } catch (error) {
        console.error(`Error fetching repo details for ${fullName}:`, error);
        return null;
    }
}

export default function SuggestPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions([]);

    try {
      const result = await suggestSimilarRepos({ repoUrl: values.repoUrl });
      
      if (result.similar_repositories.length === 0 && result.keywords.length > 0) {
        toast({
          title: "No similar repositories found",
          description: `We couldn't find any repositories matching the keywords: ${result.keywords.join(", ")}`,
        });
        setIsLoading(false);
        return;
      }
      
      const detailedSuggestions = await Promise.all(
        result.similar_repositories.map(async (suggestion) => {
          const details = await getRepoDetails(suggestion.name);
          return { details, reason: suggestion.reason };
        })
      );
      
      const validSuggestions = detailedSuggestions.filter(s => s.details !== null) as Suggestion[];

      // Rank by stars
      validSuggestions.sort((a, b) => b.details.stargazers_count - a.details.stargazers_count);

      setSuggestions(validSuggestions);

    } catch (error) {
      console.error('Suggestion generation failed:', error);
      toast({
        variant: "destructive",
        title: "AI Service Unavailable",
        description: "The AI model is currently overloaded. Please try again in a few moments.",
      })
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Suggest Similar Repositories</h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Discover alternatives and similar projects powered by AI.
            </p>
          </div>

          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="w-6 h-6 text-primary" />
                <span>Find Similar Repos</span>
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
                        Searching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Suggest
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
                Our AI is searching for similar repositories...
              </p>
            </div>
          )}

          {suggestions.length > 0 && (
             <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Suggested Repositories</h2>
                 <div className="grid grid-cols-1 gap-4">
                    {suggestions.map((suggestion) => (
                        <Card key={suggestion.details.id} className="bg-card/50 border-border/50 backdrop-blur-sm">
                             <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                     <a href={suggestion.details.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                                        <BookText className="w-5 h-5" />
                                        <span>{suggestion.details.full_name}</span>
                                    </a>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Star className="w-4 h-4" />
                                            {suggestion.details.stargazers_count.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <GitFork className="w-4 h-4" />
                                            {suggestion.details.forks_count.toLocaleString()}
                                        </span>
                                    </div>
                                </CardTitle>
                                <CardDescription>{suggestion.details.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground italic border-l-2 border-primary pl-3">
                                    <span className="font-semibold text-foreground">Reason:</span> {suggestion.reason}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
