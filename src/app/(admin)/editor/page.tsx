'use client';

import { useState } from 'react';
import RichTextEditor from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditorPage() {
    const [content, setContent] = useState('');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
                 <div>
                    <Label htmlFor="title" className="text-sm text-muted-foreground">Article Title</Label>
                    <Input 
                        id="title" 
                        placeholder="Enter a catchy title..." 
                        className="border-0 border-b-2 border-input px-0 text-2xl font-headline h-auto focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none" 
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
            </div>
        </div>
    );
}
