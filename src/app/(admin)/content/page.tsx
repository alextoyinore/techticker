'use client';

import { MoreHorizontal, PlusCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Article {
    id: string;
    title: string;
    status: "Published" | "Draft";
    authorName: string;
    updatedAt: string;
}

export default function ContentPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const articlesCollection = collection(db, "articles");
                const q = query(articlesCollection, orderBy("updatedAt", "desc"));
                const querySnapshot = await getDocs(q);
                const articlesData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const ts = data.updatedAt as Timestamp;
                    return {
                        id: doc.id,
                        title: data.title,
                        status: data.status,
                        authorName: data.authorName,
                        updatedAt: ts ? ts.toDate().toLocaleDateString() : 'N/A',
                    }
                }) as Article[];
                setArticles(articlesData);
            } catch (error) {
                console.error("Error fetching articles:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch articles.' });
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [toast]);

    const getBadgeVariant = (status: Article['status']): BadgeProps['variant'] => {
        if (status === 'Published') {
            return 'default';
        }
        return 'secondary';
    }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="font-headline">Content</CardTitle>
                <CardDescription>Manage your articles, pages, and other content.</CardDescription>
            </div>
            <Link href="/editor">
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Create New
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
              <TableHead className="hidden md:table-cell">Author</TableHead>
              <TableHead className="hidden md:table-cell">Last Updated</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[300px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></TableCell>
                    </TableRow>
                ))
            ) : (
                articles.map((item) => (
                <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                    <Badge variant={getBadgeVariant(item.status)}>
                        {item.status}
                    </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{item.authorName}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.updatedAt}</TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>{articles.length}</strong> of <strong>{articles.length}</strong> articles
        </div>
      </CardFooter>
    </Card>
  )
}
