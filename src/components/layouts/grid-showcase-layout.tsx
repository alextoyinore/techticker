import React from 'react';

interface GridShowcaseLayoutProps {
  showcase?: React.ReactNode;
}

export default function GridShowcaseLayout({ showcase }: GridShowcaseLayoutProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {showcase}
      </div>
    </div>
  );
}
