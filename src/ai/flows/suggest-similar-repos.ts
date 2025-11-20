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
  fullName: z.string().describe('The full name of the repository in "owner/repo" format.'),
  reason: z.string().describe('A brief explanation of why this repository is a good suggestion.'),
});

const SuggestSimilarReposInputSchema = z.object({
  repoUrl: z.string().url().describe('The URL of the repository to find alternatives for.'),
});
export type SuggestSimilarReposInput = z.infer<
  typeof SuggestSimilarReposInputSchema
>;

const SuggestSimilarReposOutputSchema = z.object({
  suggestions: z.array(RepoSuggestionSchema).describe('A list of suggested similar repositories.'),
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
  prompt: `You are a world-class expert in software development and open-source projects.
    Your task is to suggest repositories with similar names to a given GitHub repository URL.
    Extract the keywords from the repository name in the URL. For example, if the URL is 'https://github.com/user/CPU-Scheduling-Algorithms', you should search for repositories related to 'CPU Scheduling Algorithms'.
    Provide a list of 5 relevant suggestions. For each suggestion, provide the full name ("owner/repo") and a concise reason for the recommendation.

    Repository URL: {{{repoUrl}}}
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
