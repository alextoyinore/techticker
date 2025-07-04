import { MoreHorizontal, PlusCircle } from "lucide-react"
import Link from "next/link"

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

const contentItems = [
  {
    title: "The Future of AI in Tech Journalism",
    status: "Published",
    author: "Jane Doe",
    lastUpdated: "2023-10-18",
  },
  {
    title: "Unboxing the New Quantum Laptop",
    status: "Draft",
    author: "John Smith",
    lastUpdated: "2023-10-20",
  },
  {
    title: "A Deep Dive into Sustainable Tech",
    status: "Published",
    author: "Emily White",
    lastUpdated: "2023-09-05",
  },
  {
    title: "Top 10 VSCode Extensions for 2024",
    status: "In Review",
    author: "Michael Brown",
    lastUpdated: "2023-10-21",
  },
  {
    title: "How Edge Computing is Changing the IoT",
    status: "Published",
    author: "Jane Doe",
    lastUpdated: "2023-08-12",
  },
]

export default function ContentPage() {
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
            {contentItems.map((item) => (
              <TableRow key={item.title}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  <Badge variant={item.status === 'Draft' ? 'secondary' : 'outline'}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{item.author}</TableCell>
                <TableCell className="hidden md:table-cell">{item.lastUpdated}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-5</strong> of <strong>{contentItems.length}</strong> products
        </div>
      </CardFooter>
    </Card>
  )
}
