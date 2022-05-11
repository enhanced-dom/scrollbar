import { HtmlRenderer, IRenderingEngine, SECTION_ID } from '@enhanced-dom/webcomponent'
import classNames from 'classnames'
import debounce from 'lodash.debounce'

import * as styles from './scrollbar.webcomponent.pcss'
import { selectors } from './scrollbar.selectors'

export enum ScrollDirection {
  horizontal = 'horizontal',
  vertical = 'vertical',
}

export interface ScrollbarWebComponentAttributes {
  direction: ScrollDirection
}

export class ScrollbarWebComponent extends HTMLElement {
  static get observedAttributes() {
    return ['direction', 'class', 'style', 'value']
  }

  static cssVariables = {
    scrollSize: styles.variablesScrollSize,
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
  static template = ({ value, direction, ...rest }: Record<string, any> = {}) => {
    return {
      tag: 'div',
      attributes: {
        ...rest,
        class: classNames(styles.scrollbar, direction === ScrollDirection.horizontal ? styles.horizontal : styles.vertical, rest.class),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'aria-orientation': direction === ScrollDirection.horizontal ? 'horizontal' : 'vertical',
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
  static renderer: IRenderingEngine = new HtmlRenderer('@enhanced-dom/ScrollbarWebComponent', ScrollbarWebComponent.template)
  private _attributes: Record<string, any> = {
    value: 0,
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    ScrollbarWebComponent.renderer.render(this.shadowRoot, this._attributes)
  }

  private get $scrollContainer() {
    return this.shadowRoot.querySelector(`*[${SECTION_ID}="${ScrollbarWebComponent.sectionIdentifiers.CONTAINER}"]`)
  }

  private _attachScrollListeners() {
    this.$scrollContainer.addEventListener(
      'scroll',
      (e) => {
        if (e.target === this.$scrollContainer) {
          this.value = this.$scrollContainer[this.direction === ScrollDirection.vertical ? 'scrollTop' : 'scrollLeft']
        }
        e.stopPropagation()
        this.dispatchEvent(new Event('scroll'))
      },
      true,
    )
  }

  private _propagateScrollValue() {
    const currentScrollValue = this.$scrollContainer[this.direction === ScrollDirection.vertical ? 'scrollTop' : 'scrollLeft']
    if (currentScrollValue != this.value) {
      this.$scrollContainer[this.direction === ScrollDirection.vertical ? 'scrollTop' : 'scrollLeft'] = this.value
    }
  }

  render = debounce(
    () => {
      ScrollbarWebComponent.renderer.render(this.shadowRoot, this._attributes)
      this._attachScrollListeners()
    },
    10,
    { leading: false, trailing: true },
  )

  connectedCallback() {
    this.render()
  }

  get direction() {
    return this.getAttribute('direction') as ScrollDirection
  }

  set direction(newDirection: ScrollDirection) {
    this._attributes.direction = newDirection
    this.setAttribute('direction', newDirection)
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

ScrollbarWebComponent.renderer.addStyle(styles._stylesheetName)
