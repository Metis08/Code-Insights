'use server';
/**
 * @fileOverview Generates documentation for individual files within a codebase using AI.
 *
 * - generateFileByFileDocumentation - A function that handles the generation of file-by-file documentation.
 * - GenerateFileByFileDocumentationInput - The input type for the generateFileByFileDocumentation function.
 * - GenerateFileByFileDocumentationOutput - The return type for the generateFileByFileDocumentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFileByFileDocumentationInputSchema = z.object({
  fileContent: z.string().describe('The content of the file to document.'),
  fileName: z.string().describe('The name of the file being documented.'),
});
export type GenerateFileByFileDocumentationInput = z.infer<
  typeof GenerateFileByFileDocumentationInputSchema
>;

const GenerateFileByFileDocumentationOutputSchema = z.object({
  documentation: z
    .string()
    .describe('The AI-generated documentation for the file.'),
});
export type GenerateFileByFileDocumentationOutput = z.infer<
  typeof GenerateFileByFileDocumentationOutputSchema
>;

export async function generateFileByFileDocumentation(
  input: GenerateFileByFileDocumentationInput
): Promise<GenerateFileByFileDocumentationOutput> {
  return generateFileByFileDocumentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFileByFileDocumentationPrompt',
  input: {schema: GenerateFileByFileDocumentationInputSchema},
  output: {schema: GenerateFileByFileDocumentationOutputSchema},
  prompt: [
    'You are an AI expert at documenting code files.',
    '',
    'Generate documentation for the following file, incorporating relevant code snippets to explain its purpose and functionality.',
    '',
    'File Name: {{{fileName}}}',
    'File Content:',
    '```',
    '{{{fileContent}}}',
    '```',
    '',
  ].join('\n'),
});

const generateFileByFileDocumentationFlow = ai.defineFlow(
  {
    name: 'generateFileByFileDocumentationFlow',
    inputSchema: GenerateFileByFileDocumentationInputSchema,
    outputSchema: GenerateFileByFileDocumentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
