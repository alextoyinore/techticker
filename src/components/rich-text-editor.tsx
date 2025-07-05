
'use client';

import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Table,
  Code,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// A dedicated toolbar component for the markdown editor
const MarkdownToolbar = ({
  onApply,
}: {
  onApply: (
    syntax:
      | 'h1' | 'h2' | 'h3' | 'bold' | 'italic' | 'strike' | 'quote'
      | 'link' | 'image' | 'ul' | 'ol' | 'table' | 'code'
  ) => void;
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-md border-b bg-transparent p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Heading className="h-4 w-4" />
            <span className="sr-only">Headings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onApply('h1')}>
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onApply('h2')}>
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onApply('h3')}>
            Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onApply('bold')}>
        <Bold className="h-4 w-4" />
        <span className="sr-only">Bold</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onApply('italic')}>
        <Italic className="h-4 w-4" />
        <span className="sr-only">Italic</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onApply('strike')}>
        <Strikethrough className="h-4 w-4" />
        <span className="sr-only">Strikethrough</span>
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onApply('quote')}>
        <Quote className="h-4 w-4" />
        <span className="sr-only">Quote</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onApply('code')}>
        <Code className="h-4 w-4" />
        <span className="sr-only">Code</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onApply('link')}>
        <LinkIcon className="h-4 w-4" />
        <span className="sr-only">Insert Link</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onApply('image')}>
        <ImageIcon className="h-4 w-4" />
        <span className="sr-only">Insert Image</span>
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onApply('ul')}>
        <List className="h-4 w-4" />
        <span className="sr-only">Unordered List</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onApply('ol')}>
        <ListOrdered className="h-4 w-4" />
        <span className="sr-only">Ordered List</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onApply('table')}>
        <Table className="h-4 w-4" />
        <span className="sr-only">Insert Table</span>
      </Button>
    </div>
  );
};

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyMarkdown = (
    syntax: 'h1' | 'h2' | 'h3' | 'bold' | 'italic' | 'strike' | 'quote' | 'link' | 'image' | 'ul' | 'ol' | 'table' | 'code'
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText = '';
    let newSelectionStart = start;
    let newSelectionEnd = end;

    const insertAndSelect = (prefix: string, suffix: string = '') => {
      const defaultText = suffix ? '' : 'text'; // if suffix exists, likely wrapping, no default needed
      const textToWrap = selectedText || defaultText;
      newText = `${value.substring(0, start)}${prefix}${textToWrap}${suffix}${value.substring(end)}`;
      newSelectionStart = start + prefix.length;
      newSelectionEnd = newSelectionStart + textToWrap.length;
    };

    const insertAtLineStart = (prefix: string) => {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      newText = `${value.substring(0, lineStart)}${prefix}${value.substring(lineStart)}`;
      const addedLength = prefix.length;
      newSelectionStart = start + addedLength;
      newSelectionEnd = end + addedLength;
    };
    
    switch (syntax) {
      case 'bold': insertAndSelect('**', '**'); break;
      case 'italic': insertAndSelect('*', '*'); break;
      case 'strike': insertAndSelect('~~', '~~'); break;
      case 'code': insertAndSelect('`', '`'); break;
      case 'h1': insertAtLineStart('# '); break;
      case 'h2': insertAtLineStart('## '); break;
      case 'h3': insertAtLineStart('### '); break;
      case 'quote': insertAtLineStart('> '); break;
      case 'ul': insertAtLineStart('- '); break;
      case 'ol': insertAtLineStart('1. '); break;
      case 'link': {
        const url = prompt('Enter the URL:');
        if (url) insertAndSelect('[', `](${url})`);
        break;
      }
      case 'image': {
        const url = prompt('Enter the image URL:');
        if (url) newText = `${value.substring(0, start)}![alt text](${url})${value.substring(end)}`;
        if (newText) {
            newSelectionStart = start + `![alt text](${url})`.length;
            newSelectionEnd = newSelectionStart;
        }
        break;
      }
      case 'table': {
        const tableMd = '\n| Header 1 | Header 2 |\n|---|---|\n| Cell 1 | Cell 2 |\n\n';
        newText = `${value.substring(0, start)}${tableMd}${value.substring(end)}`;
        newSelectionStart = start + tableMd.length;
        newSelectionEnd = newSelectionStart;
        break;
      }
    }

    if (newText && newText !== value) {
      onChange(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newSelectionStart, newSelectionEnd);
        }
      }, 0);
    } else if (syntax !== 'link' && syntax !== 'image') {
        textarea.focus();
    }
  };


  return (
    <Tabs defaultValue="write" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write">
        <div className="rounded-md border">
          <MarkdownToolbar onApply={applyMarkdown} />
          <Textarea
            ref={textareaRef}
            placeholder="Start writing your masterpiece in Markdown..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[400px] w-full rounded-t-none border-0 p-4 font-mono shadow-none focus-visible:ring-0"
          />
        </div>
      </TabsContent>
      <TabsContent value="preview">
        <Card className="min-h-[400px]">
          <CardContent className="p-6">
            <article className="prose dark:prose-invert max-w-none">
              {value ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown> : <p className="text-muted-foreground">Preview will appear here.</p>}
            </article>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
