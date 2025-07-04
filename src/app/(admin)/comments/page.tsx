'use client';

import { MoreHorizontal } from "lucide-react"
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Badge } from "@/components/ui/badge"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton";

interface Comment {
    id: string;
    authorName: string;
    authorAvatar: string;
    comment: string;
    post?: string;
    date: string;
    status: "Approved" | "Pending" | "Spam" | "Rejected";
}

export default function CommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            const commentsCollection = collection(db, "comments");
            const q = query(commentsCollection, orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            const commentsData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    authorName: data.authorName,
                    authorAvatar: data.authorAvatar || "https://placehold.co/40x40.png",
                    comment: data.text,
                    post: data.articleId || 'Unknown Article',
                    date: data.timestamp?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
                    status: data.status,
                }
            }) as Comment[];
            setComments(commentsData);
            setLoading(false);
        };
        fetchComments();
    }, []);

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case "Approved": return "default";
            case "Pending": return "secondary";
            case "Spam": return "destructive";
            case "Rejected": return "outline";
            default: return "secondary";
        }
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Comment Moderation</CardTitle>
        <CardDescription>Approve, reject, or mark comments as spam.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Comment</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">In Response To</TableHead>
              <TableHead className="hidden md:table-cell">Submitted On</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></TableCell>
                    </TableRow>
                ))
            ) : (
                comments.map((item) => (
                <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-sm truncate">{item.comment}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={item.authorAvatar} alt={item.authorName} />
                                <AvatarFallback>{item.authorName?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{item.authorName}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                    <Badge variant={getBadgeVariant(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{item.post}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.date}</TableCell>
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
                        <DropdownMenuItem>Approve (Not Implemented)</DropdownMenuItem>
                        <DropdownMenuItem>Reject (Not Implemented)</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Spam (Not Implemented)</DropdownMenuItem>
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
          Showing <strong>1-{comments.length < 5 ? comments.length : 5}</strong> of <strong>{comments.length}</strong> comments
        </div>
      </CardFooter>
    </Card>
  )
}
