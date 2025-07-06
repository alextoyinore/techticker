'use client';

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
import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from "@/lib/firebase";

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
import { Skeleton } from "@/components/ui/skeleton";

interface RecentActivity {
    id: string;
    type: 'New User' | 'New Comment';
    name: string;
    detail: string;
    date: Date;
}

export default function Dashboard() {
    const [stats, setStats] = useState({ totalPosts: 0, totalComments: 0, totalUsers: 0 });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const articlesRef = collection(db, 'articles');
                const commentsRef = collection(db, 'comments');
                const usersRef = collection(db, 'users');
        
                const [articlesSnapshot, commentsSnapshot, usersSnapshot] = await Promise.all([
                    getDocs(articlesRef),
                    getDocs(commentsRef),
                    getDocs(usersRef)
                ]);
        
                setStats({
                    totalPosts: articlesSnapshot.size,
                    totalComments: commentsSnapshot.size,
                    totalUsers: usersSnapshot.size,
                });
        
                // For recent activity
                const recentUsersQuery = query(usersRef, orderBy('createdAt', 'desc'), limit(5));
                const recentCommentsQuery = query(commentsRef, orderBy('timestamp', 'desc'), limit(5));
        
                const [recentUsersSnap, recentCommentsSnap] = await Promise.all([
                    getDocs(recentUsersQuery),
                    getDocs(recentCommentsQuery)
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
        
                const combinedActivity = [...recentUsers, ...recentComments]
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .slice(0, 5);

                setRecentActivity(combinedActivity);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderStatCard = (title: string, value: number | string, icon: React.ReactNode, description: string, isLoading: boolean) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              {icon}
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value}</div>}
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {renderStatCard("Total Posts", stats.totalPosts, <FileText className="h-4 w-4 text-muted-foreground" />, "articles published", loading)}
              {renderStatCard("Total Comments", stats.totalComments, <MessageSquare className="h-4 w-4 text-muted-foreground" />, "comments submitted", loading)}
              {renderStatCard("Total Users", stats.totalUsers, <Users className="h-4 w-4 text-muted-foreground" />, "users signed up", loading)}
              {renderStatCard("Total Visits", "15,302", <Eye className="h-4 w-4 text-muted-foreground" />, "(Placeholder Data)", false)}
              {renderStatCard("Total Reads", "23,159", <BookOpenCheck className="h-4 w-4 text-muted-foreground" />, "(Placeholder Data)", false)}
              {renderStatCard("Active Now", "12", <Activity className="h-4 w-4 text-muted-foreground" />, "(Placeholder Data)", false)}
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
                    {loading ? (
                        Array.from({length: 5}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-4 w-20" /></TableCell>
                            </TableRow>
                        ))
                    ) : recentActivity.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No recent activity.</TableCell>
                        </TableRow>
                    ) : (
                        recentActivity.map((activity) => (
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
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
    )
  }
  