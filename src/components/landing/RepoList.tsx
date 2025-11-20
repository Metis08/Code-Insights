'use client'

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, GitFork, BookText } from "lucide-react";
import { Badge } from "../ui/badge";
import { timeAgo } from "@/lib/utils";

export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
};

export function RepoList({ repos }: { repos: GithubRepo[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
      {repos.map((repo) => (
        <Link key={repo.id} href={`/analyze?repoUrl=${repo.html_url}`} passHref>
          <Card className="h-full flex flex-col hover:border-primary transition-colors text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookText className="w-5 h-5" />
                <span>{repo.name}</span>
              </CardTitle>
              <CardDescription>{repo.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {repo.stargazers_count}
                    </div>
                    <div className="flex items-center gap-1">
                        <GitFork className="w-4 h-4" />
                        {repo.forks_count}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Updated {timeAgo(repo.updated_at)}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
