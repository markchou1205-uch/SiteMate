// src/ai/flows/suggest-site-layout.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests an initial site layout based on a given topic.
 *
 * - suggestSiteLayout - A function that takes a website topic and returns a suggested site structure.
 * - SuggestSiteLayoutInput - The input type for the suggestSiteLayout function.
 * - SuggestSiteLayoutOutput - The return type for the suggestSiteLayout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSiteLayoutInputSchema = z.object({
  topic: z.string().describe('The topic of the website.'),
});
export type SuggestSiteLayoutInput = z.infer<typeof SuggestSiteLayoutInputSchema>;

const SuggestSiteLayoutOutputSchema = z.object({
  sections: z
    .array(z.string())
    .describe('An array of suggested section titles for the website.'),
  pages: z
    .array(z.string())
    .describe('An array of suggested page titles for the website.'),
});
export type SuggestSiteLayoutOutput = z.infer<typeof SuggestSiteLayoutOutputSchema>;

export async function suggestSiteLayout(input: SuggestSiteLayoutInput): Promise<SuggestSiteLayoutOutput> {
  return suggestSiteLayoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSiteLayoutPrompt',
  input: {schema: SuggestSiteLayoutInputSchema},
  output: {schema: SuggestSiteLayoutOutputSchema},
  prompt: `You are a website design expert. Given the topic of a website, suggest an initial site structure with sections and page titles.

Topic: {{{topic}}}

Sections: A list of suggested section titles for the website.
Pages: A list of suggested page titles for the website.

Please provide the output in the requested JSON format. Focus on high-quality suggestions.
`,
});

const suggestSiteLayoutFlow = ai.defineFlow(
  {
    name: 'suggestSiteLayoutFlow',
    inputSchema: SuggestSiteLayoutInputSchema,
    outputSchema: SuggestSiteLayoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
