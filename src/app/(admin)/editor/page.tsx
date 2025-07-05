'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Wand2, ImageIcon } from 'lucide-react';
import { generateExcerpt } from '@/ai/flows/summarize-flow';
import RichTextEditor from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from '@/context/auth-context';

interface Category {
    id: string;
    name: string;
}

export default function EditorPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSaving, startSavingTransition] = useTransition();

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [tags, setTags] = useState('');
    
    // AI excerpt generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    // Featured image state
    const [featuredImage, setFeaturedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Categories state
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const querySnapshot = await getDocs(collection(db, "categories"));
                const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
                setCategories(cats);
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch categories.' });
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, [toast]);


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

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset || cloudName === "YOUR_CLOUD_NAME") {
            toast({
                variant: 'destructive',
                title: 'Cloudinary not configured',
                description: 'Please set Cloudinary environment variables in your .env.local file.',
            });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Image upload failed');
            }

            const data = await response.json();
            setFeaturedImage(data.secure_url);
            toast({ title: 'Success', description: 'Image uploaded successfully.' });
        } catch (error) {
            console.error("Error uploading image:", error);
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: 'There was an error uploading the image.',
            });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleSave = async (status: 'Published' | 'Draft') => {
        if (!title.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Title is required.' });
            return;
        }
        if (!content.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Content is required.' });
            return;
        }
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }
        
        startSavingTransition(async () => {
            try {
                const articleData = {
                    title,
                    content,
                    excerpt,
                    featuredImage,
                    categoryId: selectedCategory,
                    tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                    status,
                    authorId: user.uid,
                    authorName: user.displayName || user.email,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                };

                await addDoc(collection(db, "articles"), articleData);

                toast({ title: 'Success', description: `Article saved as ${status}.` });
                router.push('/content');

            } catch (error) {
                console.error("Error saving article:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not save the article.' });
            }
        });
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                 <div>
                    <Label htmlFor="title" className="text-sm text-muted-foreground">Article Title</Label>
                    <Input 
                        id="title" 
                        placeholder="Enter a catchy title..." 
                        className="border-0 border-b border-input px-0 text-5xl font-headline h-auto focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isSaving}
                    />
                 </div>
                <RichTextEditor value={content} onChange={setContent} className="flex-grow flex flex-col" />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-8">
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold font-headline">Publish</h3>
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => handleSave('Published')} disabled={isSaving || isUploading}>
                            {isSaving ? <><LoaderCircle className="animate-spin" /> Publishing...</> : 'Publish Article'}
                        </Button>
                        <Button variant="outline" onClick={() => handleSave('Draft')} disabled={isSaving || isUploading}>
                            {isSaving ? <><LoaderCircle className="animate-spin" /> Saving...</> : 'Save Draft'}
                        </Button>
                    </div>
                </div>
                 <div className="space-y-4">
                    <h3 className="text-xl font-semibold font-headline">Featured Image</h3>
                    <div className="relative aspect-[2/1] w-full rounded-md border-2 border-dashed flex items-center justify-center bg-muted/50 hover:border-primary transition-colors">
                        {featuredImage ? (
                            <img src={featuredImage} alt="Featured Image Preview" className="absolute inset-0 h-full w-full object-cover rounded-md" />
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                <ImageIcon className="mx-auto h-12 w-12" />
                                <p className="mt-2 text-sm">Click to upload an image</p>
                            </div>
                        )}
                        {(isUploading || isSaving) && (
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
                        disabled={isUploading || isSaving}
                    >
                        {isUploading ? 'Uploading...' : (featuredImage ? 'Change Image' : 'Set Featured Image')}
                    </Button>
                </div>
                 <div className="space-y-4">
                    <h3 className="text-xl font-semibold font-headline">Details</h3>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select 
                                value={selectedCategory} 
                                onValueChange={setSelectedCategory} 
                                disabled={loadingCategories || isSaving}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingCategories ? "Loading..." : "Select a category"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <Input 
                                id="tags" 
                                placeholder="AI, Machine Learning,..." 
                                value={tags} 
                                onChange={(e) => setTags(e.target.value)} 
                                disabled={isSaving}
                            />
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
                            disabled={isSaving}
                        />
                        <Button variant="outline" size="sm" onClick={handleGenerateExcerpt} disabled={isGenerating || isSaving}>
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
