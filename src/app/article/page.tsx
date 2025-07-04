'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth, User } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';

const mockArticle = {
  title: 'The Future is Now: A Deep Dive into Quantum Computing',
  author: 'Dr. Evelyn Reed',
  date: 'October 26, 2023',
  content: `
    <p>Quantum computing, once a realm of theoretical physics, is rapidly becoming a tangible reality. Unlike classical computers that store information in bits as either 0s or 1s, quantum computers use qubits. A qubit can exist as a 0, a 1, or a superposition of both, allowing for an exponential increase in computational power.</p>
    <p>This paradigm shift promises to revolutionize fields from medicine and materials science to finance and artificial intelligence. Imagine developing new drugs in a fraction of the time, creating novel materials with unprecedented properties, or building financial models that can predict market fluctuations with uncanny accuracy. These are not science fiction scenarios; they are the potential applications that researchers are actively exploring.</p>
    <p>However, the path to a fully-functional, fault-tolerant quantum computer is fraught with challenges. Qubits are notoriously fragile and susceptible to "decoherence," where they lose their quantum properties due to interaction with the environment. Engineers and physicists are in a global race to develop better hardware, error-correction codes, and algorithms to overcome these hurdles. The journey is as exciting as the destination itself.</p>
  `,
};

const mockComments = [
    {
        id: '1',
        author: 'Alex Turner',
        avatar: "https://placehold.co/40x40.png",
        fallback: 'AT',
        text: 'This is a fantastic article! Really well-written and insightful. I learned a lot.',
        timestamp: new Date('2023-10-21'),
    },
    {
        id: '2',
        author: 'Samantha Bee',
        avatar: "https://placehold.co/40x40.png",
        fallback: 'SB',
        text: "I'm still trying to wrap my head around superposition. It's mind-bending!",
        timestamp: new Date('2023-10-22'),
    },
];

export default function ArticlePage() {
  const { user, loading, logout } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        articleId: 'quantum-computing-101', // mock article id
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

  const isAdmin = user && ['admin', 'superadmin', 'editor', 'writer'].includes(user.role as string);

  return (
    <>
        <header className="flex h-16 items-center justify-between border-b bg-background px-6 sticky top-0 z-50">
            <Link href="/article" className="flex items-center">
                <span className="font-bold font-headline">TechTicker</span>
            </Link>
            <div className="flex items-center gap-2">
                {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : user ? (
                    <>
                        {isAdmin && <Link href="/dashboard"><Button variant="outline">Dashboard</Button></Link>}
                        <Button onClick={logout}>Logout</Button>
                    </>
                ) : (
                    <Link href="/">
                        <Button>Login</Button>
                    </Link>
                )}
            </div>
        </header>

        <main className="container mx-auto max-w-4xl py-8 px-4">
            <article className="prose dark:prose-invert lg:prose-xl max-w-none">
                <h1>{mockArticle.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                    <span>By {mockArticle.author}</span>
                    <span>&bull;</span>
                    <span>{mockArticle.date}</span>
                </div>
                <Separator className="my-8" />
                <div dangerouslySetInnerHTML={{ __html: mockArticle.content }} />
            </article>

            <Separator className="my-12" />

            <section id="comments">
                <h2 className="text-3xl font-bold font-headline mb-8">Comments ({mockComments.length})</h2>

                <Card>
                    <CardContent className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : user ? (
                            <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.photoURL ?? ''} />
                                        <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0).toUpperCase()}</AvatarFallback>
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
                    {mockComments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-4">
                             <Avatar className="h-10 w-10 border">
                                <AvatarImage src={comment.avatar} />
                                <AvatarFallback>{comment.fallback}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{comment.author}</p>
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
