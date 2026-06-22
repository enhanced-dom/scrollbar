const { TestEnvironment } = require('jest-environment-node')
const { parseHTML } = require('linkedom')

// Polyfill ::part() pseudo-element — linkedom (css-select) doesn't support it.
// *::part(X) means "element with part attribute containing token X" → [part~="X"]
function patchQuerySelector(proto) {
  const orig = proto.querySelector
  proto.querySelector = function (sel) {
    return orig.call(this, sel.replace(/\*::part\(([^)]+)\)/g, '[part~="$1"]'))
  }
  const origAll = proto.querySelectorAll
  proto.querySelectorAll = function (sel) {
    return origAll.call(this, sel.replace(/\*::part\(([^)]+)\)/g, '[part~="$1"]'))
  }
}

class LinkedomEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context)

    const dom = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>')

    patchQuerySelector(dom.ShadowRoot.prototype)
    patchQuerySelector(dom.Element.prototype)

    const g = this.global
    g.window = dom.window
    g.document = dom.document
    g.customElements = dom.window.customElements
    g.Event = dom.Event
    g.CustomEvent = dom.CustomEvent
    g.MutationObserver = dom.MutationObserver
    g.HTMLElement = dom.HTMLElement
    g.Element = dom.Element
    g.Node = dom.Node
    g.ShadowRoot = dom.ShadowRoot
    g.DocumentFragment = dom.DocumentFragment
    g.Text = dom.Text
    g.Comment = dom.Comment
  }
}

module.exports = LinkedomEnvironment
