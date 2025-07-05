import React from "react";

export interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  preview: React.ReactNode;
  html: string;
}

export const widgetTemplates: WidgetTemplate[] = [
  {
    id: 'grid-view',
    name: 'Grid View',
    description: 'A responsive grid of articles with images and titles.',
    preview: React.createElement(
      'div',
      { className: "grid grid-cols-2 gap-1 h-full" },
      React.createElement('div', { className: "bg-muted rounded-sm" }),
      React.createElement('div', { className: "bg-muted/50 rounded-sm" }),
      React.createElement('div', { className: "bg-muted/50 rounded-sm" }),
      React.createElement('div', { className: "bg-muted rounded-sm" }),
    ),
    html: `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- loop start -->
    <div class="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
        <a href="{{url}}" class="block">
            <img src="{{featuredImage}}" alt="{{title}}" class="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105" data-ai-hint="technology abstract">
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            <div class="absolute bottom-0 p-4">
                <h3 class="text-white font-bold text-lg leading-tight">{{title}}</h3>
            </div>
        </a>
    </div>
    <!-- loop end -->
</div>`,
  },
  {
    id: 'simple-list',
    name: 'Simple List',
    description: 'A vertical list of articles with a small image, title, and excerpt.',
    preview: React.createElement(
      'div',
      { className: "flex flex-col gap-1 h-full" },
      React.createElement('div', { className: "flex items-center gap-1" }, React.createElement('div', {className: "w-4 h-4 bg-muted rounded-sm"}), React.createElement('div', {className: "w-full h-2 bg-muted/50 rounded-sm"})),
      React.createElement('div', { className: "flex items-center gap-1" }, React.createElement('div', {className: "w-4 h-4 bg-muted rounded-sm"}), React.createElement('div', {className: "w-full h-2 bg-muted/50 rounded-sm"})),
      React.createElement('div', { className: "flex items-center gap-1" }, React.createElement('div', {className: "w-4 h-4 bg-muted rounded-sm"}), React.createElement('div', {className: "w-full h-2 bg-muted/50 rounded-sm"})),
    ),
    html: `<div class="space-y-1">
    <!-- loop start -->
    <a href="{{url}}" class="flex items-center gap-4 group p-2 rounded-lg hover:bg-muted transition-colors">
        <img src="{{featuredImage}}" alt="{{title}}" class="w-20 h-20 object-cover rounded-md flex-shrink-0" data-ai-hint="gadget tech">
        <div class="flex-grow">
            <h3 class="font-semibold text-lg group-hover:text-primary">{{title}}</h3>
            <p class="text-sm text-muted-foreground line-clamp-2">{{excerpt}}</p>
            <p class="text-xs text-muted-foreground mt-1">{{authorName}} &bull; {{updatedAt}}</p>
        </div>
    </a>
    <!-- loop end -->
</div>`,
  },
  {
    id: 'featured-list',
    name: 'Featured Article + List',
    description: 'A large featured article at the top, followed by a list of smaller articles.',
    preview: React.createElement(
        'div',
        { className: "flex flex-col gap-1 h-full" },
        React.createElement('div', { className: "h-1/2 bg-muted rounded-sm" }),
        React.createElement('div', { className: "flex items-center gap-1 mt-1" }, React.createElement('div', {className: "w-4 h-2 bg-muted/50 rounded-sm"}), React.createElement('div', {className: "w-full h-2 bg-muted/50 rounded-sm"})),
        React.createElement('div', { className: "flex items-center gap-1" }, React.createElement('div', {className: "w-4 h-2 bg-muted/50 rounded-sm"}), React.createElement('div', {className: "w-full h-2 bg-muted/50 rounded-sm"})),
    ),
    html: `<div>
    <!-- loop-first start -->
    <a href="{{url}}" class="block group relative overflow-hidden rounded-lg shadow-lg mb-6">
        <img src="{{featuredImage}}" alt="{{title}}" class="w-full h-80 object-cover transform transition-transform duration-300 group-hover:scale-105" data-ai-hint="technology future">
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div class="absolute bottom-0 p-6">
            <h2 class="text-white text-3xl font-bold leading-tight">{{title}}</h2>
            <p class="text-gray-300 mt-2 line-clamp-2">{{excerpt}}</p>
        </div>
    </a>
    <!-- loop-first end -->
    <div class="space-y-1">
        <!-- loop-rest start -->
        <a href="{{url}}" class="flex items-center gap-4 group p-2 rounded-lg hover:bg-muted transition-colors">
            <img src="{{featuredImage}}" alt="{{title}}" class="w-16 h-16 object-cover rounded-md flex-shrink-0" data-ai-hint="circuit board">
            <div>
                <h3 class="font-semibold group-hover:text-primary">{{title}}</h3>
            </div>
        </a>
        <!-- loop-rest end -->
    </div>
</div>`,
  },
  {
    id: 'large-image-list',
    name: 'Large Image List',
    description: 'A single column list with large, full-width images for each article.',
    preview: React.createElement(
      'div',
      { className: "flex flex-col gap-1 h-full" },
      React.createElement('div', { className: "h-1/3 bg-muted rounded-sm" }),
      React.createElement('div', { className: "h-1/3 bg-muted/50 rounded-sm" }),
      React.createElement('div', { className: "h-1/3 bg-muted rounded-sm" }),
    ),
    html: `<div class="space-y-8">
    <!-- loop start -->
    <a href="{{url}}" class="block group">
        <div class="overflow-hidden rounded-lg">
            <img src="{{featuredImage}}" alt="{{title}}" class="w-full h-64 object-cover transform transition-transform duration-300 group-hover:scale-105" data-ai-hint="modern city">
        </div>
        <div class="mt-4">
            <h2 class="text-2xl font-bold group-hover:text-primary">{{title}}</h2>
            <p class="text-muted-foreground mt-2 line-clamp-3">{{excerpt}}</p>
            <p class="text-sm text-muted-foreground mt-2">{{authorName}} &bull; {{updatedAt}}</p>
        </div>
    </a>
    <!-- loop end -->
</div>`
  },
  {
    id: 'text-only-list',
    name: 'Text-Only List',
    description: 'A compact, text-only list of article titles. Ideal for sidebars.',
    preview: React.createElement(
      'div',
      { className: "flex flex-col gap-1 h-full" },
      React.createElement('div', { className: "w-full h-2 bg-muted/50 rounded-sm" }),
      React.createElement('div', { className: "w-3/4 h-2 bg-muted/50 rounded-sm" }),
      React.createElement('div', { className: "w-full h-2 bg-muted/50 rounded-sm" }),
      React.createElement('div', { className: "w-1/2 h-2 bg-muted/50 rounded-sm" }),
      React.createElement('div', { className: "w-5/6 h-2 bg-muted/50 rounded-sm" }),
    ),
    html: `<ul class="space-y-2">
    <!-- loop start -->
    <li>
      <a href="{{url}}" class="font-medium hover:text-primary hover:underline transition-colors">{{title}}</a>
    </li>
    <!-- loop end -->
</ul>`
  }
];
