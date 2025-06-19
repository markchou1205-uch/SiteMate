'use server';

/**
 * @fileOverview A flow to suggest appropriate page templates for a given site layout.
 *
 * - suggestPageTemplates - A function that suggests page templates based on the layout.
 * - SuggestPageTemplatesInput - The input type for the suggestPageTemplates function.
 * - SuggestPageTemplatesOutput - The return type for the suggestPageTemplates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPageTemplatesInputSchema = z.object({
  topic: z.string().describe('The topic of the website.'),
  layout: z.array(z.string()).describe('The suggested site layout (an array of page names).'),
});
export type SuggestPageTemplatesInput = z.infer<typeof SuggestPageTemplatesInputSchema>;

const SuggestPageTemplatesOutputSchema = z.record(z.string(), z.string()).describe(
  'A map of page names to suggested template names.'
);
export type SuggestPageTemplatesOutput = z.infer<typeof SuggestPageTemplatesOutputSchema>;

export async function suggestPageTemplates(input: SuggestPageTemplatesInput): Promise<SuggestPageTemplatesOutput> {
  return suggestPageTemplatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPageTemplatesPrompt',
  input: {schema: SuggestPageTemplatesInputSchema},
  output: {schema: SuggestPageTemplatesOutputSchema},
  prompt: `Given the website topic "{{topic}}" and the following site layout:

  {{#each layout}}
  - {{this}}
  {{/each}}

  Suggest an appropriate page template from the Template Library for each page in the layout.  Respond as a JSON object mapping the page name to the template name.  Use your best judgement to pick the best template for the page.

  Here are some of the templates in the Template Library, with descriptions:

  - "About Us": A template for an about us page. Includes sections for company history, mission, and team members.
  - "Contact": A template for a contact page. Includes a contact form, address, phone number, and email address.
  - "Blog Post": A template for a blog post.
  - "Landing Page":  Template for the main landing page of the website.
  - "Pricing": A template for a pricing page. Includes a table of pricing plans and features.
  - "Gallery": A template for a gallery page. Includes a grid of images.
  - "Services": A template for a services page. Includes descriptions of the services offered.
`,
});

const suggestPageTemplatesFlow = ai.defineFlow(
  {
    name: 'suggestPageTemplatesFlow',
    inputSchema: SuggestPageTemplatesInputSchema,
    outputSchema: SuggestPageTemplatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
