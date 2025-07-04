import RichTextEditor from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function EditorPage() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <Label htmlFor="title" className="text-sm text-muted-foreground">Article Title</Label>
                        <Input id="title" placeholder="Enter a catchy title..." className="text-2xl font-headline h-auto p-2 border-0 shadow-none focus-visible:ring-0" />
                    </CardHeader>
                    <CardContent>
                        <RichTextEditor />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Publish</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Button>Publish Article</Button>
                        <Button variant="outline">Save Draft</Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <CardDescription>Configure categories and tags.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
