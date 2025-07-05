import React from 'react';

interface FullWidthLayoutProps {
  main?: React.ReactNode;
}

export default function FullWidthLayout({ main }: FullWidthLayoutProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <main className="w-full space-y-8">
        {main}
      </main>
    </div>
  );
}
