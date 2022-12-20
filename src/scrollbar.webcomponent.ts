import { WebcomponentRenderer, IRenderingEngine } from '@enhanced-dom/webcomponent'
import { EventListenerTracker, SECTION_ID } from '@enhanced-dom/dom'
import classNames from 'classnames'
import debounce from 'lodash.debounce'

import * as styles from './scrollbar.webcomponent.pcss'
import { selectors } from './scrollbar.selectors'

export enum ScrollOrientation {
  horizontal = 'horizontal',
  vertical = 'vertical',
}

export interface ScrollbarWebComponentAttributes {
  orientation: ScrollOrientation
}

export class ScrollbarWebComponent extends HTMLElement {
  static get observedAttributes() {
    return ['orientation', 'class', 'style', 'value']
  }

  static orientations = ScrollOrientation

  static cssVariables = {
    scrollSize: styles.variablesScrollbarScrollSize,
    scrollbarThumb: styles.variablesScrollbarThumb,
    scrollbarTrack: styles.variablesScrollbarTrack,
    scrollbarThickness: styles.variablesScrollbarThickness,
  } as const

  static sectionIdentifiers = selectors

  static tag = 'enhanced-dom-scrollbar'
  static register = () => {
    if (!window.customElements.get(ScrollbarWebComponent.tag)) {
      window.customElements.define(ScrollbarWebComponent.tag, ScrollbarWebComponent)
    }
  }

  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  static template = ({ value, orientation, ...rest }: Record<string, any> = {}) => {
    return {
      tag: 'div',
      attributes: {
        ...rest,
        class: classNames(styles.scrollbar, orientation === ScrollOrientation.horizontal ? styles.horizontal : styles.vertical, rest.class),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'aria-orientation': orientation === ScrollOrientation.horizontal ? 'horizontal' : 'vertical',
        role: 'scrollbar',
        [SECTION_ID]: ScrollbarWebComponent.sectionIdentifiers.CONTAINER,
      },
      children: [
        {
          tag: 'div',
          attributes: {
            class: styles.contents,
          },
        },
      ],
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
    this._addEventListeners()
  }

  private _addEventListeners = () => {
    this._eventListenerTracker.unregister({ nodeLocator: this._findScrollContainer })
    this._eventListenerTracker.register({
      hook: (e: Element) => {
        const scrollMonitor = (event: Event) => {
          const scrollContainer = this._findScrollContainer()
          if (event.target === scrollContainer) {
            event.stopPropagation()
            this.value = scrollContainer[this.orientation === ScrollOrientation.vertical ? 'scrollTop' : 'scrollLeft']
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
    return this.shadowRoot.querySelector(`*[${SECTION_ID}="${ScrollbarWebComponent.sectionIdentifiers.CONTAINER}"]`)
  }

  private _propagateScrollValue() {
    const scrollContainer = this._findScrollContainer()
    if (!scrollContainer) {
      return
    }
    const currentScrollValue = scrollContainer[this.orientation === ScrollOrientation.vertical ? 'scrollTop' : 'scrollLeft']
    if (currentScrollValue != this.value) {
      scrollContainer[this.orientation === ScrollOrientation.vertical ? 'scrollTop' : 'scrollLeft'] = this.value
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
    this.render()
  }

  disconnectedCallback() {
    this.render.cancel()
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

  set value(newValue: number) {
    this._attributes.value = newValue
    this.setAttribute('value', newValue.toString())
    this._propagateScrollValue()
  }

  private _convertToNumber(newValue: string) {
    return newValue != null ? parseInt(newValue) : null
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal !== newVal) {
      if (name === 'value') {
        this.value = this._convertToNumber(newVal)
        return
      } else {
        this._attributes[name] = newVal
        this.render()
      }
    }
  }
}
