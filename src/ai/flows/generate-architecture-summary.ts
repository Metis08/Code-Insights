'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating high-level architecture summaries of a codebase.
 *
 * The flow takes a GitHub repository URL as input and returns a summary of the architecture.
 * - generateArchitectureSummary - The function to call to generate the architecture summary.
 * - GenerateArchitectureSummaryInput - The input type for the generateArchitectureSummary function.
 * - GenerateArchitectureSummaryOutput - The output type for the generateArchitectureSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateArchitectureSummaryInputSchema = z.object({
  repoUrl: z.string().describe('The URL of the GitHub repository to analyze.'),
});
export type GenerateArchitectureSummaryInput = z.infer<
  typeof GenerateArchitectureSummaryInputSchema
>;

const GenerateArchitectureSummaryOutputSchema = z.object({
  summary: z.string().describe('A high-level architecture summary of the codebase.'),
});
export type GenerateArchitectureSummaryOutput = z.infer<
  typeof GenerateArchitectureSummaryOutputSchema
>;

export async function generateArchitectureSummary(
  input: GenerateArchitectureSummaryInput
): Promise<GenerateArchitectureSummaryOutput> {
  return generateArchitectureSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateArchitectureSummaryPrompt',
  input: {schema: GenerateArchitectureSummaryInputSchema},
  output: {schema: GenerateArchitectureSummaryOutputSchema},
  prompt: `You are an AI expert in understanding and summarizing software architecture.
  Given a GitHub repository URL, analyze the codebase and provide a high-level architecture summary.
  The summary should include the main components, their relationships, and the overall structure of the application.
  Focus on providing insights that help developers quickly understand the codebase.

  Repository URL: {{{repoUrl}}}
  Summary:
  `,
});

const generateArchitectureSummaryFlow = ai.defineFlow(
  {
    name: 'generateArchitectureSummaryFlow',
    inputSchema: GenerateArchitectureSummaryInputSchema,
    outputSchema: GenerateArchitectureSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
