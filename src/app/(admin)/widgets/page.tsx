'use client';

import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

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
}

export default function WidgetsPage() {
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newWidgetName, setNewWidgetName] = useState("");
    const [newWidgetDescription, setNewWidgetDescription] = useState("");
    const { toast } = useToast();

    const fetchWidgets = async () => {
        setLoading(true);
        try {
            const widgetsCollection = collection(db, "widgets");
            const querySnapshot = await getDocs(widgetsCollection);
            const widgetsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Widget[];
            setWidgets(widgetsData);
        } catch (error) {
            console.error("Error fetching widgets:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch widgets.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWidgets();
    }, [toast]);
    
    const handleAddWidget = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWidgetName.trim() || !newWidgetDescription.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill out all fields.' });
            return;
        }

        try {
            await addDoc(collection(db, "widgets"), {
                name: newWidgetName,
                description: newWidgetDescription,
            });
            toast({ title: 'Success', description: 'Widget created successfully.' });
            setNewWidgetName("");
            setNewWidgetDescription("");
            setIsDialogOpen(false);
            fetchWidgets(); // Refresh list
        } catch (error) {
            console.error("Error adding widget:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create widget.' });
        }
    };
    
    const handleDeleteWidget = async (widgetId: string) => {
        try {
            await deleteDoc(doc(db, "widgets", widgetId));
            toast({ title: 'Success', description: 'Widget deleted.' });
            fetchWidgets(); // Refresh list
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Create Widget
                        </span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <form onSubmit={handleAddWidget}>
                        <DialogHeader>
                        <DialogTitle>Create New Widget</DialogTitle>
                        <DialogDescription>
                            Widgets are reusable blocks of content for your layouts.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" value={newWidgetName} onChange={(e) => setNewWidgetName(e.target.value)} placeholder="e.g. Hero Section" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="description" className="text-right pt-2">Description</Label>
                                <Textarea id="description" value={newWidgetDescription} onChange={(e) => setNewWidgetDescription(e.target.value)} placeholder="A short description of the widget." className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit">Create Widget</Button>
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
              <TableHead>Description</TableHead>
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
                        <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                        <TableCell><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></TableCell>
                    </TableRow>
                ))
            ) : (
                widgets.map((widget) => (
                <TableRow key={widget.id}>
                    <TableCell className="font-medium">{widget.name}</TableCell>
                    <TableCell className="text-muted-foreground">{widget.description}</TableCell>
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
                            <DropdownMenuItem disabled>Edit</DropdownMenuItem>
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
