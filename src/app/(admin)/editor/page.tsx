'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Wand2, ImageIcon, CaseSensitive } from 'lucide-react';
import { generateExcerpt } from '@/ai/flows/summarize-flow';
import { generateTags } from '@/ai/flows/tag-generator-flow';
import RichTextEditor from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from '@/context/auth-context';

interface Category {
    id: string;
    name: string;
}

interface Layout {
    id: string;
    name: string;
}

export default function EditorPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSaving, startSavingTransition] = useTransition();

    // Page vs Article state
    const [docType, setDocType] = useState<'article' | 'page'>('article');
    const [docId, setDocId] = useState<string | null>(null);
    
    // Common state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'Published' | 'Draft'>('Draft');
    
    // Article-specific state
    const [excerpt, setExcerpt] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [featuredImage, setFeaturedImage] = useState<string | null>(null);
    
    // Page-specific state
    const [slug, setSlug] = useState('');
    const [selectedLayoutId, setSelectedLayoutId] = useState('');
    const [layouts, setLayouts] = useState<Layout[]>([]);
    const [loadingLayouts, setLoadingLayouts] = useState(true);

    // AI generation state
    const [isGeneratingExcerpt, setIsGeneratingExcerpt] = useState(false);
    const [isGeneratingTags, setIsGeneratingTags] = useState(false);
    const { toast } = useToast();

    // Image upload state
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Categories state
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        const typeParam = searchParams.get('type') as 'article' | 'page' | null;
        const idParam = searchParams.get('id');
        
        setDocType(typeParam || 'article');
        setDocId(idParam);

        if (idParam) {
            const fetchDoc = async () => {
                const collectionName = typeParam === 'page' ? 'pages' : 'articles';
                try {
                    const docRef = doc(db, collectionName, idParam);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setTitle(data.title || '');
                        setContent(data.content || '');
                        setStatus(data.status || 'Draft');

                        if (typeParam === 'page') {
                            setSlug(data.slug || '');
                            setSelectedLayoutId(data.layoutId || '');
                        } else {
                            setExcerpt(data.excerpt || '');
                            setSelectedCategory(data.categoryId || '');
                            setTags(data.tags || []);
                            setFeaturedImage(data.featuredImage || null);
                        }
                    } else {
                        toast({ variant: 'destructive', title: 'Error', description: 'Document not found.' });
                        router.push(typeParam === 'page' ? '/pages' : '/content');
                    }
                } catch (error) {
                    console.error("Error fetching document:", error);
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch document.' });
                }
            };
            fetchDoc();
        }
    }, [searchParams, router, toast]);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const querySnapshot = await getDocs(collection(db, "categories"));
                const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
                setCategories(cats);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoadingCategories(false);
            }
        };

        const fetchLayouts = async () => {
            setLoadingLayouts(true);
            try {
                const querySnapshot = await getDocs(collection(db, "layouts"));
                const layoutsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Layout));
                setLayouts(layoutsData);
            } catch (error) {
                console.error("Error fetching layouts:", error);
            } finally {
                setLoadingLayouts(false);
            }
        };

        if (docType === 'article') {
            fetchCategories();
        } else {
            fetchLayouts();
        }
    }, [docType]);

    const handleGenerateSlug = () => {
        const newSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
        setSlug(newSlug);
    };

    const handleGenerateExcerpt = async () => {
        if (!content.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please write some content first.' });
            return;
        }
        setIsGeneratingExcerpt(true);
        try {
            const result = await generateExcerpt({ articleContent: content });
            setExcerpt(result.excerpt);
            toast({ title: 'Success', description: 'Excerpt generated by AI.' });
        } catch (error) {
            console.error("Error generating excerpt:", error);
            toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate excerpt.' });
        } finally {
            setIsGeneratingExcerpt(false);
        }
    };
    
    const handleGenerateTags = async () => {
        if (!title.trim() || !content.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please provide a title and content first.' });
            return;
        }
        setIsGeneratingTags(true);
        try {
            const result = await generateTags({ articleTitle: title, articleContent: content });
            setTags(result.tags);
            toast({ title: 'Success', description: 'Tags generated by AI.' });
        } catch (error) {
            console.error("Error generating tags:", error);
            toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate tags.' });
        } finally {
            setIsGeneratingTags(false);
        }
    };
    
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'your_cloudinary_upload_preset'); // REPLACE with your preset
            
            // This is a placeholder for your Cloudinary URL
            const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', { // REPLACE with your cloud name
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.secure_url) {
                setFeaturedImage(data.secure_url);
                toast({ title: 'Success', description: 'Image uploaded successfully.' });
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast({ variant: 'destructive', title: 'Upload Error', description: 'Could not upload image. Using placeholder.' });
            // Use a placeholder if upload fails
            setFeaturedImage(`https://placehold.co/1200x600.png`);
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleSave = async (newStatus: 'Published' | 'Draft') => {
        if (!title.trim() || !content.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Title and Content are required.' });
            return;
        }
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
            return;
        }
        
        startSavingTransition(async () => {
            const collectionName = docType === 'page' ? 'pages' : 'articles';

            try {
                if (docId) {
                    const docRef = doc(db, collectionName, docId);
                    const dataToUpdate: any = {
                        title,
                        content,
                        status: newStatus,
                        updatedAt: serverTimestamp(),
                    };

                    if (docType === 'page') {
                        if (!slug.trim() || !selectedLayoutId) {
                            toast({ variant: 'destructive', title: 'Error', description: 'Slug and Layout are required.' });
                            return;
                        }
                        dataToUpdate.slug = slug;
                        dataToUpdate.layoutId = selectedLayoutId;
                    } else {
                        dataToUpdate.excerpt = excerpt;
                        dataToUpdate.featuredImage = featuredImage;
                        dataToUpdate.categoryId = selectedCategory || '';
                        dataToUpdate.tags = tags || [];
                    }
                    await updateDoc(docRef, dataToUpdate);

                } else {
                    const dataToCreate: any = {
                        title,
                        content,
                        status: newStatus,
                        authorId: user.uid,
                        authorName: user.displayName || user.email,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    };

                    if (docType === 'page') {
                         if (!slug.trim() || !selectedLayoutId) {
                            toast({ variant: 'destructive', title: 'Error', description: 'Slug and Layout are required.' });
                            return;
                        }
                        dataToCreate.slug = slug;
                        dataToCreate.layoutId = selectedLayoutId;
                    } else {
                        dataToCreate.excerpt = excerpt;
                        dataToCreate.featuredImage = featuredImage;
                        dataToCreate.categoryId = selectedCategory || '';
                        dataToCreate.tags = tags || [];
                    }
                    await addDoc(collection(db, collectionName), dataToCreate);
                }

                toast({ title: 'Success', description: `${docType === 'page' ? 'Page' : 'Article'} saved as ${newStatus}.` });
                router.push(docType === 'page' ? '/pages' : '/content');

            } catch (error) {
                console.error(`Error saving ${docType}:`, error);
                toast({ variant: 'destructive', title: 'Error', description: `Could not save the ${docType}.` });
            }
        });
    }

    const PageSpecificFields = () => (
        <>
            <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex items-center gap-2">
                    <Input id="slug" placeholder="e.g., about-us" value={slug} onChange={(e) => setSlug(e.target.value)} required disabled={isSaving}/>
                    <Button variant="outline" size="icon" type="button" onClick={handleGenerateSlug} disabled={isSaving} aria-label="Generate slug from title">
                        <CaseSensitive className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="layout">Layout</Label>
                <Select value={selectedLayoutId} onValueChange={setSelectedLayoutId} disabled={loadingLayouts || isSaving}>
                    <SelectTrigger>
                        <SelectValue placeholder={loadingLayouts ? "Loading layouts..." : "Select a layout"} />
                    </SelectTrigger>
                    <SelectContent>
                        {layouts.map((layout) => (
                            <SelectItem key={layout.id} value={layout.id}>{layout.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </>
    );

    const ArticleSpecificFields = () => (
         <>
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
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isSaving}>
                    {isUploading ? 'Uploading...' : (featuredImage ? 'Change Image' : 'Set Featured Image')}
                </Button>
            </div>
            <div className="space-y-4">
                <h3 className="text-xl font-semibold font-headline">Details</h3>
                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={loadingCategories || isSaving}>
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
                        <div className="flex justify-between items-center">
                            <Label htmlFor="tags">Tags</Label>
                            <Button variant="outline" size="sm" onClick={handleGenerateTags} disabled={isGeneratingTags || isSaving}>
                                {isGeneratingTags ? <><LoaderCircle className="animate-spin" /><span>Generating...</span></> : <><Wand2 /><span>Generate with AI</span></>}
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[2.5rem] items-center">
                            {tags.length > 0 ? (
                                tags.map((tag, index) => <Badge key={index} variant="secondary">{tag}</Badge>)
                            ) : (
                                <p className="text-sm text-muted-foreground px-1">Click the button to generate tags.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-xl font-semibold font-headline">Excerpt</h3>
                <p className="text-sm text-muted-foreground">A short summary of your article.</p>
                <div className="space-y-2 pt-2">
                    <Textarea id="excerpt" placeholder="Write a short summary or generate one with AI." value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={4} disabled={isSaving} />
                    <Button variant="outline" size="sm" onClick={handleGenerateExcerpt} disabled={isGeneratingExcerpt || isSaving}>
                         {isGeneratingExcerpt ? <><LoaderCircle className="animate-spin" /><span>Generating...</span></> : <><Wand2 /><span>Generate with AI</span></>}
                    </Button>
                </div>
            </div>
        </>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                 <div>
                    <Label htmlFor="title" className="text-sm text-muted-foreground">{docType === 'page' ? 'Page' : 'Article'} Title</Label>
                    <Input 
                        id="title" 
                        placeholder="Enter a catchy title..." 
                        className="border-0 border-b border-input px-0 text-3xl font-headline h-auto focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isSaving}
                    />
                 </div>
                <RichTextEditor value={content} onChange={setContent} className="flex-grow flex flex-col" />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-8">
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold font-headline">{docId ? 'Update' : 'Publish'}</h3>
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => handleSave('Published')} disabled={isSaving || isUploading || isGeneratingExcerpt || isGeneratingTags}>
                            {isSaving ? <><LoaderCircle className="animate-spin" /> Publishing...</> : `Publish ${docType === 'page' ? 'Page' : 'Article'}`}
                        </Button>
                        <Button variant="outline" onClick={() => handleSave('Draft')} disabled={isSaving || isUploading || isGeneratingExcerpt || isGeneratingTags}>
                            {isSaving ? <><LoaderCircle className="animate-spin" /> Saving...</> : 'Save Draft'}
                        </Button>
                    </div>
                </div>

                {docType === 'page' ? <PageSpecificFields /> : <ArticleSpecificFields />}
            </div>
        </div>
    );
}
