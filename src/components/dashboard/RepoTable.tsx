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
import { Star } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export function RepoTable({ repos }: { repos: GithubRepo[] }) {
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
                <TableCell>...</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
