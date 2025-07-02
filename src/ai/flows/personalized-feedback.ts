// src/ai/flows/personalized-feedback.ts
'use server';

/**
 * @fileOverview Provides personalized feedback and suggestions on user answers.
 *
 * - getPersonalizedFeedback - A function that generates personalized feedback for a user's answer.
 * - PersonalizedFeedbackInput - The input type for the getPersonalizedFeedback function.
 * - PersonalizedFeedbackOutput - The return type for the getPersonalizedFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedFeedbackInputSchema = z.object({
  question: z.string().describe('The question that was asked.'),
  userAnswer: z.string().describe('The user\u2019s answer to the question.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  category: z.string().describe('The category of the question (e.g. Math, Science).'),
  subcategory: z.string().describe('The subcategory of the question (e.g. Algebra, Physics).'),
});
export type PersonalizedFeedbackInput = z.infer<typeof PersonalizedFeedbackInputSchema>;

const PersonalizedFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback on the user\u2019s answer, explaining mistakes and suggesting improvements.'),
  suggestions: z.string().describe('Suggestions for further learning and resources to improve understanding.'),
});
export type PersonalizedFeedbackOutput = z.infer<typeof PersonalizedFeedbackOutputSchema>;

export async function getPersonalizedFeedback(input: PersonalizedFeedbackInput): Promise<PersonalizedFeedbackOutput> {
  return personalizedFeedbackFlow(input);
}

const personalizedFeedbackPrompt = ai.definePrompt({
  name: 'personalizedFeedbackPrompt',
  input: {schema: PersonalizedFeedbackInputSchema},
  output: {schema: PersonalizedFeedbackOutputSchema},
  prompt: `You are an AI assistant providing personalized feedback on a user's answer to a question.

  Question: {{{question}}}
  User's Answer: {{{userAnswer}}}
  Correct Answer: {{{correctAnswer}}}
  Category: {{{category}}}
  Subcategory: {{{subcategory}}}

  Analyze the user's answer, compare it to the correct answer, and provide specific feedback on their mistakes.
  Offer suggestions for improvement and recommend relevant learning resources.
  Ensure the feedback is constructive and encouraging.

  Format your response as follows:
  Feedback: [Personalized feedback on the user's answer]
  Suggestions: [Suggestions for further learning and resources]
  `,
});

const personalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'personalizedFeedbackFlow',
    inputSchema: PersonalizedFeedbackInputSchema,
    outputSchema: PersonalizedFeedbackOutputSchema,
  },
  async input => {
    const {output} = await personalizedFeedbackPrompt(input);
    return output!;
  }
);
