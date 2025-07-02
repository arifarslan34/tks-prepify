
'use server';
/**
 * @fileOverview An AI agent for generating question paper descriptions.
 *
 * - generatePaperDescription - A function that handles the description generation process.
 * - GeneratePaperDescriptionInput - The input type for the generatePaperDescription function.
 * - GeneratePaperDescriptionOutput - The return type for the generatePaperDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePaperDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the question paper.'),
});
export type GeneratePaperDescriptionInput = z.infer<typeof GeneratePaperDescriptionInputSchema>;

const GeneratePaperDescriptionOutputSchema = z.object({
  description: z.string().describe('A concise and informative description for the paper (about 2-3 sentences).'),
});
export type GeneratePaperDescriptionOutput = z.infer<typeof GeneratePaperDescriptionOutputSchema>;

export async function generatePaperDescription(input: GeneratePaperDescriptionInput): Promise<GeneratePaperDescriptionOutput> {
  return generatePaperDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePaperDescriptionPrompt',
  input: {schema: GeneratePaperDescriptionInputSchema},
  output: {schema: GeneratePaperDescriptionOutputSchema},
  prompt: `You are an expert content writer. Given the following question paper title, generate a concise and informative description for it. The description should be about 2-3 sentences long and suitable for a website that offers practice question papers.

Paper Title: {{{title}}}`,
});

const generatePaperDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePaperDescriptionFlow',
    inputSchema: GeneratePaperDescriptionInputSchema,
    outputSchema: GeneratePaperDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
