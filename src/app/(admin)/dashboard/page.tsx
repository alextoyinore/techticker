import {
    Activity,
    ArrowUpRight,
    BookOpenCheck,
    Eye,
    FileText,
    MessageSquare,
    Users,
  } from "lucide-react"
  import Link from "next/link"
  import { adminDb } from "@/lib/firebase-admin"
  import type { Timestamp } from "firebase-admin/firestore"
  
  import { Badge } from "@/components/ui/badge"
  import { Button } from "@/components/ui/button"
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  
  export default async function Dashboard() {
    let totalPosts = 0;
    let totalComments = 0;
    let totalUsers = 0;
    let recentActivity: any[] = [];
  
    try {
        const articlesRef = adminDb.collection('articles');
        const commentsRef = adminDb.collection('comments');
        const usersRef = adminDb.collection('users');
    
        const [articlesSnapshot, commentsSnapshot, usersSnapshot] = await Promise.all([
            articlesRef.get(),
            commentsRef.get(),
            usersRef.get()
        ]);
    
        totalPosts = articlesSnapshot.size;
        totalComments = commentsSnapshot.size;
        totalUsers = usersSnapshot.size;
    
        // For recent activity
        const recentUsersQuery = usersRef.orderBy('createdAt', 'desc').limit(5);
        const recentCommentsQuery = commentsRef.orderBy('timestamp', 'desc').limit(5);
    
        const [recentUsersSnap, recentCommentsSnap] = await Promise.all([
            recentUsersQuery.get(),
            recentCommentsQuery.get()
        ]);
    
        const recentUsers = recentUsersSnap.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp | undefined;
            return {
                id: doc.id,
                type: 'New User' as const,
                name: data.displayName || data.email,
                detail: data.email,
                date: createdAt ? createdAt.toDate() : new Date(),
            };
        });
    
        const recentComments = recentCommentsSnap.docs.map(doc => {
            const data = doc.data();
            const timestamp = data.timestamp as Timestamp | undefined;
            const commentText = typeof data.text === 'string' ? data.text : '';
            return {
                id: doc.id,
                type: 'New Comment' as const,
                name: data.authorName,
                detail: `Comment: "${commentText.substring(0, 30)}..."`,
                date: timestamp ? timestamp.toDate() : new Date(),
            };
        });
    
        recentActivity = [...recentUsers, ...recentComments]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5);

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Data will remain 0 or empty array, page will render with default values.
    }


    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Posts
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPosts}</div>
                  <p className="text-xs text-muted-foreground">
                    articles published
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Comments
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalComments}</div>
                  <p className="text-xs text-muted-foreground">
                    comments submitted
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    users signed up
                  </p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15,302</div>
                  <p className="text-xs text-muted-foreground">
                    (Placeholder Data)
                  </p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reads</CardTitle>
                  <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23,159</div>
                  <p className="text-xs text-muted-foreground">
                    (Placeholder Data)
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    (Placeholder Data)
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Recent comments and user sign-ups.
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                  <Link href="/comments">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity) => (
                        <TableRow key={activity.id}>
                        <TableCell>
                            <div className="font-medium">{activity.name}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                            {activity.detail}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={activity.type === 'New User' ? 'secondary' : 'outline'}>{activity.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{activity.date.toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
    )
  }
  