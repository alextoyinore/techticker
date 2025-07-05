import React from 'react';

interface MagazineHomepageLayoutProps {
  hero?: React.ReactNode;
  main_content?: React.ReactNode;
  sidebar?: React.ReactNode;
}

export default function MagazineHomepageLayout({ hero, main_content, sidebar }: MagazineHomepageLayoutProps) {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <section className="w-full">
        {hero}
      </section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <main className="md:col-span-2 space-y-8">
          {main_content}
        </main>
        <aside className="md:col-span-1 space-y-8">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}
