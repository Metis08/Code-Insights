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

export async function suggestSimilarRepos(
  input: SuggestSimilarReposInput
): Promise<SuggestSimilarReposOutput> {
  return suggestSimilarReposFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSimilarReposPrompt',
  input: { schema: SuggestSimilarReposInputSchema },
  output: { schema: SuggestSimilarReposOutputSchema },
  prompt: `You are an expert GitHub repository recommender.
Your job is to analyze the given GitHub repo URL and return ONLY repositories that are genuinely similar.

Follow these rules strictly:

1. First, extract the core keywords from:
   - Repository name
   - Description
   - README content (if provided)
   - Tech stack (languages, frameworks)
   - Problem the repo solves

2. Understand the main purpose of the repo. Examples:
   - Is it a web app?
   - Is it an API?
   - Is it ML/AI?
   - Is it a portfolio?
   - Is it a game engine?
   - Is it a Firebase project?

3. Recommend ONLY GitHub repositories that match:
   - SAME purpose
   - SAME category
   - SAME tech stack or closely related stack
   - SAME problem or similar functionality

4. DO NOT recommend:
   - Random popular repos
   - Unrelated topics
   - Repos from different domains
   - Repos with mismatched tech stacks

5. Recommend 5–7 repos max.
6. Only output VALID GitHub repo links.
7. No explanation outside JSON.

Now analyze this repository: {{{repoUrl}}}
  `,
});

const suggestSimilarReposFlow = ai.defineFlow(
  {
    name: 'suggestSimilarReposFlow',
    inputSchema: SuggestSimilarReposInputSchema,
    outputSchema: SuggestSimilarReposOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
