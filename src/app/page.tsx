'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';

import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import WidgetRenderer, { type Article, type Widget } from '@/components/widget-renderer';
import { Skeleton } from '@/components/ui/skeleton';

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
    const widgetRef = doc(db, 'widgets', widgetId);
    const widgetDoc = await getDoc(widgetRef);
    
    if (!widgetDoc.exists()) {
        console.error(`Error: Widget with id ${widgetId} not found, but is referenced in a layout.`);
        return null;
    }

    const widget = { id: widgetDoc.id, ...widgetDoc.data() } as Widget;
    
    try {
        const config = widget.config;
        let articlesQuery = query(collection(db, 'articles'), where('status', '==', 'Published'));
        let requiresCompositeIndex = false;

        if (config && config.value) {
            if (config.type === 'category') {
                 const categoriesRef = collection(db, 'categories');
                 const categoryQuery = query(categoriesRef, where('name', '==', config.value), limit(1));
                 const categorySnapshot = await getDocs(categoryQuery);
                 if (!categorySnapshot.empty) {
                     const categoryId = categorySnapshot.docs[0].id;
                     articlesQuery = query(articlesQuery, where('categoryId', '==', categoryId));
                     requiresCompositeIndex = true;
                 } else {
                     return { widget, articles: [] }; // Category not found, return gracefully
                 }
            } else if (config.type === 'tag') {
                articlesQuery = query(articlesQuery, where('tags', 'array-contains', config.value));
                requiresCompositeIndex = true;
            }
        }

        if (!requiresCompositeIndex) {
            articlesQuery = query(articlesQuery, orderBy('createdAt', 'desc'));
        }
        
        articlesQuery = query(articlesQuery, limit(config?.limit || 5));

        const articlesSnapshot = await getDocs(articlesQuery);
        
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

export default function HomePage() {
  const [layoutData, setLayoutData] = useState<{ layout: Layout; zones: { [key: string]: React.ReactNode } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomepageLayout = async () => {
        setLoading(true);
        setError(null);
        try {
            const layoutsRef = collection(db, 'layouts');
            const homepageQuery = query(layoutsRef, where('isHomepage', '==', true), limit(1));
            const homepageSnapshot = await getDocs(homepageQuery);

            if (homepageSnapshot.empty) {
                setError("No homepage has been set.");
                setLoading(false);
                return;
            }
            
            const docSnap = homepageSnapshot.docs[0];
            const layout = { id: docSnap.id, ...docSnap.data() } as Layout;

            const renderedZones: { [key: string]: React.ReactNode } = {};

            const allZonePromises = Object.entries(layout.zones || {}).map(async ([zoneName, widgetIds]) => {
                if (!widgetIds || widgetIds.length === 0) {
                    return;
                }

                // Promise.all is safe because getWidgetWithArticles now catches its own errors.
                const widgetDataArray = await Promise.all(
                    widgetIds.map(getWidgetWithArticles)
                );

                const validWidgetData = widgetDataArray.filter(Boolean) as { widget: Widget; articles: Article[] }[];
                
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
            setLayoutData({ layout, zones: renderedZones });
        } catch (err) {
            console.error("Error fetching homepage layout:", err);
            setError("Failed to load homepage content.");
        } finally {
            setLoading(false);
        }
    };
    
    fetchHomepageLayout();
  }, []);

  let content;
  if (loading) {
      content = (
          <main className="flex-grow container mx-auto py-8 px-4">
              <div className="space-y-8">
                  <Skeleton className="h-64 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 space-y-4">
                          <Skeleton className="h-8 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                      </div>
                      <div className="space-y-4">
                          <Skeleton className="h-8 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                      </div>
                  </div>
              </div>
          </main>
      );
  } else if (error || !layoutData) {
      content = (
          <main className="flex-grow flex items-center justify-center">
              <div className="text-center">
                  <h1 className="text-2xl font-bold">{error || 'Welcome!'}</h1>
                  <p className="text-muted-foreground">Homepage content could not be loaded.</p>
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
