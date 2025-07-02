'use server';

/**
 * @fileOverview AI agent that recommends learning resources based on user performance and identified weak areas.
 *
 * - recommendResources - A function that recommends learning resources.
 * - RecommendResourcesInput - The input type for the recommendResources function.
 * - RecommendResourcesOutput - The return type for the recommendResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendResourcesInputSchema = z.object({
  performanceData: z
    .string()
    .describe('User performance data, including time spent on each question and accuracy.'),
  weakAreas: z
    .string()
    .describe('Identified weak areas based on the user performance.'),
});
export type RecommendResourcesInput = z.infer<typeof RecommendResourcesInputSchema>;

const RecommendResourcesOutputSchema = z.object({
  recommendedResources: z
    .string()
    .describe('A list of recommended learning resources based on the user performance and identified weak areas.'),
});
export type RecommendResourcesOutput = z.infer<typeof RecommendResourcesOutputSchema>;

export async function recommendResources(input: RecommendResourcesInput): Promise<RecommendResourcesOutput> {
  return recommendResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendResourcesPrompt',
  input: {schema: RecommendResourcesInputSchema},
  output: {schema: RecommendResourcesOutputSchema},
  prompt: `You are an expert learning resource recommender. Based on the user's performance data and identified weak areas, you will recommend relevant learning resources.

User Performance Data: {{{performanceData}}}
Identified Weak Areas: {{{weakAreas}}}

Recommended Learning Resources:`, // No need for JSON formatting here, as the model returns a string.
});

const recommendResourcesFlow = ai.defineFlow(
  {
    name: 'recommendResourcesFlow',
    inputSchema: RecommendResourcesInputSchema,
    outputSchema: RecommendResourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
