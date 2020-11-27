# svg-url-loader

[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![codecov][codecov-image]][codecov-url] [![MIT License][license-image]][license-url]

A webpack loader which loads SVG file as utf-8 encoded DataUrl string.

Existing [`url-loader`](https://github.com/webpack-contrib/url-loader) always does Base64 encoding for data-uri. As SVG content is a human-readable xml string, using base64 encoding is not mandatory. Instead, one may only escape [unsafe characters](http://www.ietf.org/rfc/rfc1738.txt) and replace `"` with `'` as described [in this article](http://codepen.io/Tigt/post/optimizing-svgs-in-data-uris).

There are some benefits for choosing utf-8 encoding over base64.

1. Resulting string is shorter (can be ~2 times shorter for 2K-sized icons);
2. Resulting string will be compressed better when using gzip compression;
3. Browser parses utf-8 encoded string faster than its base64 equivalent.

## Supported parameters

Parameters can be passed both in an url or from webpack config file. See [Loaders](https://webpack.js.org/concepts/loaders/) section in webpack documentation for more details.

Passing parameters using `resourceQuery` is also supported:

```css
.selector {
  background-image: url(../assets/foo.svg?encoding=base64);
}
```

The loader supports the following parameters:

### `limit`

If given, loader will not encode the source file if its content is greater than this limit.
Defaults to no limit.
If the file is greater than the limit the [`file-loader`](https://github.com/webpack-contrib/file-loader) is used, receiving all query parameters set for svg-url-loader.

```javascript
require("svg-url-loader?limit=1024!./file.svg");
// => DataUrl if "file.png" is smaller that 1kb

require("svg-url-loader?prefix=img/!./file.svg");
// => Parameters for the file-loader are valid too
//    They are passed to the file-loader if used.
```

### `stripdeclarations`

This option is true by default. **It will be removed in the next major release.**  
See [this issue](https://github.com/bhovhannes/svg-url-loader/issues/104#issuecomment-348377933) for more context about this decision.

If given will tell the loader to strip out any XML declaration, e.g. `<?xml version="1.0" encoding="UTF-8"?>` at the beginning of imported SVGs.
Internet Explorer (tested in Edge 14) cannot handle XML declarations in CSS data URLs (`content: url("data:image/svg...")`).

```javascript
require("svg-url-loader?stripdeclarations!./file.svg");
```

### `iesafe`

This option tells loader to fall back to the file-loader if the file contains a style-element and the encoded size is above 4kB no matter the `limit` specified.

This option was introduced because Internet Explorer (including IE11) stops parsing style-elements in SVG data-URIs longer than 4kB. This results in black fill-color for all styled shapes.

You can either specify `iesafe` option in the query:

```javascript
// apply `iesafe` option only for 'foo.svg'
require("svg-url-loader?iesafe!./foo.svg");
```

Or, you can set this option globally in you webpack config:

```javascript
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.svg/,
        use: {
          loader: "svg-url-loader",
          options: {
            // make all svg images to work in IE
            iesafe: true,
          },
        },
      },
    ],
  },
  //...
};
```

### `encoding`

This option controls which encoding to use when constructing a data-URI for an SVG. When set to a non-"none" value, loader does not apply quotes to the resulting data-URI.

Possible values are "base64" and "none". Defaults to "none".

Normally, setting `encoding` option to `base64` _should not_ be required, as using base64 encoding defeats the original purpose of this loader - embed svg with minimal size overhead. However, because of incompatibility with some tools, we support this mode, too.

You can either specify `base64` option in the query:

```javascript
// apply `base64` option only for 'foo.svg'
require("svg-url-loader?encoding=base64!./foo.svg");
```

Or, you can set this option globally in you webpack config:

```javascript
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.svg/,
        use: {
          loader: "svg-url-loader",
          options: {
            // make loader to behave like url-loader, for all svg files
            encoding: "base64",
          },
        },
      },
    ],
  },
  //...
};
```

## Usage

[Documentation: Loaders](https://webpack.js.org/concepts/loaders/)

### In JS:

```javascript
require("svg-url-loader!./file.svg");
// => DataUrl for file.svg
```

### In CSS (with webpack.config.js below):

```css
.icon {
  background: url("../images/file.svg");
}
```

```javascript
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.svg/,
        use: {
          loader: "svg-url-loader",
          options: {},
        },
      },
    ],
  },
  //...
};
```

## Benefits of using data-uri

1. Browser won't make an extra http call to download the image
2. Some folks [mentioned](https://github.com/bhovhannes/svg-url-loader/issues/341) that even if image is in browser cache images with data url appear on screen faster.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: LICENSE
[npm-url]: https://www.npmjs.org/package/svg-url-loader
[npm-version-image]: https://img.shields.io/npm/v/svg-url-loader.svg?style=flat-square
[npm-downloads-image]: https://img.shields.io/npm/dm/svg-url-loader.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/bhovhannes/svg-url-loader
[codecov-image]: https://codecov.io/gh/bhovhannes/svg-url-loader/branch/master/graph/badge.svg?token=iJvUUKrgzB
