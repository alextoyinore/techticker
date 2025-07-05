import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export interface Article {
    id: string;
    title: string;
    excerpt: string;
    featuredImage: string;
    url: string;
    authorName?: string;
    createdAt?: string;
}

export interface Widget {
    id: string;
    name: string;
    html: string;
    config?: {
        type: 'category' | 'tag';
        value: string;
        limit: number;
    }
}

function parseAndRenderWidget(html: string, articles: Article[]): string {
    let renderedHtml = html;

    const renderTemplate = (template: string, article: Article) => {
        let finalTemplate = template
            .replace(/\{\{title\}\}/g, article.title || '')
            .replace(/\{\{excerpt\}\}/g, article.excerpt || '')
            .replace(/\{\{featuredImage\}\}/g, article.featuredImage || 'https://placehold.co/600x400.png')
            .replace(/\{\{url\}\}/g, article.url || '');
        
        if (article.authorName) {
            finalTemplate = finalTemplate.replace(/\{\{authorName\}\}/g, article.authorName);
        }
        if (article.createdAt) {
            const formattedDate = format(new Date(article.createdAt), 'MMMM d, yyyy');
            finalTemplate = finalTemplate.replace(/\{\{createdAt\}\}/g, formattedDate);
        }
        
        // Clean up any un-replaced placeholders
        finalTemplate = finalTemplate.replace(/\{\{authorName\}\}/g, '');
        finalTemplate = finalTemplate.replace(/\{\{createdAt\}\}/g, '');

        return finalTemplate;
    };

    // Handle loop-first
    renderedHtml = renderedHtml.replace(/<!-- loop-first start -->(.*?)<!-- loop-first end -->/gs, (_, template) => {
        if (articles.length === 0) return '';
        const article = articles[0];
        return renderTemplate(template, article);
    });

    // Handle loop-rest
    renderedHtml = renderedHtml.replace(/<!-- loop-rest start -->(.*?)<!-- loop-rest end -->/gs, (_, template) => {
        if (articles.length <= 1) return '';
        return articles.slice(1).map(article => renderTemplate(template, article)).join('');
    });

    // Handle standard loop
    renderedHtml = renderedHtml.replace(/<!-- loop start -->(.*?)<!-- loop end -->/gs, (_, template) => {
        if (articles.length === 0) return '';
        return articles.map(article => renderTemplate(template, article)).join('');
    });

    return renderedHtml;
}


export default function WidgetRenderer({ widget, articles }: { widget: Widget, articles: Article[] }) {
    if (!widget || !widget.html) {
         return (
            <div className="p-4 border border-destructive/50 rounded-md text-destructive bg-destructive/10 flex items-start gap-4">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                <div>
                    <p className="font-bold">Widget Failed to Render</p>
                    <p className="text-sm">The widget data is missing or invalid.</p>
                </div>
            </div>
        );
    }

    const renderedHtml = parseAndRenderWidget(widget.html, articles);

    if (renderedHtml) {
      return <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
    }

    return null;
}
