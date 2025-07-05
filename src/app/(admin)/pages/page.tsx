'use client';

import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, Timestamp, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Page {
    id: string;
    title: string;
    status: "Published" | "Draft";
    lastUpdated: string;
    layoutName: string;
}

interface Layout {
    id: string;
    name: string;
}

export default function PagesPage() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchPagesAndLayouts = async () => {
            setLoading(true);
            try {
                // Fetch layouts first to create a map
                const layoutsSnapshot = await getDocs(collection(db, "layouts"));
                const layoutsMap = new Map<string, string>();
                layoutsSnapshot.forEach(doc => {
                    layoutsMap.set(doc.id, doc.data().name);
                });

                // Fetch pages
                const pagesCollection = collection(db, "pages");
                const q = query(pagesCollection, orderBy("updatedAt", "desc"));
                const querySnapshot = await getDocs(q);
                const pagesData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const ts = data.updatedAt as Timestamp;
                    return {
                        id: doc.id,
                        title: data.title,
                        status: data.status,
                        lastUpdated: ts ? ts.toDate().toLocaleDateString() : 'N/A',
                        layoutName: layoutsMap.get(data.layoutId) || 'N/A',
                    }
                }) as Page[];
                setPages(pagesData);
            } catch (error) {
                console.error("Error fetching pages:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch pages.' });
            } finally {
                setLoading(false);
            }
        };

        fetchPagesAndLayouts();
    }, [toast]);

    const handleDelete = async (pageId: string) => {
        try {
            await deleteDoc(doc(db, "pages", pageId));
            setPages(pages.filter(page => page.id !== pageId));
            toast({ title: 'Success', description: 'Page deleted successfully.' });
        } catch (error) {
            console.error("Error deleting page:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete page.' });
        }
    };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="font-headline">Pages</CardTitle>
                <CardDescription>Manage your site's static pages like 'About' or 'Contact'.</CardDescription>
            </div>
            <Link href="/editor?type=page">
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Create New Page
                    </span>
                </Button>
            </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Layout</TableHead>
              <TableHead className="hidden md:table-cell">Last Updated</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></TableCell>
                    </TableRow>
                ))
            ) : pages.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  <Badge variant={item.status === 'Draft' ? 'secondary' : 'default'}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{item.layoutName}</TableCell>
                <TableCell className="hidden md:table-cell">{item.lastUpdated}</TableCell>
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
                            <DropdownMenuItem asChild>
                                <Link href={`/editor?id=${item.id}&type=page`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/${item.id}`} target="_blank">View</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
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
                                This action cannot be undone. This will permanently delete the page titled &quot;{item.title}&quot;.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">
                                Yes, delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                   </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>{pages.length}</strong> of <strong>{pages.length}</strong> pages
        </div>
      </CardFooter>
    </Card>
  )
}
