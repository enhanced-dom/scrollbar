const path = require('path')
const jestConfigFactory = require('@enhanced-dom/jest').jestConfigFactory
const baseConfig = jestConfigFactory({ ts: true, processorConfigPath: path.join(__dirname, 'tsconfig.json') })
module.exports = {
  ...baseConfig,
  testEnvironment: path.join(__dirname, 'linkedom-environment.cjs'),
  transformIgnorePatterns: ['node_modules/(?!@enhanced-dom/|lodash-es)'],
  moduleNameMapper: { '\\.pcss$': path.join(__dirname, '__mocks__/style.cjs') },
}
