'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, Plus } from "lucide-react";
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

export default function LayoutsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-1 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Layout Builder</CardTitle>
            <CardDescription>Drag widgets onto the page to build your layout.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Widgets</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3">
                        <Skeleton className="h-5 w-5" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                ))
            ) : (
                widgets.map((widget) => (
                <div key={widget.id} className="flex items-center gap-4 p-3 border rounded-lg bg-secondary/50 cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div>
                    <h3 className="font-semibold">{widget.name}</h3>
                    <p className="text-sm text-muted-foreground">{widget.description}</p>
                    </div>
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
          <CardContent className="flex-1 border-4 border-dashed rounded-lg m-6 p-6 flex flex-col items-center justify-center gap-4 text-center bg-background">
            <div className="w-full p-8 border-2 border-dashed rounded-lg">
              <h3 className="font-semibold">Hero Section</h3>
              <p className="text-sm text-muted-foreground">Placeholder</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-8 border-2 border-dashed rounded-lg">
                <h3 className="font-semibold">Featured Post</h3>
                <p className="text-sm text-muted-foreground">Placeholder</p>
              </div>
              <div className="p-8 border-2 border-dashed rounded-lg">
                <h3 className="font-semibold">Featured Post</h3>
                <p className="text-sm text-muted-foreground">Placeholder</p>
              </div>
            </div>
             <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Plus className="h-4 w-4" />
                Add Section
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
