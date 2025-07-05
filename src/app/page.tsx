import { adminDb } from '@/lib/firebase-admin';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import WidgetRenderer, { type Article, type Widget } from '@/components/widget-renderer';
import { Skeleton } from '@/components/ui/skeleton';
import type { Timestamp } from 'firebase-admin/firestore';

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

async function getWidgetWithArticles(widgetId: string): Promise<{ widget: Widget; articles: Article[] }> {
    const widgetRef = adminDb.collection('widgets').doc(widgetId);
    const widgetDoc = await widgetRef.get();
    
    if (!widgetDoc.exists) {
        throw new Error(`Widget with id ${widgetId} not found.`);
    }

    const widget = { id: widgetDoc.id, ...widgetDoc.data() } as Widget;

    const config = widget.config;
    let articlesQuery: admin.firestore.Query = adminDb.collection('articles').where('status', '==', 'Published');

    if (config && config.value) {
        if (config.type === 'category') {
             const categoriesRef = adminDb.collection('categories');
             const categoryQuery = categoriesRef.where('name', '==', config.value).limit(1);
             const categorySnapshot = await categoryQuery.get();
             if (!categorySnapshot.empty) {
                 const categoryId = categorySnapshot.docs[0].id;
                 articlesQuery = articlesQuery.where('categoryId', '==', categoryId);
             } else {
                 return { widget, articles: [] }; // Category not found
             }
        } else if (config.type === 'tag') {
            articlesQuery = articlesQuery.where('tags', 'array-contains', config.value);
        }
    }

    articlesQuery = articlesQuery.orderBy('createdAt', 'desc').limit(config?.limit || 5);
    const articlesSnapshot = await articlesQuery.get();
    
    const articles = articlesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            excerpt: data.excerpt,
            featuredImage: data.featuredImage || 'https://placehold.co/600x400.png',
            url: `/article/${doc.id}`,
            authorName: data.authorName,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        }
    });

    return { widget, articles };
}


async function getHomepageLayout() {
    try {
        const layoutsRef = adminDb.collection('layouts');
        const homepageQuery = layoutsRef.where('isHomepage', '==', true).limit(1);
        const homepageSnapshot = await homepageQuery.get();

        if (homepageSnapshot.empty) {
            return null;
        }
        
        const doc = homepageSnapshot.docs[0];
        const layoutData = { id: doc.id, ...doc.data() } as Layout;

        const renderedZones: { [key: string]: React.ReactNode } = {};
        const zones = layoutData.zones || {};

        for (const zoneName in zones) {
            const widgetIds = zones[zoneName] || [];
            if (widgetIds.length > 0) {
                const widgetDataPromises = widgetIds.map(getWidgetWithArticles);
                const widgetsWithArticles = await Promise.all(widgetDataPromises);

                renderedZones[zoneName] = (
                    <div className="space-y-8">
                        {widgetsWithArticles.map(({ widget, articles }) => (
                            <WidgetRenderer key={widget.id} widget={widget} articles={articles} />
                        ))}
                    </div>
                );
            }
        }

        return { layout: layoutData, zones: renderedZones };
    } catch (error) {
        console.error("Error fetching homepage layout:", error);
        return null;
    }
}

export default async function HomePage() {
  const data = await getHomepageLayout();

  const renderContent = () => {
    if (!data) {
      return (
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p className="text-muted-foreground">No homepage has been set yet.</p>
          </div>
        </main>
      );
    }
  
    const { layout, zones } = data;
    const LayoutComponent = layoutComponents[layout.templateId] || FullWidthLayout;
    
    return (
      <main className="flex-grow">
        <LayoutComponent {...zones} />
      </main>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      {renderContent()}
      <PublicFooter />
    </div>
  );
}
