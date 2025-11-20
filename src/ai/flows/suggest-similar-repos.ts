'use server';
/**
 * @fileOverview Suggests similar code repositories using AI.
 *
 * - suggestSimilarRepos - A function that handles suggesting similar repositories.
 * - SuggestSimilarReposInput - The input type for the suggestSimilarRepos function.
 * - SuggestSimilarReposOutput - The return type for the suggestSimilarRepos function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchRepositories } from '@/actions/github';

const RepoSuggestionSchema = z.object({
  name: z.string().describe('The full name of the repository in "owner/repo" format.'),
  url: z.string().url().describe('The full URL of the repository.'),
  reason: z.string().describe('Why this repo is a similar and relevant suggestion.'),
});

const SuggestSimilarReposInputSchema = z.object({
  repoUrl: z.string().url().describe('The URL of the repository to find alternatives for.'),
});
export type SuggestSimilarReposInput = z.infer<
  typeof SuggestSimilarReposInputSchema
>;

const SuggestSimilarReposOutputSchema = z.object({
  keywords: z.array(z.string()).describe('A list of core keywords extracted from the source repository.'),
  similar_repositories: z.array(RepoSuggestionSchema).describe('A list of suggested similar repositories.'),
});
export type SuggestSimilarReposOutput = z.infer<
  typeof SuggestSimilarReposOutputSchema
>;

const FlowInputSchema = z.object({
  sourceRepoUrl: z.string().url(),
  candidateRepos: z.array(z.object({
    name: z.string(),
    description: z.string(),
    html_url: z.string().url(),
  })),
});

export async function suggestSimilarRepos(
  input: SuggestSimilarReposInput
): Promise<SuggestSimilarReposOutput> {
  return suggestSimilarReposFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSimilarReposPrompt',
  input: { schema: FlowInputSchema },
  output: { schema: SuggestSimilarReposOutputSchema },
  prompt: `You are an expert GitHub repository recommender.
Your job is to analyze the given source GitHub repo URL and a list of candidate repositories, then return ONLY the candidates that are genuinely similar.

Follow these rules strictly:

1. Analyze the source repository to understand its core purpose, technology, and what problem it solves.
   Source Repository: {{{sourceRepoUrl}}}

2. From the following list of candidate repositories, select the ones that are the most similar to the source repository.
   Candidate Repositories:
   {{#each candidateRepos}}
   - Name: {{name}}
     URL: {{html_url}}
     Description: {{description}}
   {{/each}}

3. Recommend ONLY GitHub repositories that match:
   - SAME purpose
   - SAME category
   - SAME tech stack or closely related stack
   - SAME problem or similar functionality

4. DO NOT recommend:
   - Repositories that are not in the candidate list.
   - Unrelated topics or mismatched tech stacks.

5. Provide a concise reason for each recommendation.
6. Recommend 5-7 repos max from the candidate list.
7. Only output VALID GitHub repo links.
8. No explanation outside the required JSON format.
  `,
});

const suggestSimilarReposFlow = ai.defineFlow(
  {
    name: 'suggestSimilarReposFlow',
    inputSchema: SuggestSimilarReposInputSchema,
    outputSchema: SuggestSimilarReposOutputSchema,
  },
  async input => {
    // Step 1: Extract keywords and search GitHub API
    const url = new URL(input.repoUrl);
    const pathParts = url.pathname.slice(1).split('/');
    const repoName = pathParts[1] || '';
    const keywords = repoName.split(/[-_]/).join(' ');
    
    const searchResult = await searchRepositories(keywords + ' in:name,description,topics');

    if (searchResult.error || !searchResult.data) {
      console.error("GitHub search failed:", searchResult.error);
      throw new Error("Could not search for repositories on GitHub.");
    }
    
    // Filter out the source repo itself from candidates
    const sourceFullName = `${pathParts[0]}/${pathParts[1]}`;
    const candidates = searchResult.data.filter((repo: any) => repo.full_name !== sourceFullName);

    // Step 2: Send candidates to Gemini for ranking and filtering
    const { output } = await prompt({
      sourceRepoUrl: input.repoUrl,
      candidateRepos: candidates.map((repo: any) => ({
        name: repo.full_name,
        description: repo.description || '',
        html_url: repo.html_url
      }))
    });

    return output!;
  }
);
