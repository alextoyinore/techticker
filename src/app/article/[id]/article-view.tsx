'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp, doc, getDoc, query, where, orderBy, getDocs } from 'firebase/firestore'; 
import type { Timestamp } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

import type { Article, Comment } from './page';

interface ArticleViewProps {
  articleId: string;
}

export default function ArticleView({ articleId }: ArticleViewProps) {
  const { user, loading: authLoading } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchArticleAndComments = async () => {
        if (!articleId) return;
        setLoading(true);
        setError(null);
        try {
            const articleRef = doc(db, 'articles', articleId);
            const articleSnap = await getDoc(articleRef);

            if (!articleSnap.exists() || articleSnap.data()?.status !== 'Published') {
                setError('Article not found or not published.');
                return;
            }
            
            const data = articleSnap.data()!;
            const fetchedArticle: Article = {
                id: articleSnap.id,
                title: data.title,
                authorName: data.authorName,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
                content: data.content,
                status: data.status,
                featuredImage: data.featuredImage,
            };
            setArticle(fetchedArticle);

            const commentsQuery = query(
                collection(db, 'comments'),
                where('articleId', '==', articleId),
                where('status', '==', 'Approved'),
                orderBy('timestamp', 'desc')
            );
                
            const commentsSnap = await getDocs(commentsQuery);
            const fetchedComments: Comment[] = commentsSnap.docs.map(doc => {
                const commentData = doc.data();
                return {
                    id: doc.id,
                    authorName: commentData.authorName,
                    authorAvatar: commentData.authorAvatar || `https://placehold.co/40x40.png`,
                    text: commentData.text,
                    timestamp: (commentData.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                }
            });
            setComments(fetchedComments);
        } catch (e) {
            console.error("Error fetching article:", e);
            setError("Failed to load article.");
        } finally {
            setLoading(false);
        }
    };
    
    fetchArticleAndComments();
  }, [articleId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const commentData = {
        articleId: articleId,
        text: newComment,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        authorAvatar: user.photoURL,
        timestamp: serverTimestamp(),
        status: 'Pending',
      };
      await addDoc(collection(db, 'comments'), commentData);
      setNewComment('');
      toast({ title: 'Success', description: 'Your comment has been submitted for approval.' });
    } catch (error) {
      console.error('Error adding comment: ', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit comment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString();
  }

  if (loading) {
    return (
        <main className="container mx-auto max-w-4xl py-8 px-4 flex-grow">
            <div className="prose dark:prose-invert lg:prose-xl max-w-none">
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-8" />
                <Skeleton className="w-full aspect-video my-8 rounded-lg" />
                <Separator className="my-8" />
                <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                </div>
            </div>
        </main>
    );
  }

  if (error || !article) {
      return (
        <main className="flex-grow flex h-[calc(100vh-8rem)] w-full items-center justify-center text-center">
          <div>
              <h1 className="text-4xl font-bold">404</h1>
              <p className="text-muted-foreground">{error || 'Article not found.'}</p>
              <Button asChild className="mt-4">
                  <Link href="/">Go Home</Link>
              </Button>
          </div>
        </main>
      )
  }

  return (
    <main className="container mx-auto max-w-4xl py-8 px-4 flex-grow">
        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
            <h1>{article.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
                <span>By {article.authorName}</span>
                <span>&bull;</span>
                <span>{formatDate(article.createdAt)}</span>
            </div>
             {article.featuredImage && (
                <div className="relative w-full aspect-video my-8">
                    <Image src={article.featuredImage} alt={article.title} fill className="object-cover rounded-lg" data-ai-hint="news article" />
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
                            <p><Link href="/login" className="text-primary underline">Log in</Link> to join the discussion.</p>
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
                                    {formatDate(comment.timestamp)}
                                </p>
                            </div>
                            <p className="text-foreground/90">{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    </main>
  );
}
