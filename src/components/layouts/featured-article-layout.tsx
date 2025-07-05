import React from 'react';

interface FeaturedArticleLayoutProps {
  hero?: React.ReactNode;
  left_column?: React.ReactNode;
  right_column?: React.ReactNode;
}

export default function FeaturedArticleLayout({ hero, left_column, right_column }: FeaturedArticleLayoutProps) {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <section className="w-full">
        {hero}
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          {left_column}
        </div>
        <div className="space-y-8">
          {right_column}
        </div>
      </div>
    </div>
  );
}
