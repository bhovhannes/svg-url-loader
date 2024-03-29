const { describe, it, expect } = require('@jest/globals')
const path = require('path')
const webpack = require('webpack')

const svgUrlLoader = path.resolve(__dirname, '../index.js')
const context = path.resolve(__dirname, '../')
const outputDir = path.resolve(__dirname, './output')

function getBundleFile(assetName) {
  return path.join(outputDir, assetName)
}

function getBaseWebpackConfig() {
  return {
    context,
    mode: 'development',
    devtool: false,
    output: {
      path: outputDir,
      filename: 'bundle.[fullhash].js',
      publicPath: '',
      libraryTarget: 'commonjs2'
    },
    module: {
      rules: [
        {
          test: /\.svg/,
          exclude: /node_modules/,
          use: [
            {
              loader: svgUrlLoader,
              options: {}
            }
          ],
          type: 'javascript/auto'
        }
      ]
    }
  }
}

async function runWebpack(config) {
  return new Promise((resolve, reject) => {
    webpack(config, function (err, stats) {
      if (err) {
        reject(err)
      } else {
        resolve(stats.toJson('minimal').assetsByChunkName.main[0])
      }
    })
  })
}

async function evaluateGeneratedBundle(assetName) {
  // require is now mandatory with webpack >5.22.0
  return eval(`require("${getBundleFile(assetName)}")`)
}

describe('svg-url-loader', function () {
  describe('"stripdeclarations" option', function () {
    it('if turned off - should do nothing to an SVG that has an XML declaration', async () => {
      const config = {
        ...getBaseWebpackConfig(),
        entry: './test/input/icon-with-declaration.js'
      }
      config.module.rules[0].use[0].options.stripdeclarations = false

      const assetName = await runWebpack(config)
      const encoded = await evaluateGeneratedBundle(assetName)
      expect(encoded).toContain("%3c?xml version='1.0' encoding='UTF-8'?%3e")
    })

    it("if turned on - should do nothing to an SVG that doesn't have an XML declaration", async () => {
      const config = {
        ...getBaseWebpackConfig(),
        entry: './test/input/icon.js'
      }
      config.module.rules[0].use[0].options.stripdeclarations = true

      const assetName = await runWebpack(config)
      const encoded = await evaluateGeneratedBundle(assetName)
      expect(encoded.startsWith('data:image/svg+xml,%3csvg')).toBe(true)
    })

    it('if turned on - should remove XML declaration from a file that has one', async () => {
      const config = {
        ...getBaseWebpackConfig(),
        entry: './test/input/icon-with-declaration.js'
      }
      config.module.rules[0].use[0].options.stripdeclarations = true

      const assetName = await runWebpack(config)
      const encoded = await evaluateGeneratedBundle(assetName)
      expect(encoded).not.toContain('%3c?xml version="1.0" encoding="UTF-8"?%3e')
      expect(encoded.startsWith('data:image/svg+xml,%3csvg')).toBe(true)
    })
  })

  describe('"limit" option and "url.dataUrlLimit" configuration', function () {
    it('should fall back to file-loader if the content of SVG file is longer than "limit" query parameter', async () => {
      const config = {
        ...getBaseWebpackConfig(),
        entry: './test/input/icon.js'
      }
      config.module.rules[0].use[0].options.limit = 10
      config.module.rules[0].use[0].options.name = 'foo.svg'

      const assetName = await runWebpack(config)
      const encoded = await evaluateGeneratedBundle(assetName)
      expect(encoded).toEqual(
        expect.objectContaining({
          default: 'foo.svg'
        })
      )
    })
  })

  describe('combining with other loaders', function () {
    it('should convert SVG file to utf-8 encoded data-uri string, when embedded in LESS file', async () => {
      const config = {
        ...getBaseWebpackConfig(),
        entry: './test/input/less.js'
      }
      config.module.rules.push({
        test: /\.less$/,
        use: ['css-loader', 'less-loader']
      })

      const assetName = await runWebpack(config)
      const encoded = await evaluateGeneratedBundle(assetName)
      expect(encoded.default.toString()).toContain(
        'background-image: url("data:image/svg+xml,%3csvg'
      )
    })

    it('should convert SVG file to utf-8 encoded data-uri string, when embedded in SCSS file', async () => {
      const config = {
        ...getBaseWebpackConfig(),
        entry: './test/input/scss.js'
      }
      config.module.rules.push({
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader']
      })

      const assetName = await runWebpack(config)
      const encoded = await evaluateGeneratedBundle(assetName)
      expect(encoded.default.toString()).toContain(
        'background-image: url("data:image/svg+xml,%3csvg'
      )
    })

    it('should convert SVG file to utf-8 encoded data-uri string, when embedded in CSS file', async () => {
      const config = {
        ...getBaseWebpackConfig(),
        entry: './test/input/css.js'
      }
      config.module.rules.push({
        test: /\.css$/,
        use: ['css-loader']
      })

      const assetName = await runWebpack(config)
      const encoded = await evaluateGeneratedBundle(assetName)
      expect(encoded.default.toString()).toContain(
        'background-image: url("data:image/svg+xml,%3csvg'
      )
    })
  })

  describe('"iesafe" option skips styled files encoded to more than 4kB', function () {
    it('should encode file below limit', async () => {
      const config = {
        ...getBaseWebpackConfig(),
        entry: './test/input/4047B-encoded-styled.js'
      }
      config.module.rules[0].use[0].options.iesafe = true

      const assetName = await runWebpack(config)
      const encoded = await evaluateGeneratedBundle(assetName)
      expect(encoded.startsWith('data:image/svg+xml,%3csvg')).toBe(true)
      expect(encoded.length).toBeLessThan(4096)
    })

    it('should encode file above limit without style-element', async () => {
      const config = {
        ...getBaseWebpackConfig(),
        entry: './test/input/4104B-encoded-unstyled.js'
      }
      config.module.rules[0].use[0].options.iesafe = true

      const assetName = await runWebpack(config)
      const encoded = await evaluateGeneratedBundle(assetName)
      expect(encoded.startsWith('data:image/svg+xml,%3csvg')).toBe(true)
      expect(encoded.length).toBeGreaterThan(4096)
    })

    it('should fall back on file above limit with style-element', async () => {
      const config = {
        ...getBaseWebpackConfig(),
        entry: './test/input/4099B-encoded-styled.js'
      }
      config.module.rules[0].use[0].options.iesafe = true
      config.module.rules[0].use[0].options.name = 'foo.svg'

      const assetName = await runWebpack(config)
      const encoded = await evaluateGeneratedBundle(assetName)
      expect(encoded).toEqual(
        expect.objectContaining({
          default: 'foo.svg'
        })
      )
    })

    it('should fall back on file above limit with style-element even when base64 encoding', async () => {
      const config = {
        ...getBaseWebpackConfig(),
        entry: './test/input/4099B-encoded-styled.js'
      }
      config.module.rules[0].use[0].options.iesafe = true
      config.module.rules[0].use[0].options.name = 'foo.svg'
      config.module.rules[0].use[0].options.encoding = 'base64'

      const assetName = await runWebpack(config)
      const encoded = await evaluateGeneratedBundle(assetName)
      expect(encoded).toEqual(
        expect.objectContaining({
          default: 'foo.svg'
        })
      )
    })
  })

  describe('encoding is base64', function () {
    it('should convert SVG file to base64 encoded data-uri string', async () => {
      const config = {
        ...getBaseWebpackConfig(),
        entry: './test/input/icon.js'
      }
      config.module.rules[0].use[0].options.encoding = 'base64'

      const assetName = await runWebpack(config)
      const encoded = await evaluateGeneratedBundle(assetName)
      expect(encoded).not.toContain('"')
      expect(encoded.startsWith('data:image/svg+xml;base64')).toBe(true)
    })

    it('supports passing options using resource query', async () => {
      const config = {
        ...getBaseWebpackConfig(),
        entry: './test/input/icon-resource-query.js'
      }

      const assetName = await runWebpack(config)
      const encoded = await evaluateGeneratedBundle(assetName)
      expect(encoded).not.toContain('"')
      expect(encoded.startsWith('data:image/svg+xml;base64')).toBe(true)
    })
  })
})
