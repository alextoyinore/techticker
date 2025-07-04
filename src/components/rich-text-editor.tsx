"use client"

import { Plate, useEditorRef, toggleElement } from "@udecode/plate-common";
import { Editable } from "slate-react";
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { MARK_HIGHLIGHT } from "@udecode/plate-highlight";
import { ELEMENT_BLOCKQUOTE } from "@udecode/plate-block-quote";
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from "@udecode/plate-heading";
import { ELEMENT_OL, ELEMENT_UL } from "@udecode/plate-list";
import { insertTable } from "@udecode/plate-table";
import {
    Quote,
    Bold,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Italic,
    List,
    ListOrdered,
    Strikethrough,
    Table,
    Underline,
} from 'lucide-react';

import { plugins } from "@/lib/plate-plugins";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { PlateMarkToolbarButton, Toolbar, ToolbarGroup } from "./plate-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';


const toggleBlock = (editor: any, format: string) => {
    toggleElement(editor, {
      key: format,
    });
};

export default function RichTextEditor() {
    const editor = useEditorRef();
    return (
    <Plate plugins={plugins}>
      <div className="relative">
        <Toolbar className="flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 p-2 bg-secondary/50">
            <ToolbarGroup>
                <PlateMarkToolbarButton nodeType={MARK_BOLD} tooltip="Bold (⌘+B)">
                    <Bold className="h-4 w-4" />
                </PlateMarkToolbarButton>
                <PlateMarkToolbarButton nodeType={MARK_ITALIC} tooltip="Italic (⌘+I)">
                    <Italic className="h-4 w-4" />
                </PlateMarkToolbarButton>
                <PlateMarkToolbarButton nodeType={MARK_UNDERLINE} tooltip="Underline (⌘+U)">
                    <Underline className="h-4 w-4" />
                </PlateMarkToolbarButton>
                <PlateMarkToolbarButton nodeType={MARK_STRIKETHROUGH} tooltip="Strikethrough (⌘+⇧+X)">
                    <Strikethrough className="h-4 w-4" />
                </PlateMarkToolbarButton>
                <PlateMarkToolbarButton nodeType={MARK_CODE} tooltip="Code (⌘+E)">
                    <Code className="h-4 w-4" />
                </PlateMarkToolbarButton>
                 <PlateMarkToolbarButton nodeType={MARK_HIGHLIGHT} tooltip="Highlight (⌘+⇧+H)">
                    <Highlighter className="h-4 w-4" />
                </PlateMarkToolbarButton>
            </ToolbarGroup>
            <Separator orientation="vertical" className="h-6 mx-1" />
             <ToolbarGroup>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleBlock(editor, ELEMENT_H1)}><Heading1 className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleBlock(editor, ELEMENT_H2)}><Heading2 className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleBlock(editor, ELEMENT_H3)}><Heading3 className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleBlock(editor, ELEMENT_BLOCKQUOTE)}><Quote className="h-4 w-4" /></Button>
            </ToolbarGroup>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <ToolbarGroup>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleBlock(editor, ELEMENT_UL)}><List className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleBlock(editor, ELEMENT_OL)}><ListOrdered className="h-4 w-4" /></Button>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <Table className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                    <DropdownMenuItem
                        onSelect={() => {
                        insertTable(editor);
                        }}
                    >
                        Insert Table
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </ToolbarGroup>
        </Toolbar>
        <div className="rounded-b-md border-input border p-4">
             <Editable 
                placeholder="Start writing your masterpiece..."
                className="min-h-[400px] focus-visible:ring-0 focus-visible:ring-offset-0 border-none p-0"
                autoFocus
             />
        </div>
      </div>
    </Plate>
  );
}
