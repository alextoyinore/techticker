import React from 'react';

interface ClassicBlogLayoutProps {
  main?: React.ReactNode;
  sidebar?: React.ReactNode;
}

export default function ClassicBlogLayout({ main, sidebar }: ClassicBlogLayoutProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <main className="md:col-span-3 space-y-8">
          {main}
        </main>
        <aside className="md:col-span-1 space-y-8">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}
