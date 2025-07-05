import { AlertCircle } from 'lucide-react';

export interface Article {
    id: string;
    title: string;
    excerpt: string;
    featuredImage: string;
    url: string;
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
    const loopStartTag = '<!-- loop start -->';
    const loopEndTag = '<!-- loop end -->';

    const loopStartIndex = html.indexOf(loopStartTag);
    const loopEndIndex = html.indexOf(loopEndTag);

    if (loopStartIndex === -1 || loopEndIndex === -1) {
        if (articles.length > 0) {
            console.warn(`Widget '${name}' is missing loop tags but has articles to display.`);
        }
        return html;
    }
    
    const beforeLoop = html.substring(0, loopStartIndex);
    const afterLoop = html.substring(loopEndIndex + loopEndTag.length);
    const loopContentTemplate = html.substring(loopStartIndex + loopStartTag.length, loopEndIndex);

    const renderedItems = articles.map(article => {
        let itemHtml = loopContentTemplate;
        itemHtml = itemHtml.replace(/\{\{title\}\}/g, article.title || '');
        itemHtml = itemHtml.replace(/\{\{excerpt\}\}/g, article.excerpt || '');
        itemHtml = itemHtml.replace(/\{\{featuredImage\}\}/g, article.featuredImage || 'https://placehold.co/600x400.png');
        itemHtml = itemHtml.replace(/\{\{url\}\}/g, article.url || '');
        return itemHtml;
    }).join('');

    return beforeLoop + renderedItems + afterLoop;
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
