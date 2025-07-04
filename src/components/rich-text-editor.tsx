"use client"
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Code,
    ImagePlus,
    Table,
    Link as LinkIcon,
  } from "lucide-react"
  import { Button } from "@/components/ui/button"
  import { Separator } from "@/components/ui/separator"
  import { Textarea } from "@/components/ui/textarea"
  
  export default function RichTextEditor() {
    return (
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 p-2 bg-secondary/50">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Underline className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="outline" size="icon" className="h-8 w-8">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Quote className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Code className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
           <Button variant="outline" size="icon" className="h-8 w-8">
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ImagePlus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Table className="h-4 w-4" />
          </Button>
        </div>
        <Textarea
          placeholder="Start writing your masterpiece..."
          className="rounded-t-none min-h-[400px] focus-visible:ring-0 focus-visible:ring-offset-0 border-input"
        />
      </div>
    )
  }
  