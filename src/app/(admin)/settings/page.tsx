import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const categories = ["Technology", "Science", "AI", "Startups", "Gadgets"]

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
        <div className="mb-4">
            <h1 className="font-headline text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your site settings and preferences.</p>
        </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Identity</CardTitle>
            <CardDescription>Update your site name and logo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input id="site-name" defaultValue="TechTicker" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
               <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-secondary rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M12 12h.01"/><path d="M15.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"/><path d="M19 12a7 7 0 1 0-14 0 7 7 0 0 0 14 0Z"/><path d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"/></svg>
                </div>
                <Input id="logo" type="file" className="max-w-xs" />
               </div>
               <p className="text-sm text-muted-foreground">Recommended size: 256x256px</p>
            </div>
          </CardContent>
           <CardContent>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage the categories for your articles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="New category name" />
              <Button variant="outline" className="shrink-0">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
                {categories.map((cat) => (
                    <div key={cat} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                        <span className="text-sm font-medium">{cat}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
          </CardContent>
          <CardContent>
            <Button>Save Categories</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
