'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';

import type { Article, Comment } from './page';

interface ArticleViewProps {
  article: Article;
  initialComments: Comment[];
}

export default function ArticleView({ article, initialComments }: ArticleViewProps) {
  const { user, loading: authLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const commentData = {
        articleId: article.id,
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
