import React from 'react';

interface ClassicBlogLayoutProps {
  main?: React.ReactNode;
  sidebar?: React.ReactNode;
}

export default function ClassicBlogLayout({ main, sidebar }: ClassicBlogLayoutProps) {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
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
