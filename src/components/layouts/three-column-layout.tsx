import React from 'react';

interface ThreeColumnLayoutProps {
  column_one?: React.ReactNode;
  column_two?: React.ReactNode;
  column_three?: React.ReactNode;
}

export default function ThreeColumnLayout({ column_one, column_two, column_three }: ThreeColumnLayoutProps) {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="space-y-8">
          {column_one}
        </div>
        <div className="space-y-8">
          {column_two}
        </div>
        <div className="space-y-8">
          {column_three}
        </div>
      </div>
    </div>
  );
}
