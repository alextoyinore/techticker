'use server';
/**
 * @fileOverview A flow to generate relevant tags for an article.
 *
 * - generateTags - A function that suggests relevant tags based on article content.
 * - GenerateTagsInput - The input type for the generateTags function.
 * - GenerateTagsOutput - The return type for the generateTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTagsInputSchema = z.object({
  articleTitle: z.string().describe('The title of the article.'),
  articleContent: z.string().describe('The full content of the article.'),
});
export type GenerateTagsInput = z.infer<typeof GenerateTagsInputSchema>;

const GenerateTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of 5-7 relevant tags for the article. These should be short, relevant keywords.'),
});
export type GenerateTagsOutput = z.infer<typeof GenerateTagsOutputSchema>;

export async function generateTags(input: GenerateTagsInput): Promise<GenerateTagsOutput> {
  return tagGeneratorFlow(input);
}

const tagGeneratorPrompt = ai.definePrompt({
  name: 'tagGeneratorPrompt',
  input: { schema: GenerateTagsInputSchema },
  output: { schema: GenerateTagsOutputSchema },
  prompt: `You are an expert SEO content strategist. Based on the article title and content provided, generate 5 to 7 relevant tags.
These tags should be short, concise keywords that capture the main topics of the article. Do not include a "#" prefix.

Article Title:
{{{articleTitle}}}

Article Content:
{{{articleContent}}}
`,
});

const tagGeneratorFlow = ai.defineFlow(
  {
    name: 'tagGeneratorFlow',
    inputSchema: GenerateTagsInputSchema,
    outputSchema: GenerateTagsOutputSchema,
  },
  async (input) => {
    const { output } = await tagGeneratorPrompt(input);
    return output!;
  }
);
