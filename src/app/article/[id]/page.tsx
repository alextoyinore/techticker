'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, User } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp, doc, getDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CircleUser, Globe, LayoutGrid, LoaderCircle, LogOut, Moon, Monitor, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

interface Article {
    id: string;
    title: string;
    authorName: string;
    updatedAt: Date;
    content: string;
    status: 'Published' | 'Draft';
    featuredImage?: string;
}

interface Comment {
    id: string;
    authorName: string;
    authorAvatar: string;
    text: string;
    timestamp: Date;
}


export default function ArticlePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { setTheme } = useTheme();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingArticle, setLoadingArticle] = useState(true);

  useEffect(() => {
    if (!articleId) return;

    const fetchArticleAndComments = async () => {
        setLoadingArticle(true);
        const articleRef = doc(db, 'articles', articleId);
        const articleSnap = await getDoc(articleRef);

        if (articleSnap.exists() && articleSnap.data().status === 'Published') {
            const data = articleSnap.data();
            setArticle({
                id: articleSnap.id,
                title: data.title,
                authorName: data.authorName,
                updatedAt: (data.updatedAt as Timestamp).toDate(),
                content: data.content,
                status: data.status,
                featuredImage: data.featuredImage,
            });

            const commentsQuery = query(
                collection(db, 'comments'),
                where('articleId', '==', articleId),
                where('status', '==', 'Approved'),
                orderBy('timestamp', 'desc')
            );
            const commentsSnap = await getDocs(commentsQuery);
            const commentsData = commentsSnap.docs.map(doc => {
                const commentData = doc.data();
                return {
                    id: doc.id,
                    authorName: commentData.authorName,
                    authorAvatar: commentData.authorAvatar || `https://placehold.co/40x40.png`,
                    text: commentData.text,
                    timestamp: (commentData.timestamp as Timestamp)?.toDate() || new Date(),
                }
            }) as Comment[];
            setComments(commentsData);

        } else {
            setArticle(null);
        }
        setLoadingArticle(false);
    };

    fetchArticleAndComments();
  }, [articleId]);


  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        articleId: articleId,
        text: newComment,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        authorAvatar: user.photoURL,
        timestamp: serverTimestamp(),
        status: 'Pending',
      });
      setNewComment('');
      toast({ title: 'Success', description: 'Your comment has been submitted for approval.' });
    } catch (error) {
      console.error('Error adding comment: ', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit comment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingArticle || authLoading) {
      return (
          <div className="flex min-h-screen w-full items-center justify-center">
              <LoaderCircle className="animate-spin h-8 w-8" />
          </div>
      );
  }

  if (!article) {
      return (
        <>
            <header className="flex h-16 items-center justify-between border-b bg-background px-6 sticky top-0 z-50">
                <Link href="/" className="flex items-center">
                    <span className="font-bold font-headline">TechTicker</span>
                </Link>
            </header>
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center text-center">
              <div>
                  <h1 className="text-4xl font-bold">404</h1>
                  <p className="text-muted-foreground">Article not found or not published.</p>
                  <Button asChild className="mt-4">
                      <Link href="/">Go Home</Link>
                  </Button>
              </div>
            </div>
        </>
      )
  }

  return (
    <>
        <header className="flex h-16 items-center justify-between border-b bg-background px-6 sticky top-0 z-50">
            <Link href="/" className="flex items-center">
                <span className="font-bold font-headline">TechTicker</span>
            </Link>
            <div className="flex items-center gap-2">
                {authLoading ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? ''} />
                          <AvatarFallback>{user?.displayName?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.displayName ?? "User"}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <CircleUser className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <LayoutGrid className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Sun />
                          <span>Toggle Theme</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => setTheme('light')}>
                              <Sun />
                              <span>Light</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme('dark')}>
                              <Moon />
                              <span>Dark</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme('system')}>
                              <Monitor />
                              <span>System</span>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/">
                    <Button>Login</Button>
                  </Link>
                )}
            </div>
        </header>

        <main className="container mx-auto max-w-4xl py-8 px-4">
            <article className="prose dark:prose-invert lg:prose-xl max-w-none">
                <h1>{article.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                    <span>By {article.authorName}</span>
                    <span>&bull;</span>
                    <span>{article.updatedAt.toLocaleDateString()}</span>
                </div>
                 {article.featuredImage && (
                    <div className="relative w-full aspect-video my-8">
                        <Image src={article.featuredImage} alt={article.title} fill className="object-cover rounded-lg" />
                    </div>
                )}
                <Separator className="my-8" />
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
            </article>

            <Separator className="my-12" />

            <section id="comments">
                <h2 className="text-3xl font-bold font-headline mb-8">Comments ({comments.length})</h2>

                <Card>
                    <CardContent className="p-6">
                        {authLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : user ? (
                            <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.photoURL ?? ''} />
                                        <AvatarFallback>{user.displayName?.charAt(0)?.toUpperCase() ?? user.email?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <Textarea
                                        placeholder="Write a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows={4}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="self-end" disabled={isSubmitting}>
                                    {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Submit Comment'}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                                <p><Link href="/" className="text-primary underline">Log in</Link> to join the discussion.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6 mt-8">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-4">
                             <Avatar className="h-10 w-10 border">
                                <AvatarImage src={comment.authorAvatar} />
                                <AvatarFallback>{comment.authorName.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{comment.authorName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {comment.timestamp.toLocaleDateString()}
                                    </p>
                                </div>
                                <p className="text-foreground/90">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    </>
  );
}
