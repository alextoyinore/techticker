// All UI components for the Plate editor.
// This is a collection of components from the plate-ui documentation
// adapted for this project's shadcn/ui.
'use client';

import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  createFloatingBalloons,
  createFloatingToolbar,
  flip,
  offset,
  UseVirtualFloatingOptions,
} from '@udecode/plate-floating';
import {
  CodeBlockCombobox,
  ELEMENT_CODE_BLOCK,
  isSelectionExpanded,
  useCodeBlockElementState,
} from '@udecode/plate-code-block';
import {
  comboboxActions,
  ComboboxContent,
  ComboboxItem,
  useComboboxControls,
} from '@udecode/plate-combobox';
import {
  isCollapsed,
  PlateElement,
  useEditorRef,
  useEditorState,
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from '@udecode/plate-common';
import {
  FloatingLinkUrlInput,
  useLink,
  useLinkToolbarButton,
} from '@udecode/plate-link';
import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import {
  useTableBordersDropdownMenuContentState,
  useTableDropdownMenu,
  useTableElement,
  useTableElementState,
  useTableRowElement,
  useTableRowElementState,
  insertTable,
  useTableCellElement,
} from '@udecode/plate-table';
import React from 'react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useForm } from 'react-hook-form';
import {
  Blockquote,
  Bold,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link,
  List,
  ListOrdered,
  MoreVertical,
  Redo,
  Strikethrough,
  Table,
  Trash,
  Underline,
  Undo,
} from 'lucide-react';

import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Separator } from './ui/separator';

// Popover
export const PlatePopover = React.forwardRef<
  React.ElementRef<typeof Popover>,
  React.ComponentPropsWithoutRef<typeof Popover>
>((props, ref) => <Popover {...props} />);

PlatePopover.displayName = 'PlatePopover';

export { PopoverTrigger as PlatePopoverTrigger };
export { PopoverContent as PlatePopoverContent };

// Elements
export const ParagraphElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  React.ComponentPropsWithoutRef<typeof PlateElement>
>((props, ref) => (
  <PlateElement ref={ref} {...props} className={cn('py-1', props.className)} />
));
ParagraphElement.displayName = 'ParagraphElement';

export const HeadingElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  React.ComponentPropsWithoutRef<typeof PlateElement> & {
    variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }
>(({ variant, className, ...props }, ref) => {
  const { h1, h2, h3, h4, h5, h6 } = {
    h1: 'text-4xl font-bold mt-2',
    h2: 'text-3xl font-semibold mt-1.5',
    h3: 'text-2xl font-semibold mt-1.5',
    h4: 'text-xl font-semibold mt-1',
    h5: 'text-lg font-semibold mt-1',
    h6: 'text-base font-semibold mt-1',
  };
  const V = variant;
  return (
    <PlateElement
      ref={ref}
      asChild
      className={cn(
        'font-heading leading-tight tracking-tight',
        {
          h1,
          h2,
          h3,
          h4,
          h5,
          h6,
        }[variant],
        className
      )}
      {...props}
    >
      <V>{props.children}</V>
    </PlateElement>
  );
});
HeadingElement.displayName = 'HeadingElement';

export const BlockquoteElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  React.ComponentPropsWithoutRef<typeof PlateElement>
>((props, ref) => (
  <PlateElement
    ref={ref}
    asChild
    className={cn('my-1 border-l-4 pl-4 italic', props.className)}
    {...props}
  >
    <blockquote>{props.children}</blockquote>
  </PlateElement>
));
BlockquoteElement.displayName = 'BlockquoteElement';

export const HrElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  React.ComponentPropsWithoutRef<typeof PlateElement>
>((props, ref) => (
  <PlateElement ref={ref} {...props}>
    <hr
      className={cn(
        'h-0.5 cursor-pointer rounded-sm border-none bg-muted bg-clip-content',
        props.className
      )}
    />
    {props.children}
  </PlateElement>
));
HrElement.displayName = 'HrElement';

export const ListElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  React.ComponentPropsWithoutRef<typeof PlateElement> & {
    variant: 'ul' | 'ol';
  }
>(({ variant, className, ...props }, ref) => {
  const V = variant;
  return (
    <PlateElement
      ref={ref}
      asChild
      className={cn(
        'my-1 ml-6 list-outside',
        { 'list-disc': variant === 'ul', 'list-decimal': variant === 'ol' },
        className
      )}
      {...props}
    >
      <V>{props.children}</V>
    </PlateElement>
  );
});
ListElement.displayName = 'ListElement';

export const CodeBlockElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  React.ComponentPropsWithoutRef<typeof PlateElement>
>((props, ref) => {
  const { children, className, ...rest } = props;
  const state = useCodeBlockElementState();
  const { lang, syntax, syntaxText, setSyntax } = state;
  const editor = useEditorState();
  const controls = useComboboxControls();
  const activeValue = lang || 'text';

  return (
    <PlateElement
      ref={ref}
      className={cn('relative my-2', className)}
      {...rest}
    >
      <pre className="overflow-x-auto rounded-md bg-muted p-4 font-mono text-sm">
        <code>{children}</code>
      </pre>
      {syntax && (
        <div className="absolute right-2 top-2 z-10">
          <CodeBlockCombobox
            items={state.syntaxList}
            value={state.lang}
            onValueChange={state.setSyntax}
          />
        </div>
      )}
    </PlateElement>
  );
});
CodeBlockElement.displayName = 'CodeBlockElement';

export const LinkElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  React.ComponentPropsWithoutRef<typeof PlateElement>
>((props, ref) => {
  const { href } = useLink();
  return (
    <PlateElement
      ref={ref}
      asChild
      className={cn('text-primary underline decoration-primary', props.className)}
      {...props}
    >
      <a href={href}>{props.children}</a>
    </PlateElement>
  );
});
LinkElement.displayName = 'LinkElement';

const floatingLinkOptions: UseVirtualFloatingOptions = {
  placement: 'bottom-start',
  middleware: [
    offset(12),
    flip({
      padding: 12,
      fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
    }),
  ],
};

export const LinkFloatingToolbar = createFloatingToolbar(
  ({
    children,
    ...props
  }: React.ComponentProps<any>) => {
    const state = useLinkToolbarButton({
      ...props,
      floatingOptions: floatingLinkOptions,
    });
    const { props: linkProps } = useLink();
    const editor = useEditorRef();
    if (!state.isOpen) return null;

    return (
      <PlatePopover
        open={state.isOpen}
        onOpenChange={state.setIsOpen}
        {...state.floatingProps}
      >
        <PlatePopoverContent
          className={cn(
            'flex items-center gap-1 rounded-md border bg-popover p-1'
          )}
        >
          <FloatingLinkUrlInput className="h-9 w-[330px] rounded-lg bg-background px-3" />
          <Button
            size="icon"
            variant="ghost"
            href={linkProps.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Link className="h-4 w-4" />
          </Button>
        </PlatePopoverContent>
      </PlatePopover>
    );
  }
);

export const TableElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  React.ComponentPropsWithoutRef<typeof PlateElement>
>((props, ref) => {
  const { colSizes, isSelectingCell, minColumnWidth, marginLeft } =
    useTableElementState();
  return (
    <PlateElement ref={ref} {...props}>
      <table
        className={cn('my-4 w-full table-fixed border-collapse', props.className)}
      >
        <colgroup>
          {colSizes.map((size, i) => (
            <col key={i} style={{ width: size }} />
          ))}
        </colgroup>
        <tbody>{props.children}</tbody>
      </table>
    </PlateElement>
  );
});
TableElement.displayName = 'TableElement';

export const TableRowElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  React.ComponentPropsWithoutRef<typeof PlateElement>
>((props, ref) => (
  <PlateElement
    ref={ref}
    asChild
    className={cn('h-full', props.className)}
    {...props}
  >
    <tr>{props.children}</tr>
  </PlateElement>
));
TableRowElement.displayName = 'TableRowElement';

export const TableCellElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  React.ComponentPropsWithoutRef<typeof PlateElement> & { isHeader?: boolean }
>(({ isHeader, className, ...props }, ref) => {
  const As = isHeader ? 'th' : 'td';
  return (
    <PlateElement
      ref={ref}
      asChild
      className={cn(
        'relative h-full overflow-visible border border-muted p-2',
        isHeader && 'bg-muted text-left font-bold',
        className
      )}
      {...props}
    >
      <As>
        <div>{props.children}</div>
      </As>
    </PlateElement>
  );
});
TableCellElement.displayName = 'TableCellElement';

// Marks
export const CodeLeaf = React.forwardRef<
  React.ElementRef<'code'>,
  React.ComponentPropsWithoutRef<'code'>
>((props, ref) => (
  <code
    ref={ref}
    className={cn('rounded bg-muted px-1.5 py-1 font-mono text-sm', props.className)}
    {...props}
  />
));
CodeLeaf.displayName = 'CodeLeaf';

export const HighlightLeaf = React.forwardRef<
  React.ElementRef<'mark'>,
  React.ComponentPropsWithoutRef<'mark'>
>((props, ref) => (
  <mark
    ref={ref}
    className={cn('bg-primary/20 text-inherit', props.className)}
    {...props}
  />
));
HighlightLeaf.displayName = 'HighlightLeaf';

// Toolbar
export const Toolbar = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="toolbar"
    className={cn(
      'relative flex select-none items-center gap-1 overflow-x-auto',
      className
    )}
    {...props}
  />
));
Toolbar.displayName = 'Toolbar';

export const ToolbarGroup = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
));
ToolbarGroup.displayName = 'ToolbarGroup';

export const MarkToolbarButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, 'value' | 'type'> & {
    nodeType: string;
    clear?: string | string[];
  }
>(({ children, nodeType, clear, ...props }, ref) => {
  const state = useMarkToolbarButtonState({ clear, nodeType });
  const { props: buttonProps } = useMarkToolbarButton(state);

  return (
    <Button
      ref={ref}
      {...buttonProps}
      {...props}
    >
      {children}
    </Button>
  );
});
MarkToolbarButton.displayName = 'MarkToolbarButton';

// Toolbar Buttons
const PlateToolbar = React.forwardRef<
  React.ElementRef<typeof Toolbar>,
  React.ComponentPropsWithoutRef<typeof Toolbar>
>((props, ref) => (
  <Toolbar
    ref={ref}
    className={cn(
      'flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 p-1 bg-secondary/50',
      props.className
    )}
    {...props}
  />
));
PlateToolbar.displayName = 'PlateToolbar';

export const PlateMarkToolbarButton = React.forwardRef<
  React.ElementRef<typeof MarkToolbarButton>,
  React.ComponentPropsWithoutRef<typeof MarkToolbarButton>
>((props, ref) => (
  <MarkToolbarButton
    ref={ref}
    {...props}
    className={cn(
      'h-8 w-8 p-0',
      props.className
    )}
    variant="outline"
  />
));
PlateMarkToolbarButton.displayName = 'PlateMarkToolbarButton';

export const PlateFloatingToolbar = createFloatingBalloons(
  ({
    children,
    ...props
  }: React.ComponentProps<typeof Toolbar> & {
    floatingOptions?: UseVirtualFloatingOptions;
  }) => {
    const editor = useEditorState();
    const { floatingOptions } = props;

    const state = {
      ...props,
      floatingOptions: {
        placement: 'top',
        middleware: [offset(12), flip()],
        ...floatingOptions,
      },
    };
    if (
      !isSelectionExpanded(editor) ||
      isCollapsed(editor.selection) ||
      !editor.selection
    ) {
      return null;
    }

    return (
      <PlatePopover
        open={state.isOpen}
        onOpenChange={state.setIsOpen}
        {...state.floatingProps}
      >
        <PlatePopoverContent
          className={cn(
            'flex items-center gap-1 rounded-md border bg-popover p-1'
          )}
        >
          <PlateMarkToolbarButton nodeType={MARK_BOLD} tooltip="Bold (⌘+B)">
            <Bold />
          </PlateMarkToolbarButton>
          <PlateMarkToolbarButton
            nodeType={MARK_ITALIC}
            tooltip="Italic (⌘+I)"
          >
            <Italic />
          </PlateMarkToolbarButton>
          <PlateMarkToolbarButton
            nodeType={MARK_UNDERLINE}
            tooltip="Underline (⌘+U)"
          >
            <Underline />
          </PlateMarkToolbarButton>
        </PlatePopoverContent>
      </PlatePopover>
    );
  }
);
