
import { adminDb } from '@/lib/firebase-admin';
import type { Timestamp } from 'firebase-admin/firestore';

import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import WidgetRenderer, { type Article, type Widget } from '@/components/widget-renderer';

import ClassicBlogLayout from '@/components/layouts/classic-blog-layout';
import FeaturedArticleLayout from '@/components/layouts/featured-article-layout';
import MagazineHomepageLayout from '@/components/layouts/magazine-homepage-layout';
import ThreeColumnLayout from '@/components/layouts/three-column-layout';
import GridShowcaseLayout from '@/components/layouts/grid-showcase-layout';
import FullWidthLayout from '@/components/layouts/full-width-layout';

const layoutComponents: Record<string, React.ComponentType<any>> = {
  'classic-blog': ClassicBlogLayout,
  'featured-article': FeaturedArticleLayout,
  'magazine-homepage': MagazineHomepageLayout,
  'three-column': ThreeColumnLayout,
  'grid-showcase': GridShowcaseLayout,
  'full-width': FullWidthLayout,
};

interface Layout {
  id: string;
  templateId: string;
  zones: Record<string, string[]>;
}

async function getWidgetWithArticles(widgetId: string): Promise<{ widget: Widget; articles: Article[] } | null> {
    const widgetRef = adminDb.collection('widgets').doc(widgetId);
    const widgetDoc = await widgetRef.get();
    
    if (!widgetDoc.exists) {
        console.error(`Error: Widget with id ${widgetId} not found, but is referenced in a layout.`);
        return null;
    }

    const widget = { id: widgetDoc.id, ...widgetDoc.data() } as Widget;
    
    try {
        const config = widget.config;
        let articlesQuery: admin.firestore.Query = adminDb.collection('articles').where('status', '==', 'Published');

        let requiresCompositeIndex = false;

        if (config && config.value) {
            if (config.type === 'category') {
                 const categoriesRef = adminDb.collection('categories');
                 const categoryQuery = categoriesRef.where('name', '==', config.value).limit(1);
                 const categorySnapshot = await categoryQuery.get();
                 if (!categorySnapshot.empty) {
                     const categoryId = categorySnapshot.docs[0].id;
                     articlesQuery = articlesQuery.where('categoryId', '==', categoryId);
                     requiresCompositeIndex = true;
                 } else {
                     return { widget, articles: [] }; // Category not found, return gracefully
                 }
            } else if (config.type === 'tag') {
                articlesQuery = articlesQuery.where('tags', 'array-contains', config.value);
                requiresCompositeIndex = true;
            }
        }

        if (!requiresCompositeIndex) {
            articlesQuery = articlesQuery.orderBy('createdAt', 'desc');
        }
        
        articlesQuery = articlesQuery.limit(config?.limit || 5);

        const articlesSnapshot = await articlesQuery.get();
        
        const articles = articlesSnapshot.docs.map(doc => {
            const data = doc.data();
            const ts = data.createdAt as Timestamp;
            return {
                id: doc.id,
                title: data.title,
                excerpt: data.excerpt,
                featuredImage: data.featuredImage || 'https://placehold.co/600x400.png',
                url: `/article/${doc.id}`,
                authorName: data.authorName,
                createdAt: ts ? ts.toDate().toISOString() : new Date().toISOString(),
            }
        });

        return { widget, articles };

    } catch (err) {
        console.error(`Failed to fetch articles for widget "${widget.name}" (${widget.id}). This may be due to a missing Firestore index. Error:`, err);
        // If a query fails (e.g., missing index), return the widget with no articles so the page can still render.
        return { widget, articles: [] };
    }
}

export default async function HomePage() {
    let layoutData: { layout: Layout; zones: { [key: string]: React.ReactNode } } | null = null;
    let error: string | null = null;

    try {
        const layoutsRef = adminDb.collection('layouts');
        const homepageQuery = layoutsRef.where('isHomepage', '==', true).limit(1);
        const homepageSnapshot = await homepageQuery.get();

        if (homepageSnapshot.empty) {
            error = "No homepage has been set.";
        } else {
            const docSnap = homepageSnapshot.docs[0];
            const layout = { id: docSnap.id, ...docSnap.data() } as Layout;

            const renderedZones: { [key: string]: React.ReactNode } = {};

            const allZonePromises = Object.entries(layout.zones || {}).map(async ([zoneName, widgetIds]) => {
                if (!widgetIds || widgetIds.length === 0) {
                    return;
                }

                // Using Promise.allSettled to ensure all widgets attempt to load
                const widgetResults = await Promise.allSettled(
                    widgetIds.map(getWidgetWithArticles)
                );
                
                const validWidgetData = widgetResults
                  .filter(result => result.status === 'fulfilled' && result.value)
                  .map(result => (result as PromiseFulfilledResult<any>).value) as { widget: Widget; articles: Article[] }[];
                
                if (validWidgetData.length > 0) {
                    renderedZones[zoneName] = (
                        <div className="space-y-8">
                            {validWidgetData.map(({ widget, articles }) => (
                                <WidgetRenderer key={widget.id} widget={widget} articles={articles} />
                            ))}
                        </div>
                    );
                }
            });

            await Promise.all(allZonePromises);
            layoutData = { layout, zones: renderedZones };
        }
    } catch (err: any) {
        console.error("Error fetching homepage layout:", err);
        error = `Failed to load homepage content. ${err.message}`;
    }

    let content;
    if (error || !layoutData) {
        content = (
            <main className="flex-grow flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Welcome!</h1>
                    <p className="text-muted-foreground">{error || 'Homepage content could not be loaded.'}</p>
                </div>
            </main>
        );
    } else {
        const LayoutComponent = layoutComponents[layoutData.layout.templateId] || FullWidthLayout;
        content = (
            <main className="flex-grow">
                <LayoutComponent {...layoutData.zones} />
            </main>
        );
    }
  
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <PublicHeader />
        {content}
        <PublicFooter />
      </div>
    );
}
