'use server';
/**
 * @fileOverview A flow to generate a summary for an article.
 *
 * - generateExcerpt - A function that generates a concise summary for a given text.
 * - GenerateExcerptInput - The input type for the generateExcerpt function.
 * - GenerateExcerptOutput - The return type for the generateExcerpt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateExcerptInputSchema = z.object({
  articleContent: z.string().describe('The full content of the article to be summarized.'),
});
export type GenerateExcerptInput = z.infer<typeof GenerateExcerptInputSchema>;

export const GenerateExcerptOutputSchema = z.object({
  excerpt: z.string().describe('A concise, engaging summary of the article, 2-3 sentences long.'),
});
export type GenerateExcerptOutput = z.infer<typeof GenerateExcerptOutputSchema>;

export async function generateExcerpt(input: GenerateExcerptInput): Promise<GenerateExcerptOutput> {
  return summarizeFlow(input);
}

const summarizePrompt = ai.definePrompt({
  name: 'summarizeArticlePrompt',
  input: { schema: GenerateExcerptInputSchema },
  output: { schema: GenerateExcerptOutputSchema },
  prompt: `You are an expert copywriter specializing in creating compelling article summaries.
Based on the article content provided, generate a concise and engaging excerpt.
The excerpt should be no more than 2-3 sentences long and written to entice readers to click and read the full article.

Article Content:
{{{articleContent}}}
`,
});

const summarizeFlow = ai.defineFlow(
  {
    name: 'summarizeFlow',
    inputSchema: GenerateExcerptInputSchema,
    outputSchema: GenerateExcerptOutputSchema,
  },
  async (input) => {
    const { output } = await summarizePrompt(input);
    return output!;
  }
);
