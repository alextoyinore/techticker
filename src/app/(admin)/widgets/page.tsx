'use client';

import { MoreHorizontal, PlusCircle, Trash2, Wand2, LoaderCircle } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { generateWidgetHtml } from "@/ai/flows/widget-generator-flow";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Widget {
    id: string;
    name: string;
    description: string;
    html: string;
    config?: {
        type: 'category' | 'tag';
        value: string;
        limit: number;
    }
}

interface Category {
    id: string;
    name: string;
}

export default function WidgetsPage() {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    
    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, startSavingTransition] = useTransition();
    const [editingWidget, setEditingWidget] = useState<Widget | null>(null);

    // Form state
    const [widgetName, setWidgetName] = useState("");
    const [widgetDescription, setWidgetDescription] = useState("");
    const [widgetHtml, setWidgetHtml] = useState("");
    const [widgetConfigType, setWidgetConfigType] = useState<'category' | 'tag'>('category');
    const [widgetConfigValue, setWidgetConfigValue] = useState("");
    const [widgetConfigLimit, setWidgetConfigLimit] = useState<number | string>(5);

    // Categories for select dropdown
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // AI state
    const [isGenerating, setIsGenerating] = useState(false);


    const fetchWidgetsAndCategories = async () => {
        setLoading(true);
        setLoadingCategories(true);
        try {
            const widgetsCollection = collection(db, "widgets");
            const widgetsSnapshot = await getDocs(widgetsCollection);
            const widgetsData = widgetsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Widget[];
            setWidgets(widgetsData);

            const categoriesCollection = collection(db, "categories");
            const categoriesSnapshot = await getDocs(categoriesCollection);
            const categoriesData = categoriesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data() as { name: string }
            }));
            setCategories(categoriesData);

        } catch (error) {
            console.error("Error fetching data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch widgets or categories.' });
        } finally {
            setLoading(false);
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        fetchWidgetsAndCategories();
    }, []);
    
    const resetForm = () => {
        setEditingWidget(null);
        setWidgetName("");
        setWidgetDescription("");
        setWidgetHtml("");
        setWidgetConfigType("category");
        setWidgetConfigValue("");
        setWidgetConfigLimit(5);
    }
    
    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        setIsDialogOpen(open);
    }

    const handleEditClick = (widget: Widget) => {
        setEditingWidget(widget);
        setWidgetName(widget.name);
        setWidgetDescription(widget.description);
        setWidgetHtml(widget.html);
        if (widget.config) {
            setWidgetConfigType(widget.config.type);
            setWidgetConfigValue(widget.config.value);
            setWidgetConfigLimit(widget.config.limit || '');
        } else {
            // Provide default values if config is missing
            setWidgetConfigType('category');
            setWidgetConfigValue('');
            setWidgetConfigLimit(5);
        }
        setIsDialogOpen(true);
    };

    const handleGenerateHtml = async () => {
        if (!widgetDescription.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please provide a description for the AI.' });
            return;
        }
        setIsGenerating(true);
        try {
            const result = await generateWidgetHtml({ description: widgetDescription });
            setWidgetHtml(result.html);
            toast({ title: 'Success', description: 'HTML generated by AI.' });
        } catch (error) {
            console.error("Error generating widget HTML:", error);
            toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate HTML.' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSaveWidget = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!widgetName.trim() || !widgetHtml.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Widget Name and HTML are required.' });
            return;
        }

        startSavingTransition(async () => {
             const widgetData = {
                name: widgetName,
                description: widgetDescription,
                html: widgetHtml,
                config: {
                    type: widgetConfigType,
                    value: widgetConfigValue,
                    limit: Number(widgetConfigLimit) || 5,
                }
            };
            try {
                if (editingWidget) {
                    const widgetRef = doc(db, 'widgets', editingWidget.id);
                    await updateDoc(widgetRef, widgetData);
                    toast({ title: 'Success', description: 'Widget updated successfully.' });
                } else {
                    await addDoc(collection(db, "widgets"), widgetData);
                    toast({ title: 'Success', description: 'Widget created successfully.' });
                }
                resetForm();
                setIsDialogOpen(false);
                fetchWidgetsAndCategories();
            } catch (error) {
                console.error("Error saving widget:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not save widget.' });
            }
        });
    };
    
    const handleDeleteWidget = async (widgetId: string) => {
        try {
            await deleteDoc(doc(db, "widgets", widgetId));
            toast({ title: 'Success', description: 'Widget deleted.' });
            setWidgets(widgets.filter(w => w.id !== widgetId));
        } catch (error) {
            console.error("Error deleting widget:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete widget.' });
        }
    }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="font-headline">Widgets</CardTitle>
                <CardDescription>Create and manage reusable content blocks for your layouts.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Create Widget
                        </span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <form onSubmit={handleSaveWidget}>
                        <DialogHeader>
                        <DialogTitle>{editingWidget ? 'Edit Widget' : 'Create New Widget'}</DialogTitle>
                        <DialogDescription>
                            {editingWidget 
                                ? 'Update the details for your widget.'
                                : 'Use AI to generate HTML for a widget, then configure its content source.'}
                        </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="grid gap-6 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Widget Name</Label>
                                    <Input id="name" value={widgetName} onChange={(e) => setWidgetName(e.target.value)} placeholder="e.g., Featured Articles" required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Describe the widget layout</Label>
                                    <Textarea id="description" value={widgetDescription} onChange={(e) => setWidgetDescription(e.target.value)} placeholder="e.g., A 3-column grid of cards with a large image, title, and excerpt." required />
                                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateHtml} disabled={isGenerating}>
                                        {isGenerating ? <><LoaderCircle className="animate-spin" /> Generating...</> : <><Wand2 className="mr-2 h-4 w-4" /> Generate with AI</>}
                                    </Button>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="html">Generated HTML</Label>
                                    <Textarea id="html" value={widgetHtml} onChange={(e) => setWidgetHtml(e.target.value)} placeholder="AI-generated HTML will appear here." rows={8} className="font-mono text-xs" required />
                                    <p className="text-sm text-muted-foreground">You can manually edit the generated HTML.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="config-type">Content Source</Label>
                                        <Select value={widgetConfigType} onValueChange={(v) => setWidgetConfigType(v as any)}>
                                            <SelectTrigger id="config-type"><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="category">Category</SelectItem>
                                                <SelectItem value="tag">Tag</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="config-value">{widgetConfigType === 'category' ? 'Select Category (Optional)' : 'Enter Tag (Optional)'}</Label>
                                        {widgetConfigType === 'category' ? (
                                            <Select value={widgetConfigValue} onValueChange={setWidgetConfigValue}>
                                                <SelectTrigger id="config-value"><SelectValue placeholder={loadingCategories ? 'Loading...' : 'Latest Articles'} /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Latest Articles</SelectItem>
                                                    {categories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input id="config-value" value={widgetConfigValue} onChange={(e) => setWidgetConfigValue(e.target.value)} placeholder="e.g., 'AI' (or leave blank)"/>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="config-limit">Item Limit</Label>
                                        <Input id="config-limit" type="number" value={widgetConfigLimit} onChange={(e) => setWidgetConfigLimit(e.target.value || '')} min={1} max={20} required/>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="ghost" onClick={() => handleDialogOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <><LoaderCircle className="animate-spin" /> Saving...</> : (editingWidget ? 'Save Changes' : 'Create Widget')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></TableCell>
                    </TableRow>
                ))
            ) : widgets.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No widgets created yet.
                    </TableCell>
                </TableRow>
            ) : (
                widgets.map((widget) => (
                <TableRow key={widget.id}>
                    <TableCell className="font-medium">{widget.name}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                        {widget.config ? (widget.config.value ? `${widget.config.type}: ${widget.config.value}` : 'Latest Articles') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleEditClick(widget)}>Edit</DropdownMenuItem>
                             <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the widget.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteWidget(widget.id)} className="bg-destructive hover:bg-destructive/90">
                                    Yes, delete widget
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
