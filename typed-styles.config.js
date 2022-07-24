const configs = require('@enhanced-dom/webpack').configs

module.exports = configs.typedStylesConfigFactory({raw: true, filesPaths: ["./src/scrollbar.webcomponent.pcss", "./demo/app.pcss"]})
