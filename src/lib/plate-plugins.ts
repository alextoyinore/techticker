import React from 'react';
import { createBlockquotePlugin, ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import { createCodeBlockPlugin, ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { createHeadingPlugin, ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_H4, ELEMENT_H5, ELEMENT_H6 } from '@udecode/plate-heading';
import { createHorizontalRulePlugin, ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { createLinkPlugin, ELEMENT_LINK } from '@udecode/plate-link';
import { createListPlugin, ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '@udecode/plate-list';
import { createParagraphPlugin, ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { createTablePlugin, ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH, ELEMENT_TR } from '@udecode/plate-table';
import {
  createBoldPlugin,
  MARK_BOLD,
  createCodePlugin,
  MARK_CODE,
  createItalicPlugin,
  MARK_ITALIC,
  createStrikethroughPlugin,
  MARK_STRIKETHROUGH,
  createUnderlinePlugin,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { createHighlightPlugin, MARK_HIGHLIGHT } from '@udecode/plate-highlight';
import { createPlugins } from '@udecode/plate-common';

import {
  BlockquoteElement,
  CodeBlockElement,
  CodeLeaf,
  HeadingElement,
  HighlightLeaf,
  HrElement,
  LinkElement,
  LinkFloatingToolbar,
  ListElement,
  ParagraphElement,
  TableCellElement,
  TableElement,
  TableRowElement,
} from '@/components/plate-ui';

export const plugins = createPlugins(
  [
    // Block Elements
    createParagraphPlugin(),
    createHeadingPlugin(),
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHorizontalRulePlugin(),
    createLinkPlugin({
      renderAfterEditable: LinkFloatingToolbar as any,
    }),
    createListPlugin(),
    createTablePlugin(),

    // Mark Elements
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createStrikethroughPlugin(),
    createCodePlugin(),
    createHighlightPlugin(),
  ],
  {
    components: {
      [ELEMENT_PARAGRAPH]: ParagraphElement,
      [ELEMENT_H1]: (props: any) => React.createElement(HeadingElement, { ...props, variant: 'h1' }),
      [ELEMENT_H2]: (props: any) => React.createElement(HeadingElement, { ...props, variant: 'h2' }),
      [ELEMENT_H3]: (props: any) => React.createElement(HeadingElement, { ...props, variant: 'h3' }),
      [ELEMENT_H4]: (props: any) => React.createElement(HeadingElement, { ...props, variant: 'h4' }),
      [ELEMENT_H5]: (props: any) => React.createElement(HeadingElement, { ...props, variant: 'h5' }),
      [ELEMENT_H6]: (props: any) => React.createElement(HeadingElement, { ...props, variant: 'h6' }),
      [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
      [ELEMENT_CODE_BLOCK]: CodeBlockElement,
      [ELEMENT_UL]: (props: any) => React.createElement(ListElement, { ...props, variant: 'ul' }),
      [ELEMENT_OL]: (props: any) => React.createElement(ListElement, { ...props, variant: 'ol' }),
      [ELEMENT_LI]: (props: any) => React.createElement('li', props),
      [ELEMENT_HR]: HrElement,
      [ELEMENT_LINK]: LinkElement,
      [ELEMENT_TABLE]: TableElement,
      [ELEMENT_TR]: TableRowElement,
      [ELEMENT_TD]: TableCellElement,
      [ELEMENT_TH]: (props: any) => React.createElement(TableCellElement, { ...props, isHeader: true }),
      [MARK_BOLD]: (props: any) => React.createElement('strong', props),
      [MARK_ITALIC]: (props: any) => React.createElement('em', props),
      [MARK_UNDERLINE]: (props: any) => React.createElement('u', props),
      [MARK_STRIKETHROUGH]: (props: any) => React.createElement('s', props),
      [MARK_CODE]: CodeLeaf,
      [MARK_HIGHLIGHT]: HighlightLeaf,
    },
  }
);
