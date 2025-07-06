import React from 'react';

interface GridShowcaseLayoutProps {
  showcase?: React.ReactNode;
}

export default function GridShowcaseLayout({ showcase }: GridShowcaseLayoutProps) {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {showcase}
      </div>
    </div>
  );
}
