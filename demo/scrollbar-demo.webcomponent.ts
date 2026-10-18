import { WebcomponentRenderer, type IRenderingEngine } from '@enhanced-dom/webcomponent'
import { EventListenerTracker } from '@enhanced-dom/dom'
import { StylesheetsRepository, STYLESHEET_ATTRIBUTE_NAME } from '@enhanced-dom/css'
import { debounce } from 'lodash-es'

import { ScrollbarWebComponent, ScrollOrientation } from '../src'
import * as styles from './scrollbar-demo.webcomponent.pcss'

export class ScrollbarDemoWebComponent extends HTMLElement {
  static tag = 'enhanced-dom-scrollbar-demo'

  static template = ({
    value = 0,
    orientation = ScrollbarWebComponent.orientations.HORIZONTAL,
  }: { value?: number; orientation?: ScrollOrientation } = {}) => [
    {
      tag: 'style',
      attributes: { [STYLESHEET_ATTRIBUTE_NAME]: ScrollbarDemoWebComponent.tag },
      children: [{ content: styles.css }],
    },
    {
      tag: 'div',
      attributes: { class: styles.container },
      children: [
        {
          tag: 'div',
          attributes: { class: styles.scrollbarWrapper },
          children: [{ tag: ScrollbarWebComponent.tag, attributes: { orientation, value } }],
        },
        { tag: 'p', children: [{ content: `Scroll value is ${value}` }] },
        { tag: 'button', children: [{ content: 'bigger' }] },
        { tag: 'button', children: [{ content: 'reset scroll' }] },
        { tag: 'button', children: [{ content: 'toggle orientation' }] },
      ],
    },
  ]

  static register = () => {
    ScrollbarWebComponent.register()
    if (!window.customElements.get(ScrollbarDemoWebComponent.tag)) {
      window.customElements.define(ScrollbarDemoWebComponent.tag, ScrollbarDemoWebComponent)
    }
  }

  static renderer: IRenderingEngine = new WebcomponentRenderer(
    '@enhanced-dom/ScrollbarDemoWebComponent',
    ScrollbarDemoWebComponent.template,
  )

  private _attributes: Record<string, any> = { value: 0, orientation: ScrollbarWebComponent.orientations.HORIZONTAL }
  private _dimension = 1000
  private _stylesheetsRepository = new StylesheetsRepository(document)
  private _eventListenerTracker = new EventListenerTracker()

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._stylesheetsRepository.setProperty('demo-styles', ':root', ScrollbarWebComponent.cssVariables.scrollbarThumb, 'blue')
    this._stylesheetsRepository.setProperty('demo-styles', ':root', ScrollbarWebComponent.cssVariables.scrollbarTrack, 'red')
    this._stylesheetsRepository.setProperty('demo-styles', ':root', ScrollbarWebComponent.cssVariables.scrollSize, `${this._dimension}px`)
  }

  private _findScrollbar = () => this.shadowRoot?.querySelector(ScrollbarWebComponent.tag) as ScrollbarWebComponent | null

  private _findButtons = () => this.shadowRoot?.querySelectorAll('button')
  private _findBiggerButton = () => this._findButtons()?.[0]
  private _findResetButton = () => this._findButtons()?.[1]
  private _findToggleOrientationButton = () => this._findButtons()?.[2]

  private _addEventListeners = () => {
    this._removeEventListeners()
    this._eventListenerTracker.register({
      nodeLocator: this._findScrollbar,
      hook: (e: Element) => {
        const onScroll = () => {
          this._attributes.value = (e as ScrollbarWebComponent).value
          this.render()
        }
        e.addEventListener('scroll', onScroll)
        return (el: Element) => el.removeEventListener('scroll', onScroll)
      },
    })
    this._eventListenerTracker.register({
      nodeLocator: this._findBiggerButton,
      hook: (e: Element) => {
        const onClick = () => {
          this._dimension += 100
          this._stylesheetsRepository.setProperty(
            'demo-styles',
            ':root',
            ScrollbarWebComponent.cssVariables.scrollSize,
            `${this._dimension}px`,
          )
        }
        e.addEventListener('click', onClick)
        return (el: Element) => el.removeEventListener('click', onClick)
      },
    })
    this._eventListenerTracker.register({
      nodeLocator: this._findResetButton,
      hook: (e: Element) => {
        const onClick = () => {
          const scrollbar = this._findScrollbar()
          if (scrollbar) {
            scrollbar.value = 0
          }
          this._attributes.value = 0
          this.render()
        }
        e.addEventListener('click', onClick)
        return (el: Element) => el.removeEventListener('click', onClick)
      },
    })
    this._eventListenerTracker.register({
      nodeLocator: this._findToggleOrientationButton,
      hook: (e: Element) => {
        const onClick = () => {
          this._attributes.orientation =
            this._attributes.orientation === ScrollbarWebComponent.orientations.HORIZONTAL
              ? ScrollbarWebComponent.orientations.VERTICAL
              : ScrollbarWebComponent.orientations.HORIZONTAL
          this._attributes.value = 0
          this.render()
        }
        e.addEventListener('click', onClick)
        return (el: Element) => el.removeEventListener('click', onClick)
      },
    })
  }

  private _removeEventListeners = () => {
    this._eventListenerTracker.unregister({ nodeLocator: this._findScrollbar })
    this._eventListenerTracker.unregister({ nodeLocator: this._findBiggerButton })
    this._eventListenerTracker.unregister({ nodeLocator: this._findResetButton })
    this._eventListenerTracker.unregister({ nodeLocator: this._findToggleOrientationButton })
  }

  render = debounce(
    () => {
      if (!this.shadowRoot) {
        return
      }
      ScrollbarDemoWebComponent.renderer.render(this.shadowRoot, this._attributes)
      this._eventListenerTracker.refreshSubscriptions()
    },
    10,
    { leading: false, trailing: true },
  )

  connectedCallback() {
    this._addEventListeners()
    this.render()
  }

  disconnectedCallback() {
    this.render.cancel()
    this._removeEventListeners()
  }
}
