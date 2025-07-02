
'use server';
/**
 * @fileOverview An AI agent for generating SEO-related content for question papers.
 *
 * - generatePaperSeoDetails - A function that handles the SEO content generation process.
 * - GeneratePaperSeoDetailsInput - The input type for the generatePaperSeoDetails function.
 * - GeneratePaperSeoDetailsOutput - The return type for the generatePaperSeoDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePaperSeoDetailsInputSchema = z.object({
  title: z.string().describe('The title of the question paper.'),
  description: z.string().describe('The description of the question paper.'),
  categoryName: z.string().describe('The full path/name of the category the paper belongs to (e.g., "Science / Physics").'),
});
export type GeneratePaperSeoDetailsInput = z.infer<typeof GeneratePaperSeoDetailsInputSchema>;

const GeneratePaperSeoDetailsOutputSchema = z.object({
  keywords: z.string().describe('A comma-separated list of relevant keywords for the paper.'),
  metaTitle: z.string().describe('A compelling and SEO-friendly meta title for the paper (max 60 characters).'),
  metaDescription: z.string().describe('A concise and engaging meta description for the paper (max 160 characters).'),
});
export type GeneratePaperSeoDetailsOutput = z.infer<typeof GeneratePaperSeoDetailsOutputSchema>;

export async function generatePaperSeoDetails(input: GeneratePaperSeoDetailsInput): Promise<GeneratePaperSeoDetailsOutput> {
  return generatePaperSeoDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePaperSeoDetailsPrompt',
  input: {schema: GeneratePaperSeoDetailsInputSchema},
  output: {schema: GeneratePaperSeoDetailsOutputSchema},
  prompt: `You are an SEO expert. Given the following question paper title, description, and its category, generate optimized SEO content.

Paper Title: {{{title}}}
Paper Description: {{{description}}}
Category: {{{categoryName}}}

Generate a comma-separated list of keywords, a meta title, and a meta description. The meta title should be compelling and under 60 characters. The meta description should be engaging and under 160 characters.`,
});

const generatePaperSeoDetailsFlow = ai.defineFlow(
  {
    name: 'generatePaperSeoDetailsFlow',
    inputSchema: GeneratePaperSeoDetailsInputSchema,
    outputSchema: GeneratePaperSeoDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
