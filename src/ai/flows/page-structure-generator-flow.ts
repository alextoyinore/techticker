'use server';
/**
 * @fileOverview A flow to generate HTML for a page layout based on a description.
 *
 * - generatePageStructure - A function that creates a page's HTML structure.
 * - GeneratePageStructureInput - The input type for the function.
 * - GeneratePageStructureOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePageStructureInputSchema = z.object({
  description: z.string().describe('A natural language description of the desired page layout.'),
});
export type GeneratePageStructureInput = z.infer<typeof GeneratePageStructureInputSchema>;

const GeneratePageStructureOutputSchema = z.object({
  html: z.string().describe('The raw HTML and Tailwind CSS for the page layout.'),
});
export type GeneratePageStructureOutput = z.infer<typeof GeneratePageStructureOutputSchema>;

export async function generatePageStructure(input: GeneratePageStructureInput): Promise<GeneratePageStructureOutput> {
  return pageStructureGeneratorFlow(input);
}

const pageStructureGeneratorPrompt = ai.definePrompt({
  name: 'pageStructureGeneratorPrompt',
  input: { schema: GeneratePageStructureInputSchema },
  output: { schema: GeneratePageStructureOutputSchema },
  prompt: `You are an expert web developer creating page layouts with Tailwind CSS for a Next.js application.
The layout you generate will be used as a container for various widgets.

The user will provide a description of the layout. Your task is to generate the complete, raw HTML for it.

**Instructions:**
1.  **Widget Placeholder:** You MUST include a single \`{{{widgets}}}\` placeholder. This is where the application will dynamically insert the list of widgets. The placeholder should be placed in the main content area of your layout.
2.  **Styling:** Use Tailwind CSS classes for all styling. The project uses shadcn/ui, so feel free to use its stylistic conventions (e.g., containers, spacing, responsive grids).
3.  **Structure:** Create a sensible page structure. This might include a main content area and a sidebar, a full-width hero section, etc., based on the user's description.
4.  **Output:** Your response must be ONLY the raw HTML string. Do not include any explanations, markdown formatting, or code fences like \`\`\`html.

**User Description:**
{{{description}}}
`,
});

const pageStructureGeneratorFlow = ai.defineFlow(
  {
    name: 'pageStructureGeneratorFlow',
    inputSchema: GeneratePageStructureInputSchema,
    outputSchema: GeneratePageStructureOutputSchema,
  },
  async (input) => {
    const { output } = await pageStructureGeneratorPrompt(input);
    return output!;
  }
);
