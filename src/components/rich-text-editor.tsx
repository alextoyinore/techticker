'use client';

import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
const MarkdownToolbar = ({ onCommand }: { onCommand: (command: string) => void }) => {
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
          <DropdownMenuItem onSelect={() => onCommand('h1')}>Heading 1</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onCommand('h2')}>Heading 2</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onCommand('h3')}>Heading 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCommand('bold')}>
        <Bold className="h-4 w-4" />
        <span className="sr-only">Bold</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCommand('italic')}>
        <Italic className="h-4 w-4" />
        <span className="sr-only">Italic</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCommand('strike')}>
        <Strikethrough className="h-4 w-4" />
        <span className="sr-only">Strikethrough</span>
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCommand('quote')}>
        <Quote className="h-4 w-4" />
        <span className="sr-only">Quote</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCommand('code')}>
        <Code className="h-4 w-4" />
        <span className="sr-only">Code</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCommand('link')}>
        <LinkIcon className="h-4 w-4" />
        <span className="sr-only">Insert Link</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCommand('image')}>
        <ImageIcon className="h-4 w-4" />
        <span className="sr-only">Insert Image</span>
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCommand('ul')}>
        <List className="h-4 w-4" />
        <span className="sr-only">Unordered List</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCommand('ol')}>
        <ListOrdered className="h-4 w-4" />
        <span className="sr-only">Ordered List</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCommand('table')}>
        <Table className="h-4 w-4" />
        <span className="sr-only">Insert Table</span>
      </Button>
    </div>
  );
};


export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [dialog, setDialog] = useState<string | null>(null);

  const insertText = (textToInsert: string, selectText: string | null = null) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    let newText = `${value.substring(0, start)}${textToInsert}${value.substring(end)}`;
    let newSelectionStart = start;
    let newSelectionEnd = start + textToInsert.length;

    if (selectText) {
      const selectStart = textToInsert.indexOf(selectText);
      if (selectStart !== -1) {
        newSelectionStart = start + selectStart;
        newSelectionEnd = newSelectionStart + selectText.length;
      }
    }
    
    onChange(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newSelectionStart, newSelectionEnd);
      }
    }, 0);
  };
  
  const wrapSelection = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'text';
    
    const newText = `${value.substring(0, start)}${prefix}${selectedText}${suffix}${value.substring(end)}`;
    const newSelectionStart = start + prefix.length;
    const newSelectionEnd = newSelectionStart + selectedText.length;
    
    onChange(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newSelectionStart, newSelectionEnd);
      }
    }, 0);
  };
  
  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const newText = `${value.substring(0, lineStart)}${prefix}${value.substring(lineStart)}`;
    const addedLength = prefix.length;

    onChange(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + addedLength, end + addedLength);
      }
    }, 0);
  };

  const handleCommand = (command: string) => {
    switch(command) {
      case 'bold': wrapSelection('**', '**'); break;
      case 'italic': wrapSelection('*', '*'); break;
      case 'strike': wrapSelection('~~', '~~'); break;
      case 'code': wrapSelection('`', '`'); break;
      case 'h1': insertAtLineStart('# '); break;
      case 'h2': insertAtLineStart('## '); break;
      case 'h3': insertAtLineStart('### '); break;
      case 'ul': insertAtLineStart('- '); break;
      case 'ol': insertAtLineStart('1. '); break;
      case 'quote':
      case 'link':
      case 'image':
      case 'table':
        setDialog(command);
        break;
      default:
        break;
    }
  };

  // Dialog specific logic
  const LinkDialog = () => {
    const [url, setUrl] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(url) {
        wrapSelection('[', `](${url})`);
      }
      setDialog(null);
      setUrl('');
    }
    return (
      <Dialog open={dialog === 'link'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" required />
            </div>
            <DialogFooter>
              <Button type="submit">Insert</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const ImageDialog = () => {
    const [url, setUrl] = useState('');
    const [alt, setAlt] = useState('');
    const [uploading, setUploading] = useState(false);
  
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      setUploading(true);
      // TODO: Implement actual image upload to Cloudinary and replace with URL
      // For now, we'll use a data URI as a placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        setUrl(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (url) {
        insertText(`![${alt}](${url})`);
      }
      setDialog(null);
      setUrl('');
      setAlt('');
    };

    return (
      <Dialog open={dialog === 'image'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Insert Image</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input id="image-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="relative flex items-center">
                 <div className="flex-grow border-t"></div>
                 <span className="flex-shrink mx-4 text-muted-foreground">Or</span>
                 <div className="flex-grow border-t"></div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-upload">Upload an image</Label>
                <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alt-text">Alt Text</Label>
                <Input id="alt-text" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Descriptive text for the image" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!url || uploading}>
                {uploading ? 'Uploading...' : 'Insert'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const QuoteDialog = () => {
    const [quoteText, setQuoteText] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (quoteText) {
        const quoteMarkdown = quoteText.split('\n').map(line => `> ${line}`).join('\n');
        insertText(`\n${quoteMarkdown}\n`);
      }
      setDialog(null);
      setQuoteText('');
    };
    return (
      <Dialog open={dialog === 'quote'} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Insert Blockquote</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="quote-text">Text</Label>
              <Textarea id="quote-text" value={quoteText} onChange={(e) => setQuoteText(e.target.value)} placeholder="Paste or type the quote here..." rows={5} required />
            </div>
            <DialogFooter>
              <Button type="submit">Insert</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const TableDialog = () => {
    const [tableData, setTableData] = useState('');
    
    const parseToMarkdown = (text: string) => {
      const rows = text.trim().split('\n').map(row => row.split('\t'));
      if (rows.length === 0 || rows[0].length === 0) return '';
  
      const header = `| ${rows[0].join(' | ')} |`;
      const separator = `| ${rows[0].map(() => '---').join(' | ')} |`;
      const body = rows.slice(1).map(row => `| ${row.join(' | ')} |`).join('\n');
  
      return `${header}\n${separator}\n${body}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (tableData) {
        const tableMarkdown = parseToMarkdown(tableData);
        insertText(`\n${tableMarkdown}\n`);
      }
      setDialog(null);
      setTableData('');
    };
    return (
      <Dialog open={dialog === 'table'} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Insert Table</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="table-data">Paste Table Data</Label>
              <Textarea id="table-data" value={tableData} onChange={(e) => setTableData(e.target.value)} placeholder="Paste data from Excel, Google Sheets, etc. (use tabs to separate columns)" rows={10} required />
              <p className="text-sm text-muted-foreground">Tip: Copy cells from your spreadsheet and paste them here.</p>
            </div>
            <DialogFooter>
              <Button type="submit">Insert Table</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="write">
          <div className="rounded-md border">
            <MarkdownToolbar onCommand={handleCommand} />
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
      <LinkDialog />
      <ImageDialog />
      <QuoteDialog />
      <TableDialog />
    </>
  );
}
