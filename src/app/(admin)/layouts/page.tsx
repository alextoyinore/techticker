'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, Plus, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Widget {
  id: string;
  name: string;
  description: string;
}

interface LayoutSection {
  id: string;
  widget: Widget;
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
                    <p className="text-sm text-muted-foreground">{widget.description}</p>
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
                    <div key={section.id} className="relative w-full p-8 border-2 border-dashed rounded-lg group text-left">
                        <h3 className="font-semibold">{section.widget.name}</h3>
                        <p className="text-sm text-muted-foreground">{section.widget.description}</p>
                        <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
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
