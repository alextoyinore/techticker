
import React from "react";

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  preview: React.ReactNode;
  html: string;
  zones: string[];
}

export const layoutTemplates: LayoutTemplate[] = [
  {
    id: 'classic-blog',
    name: 'Classic Blog',
    description: 'A main content area with a sidebar on the right.',
    preview: React.createElement(
        'div',
        { className: "grid grid-cols-3 gap-2 h-full" },
        React.createElement('div', { className: "col-span-2 bg-muted rounded-sm" }),
        React.createElement('div', { className: "col-span-1 bg-muted/50 rounded-sm" })
    ),
    html: `<div className="container mx-auto py-8 px-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <main className="md:col-span-2 space-y-8">
            {{{main}}}
        </main>
        <aside className="md:col-span-1 space-y-8">
            {{{sidebar}}}
        </aside>
    </div>
</div>`,
    zones: ['main', 'sidebar'],
  },
  {
    id: 'featured-article',
    name: 'Featured Article',
    description: 'A full-width featured section, with two columns below.',
    preview: React.createElement(
        'div',
        { className: "flex flex-col gap-2 h-full" },
        React.createElement('div', { className: "h-1/2 bg-muted rounded-sm" }),
        React.createElement(
            'div',
            { className: "grid grid-cols-2 gap-2 flex-grow" },
            React.createElement('div', { className: "bg-muted/50 rounded-sm" }),
            React.createElement('div', { className: "bg-muted/50 rounded-sm" })
        )
    ),
    html: `<div className="container mx-auto py-8 px-4 space-y-8">
    <section className="w-full">
        {{{hero}}}
    </section>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
            {{{left_column}}}
        </div>
        <div className="space-y-8">
            {{{right_column}}}
        </div>
    </div>
</div>`,
    zones: ['hero', 'left_column', 'right_column'],
  },
  {
    id: 'three-column',
    name: 'Three Column',
    description: 'Three equal-width columns for displaying content.',
    preview: React.createElement(
        'div',
        { className: "grid grid-cols-3 gap-2 h-full" },
        React.createElement('div', { className: "bg-muted/50 rounded-sm" }),
        React.createElement('div', { className: "bg-muted/50 rounded-sm" }),
        React.createElement('div', { className: "bg-muted/50 rounded-sm" })
    ),
    html: `<div className="container mx-auto py-8 px-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-8">
            {{{column_one}}}
        </div>
        <div className="space-y-8">
            {{{column_two}}}
        </div>
        <div className="space-y-8">
            {{{column_three}}}
        </div>
    </div>
</div>`,
    zones: ['column_one', 'column_two', 'column_three'],
  },
  {
    id: 'full-width',
    name: 'Full Width',
    description: 'A single, full-width content area.',
    preview: React.createElement('div', { className: "bg-muted rounded-sm h-full w-full" }),
    html: `<div className="container mx-auto py-8 px-4">
    <main className="w-full space-y-8">
        {{{main}}}
    </main>
</div>`,
    zones: ['main'],
  },
];
