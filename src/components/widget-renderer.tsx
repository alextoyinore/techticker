'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc, orderBy } from 'firebase/firestore';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Article {
    id: string;
    title: string;
    excerpt: string;
    featuredImage: string;
    url: string;
}

interface Widget {
    id: string;
    name: string;
    html: string;
    config?: {
        type: 'category' | 'tag';
        value: string;
        limit: number;
    }
}

function parseAndRenderWidget(html: string, articles: Article[]): string {
    const loopStartTag = '<!-- loop start -->';
    const loopEndTag = '<!-- loop end -->';

    const loopStartIndex = html.indexOf(loopStartTag);
    const loopEndIndex = html.indexOf(loopEndTag);

    if (loopStartIndex === -1 || loopEndIndex === -1) {
        return html; // No loop found, return original HTML
    }
    
    const beforeLoop = html.substring(0, loopStartIndex);
    const afterLoop = html.substring(loopEndIndex + loopEndTag.length);
    const loopContentTemplate = html.substring(loopStartIndex + loopStartTag.length, loopEndIndex);

    const renderedItems = articles.map(article => {
        let itemHtml = loopContentTemplate;
        itemHtml = itemHtml.replace(/\{\{title\}\}/g, article.title || '');
        itemHtml = itemHtml.replace(/\{\{excerpt\}\}/g, article.excerpt || '');
        itemHtml = itemHtml.replace(/\{\{featuredImage\}\}/g, article.featuredImage || '');
        itemHtml = itemHtml.replace(/\{\{url\}\}/g, article.url || '');
        return itemHtml;
    }).join('');

    return beforeLoop + renderedItems + afterLoop;
}


export default function WidgetRenderer({ widgetId }: { widgetId: string }) {
    const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState('');

    useEffect(() => {
        const fetchWidgetAndArticles = async () => {
            setLoading(true);
            setError(null);
            try {
                // Get Widget
                const widgetRef = doc(db, 'widgets', widgetId);
                const widgetDoc = await getDoc(widgetRef);
                if (!widgetDoc.exists() || !widgetDoc.data()?.html) {
                    throw new Error('Widget not found or has no HTML content.');
                }
                const widget = { id: widgetDoc.id, ...widgetDoc.data() } as Widget;

                // Get Articles
                const config = widget.config;
                let articlesQuery: any = query(collection(db, 'articles'), where('status', '==', 'Published'));

                if (config && config.value) {
                    if (config.type === 'category') {
                        const categoriesRef = collection(db, 'categories');
                        const categoryQuery = query(categoriesRef, where('name', '==', config.value), limit(1));
                        const categorySnapshot = await getDocs(categoryQuery);
                        if (!categorySnapshot.empty) {
                            const categoryId = categorySnapshot.docs[0].id;
                            articlesQuery = query(articlesQuery, where('categoryId', '==', categoryId));
                        } else {
                            // Category not found, return no articles
                           setRenderedHtml(parseAndRenderWidget(widget.html, []));
                           setLoading(false);
                           return;
                        }
                    } else if (config.type === 'tag') {
                        articlesQuery = query(articlesQuery, where('tags', 'array-contains', config.value));
                    }
                }
                
                articlesQuery = query(articlesQuery, orderBy('updatedAt', 'desc'), limit(config?.limit || 5));
                const articlesSnapshot = await getDocs(articlesQuery);
                
                const articles = articlesSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title,
                        excerpt: data.excerpt,
                        featuredImage: data.featuredImage || 'https://placehold.co/600x400.png',
                        url: `/article/${doc.id}`,
                    }
                });

                setRenderedHtml(parseAndRenderWidget(widget.html, articles));

            } catch (err: any) {
                const isIndexError = err.code === 'failed-precondition' || (err.message && (err.message.toLowerCase().includes('requires an index')));
                if (isIndexError) {
                    setError('Database Index Required');
                    setErrorDetails('This widget requires a database index that has not been created yet. Please go to the Firebase console to create it.');
                } else {
                    console.error(`Error rendering widget ${widgetId}:`, err);
                    setError('Widget Failed to Render');
                    setErrorDetails('An unexpected error occurred.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchWidgetAndArticles();
    }, [widgetId]);

    if (loading) {
        return <Skeleton className="h-48 w-full" />;
    }

    if (error) {
        return (
            <div className="p-4 border border-destructive/50 rounded-md text-destructive bg-destructive/10 flex items-start gap-4">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                <div>
                    <p className="font-bold">{error}</p>
                    <p className="text-sm">{errorDetails}</p>
                    <p className="text-xs mt-2 text-destructive/70">Widget ID: {widgetId}</p>
                </div>
            </div>
        );
    }

    if (renderedHtml) {
      return <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
    }

    return null;
}
