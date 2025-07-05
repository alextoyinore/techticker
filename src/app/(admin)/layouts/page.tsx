'use client';

import { useEffect, useState, useTransition } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { layoutTemplates } from "@/lib/layout-templates";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MoreHorizontal, PlusCircle, Trash2, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";


interface Widget {
  id: string;
  name: string;
}

interface Layout {
  id: string;
  name: string;
  templateId: string;
  zones: Record<string, string[]>;
  isHomepage?: boolean;
}

export default function LayoutsPage() {
    const { toast } = useToast();
    const [layouts, setLayouts] = useState<Layout[]>([]);
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, startSavingTransition] = useTransition();
    const [editingLayout, setEditingLayout] = useState<Layout | null>(null);

    // Form state
    const [layoutName, setLayoutName] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [assignedWidgets, setAssignedWidgets] = useState<Record<string, string[]>>({});
    
    const fetchLayoutsAndWidgets = async () => {
        setLoading(true);
        try {
            const layoutsSnapshot = await getDocs(collection(db, "layouts"));
            const layoutsData = layoutsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Layout));
            setLayouts(layoutsData);

            const widgetsSnapshot = await getDocs(collection(db, "widgets"));
            const widgetsData = widgetsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Widget));
            setWidgets(widgetsData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch layouts or widgets.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLayoutsAndWidgets();
    }, []);

    const resetForm = () => {
        setEditingLayout(null);
        setLayoutName("");
        setSelectedTemplateId(null);
        setAssignedWidgets({});
    };

    const handleDialogOpenChange = (open: boolean) => {
        if (!open) resetForm();
        setIsDialogOpen(open);
    };

    const handleEditClick = (layout: Layout) => {
        setEditingLayout(layout);
        setLayoutName(layout.name);
        setSelectedTemplateId(layout.templateId);
        setAssignedWidgets(layout.zones || {});
        setIsDialogOpen(true);
    };
    
    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplateId(templateId);
        // Reset widget assignments when template changes
        setAssignedWidgets({});
    };

    const handleWidgetAssignmentChange = (zone: string, widgetId: string, isChecked: boolean) => {
        setAssignedWidgets(prev => {
            const zoneWidgets = prev[zone] ? [...prev[zone]] : [];
            if (isChecked) {
                if (!zoneWidgets.includes(widgetId)) {
                    zoneWidgets.push(widgetId);
                }
            } else {
                const index = zoneWidgets.indexOf(widgetId);
                if (index > -1) {
                    zoneWidgets.splice(index, 1);
                }
            }
            return { ...prev, [zone]: zoneWidgets };
        });
    };

    const handleSaveLayout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!layoutName.trim() || !selectedTemplateId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Layout Name and a Template selection are required.' });
            return;
        }

        startSavingTransition(async () => {
            const layoutData = {
                name: layoutName,
                templateId: selectedTemplateId,
                zones: assignedWidgets,
            };
            try {
                if (editingLayout) {
                    const layoutRef = doc(db, 'layouts', editingLayout.id);
                    await updateDoc(layoutRef, layoutData);
                    toast({ title: 'Success', description: 'Layout updated successfully.' });
                } else {
                    await addDoc(collection(db, "layouts"), { ...layoutData, isHomepage: false });
                    toast({ title: 'Success', description: 'Layout created successfully.' });
                }
                resetForm();
                setIsDialogOpen(false);
                fetchLayoutsAndWidgets();
            } catch (error) {
                console.error("Error saving layout:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not save layout.' });
            }
        });
    };

    const handleDeleteLayout = async (layoutId: string) => {
        try {
            await deleteDoc(doc(db, "layouts", layoutId));
            toast({ title: 'Success', description: 'Layout deleted.' });
            setLayouts(layouts.filter(l => l.id !== layoutId));
        } catch (error) {
            console.error("Error deleting layout:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete layout.' });
        }
    };

    const handleSetHomepage = async (layoutId: string) => {
        const batch = writeBatch(db);
        
        layouts.forEach(layout => {
            const layoutRef = doc(db, 'layouts', layout.id);
            if (layout.id === layoutId) {
                batch.update(layoutRef, { isHomepage: true });
            } else if (layout.isHomepage) {
                batch.update(layoutRef, { isHomepage: false });
            }
        });

        try {
            await batch.commit();
            toast({ title: 'Success', description: 'Homepage layout updated.' });
            fetchLayoutsAndWidgets();
        } catch (error) {
            console.error('Error setting homepage:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not set homepage layout.' });
        }
    };
    
    const selectedTemplate = layoutTemplates.find(t => t.id === selectedTemplateId);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-headline">Layouts</CardTitle>
                        <CardDescription>Manage reusable page layouts for your site.</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-1">
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span>Create Layout</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl">
                            <form onSubmit={handleSaveLayout}>
                                <DialogHeader>
                                    <DialogTitle>{editingLayout ? 'Edit Layout' : 'Create New Layout'}</DialogTitle>
                                    <DialogDescription>
                                        Choose a template and assign widgets to its zones.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Layout Name</Label>
                                        <Input id="name" value={layoutName} onChange={(e) => setLayoutName(e.target.value)} placeholder="e.g., Homepage, Two-Column" required />
                                    </div>
                                    <ScrollArea className="h-[55vh] pr-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                            <div className="space-y-4">
                                                <Label>Select a Layout Template</Label>
                                                <RadioGroup value={selectedTemplateId ?? ""} onValueChange={handleTemplateSelect} className="grid grid-cols-2 gap-4">
                                                    {layoutTemplates.map((template) => (
                                                        <div key={template.id}>
                                                            <RadioGroupItem value={template.id} id={template.id} className="peer sr-only" />
                                                            <Label
                                                                htmlFor={template.id}
                                                                className={cn(
                                                                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                                                                    "cursor-pointer"
                                                                )}
                                                            >
                                                                <div className="h-24 w-full bg-background rounded-lg p-2 border">
                                                                    {template.preview}
                                                                </div>
                                                                <span className="mt-2 font-semibold">{template.name}</span>
                                                                <span className="text-xs text-center text-muted-foreground">{template.description}</span>
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </div>
                                            <div className="space-y-4">
                                                <Label>Assign Widgets to Zones</Label>
                                                {selectedTemplate ? (
                                                    <Accordion type="multiple" className="w-full space-y-2" defaultValue={selectedTemplate.zones}>
                                                        {selectedTemplate.zones.map(zone => (
                                                            <AccordionItem value={zone} key={zone} className="border rounded-md px-4">
                                                                <AccordionTrigger className="capitalize text-base py-3 hover:no-underline">{zone.replace(/_/g, ' ')}</AccordionTrigger>
                                                                <AccordionContent>
                                                                    <ScrollArea className="h-48">
                                                                        <div className="space-y-2 pr-4 pb-2">
                                                                            {widgets.length > 0 ? widgets.map(widget => (
                                                                                <div key={widget.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary">
                                                                                    <Checkbox
                                                                                        id={`${zone}-${widget.id}`}
                                                                                        checked={assignedWidgets[zone]?.includes(widget.id)}
                                                                                        onCheckedChange={(checked) => handleWidgetAssignmentChange(zone, widget.id, !!checked)}
                                                                                    />
                                                                                    <Label htmlFor={`${zone}-${widget.id}`} className="font-normal flex-1 cursor-pointer">{widget.name}</Label>
                                                                                </div>
                                                                            )) : <p className="text-sm text-muted-foreground p-2">No widgets found. Create one on the Widgets page.</p>}
                                                                        </div>
                                                                    </ScrollArea>
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        ))}
                                                    </Accordion>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                                                        <p className="text-muted-foreground">Select a template first</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </div>
                                <DialogFooter className="pt-4 border-t">
                                    <Button type="button" variant="ghost" onClick={() => handleDialogOpenChange(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? <><LoaderCircle className="animate-spin" /> Saving...</> : (editingLayout ? 'Save Changes' : 'Create Layout')}
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
                            <TableHead>Template</TableHead>
                            <TableHead>Homepage</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                                    <TableCell><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></TableCell>
                                </TableRow>
                            ))
                        ) : layouts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                    No layouts created yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            layouts.map((layout) => (
                                <TableRow key={layout.id}>
                                    <TableCell className="font-medium">{layout.name}</TableCell>
                                    <TableCell>{layoutTemplates.find(t => t.id === layout.templateId)?.name || 'Unknown'}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={!!layout.isHomepage}
                                            onCheckedChange={() => handleSetHomepage(layout.id)}
                                            aria-label="Set as homepage"
                                        />
                                    </TableCell>
                                    <TableCell>
                                      <AlertDialog>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onSelect={() => handleEditClick(layout)}>Edit</DropdownMenuItem>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently delete the layout.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteLayout(layout.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Yes, delete
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
    );
}
