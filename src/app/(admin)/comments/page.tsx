import { MoreHorizontal } from "lucide-react"

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

const comments = [
    {
        author: "Alex Turner",
        avatar: "https://placehold.co/40x40.png",
        fallback: "AT",
        comment: "This is a fantastic article! Really well-written and insightful. I learned a lot.",
        post: "The Future of AI",
        date: "2023-10-21",
        status: "Approved",
        aiHint: "male portrait"
    },
    {
        author: "Samantha Bee",
        avatar: "https://placehold.co/40x40.png",
        fallback: "SB",
        comment: "I disagree with point 3. The data doesn't support that conclusion. You should check aifutures.com for more accurate info.",
        post: "The Future of AI",
        date: "2023-10-21",
        status: "Pending",
        aiHint: "female portrait"
    },
    {
        author: "Mike P.",
        avatar: "https://placehold.co/40x40.png",
        fallback: "MP",
        comment: "make money fast click here www.getrichquick.scam",
        post: "Unboxing the New Laptop",
        date: "2023-10-20",
        status: "Spam",
        aiHint: "male portrait"
    },
    {
        author: "Jessica Day",
        avatar: "https://placehold.co/40x40.png",
        fallback: "JD",
        comment: "Could you elaborate on the section about quantum computing? It was a bit dense.",
        post: "Deep Dive into Tech",
        date: "2023-10-19",
        status: "Approved",
        aiHint: "female portrait"
    },
     {
        author: "Ben Wyatt",
        avatar: "https://placehold.co/40x40.png",
        fallback: "BW",
        comment: "First!",
        post: "Top 10 Extensions",
        date: "2023-10-18",
        status: "Rejected",
        aiHint: "male portrait"
    },
];

export default function CommentsPage() {
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
            {comments.map((item) => (
              <TableRow key={item.comment}>
                <TableCell className="font-medium max-w-sm truncate">{item.comment}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={item.avatar} alt={item.author} data-ai-hint={item.aiHint} />
                            <AvatarFallback>{item.fallback}</AvatarFallback>
                        </Avatar>
                        <span>{item.author}</span>
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
                      <DropdownMenuItem>Approve</DropdownMenuItem>
                      <DropdownMenuItem>Reject</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Spam</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-5</strong> of <strong>{comments.length}</strong> comments
        </div>
      </CardFooter>
    </Card>
  )
}
