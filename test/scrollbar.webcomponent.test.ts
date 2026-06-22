/* global jest, expect, test, describe, beforeEach, afterEach */
import '@testing-library/jest-dom'
import { ScrollbarWebComponent, ScrollOrientation } from '../src/scrollbar.webcomponent'

ScrollbarWebComponent.register()

describe('scrollbar webcomponent', () => {
  let el: ScrollbarWebComponent

  beforeEach(() => {
    el = document.createElement(ScrollbarWebComponent.tag) as ScrollbarWebComponent
    document.body.appendChild(el)
  })

  afterEach(() => {
    if (el.isConnected) document.body.removeChild(el)
  })

  describe('static properties', () => {
    test('tag', () => expect(ScrollbarWebComponent.tag).toBe('enhanced-dom-scrollbar'))
    test('identifier', () => expect(ScrollbarWebComponent.identifier).toBe('urn:enhanced-dom:scrollbar'))
    test('orientations alias', () => expect(ScrollbarWebComponent.orientations).toBe(ScrollOrientation))
    test('observedAttributes', () => {
      expect(ScrollbarWebComponent.observedAttributes).toEqual(['orientation', 'value', 'for', 'delegated'])
    })
    test('register is idempotent', () => {
      ScrollbarWebComponent.register()
      expect(window.customElements.get(ScrollbarWebComponent.tag)).toBe(ScrollbarWebComponent)
    })
  })

  describe('value', () => {
    test('defaults to 0', () => expect(el.value).toBe(0))

    test('setter stores number and reflects attribute', () => {
      el.value = 42
      expect(el.value).toBe(42)
      expect(el.getAttribute('value')).toBe('42')
    })

    test('setter parses string to int', () => {
      el.value = '17' as unknown as number
      expect(el.value).toBe(17)
    })

    test('setAttribute routes through attributeChangedCallback', () => {
      el.setAttribute('value', '99')
      expect(el.value).toBe(99)
    })

    test('attributeChangedCallback is no-op when value unchanged', () => {
      el.setAttribute('value', '5')
      expect(el.value).toBe(5)
      el.setAttribute('value', '5') // oldVal === newVal → no setter call
      expect(el.value).toBe(5)
    })
  })

  describe('orientation', () => {
    test('setter reflects as attribute', () => {
      el.orientation = ScrollOrientation.HORIZONTAL
      expect(el.getAttribute('orientation')).toBe('horizontal')
    })

    test('getter reads from attribute', () => {
      el.setAttribute('orientation', 'vertical')
      expect(el.orientation).toBe(ScrollOrientation.VERTICAL)
    })

    test('setAttribute routes through attributeChangedCallback', () => {
      el.setAttribute('orientation', 'horizontal')
      expect(el.orientation).toBe(ScrollOrientation.HORIZONTAL)
    })
  })

  describe('delegated', () => {
    test('setter stores object', () => {
      el.delegated = { tabIndex: 0 }
      expect(el.delegated).toEqual({ tabIndex: 0 })
    })

    test('setter parses JSON string', () => {
      el.delegated = '{"class":"bar"}' as unknown as Record<string, string>
      expect(el.delegated).toEqual({ class: 'bar' })
    })

    test('setAttribute routes delegated as JSON string', () => {
      el.setAttribute('delegated', '{"role":"presentation"}')
      expect(el.delegated).toEqual({ role: 'presentation' })
    })
  })

  describe('render', () => {
    test('is debounced (exposes cancel)', () => {
      expect(typeof el.render.cancel).toBe('function')
    })

    test('disconnectedCallback cancels pending render', () => {
      const spy = jest.spyOn(el.render, 'cancel')
      document.body.removeChild(el)
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('template', () => {
    test('returns style node and container div', () => {
      const result = ScrollbarWebComponent.template({ orientation: ScrollOrientation.VERTICAL, value: 0 })
      expect(result).toHaveLength(2)
      expect(result[0]!.tag).toBe('style')
      expect(result[1]!.tag).toBe('div')
    })

    test('role is scrollbar', () => {
      const [, container] = ScrollbarWebComponent.template({ orientation: ScrollOrientation.VERTICAL, value: 0 })
      expect(container!.attributes.role).toBe('scrollbar')
    })

    test('horizontal aria-orientation', () => {
      const [, container] = ScrollbarWebComponent.template({ orientation: ScrollOrientation.HORIZONTAL, value: 0 })
      expect(container!.attributes['aria-orientation']).toBe('horizontal')
    })

    test('vertical aria-orientation', () => {
      const [, container] = ScrollbarWebComponent.template({ orientation: ScrollOrientation.VERTICAL, value: 0 })
      expect(container!.attributes['aria-orientation']).toBe('vertical')
    })

    test('aria-valuenow reflects value', () => {
      const [, container] = ScrollbarWebComponent.template({ orientation: ScrollOrientation.VERTICAL, value: 50 })
      expect(container!.attributes['aria-valuenow']).toBe(50)
    })

    test('aria-controls reflects for prop', () => {
      const [, container] = ScrollbarWebComponent.template({ orientation: ScrollOrientation.VERTICAL, value: 0, for: 'my-el' })
      expect(container!.attributes['aria-controls']).toBe('my-el')
    })

    test('delegated attributes spread onto container', () => {
      const [, container] = ScrollbarWebComponent.template({
        orientation: ScrollOrientation.VERTICAL,
        value: 0,
        delegated: { dataFoo: 'bar' },
      })
      expect(container!.attributes['dataFoo']).toBe('bar')
    })
  })
})
