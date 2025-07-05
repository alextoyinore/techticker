import { adminDb } from '@/lib/firebase-admin';
import PublicHeader from '@/components/public-header';
import PublicFooter from '@/components/public-footer';
import WidgetRenderer from '@/components/widget-renderer';

import ClassicBlogLayout from '@/components/layouts/classic-blog-layout';
import FeaturedArticleLayout from '@/components/layouts/featured-article-layout';
import MagazineHomepageLayout from '@/components/layouts/magazine-homepage-layout';
import ThreeColumnLayout from '@/components/layouts/three-column-layout';
import GridShowcaseLayout from '@/components/layouts/grid-showcase-layout';
import FullWidthLayout from '@/components/layouts/full-width-layout';

// Define a map from template ID to component
const layoutComponents: Record<string, React.ComponentType<any>> = {
  'classic-blog': ClassicBlogLayout,
  'featured-article': FeaturedArticleLayout,
  'magazine-homepage': MagazineHomepageLayout,
  'three-column': ThreeColumnLayout,
  'grid-showcase': GridShowcaseLayout,
  'full-width': FullWidthLayout,
};

async function getHomepageLayout() {
  const layoutsRef = adminDb.collection('layouts');
  const homepageQuery = layoutsRef.where('isHomepage', '==', true).limit(1);
  const homepageSnapshot = await homepageQuery.get();

  if (homepageSnapshot.empty) {
    return null;
  }

  const doc = homepageSnapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export default async function HomePage() {
  const homepageLayout = await getHomepageLayout();

  if (!homepageLayout) {
    return (
      <div className="flex flex-col min-h-screen">
        <PublicHeader />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p className="text-muted-foreground">No homepage has been set yet.</p>
          </div>
        </main>
        <PublicFooter />
      </div>
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
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-grow">
        <LayoutComponent {...renderedZones} />
      </main>
      <PublicFooter />
    </div>
  );
}
