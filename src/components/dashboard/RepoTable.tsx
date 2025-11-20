'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { GithubRepo } from "@/components/landing/RepoList";
import { Star, MoreHorizontal, FileText, Search, MessageSquare } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button";
import Link from "next/link";

export function RepoTable({ repos, username }: { repos: GithubRepo[], username: string | null }) {
  const getLink = (base: string, repoUrl: string) => {
    const url = `${base}?repoUrl=${repoUrl}&analyze=true`;
    return username ? `${url}&username=${username}` : url;
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repository</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Stars</TableHead>
              <TableHead>Last Commit</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repos.map((repo) => (
              <TableRow key={repo.id}>
                <TableCell className="font-medium">{repo.full_name}</TableCell>
                <TableCell>{repo.language || 'N/A'}</TableCell>
                <TableCell className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    {repo.stargazers_count}
                </TableCell>
                <TableCell>{timeAgo(repo.updated_at)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem asChild>
                        <Link href={getLink('/analyze', repo.html_url)}>
                          <Search className="mr-2 h-4 w-4"/>
                          <span>Analyze</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                         <Link href={getLink('/docs', repo.html_url)}>
                          <FileText className="mr-2 h-4 w-4"/>
                          <span>Documentation</span>
                        </Link>
                      </DropdownMenuItem>
                       <DropdownMenuItem asChild>
                         <Link href={getLink('/qa', repo.html_url)}>
                          <MessageSquare className="mr-2 h-4 w-4"/>
                          <span>Q&A</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
