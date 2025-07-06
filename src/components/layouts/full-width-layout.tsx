import React from 'react';

interface FullWidthLayoutProps {
  main?: React.ReactNode;
}

export default function FullWidthLayout({ main }: FullWidthLayoutProps) {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <main className="w-full space-y-8 max-w-7xl mx-auto">
        {main}
      </main>
    </div>
  );
}
