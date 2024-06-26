import { WebcomponentRenderer, type IRenderingEngine } from '@enhanced-dom/webcomponent'
import { EventListenerTracker } from '@enhanced-dom/dom'
import { STYLESHEET_ATTRIBUTE_NAME } from '@enhanced-dom/css'
import classNames from 'classnames'
import debounce from 'lodash.debounce'

import * as styles from './scrollbar.webcomponent.pcss'
import { Parts } from './scrollbar.selectors'

export enum ScrollOrientation {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export interface ScrollbarWebComponentAttributes {
  orientation: ScrollOrientation
  value?: number
  for?: string
  delegated?: Record<string, string | number | boolean>
}

export class ScrollbarWebComponent extends HTMLElement {
  static get observedAttributes() {
    return ['orientation', 'value', 'for', 'delegated']
  }

  static orientations = ScrollOrientation

  static cssVariables = {
    scrollSize: styles.variablesScrollbarScrollSize,
    scrollbarThumb: styles.variablesScrollbarThumb,
    scrollbarTrack: styles.variablesScrollbarTrack,
    scrollbarThickness: styles.variablesScrollbarThickness,
  } as const

  static tag = 'enhanced-dom-scrollbar'
  static identifier = 'urn:enhanced-dom:scrollbar'
  static parts = Parts
  static template = ({ value, orientation, for: idOfControlledElement, delegated = {}, ...rest }: Record<string, any> = {}) => {
    return [
      {
        tag: 'style',
        attributes: {
          [STYLESHEET_ATTRIBUTE_NAME]: ScrollbarWebComponent.tag,
        },
        children: [{ content: styles.css }],
      },
      {
        tag: 'div',
        attributes: {
          ...rest,
          ...delegated,
          class: classNames(
            styles.scrollbar,
            orientation === ScrollOrientation.HORIZONTAL ? styles.horizontal : styles.vertical,
            delegated.class,
          ),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'aria-orientation': orientation === ScrollOrientation.HORIZONTAL ? 'horizontal' : 'vertical',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'aria-valuenow': value,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'aria-controls': idOfControlledElement,
          role: 'scrollbar',
          part: ScrollbarWebComponent.parts.CONTAINER,
        },
        children: [
          {
            tag: 'div',
            attributes: {
              class: styles.contents,
              role: 'presentation',
            },
          },
        ],
      },
    ]
  }
  static register = () => {
    if (!window.customElements.get(ScrollbarWebComponent.tag)) {
      window.customElements.define(ScrollbarWebComponent.tag, ScrollbarWebComponent)
    }
  }

  static renderer: IRenderingEngine = new WebcomponentRenderer('@enhanced-dom/ScrollbarWebComponent', ScrollbarWebComponent.template)
  private _attributes: Record<string, any> = {
    value: 0,
  }
  private _eventListenerTracker = new EventListenerTracker()

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  private _addEventListeners = () => {
    this._eventListenerTracker.unregister({ nodeLocator: this._findScrollContainer })
    this._eventListenerTracker.register({
      hook: (e: Element) => {
        const scrollMonitor = (event: Event) => {
          const scrollContainer = this._findScrollContainer()
          if (event.target === scrollContainer) {
            event.stopPropagation()
            this.value = scrollContainer[this.orientation === ScrollOrientation.VERTICAL ? 'scrollTop' : 'scrollLeft']
            // console.log(`triggered scroll ${this.value}`)
            this.dispatchEvent(new Event('scroll'))
          }
        }
        e.addEventListener('scroll', scrollMonitor, true)

        return (event1: Element) => {
          event1.removeEventListener('scroll', scrollMonitor)
        }
      },
      nodeLocator: this._findScrollContainer,
    })
  }

  private _findScrollContainer = (): HTMLElement => {
    return this.shadowRoot.querySelector(`*::part(${ScrollbarWebComponent.parts.CONTAINER})`)
  }

  private _propagateScrollValue() {
    const scrollContainer = this._findScrollContainer()
    if (!scrollContainer) {
      return
    }
    const currentScrollValue = scrollContainer[this.orientation === ScrollOrientation.VERTICAL ? 'scrollTop' : 'scrollLeft']
    if (currentScrollValue != this.value) {
      scrollContainer[this.orientation === ScrollOrientation.VERTICAL ? 'scrollTop' : 'scrollLeft'] = this.value
    }
  }

  render = debounce(
    () => {
      ScrollbarWebComponent.renderer.render(this.shadowRoot, this._attributes)
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
    this._eventListenerTracker.unregister({ nodeLocator: this._findScrollContainer })
  }

  get orientation() {
    return this.getAttribute('orientation') as ScrollOrientation
  }

  set orientation(newOrientation: ScrollOrientation) {
    this._attributes.orientation = newOrientation
    this.setAttribute('orientation', newOrientation)
  }

  get value(): number {
    return this.hasAttribute('value') ? parseInt(this.getAttribute('value')) : 0
  }

  set value(newValue: number | string) {
    const parsedValue = typeof newValue === 'string' ? parseInt(newValue) : newValue
    this._attributes.value = parsedValue
    this.setAttribute('value', parsedValue.toString())
    this._findScrollContainer()?.setAttribute('aria-valuenow', parsedValue.toString())
    this._propagateScrollValue()
  }

  get delegated() {
    return this._attributes.delegated
  }
  set delegated(d: string | Record<string, string | number | boolean>) {
    if (typeof d === 'string') {
      this._attributes.delegated = JSON.parse(d)
    } else {
      this._attributes.delegated = d
    }
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal !== newVal) {
      switch (name) {
        case 'value':
          this.value = newVal
          break
        case 'delegated':
          this.delegated = newVal
          break
        default:
          this._attributes[name] = newVal
          break
      }
    }
  }
}
