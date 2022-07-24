import React from 'react'
import { withReactAdapter } from '@enhanced-dom/react'

import { ScrollbarWebComponent, ScrollbarWebComponentAttributes } from '../src'

declare interface ScrollbarAttributes
  extends ScrollbarWebComponentAttributes,
    Omit<React.DetailedHTMLProps<React.HTMLAttributes<ScrollbarWebComponent>, ScrollbarWebComponent>, 'class' | 'style'> {
  className?: string
  style?: React.CSSProperties
}

const Scrollbar = withReactAdapter<
  ScrollbarWebComponent,
  never[],
  typeof ScrollbarWebComponent,
  ScrollbarAttributes,
  never,
  'renderer' | 'orientations' | 'cssVariables' | 'sectionIdentifiers'
>({
  type: ScrollbarWebComponent,
  hoistedProps: ['renderer', 'orientations', 'cssVariables', 'sectionIdentifiers'],
})

export default Scrollbar
