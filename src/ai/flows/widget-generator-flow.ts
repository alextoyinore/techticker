'use server';
/**
 * @fileOverview A flow to generate HTML for a widget based on a description.
 *
 * - generateWidgetHtml - A function that creates a widget's HTML structure.
 * - GenerateWidgetHtmlInput - The input type for the function.
 * - GenerateWidgetHtmlOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWidgetHtmlInputSchema = z.object({
  description: z.string().describe('A natural language description of the desired widget layout.'),
});
export type GenerateWidgetHtmlInput = z.infer<typeof GenerateWidgetHtmlInputSchema>;

const GenerateWidgetHtmlOutputSchema = z.object({
  html: z.string().describe('The raw HTML and Tailwind CSS for the widget.'),
});
export type GenerateWidgetHtmlOutput = z.infer<typeof GenerateWidgetHtmlOutputSchema>;

export async function generateWidgetHtml(input: GenerateWidgetHtmlInput): Promise<GenerateWidgetHtmlOutput> {
  return widgetGeneratorFlow(input);
}

const widgetGeneratorPrompt = ai.definePrompt({
  name: 'widgetGeneratorPrompt',
  input: { schema: GenerateWidgetHtmlInputSchema },
  output: { schema: GenerateWidgetHtmlOutputSchema },
  prompt: `You are an expert web developer creating HTML widgets with Tailwind CSS for a Next.js application.
The widget you generate will be used to display a list of articles.

The user will provide a description of the widget. Your task is to generate the complete, raw HTML for it.

**Instructions:**
1.  **Data Structure:** The widget will be populated with an array of article objects. Each article has these properties: \`id\`, \`title\`, \`excerpt\`, \`featuredImage\`, and \`url\` (which is pre-formatted as '/article/{id}').
2.  **Looping:** To iterate through the articles, you MUST use a special comment syntax: \`<!-- loop start -->\` to mark the beginning of the repeating element and \`<!-- loop end -->\` to mark its end. Everything between these two comments will be duplicated for each article in the list.
3.  **Placeholders:** Inside the loop, use Handlebars-style placeholders to inject article data: \`{{title}}\`, \`{{excerpt}}\`, \`{{featuredImage}}\`, and \`{{url}}\`.
4.  **Styling:** Use Tailwind CSS classes for all styling. The project uses shadcn/ui, so feel free to use its stylistic conventions (e.g., rounded corners, subtle shadows, muted text for secondary info).
5.  **Links:** Article titles and images should typically be wrapped in an anchor tag: \`<a href="{{url}}">...\`.
6.  **Images:** Use a standard \`<img>\` tag for the featured image, like this: \`<img src="{{featuredImage}}" alt="{{title}}" class="..."/>\`. Do NOT use next/image.
7.  **Output:** Your response must be ONLY the raw HTML string. Do not include any explanations, markdown formatting, or code fences like \`\`\`html.

**User Description:**
{{{description}}}
`,
});

const widgetGeneratorFlow = ai.defineFlow(
  {
    name: 'widgetGeneratorFlow',
    inputSchema: GenerateWidgetHtmlInputSchema,
    outputSchema: GenerateWidgetHtmlOutputSchema,
  },
  async (input) => {
    const { output } = await widgetGeneratorPrompt(input);
    return output!;
  }
);
