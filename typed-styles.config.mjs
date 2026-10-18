import path from 'path'
import webpackConfigFactory from '@enhanced-dom/webpack'

export default (_, argv) => {
  const willExport = argv.mode !== 'none'
  return webpackConfigFactory.configs.typedStylesConfigFactory({
    raw: true,
    filePaths: ['./src/scrollbar.webcomponent.pcss'].concat(willExport ? [] : ['./demo/app.pcss']),
    outputPath: willExport ? path.resolve('./dist') : undefined,
  })
}
