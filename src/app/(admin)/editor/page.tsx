'use client';

import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Wand2, ImageIcon } from 'lucide-react';
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

    // New state for featured image
    const [featuredImage, setFeaturedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        // TODO: Replace this with your actual Cloudinary upload logic.
        // This placeholder code reads the file as a data URI for local preview.
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            const reader = new FileReader();
            reader.onloadend = () => {
                setFeaturedImage(reader.result as string);
                toast({
                    title: 'Image "uploaded"',
                    description: 'This is a local preview. Integrate your upload service.',
                });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Error 'uploading' image:", error);
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: 'There was an error processing the image.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-4">
                 <div>
                    <Label htmlFor="title" className="text-sm text-muted-foreground">Article Title</Label>
                    <Input 
                        id="title" 
                        placeholder="Enter a catchy title..." 
                        className="border-0 border-b border-input px-0 text-3xl font-headline h-auto focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none" 
                    />
                 </div>
                <RichTextEditor value={content} onChange={setContent} className="flex-grow flex flex-col" />
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
                    <h3 className="text-xl font-semibold font-headline">Featured Image</h3>
                    <div className="relative aspect-video w-full rounded-md border-2 border-dashed flex items-center justify-center bg-muted/50 hover:border-primary transition-colors">
                        {featuredImage ? (
                            <img src={featuredImage} alt="Featured Image Preview" className="absolute inset-0 h-full w-full object-cover rounded-md" />
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                <ImageIcon className="mx-auto h-12 w-12" />
                                <p className="mt-2 text-sm">Click to upload an image</p>
                            </div>
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                                <LoaderCircle className="h-8 w-8 animate-spin" />
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                    />
                    <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : (featuredImage ? 'Change Image' : 'Set Featured Image')}
                    </Button>
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
