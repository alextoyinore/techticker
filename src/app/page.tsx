'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from '@/lib/firebase';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import WidgetRenderer from '@/components/widget-renderer';
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
  isHomepage?: boolean;
}

export default function HomePage() {
  const [homepageLayout, setHomepageLayout] = useState<Layout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getHomepageLayout = async () => {
      try {
        const layoutsRef = collection(db, 'layouts');
        const homepageQuery = query(layoutsRef, where('isHomepage', '==', true), limit(1));
        const homepageSnapshot = await getDocs(homepageQuery);

        if (homepageSnapshot.empty) {
          setHomepageLayout(null);
        } else {
          const doc = homepageSnapshot.docs[0];
          setHomepageLayout({ id: doc.id, ...doc.data() } as Layout);
        }
      } catch (error) {
        console.error("Error fetching homepage layout:", error);
        setHomepageLayout(null);
      } finally {
        setLoading(false);
      }
    };

    getHomepageLayout();
  }, []);

  const renderLoadingSkeleton = () => {
    // Basic skeleton for a layout
    return (
      <div className="container mx-auto py-8 px-4 space-y-8">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return renderLoadingSkeleton();
    }
  
    if (!homepageLayout) {
      return (
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p className="text-muted-foreground">No homepage has been set yet.</p>
          </div>
        </main>
      );
    }
  
    const LayoutComponent = layoutComponents[homepageLayout.templateId] || FullWidthLayout;
    const zones = homepageLayout.zones || {};
    const renderedZones: { [key: string]: React.ReactNode } = {};
  
    for (const zoneName in zones) {
      const widgetIds = zones[zoneName] as string[];
      if (widgetIds && widgetIds.length > 0) {
        renderedZones[zoneName] = (
          <div className="space-y-8">
            {widgetIds.map(widgetId => (
              <WidgetRenderer key={widgetId} widgetId={widgetId} />
            ))}
          </div>
        );
      }
    }
    
    return (
      <main className="flex-grow">
        <LayoutComponent {...renderedZones} />
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
