'use server';
/**
 * @fileOverview Answers questions about a code repository using AI.
 *
 * - answerRepoQuestion - A function that handles answering questions about a repository.
 * - AnswerRepoQuestionInput - The input type for the answerRepoQuestion function.
 * - AnswerRepoQuestionOutput - The return type for the answerRepoQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerRepoQuestionInputSchema = z.object({
  repoUrl: z.string().describe('The URL of the repository the question is about.'),
  question: z.string().describe('The user\'s question about the repository.'),
});
export type AnswerRepoQuestionInput = z.infer<
  typeof AnswerRepoQuestionInputSchema
>;

const AnswerRepoQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
});
export type AnswerRepoQuestionOutput = z.infer<
  typeof AnswerRepoQuestionOutputSchema
>;

export async function answerRepoQuestion(
  input: AnswerRepoQuestionInput
): Promise<AnswerRepoQuestionOutput> {
  return answerRepoQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerRepoQuestionPrompt',
  input: {schema: AnswerRepoQuestionInputSchema},
  output: {schema: AnswerRepoQuestionOutputSchema},
  prompt: `You are an AI expert at understanding and answering questions about code repositories.
  Given the repository URL and a user's question, provide a clear and concise answer.
  Analyze the repository to provide the most accurate information.

  Repository URL: {{{repoUrl}}}
  Question: {{{question}}}
  `,
});

const answerRepoQuestionFlow = ai.defineFlow(
  {
    name: 'answerRepoQuestionFlow',
    inputSchema: AnswerRepoQuestionInputSchema,
    outputSchema: AnswerRepoQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
