'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  return (
    <Tabs defaultValue="write" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write">
        <Textarea
          placeholder="Start writing your masterpiece in Markdown..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[400px] w-full rounded-md border border-input p-4 font-mono"
        />
      </TabsContent>
      <TabsContent value="preview">
        <Card className="min-h-[400px]">
          <CardContent className="p-6">
            <article className="prose dark:prose-invert lg:prose-xl max-w-none">
              {value ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown> : <p className="text-muted-foreground">Preview will appear here.</p>}
            </article>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
