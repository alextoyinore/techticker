'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, Trash2 } from "lucide-react"

import { useState, useEffect, useTransition } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
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

interface Category {
    id: string;
    name: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isPending, startTransition] = useTransition();

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
        toast({ variant: 'destructive', title: 'Error', description: 'Category name cannot be empty.' });
        return;
    }

    startTransition(async () => {
        try {
            await addDoc(collection(db, "categories"), { name: newCategoryName });
            toast({ title: 'Success', description: 'Category added.' });
            setNewCategoryName("");
            fetchCategories(); // Refresh list
        } catch (error) {
            console.error("Error adding category:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not add category.' });
        }
    });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    startTransition(async () => {
        try {
            await deleteDoc(doc(db, "categories", categoryId));
            toast({ title: 'Success', description: 'Category deleted.' });
            fetchCategories(); // Refresh list
        } catch (error) {
            console.error("Error deleting category:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete category.' });
        }
    });
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
        <div className="mb-4">
            <h1 className="font-headline text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your site settings and preferences.</p>
        </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Identity</CardTitle>
            <CardDescription>Update your site name and logo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input id="site-name" defaultValue="TechTicker" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
               <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-secondary rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M12 12h.01"/><path d="M15.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"/><path d="M19 12a7 7 0 1 0-14 0 7 7 0 0 0 14 0Z"/><path d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"/></svg>
                </div>
                <Input id="logo" type="file" className="max-w-xs" />
               </div>
               <p className="text-sm text-muted-foreground">Recommended size: 256x256px</p>
            </div>
          </CardContent>
           <CardContent>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage the categories for your articles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <Input 
                placeholder="New category name" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={isPending}
              />
              <Button type="submit" variant="outline" className="shrink-0" disabled={isPending}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </form>
            <Separator />
            <div className="space-y-2">
                {loadingCategories ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-md">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    ))
                ) : categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No categories found.</p>
                ) : (
                    categories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                            <span className="text-sm font-medium">{cat.name}</span>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" disabled={isPending}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the <strong>{cat.name}</strong> category.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCategory(cat.id)} className="bg-destructive hover:bg-destructive/90">
                                        Yes, delete
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
