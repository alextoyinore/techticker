'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, Plus, PlusCircle, Trash2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Article {
    id: string;
    title: string;
    excerpt: string;
    featuredImage: string;
    url: string;
}

interface Widget {
  id: string;
  name: string;
  description: string;
  html: string;
  config: {
      type: 'category' | 'tag';
      value: string;
      limit: number;
  }
}

interface LayoutSection {
  id: string;
  widget: Widget;
}

function WidgetRenderer({ widget }: { widget: Widget }) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const articlesCollection = collection(db, "articles");
                let articlesQuery;
                const articleLimit = widget.config?.limit || 5;

                // If there's a config and a specific value, filter by it
                if (widget.config && widget.config.value) {
                    if (widget.config.type === 'category') {
                        articlesQuery = query(
                            articlesCollection, 
                            where("categoryId", "==", widget.config.value),
                            where("status", "==", "Published"),
                            orderBy("updatedAt", "desc"),
                            limit(articleLimit)
                        );
                    } else { // 'tag'
                        articlesQuery = query(
                            articlesCollection, 
                            where("tags", "array-contains", widget.config.value),
                            where("status", "==", "Published"),
                            orderBy("updatedAt", "desc"),
                            limit(articleLimit)
                        );
                    }
                } else { // Otherwise, fetch the latest articles
                    articlesQuery = query(
                        articlesCollection,
                        where("status", "==", "Published"),
                        orderBy("updatedAt", "desc"),
                        limit(articleLimit)
                    );
                }

                const querySnapshot = await getDocs(articlesQuery);
                const articlesData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title,
                        excerpt: data.excerpt,
                        featuredImage: data.featuredImage || 'https://placehold.co/600x400.png',
                        url: `/article/${doc.id}`,
                    }
                }) as Article[];
                setArticles(articlesData);

            } catch (error) {
                console.error(`Error fetching articles for widget ${widget.name}:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [widget]);

    const renderHtml = () => {
        if (!widget.html || articles.length === 0) return { __html: '' };

        const loopStartTag = '<!-- loop start -->';
        const loopEndTag = '<!-- loop end -->';

        const startIndex = widget.html.indexOf(loopStartTag);
        const endIndex = widget.html.indexOf(loopEndTag);
        
        if (startIndex === -1 || endIndex === -1) {
            return { __html: widget.html }; // No loop, render as is
        }

        const prefix = widget.html.substring(0, startIndex);
        const suffix = widget.html.substring(endIndex + loopEndTag.length);
        const template = widget.html.substring(startIndex + loopStartTag.length, endIndex);
        
        const content = articles.map(article => {
            return template
                .replace(/{{title}}/g, article.title)
                .replace(/{{excerpt}}/g, article.excerpt)
                .replace(/{{featuredImage}}/g, article.featuredImage)
                .replace(/{{url}}/g, article.url);
        }).join('');

        return { __html: prefix + content + suffix };
    };

    if (loading) {
        return (
            <div className="relative w-full p-8 border-2 border-dashed rounded-lg group text-left">
                <div className="flex items-center space-x-4">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    <h3 className="font-semibold">{widget.name}</h3>
                </div>
                 <Skeleton className="h-24 w-full mt-4" />
            </div>
        )
    }

    if (articles.length === 0) {
        return (
             <div className="relative w-full p-8 border-2 border-dashed rounded-lg group text-left bg-muted/50">
                <h3 className="font-semibold">{widget.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">No published articles found matching this widget's criteria.</p>
            </div>
        )
    }

    return <div dangerouslySetInnerHTML={renderHtml()} />;
}


export default function LayoutsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [layout, setLayout] = useState<LayoutSection[]>([]);

  useEffect(() => {
    const fetchWidgets = async () => {
        setLoading(true);
        try {
            const widgetsCollection = collection(db, "widgets");
            const querySnapshot = await getDocs(widgetsCollection);
            const widgetsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Widget[];
            setWidgets(widgetsData);
        } catch (error) {
            console.error("Error fetching widgets:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch widgets.' });
        } finally {
            setLoading(false);
        }
    };
    fetchWidgets();
  }, [toast]);

  const handleAddWidget = (widget: Widget) => {
    const newSection: LayoutSection = {
      id: `${widget.id}-${Date.now()}`,
      widget: widget,
    };
    setLayout(prevLayout => [...prevLayout, newSection]);
    toast({ title: 'Widget Added', description: `"${widget.name}" added to the layout.` });
  };

  const handleRemoveWidget = (sectionId: string) => {
    setLayout(prevLayout => prevLayout.filter(section => section.id !== sectionId));
    toast({ title: 'Widget Removed', description: 'The widget has been removed from the layout.' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-1 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Layout Builder</CardTitle>
            <CardDescription>Add widgets from the list to build your layout.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Available Widgets</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3">
                        <Skeleton className="h-5 w-5" />
                        <div className="flex-1 space-y-2">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-3 w-48" />
                        </div>
                         <Skeleton className="h-9 w-20" />
                    </div>
                ))
            ) : (
                widgets.map((widget) => (
                <div key={widget.id} className="flex items-center gap-4 p-3 border rounded-lg bg-secondary/50">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div className="flex-1">
                    <h3 className="font-semibold">{widget.name}</h3>
                    {widget.config && (
                       <p className="text-sm text-muted-foreground capitalize">
                            {widget.config.value ? `${widget.config.type}: ${widget.config.value}` : 'Latest Articles'}
                        </p>
                    )}
                    </div>
                     <Button size="sm" variant="outline" onClick={() => handleAddWidget(widget)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add
                    </Button>
                </div>
                ))
            )}
            { !loading && widgets.length === 0 && (
                <p className="text-sm text-muted-foreground text-center p-4">No widgets created yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card className="min-h-[600px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Homepage Layout</CardTitle>
                    <CardDescription>This is a preview of your homepage.</CardDescription>
                </div>
                <Button>Save Layout</Button>
            </CardHeader>
          <CardContent className="flex-1 border-4 border-dashed rounded-lg m-6 p-6 flex flex-col items-center gap-4 text-center bg-background">
             {layout.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>Your layout is empty.</p>
                    <p className="text-sm">Add widgets from the left panel.</p>
                </div>
            ) : (
                layout.map((section) => (
                    <div key={section.id} className="relative w-full group text-left">
                        <WidgetRenderer widget={section.widget} />
                        <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute -top-4 -right-4 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={() => handleRemoveWidget(section.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))
            )}
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-auto pt-4">
                <Plus className="h-4 w-4" />
                Add Section
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
