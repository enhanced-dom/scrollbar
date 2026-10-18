import path from 'path'
import { fileURLToPath } from 'url'
import { jestConfigFactory } from '@enhanced-dom/jest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const baseConfig = jestConfigFactory({
  ts: true,
  processorConfigPath: path.join(__dirname, 'tsconfig.json'),
  testEnvironment: 'jest-environment-linkedom',
})

export default {
  ...baseConfig,
  transformIgnorePatterns: ['node_modules/(?!@enhanced-dom/|lodash-es)'],
}
