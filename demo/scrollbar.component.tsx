import React from 'react'
import { withReactAdapter } from '@enhanced-dom/react'

import { ScrollbarWebComponent, ScrollbarWebComponentAttributes } from '../src'

declare type ScrollbarComponentProps = ScrollbarWebComponentAttributes &
  React.DetailedHTMLProps<React.HTMLAttributes<ScrollbarWebComponent>, ScrollbarWebComponent>

export const Scrollbar = withReactAdapter<
  ScrollbarWebComponent,
  never[],
  typeof ScrollbarWebComponent,
  ScrollbarComponentProps,
  never,
  'renderer' | 'orientations' | 'cssVariables' | 'sectionIdentifiers'
>({
  type: ScrollbarWebComponent,
  hoistedProps: ['renderer', 'orientations', 'cssVariables', 'sectionIdentifiers'],
})
