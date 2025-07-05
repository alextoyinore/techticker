import Link from 'next/link';
import Image from 'next/image';
import { adminDb } from '@/lib/firebase-admin';
import type { Timestamp } from 'firebase-admin/firestore';

import ArticleView from './article-view';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import { Button } from '@/components/ui/button';

export interface Article {
    id: string;
    title: string;
    authorName: string;
    updatedAt: string; // Stored as ISO string
    content: string;
    status: 'Published' | 'Draft';
    featuredImage?: string;
}

export interface Comment {
    id:string;
    authorName: string;
    authorAvatar: string;
    text: string;
    timestamp: string; // Stored as ISO string
}

async function getArticleAndComments(articleId: string) {
    const articleRef = adminDb.collection('articles').doc(articleId);
    const articleSnap = await articleRef.get();

    if (!articleSnap.exists || articleSnap.data()?.status !== 'Published') {
        return { article: null, comments: [] };
    }
    
    const data = articleSnap.data()!;
    const article: Article = {
        id: articleSnap.id,
        title: data.title,
        authorName: data.authorName,
        updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
        content: data.content,
        status: data.status,
        featuredImage: data.featuredImage,
    };

    const commentsQuery = adminDb.collection('comments')
        .where('articleId', '==', articleId)
        .where('status', '==', 'Approved')
        .orderBy('timestamp', 'desc');
        
    const commentsSnap = await commentsQuery.get();
    const comments: Comment[] = commentsSnap.docs.map(doc => {
        const commentData = doc.data();
        return {
            id: doc.id,
            authorName: commentData.authorName,
            authorAvatar: commentData.authorAvatar || `https://placehold.co/40x40.png`,
            text: commentData.text,
            timestamp: (commentData.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        }
    });

    return { article, comments };
}


export default async function ArticlePage({ params }: { params: { id: string }}) {
  const { article, comments } = await getArticleAndComments(params.id);

  if (!article) {
      return (
        <>
            <PublicHeader />
            <main className="flex-grow flex h-[calc(100vh-8rem)] w-full items-center justify-center text-center">
              <div>
                  <h1 className="text-4xl font-bold">404</h1>
                  <p className="text-muted-foreground">Article not found or not published.</p>
                  <Button asChild className="mt-4">
                      <Link href="/">Go Home</Link>
                  </Button>
              </div>
            </main>
            <PublicFooter />
        </>
      )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <ArticleView article={article} initialComments={comments} />
      <PublicFooter />
    </div>
  );
}
