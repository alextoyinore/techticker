import { adminDb } from '@/lib/firebase-admin';
import { AlertCircle } from 'lucide-react';

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

async function getWidget(widgetId: string): Promise<Widget | null> {
    const doc = await adminDb.collection('widgets').doc(widgetId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Widget;
}

async function getArticles(config: Widget['config']): Promise<Article[]> {
    let articlesQuery = adminDb.collection('articles').where('status', '==', 'Published');

    if (config && config.value) {
        if (config.type === 'category') {
            // We need to fetch the category ID from the category name first.
            // This assumes category names are unique.
            const categoriesRef = adminDb.collection('categories');
            const categoryQuery = categoriesRef.where('name', '==', config.value).limit(1);
            const categorySnapshot = await categoryQuery.get();
            if (!categorySnapshot.empty) {
                const categoryId = categorySnapshot.docs[0].id;
                articlesQuery = articlesQuery.where('categoryId', '==', categoryId);
            } else {
                 return []; // Category not found, return no articles
            }
        } else if (config.type === 'tag') {
            articlesQuery = articlesQuery.where('tags', 'array-contains', config.value);
        }
    }
    
    articlesQuery = articlesQuery.orderBy('updatedAt', 'desc').limit(config?.limit || 5);
    
    const snapshot = await articlesQuery.get();

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            excerpt: data.excerpt,
            featuredImage: data.featuredImage || 'https://placehold.co/600x400.png',
            url: `/article/${doc.id}`,
        }
    });
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
        // Basic Handlebars-style replacement
        itemHtml = itemHtml.replace(/\{\{title\}\}/g, article.title || '');
        itemHtml = itemHtml.replace(/\{\{excerpt\}\}/g, article.excerpt || '');
        itemHtml = itemHtml.replace(/\{\{featuredImage\}\}/g, article.featuredImage || '');
        itemHtml = itemHtml.replace(/\{\{url\}\}/g, article.url || '');
        return itemHtml;
    }).join('');

    return beforeLoop + renderedItems + afterLoop;
}


export default async function WidgetRenderer({ widgetId }: { widgetId: string }) {
    try {
        const widget = await getWidget(widgetId);

        if (!widget || !widget.html) {
            return (
                <div className="p-4 border border-dashed rounded-md text-muted-foreground">
                    <p>Widget not found or has no HTML content.</p>
                    <p className="text-xs">ID: {widgetId}</p>
                </div>
            );
        }
        
        const articles = await getArticles(widget.config);
        const renderedHtml = parseAndRenderWidget(widget.html, articles);

        return <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
    } catch (error: any) {
        // Check for Firestore index error
        const isIndexError = error.code === 'FAILED_PRECONDITION' || (error.message && (error.message.includes('requires an index') || error.message.includes('needs an index')));
        if (isIndexError) {
             return (
                <div className="p-4 border border-destructive/50 rounded-md text-destructive bg-destructive/10 flex items-start gap-4">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                    <div>
                        <p className="font-bold">Database Index Required</p>
                        <p className="text-sm">This widget requires a database index that has not been created yet. Please go to the Firebase console to create it.</p>
                        <p className="text-xs mt-2 text-destructive/70">Widget ID: {widgetId}</p>
                    </div>
                </div>
            );
        }

        // Generic error for other issues
        console.error(`Error rendering widget ${widgetId}:`, error);
        return (
            <div className="p-4 border border-dashed rounded-md text-muted-foreground flex items-start gap-4">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                 <div>
                    <p className="font-bold">Widget Failed to Render</p>
                    <p className="text-sm">An unexpected error occurred.</p>
                    <p className="text-xs mt-2">ID: {widgetId}</p>
                </div>
            </div>
        );
    }
}
