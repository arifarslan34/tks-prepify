'use server';
/**
 * @fileOverview An AI agent for generating SEO-related content for categories.
 *
 * - generateSeoDetails - A function that handles the SEO content generation process.
 * - GenerateSeoDetailsInput - The input type for the generateSeoDetails function.
 * - GenerateSeoDetailsOutput - The return type for the generateSeoDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSeoDetailsInputSchema = z.object({
  name: z.string().describe('The name of the category.'),
  description: z.string().describe('The description of the category.'),
});
export type GenerateSeoDetailsInput = z.infer<typeof GenerateSeoDetailsInputSchema>;

const GenerateSeoDetailsOutputSchema = z.object({
  keywords: z.string().describe('A comma-separated list of relevant keywords for the category.'),
  metaTitle: z.string().describe('A compelling and SEO-friendly meta title for the category (max 60 characters).'),
  metaDescription: z.string().describe('A concise and engaging meta description for the category (max 160 characters).'),
});
export type GenerateSeoDetailsOutput = z.infer<typeof GenerateSeoDetailsOutputSchema>;

export async function generateSeoDetails(input: GenerateSeoDetailsInput): Promise<GenerateSeoDetailsOutput> {
  return generateSeoDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSeoDetailsPrompt',
  input: {schema: GenerateSeoDetailsInputSchema},
  output: {schema: GenerateSeoDetailsOutputSchema},
  prompt: `You are an SEO expert. Given the following category name and description, generate optimized SEO content.

Category Name: {{{name}}}
Category Description: {{{description}}}

Generate a comma-separated list of keywords, a meta title, and a meta description. The meta title should be compelling and under 60 characters. The meta description should be engaging and under 160 characters.`,
});

const generateSeoDetailsFlow = ai.defineFlow(
  {
    name: 'generateSeoDetailsFlow',
    inputSchema: GenerateSeoDetailsInputSchema,
    outputSchema: GenerateSeoDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
