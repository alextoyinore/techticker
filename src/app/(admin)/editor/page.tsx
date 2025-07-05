'use client';

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Wand2 } from 'lucide-react';
import { generateExcerpt } from '@/ai/flows/summarize-flow';
import RichTextEditor from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

export default function EditorPage() {
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleGenerateExcerpt = async () => {
        if (!content.trim()) {
            toast({
                variant: 'destructive',
                title: 'Cannot generate excerpt',
                description: 'Article content is empty. Please write something first.',
            });
            return;
        }
        setIsGenerating(true);
        try {
            const result = await generateExcerpt({ articleContent: content });
            setExcerpt(result.excerpt);
            toast({ title: 'Success', description: 'Excerpt generated successfully.' });
        } catch (error) {
            console.error("Error generating excerpt:", error);
            toast({
                variant: 'destructive',
                title: 'AI Generation Failed',
                description: 'There was an error generating the excerpt. Please try again.',
            });
        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
                 <div>
                    <Label htmlFor="title" className="text-sm text-muted-foreground">Article Title</Label>
                    <Input 
                        id="title" 
                        placeholder="Enter a catchy title..." 
                        className="border-0 border-b border-input px-0 text-2xl font-headline h-auto focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none" 
                    />
                 </div>
                <RichTextEditor value={content} onChange={setContent} />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-8">
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold font-headline">Publish</h3>
                    <div className="flex flex-col gap-4">
                        <Button>Publish Article</Button>
                        <Button variant="outline">Save Draft</Button>
                    </div>
                </div>
                 <div className="space-y-4">
                    <h3 className="text-xl font-semibold font-headline">Details</h3>
                    <p className="text-sm text-muted-foreground">Configure categories and tags.</p>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="technology">Technology</SelectItem>
                                    <SelectItem value="science">Science</SelectItem>
                                    <SelectItem value="ai">AI</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <Input id="tags" placeholder="AI, Machine Learning,..." />
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold font-headline">Excerpt</h3>
                    <p className="text-sm text-muted-foreground">A short summary of your article.</p>
                    <div className="space-y-2 pt-2">
                        <Textarea 
                            id="excerpt" 
                            placeholder="Write a short summary or generate one with AI." 
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            rows={4}
                        />
                        <Button variant="outline" size="sm" onClick={handleGenerateExcerpt} disabled={isGenerating}>
                             {isGenerating ? (
                                <>
                                    <LoaderCircle className="animate-spin" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <Wand2 />
                                    <span>Generate with AI</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
