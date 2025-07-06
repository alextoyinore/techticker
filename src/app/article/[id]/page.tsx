import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import ArticleView from './article-view';
import type { Metadata } from 'next';

// We can't generate dynamic metadata easily without firebase-admin
// so we'll use a generic title for now.
export const metadata: Metadata = {
  title: 'Article',
};

export interface Article {
    id: string;
    title: string;
    authorName: string;
    createdAt: string; // Stored as ISO string
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

// This page now only serves to pass the ID to the client component.
export default function ArticlePage({ params }: { params: { id: string }}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <ArticleView articleId={params.id} />
      <PublicFooter />
    </div>
  );
}
