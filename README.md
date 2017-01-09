# svg-url-loader
[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![Dependencies][deps-image]][deps-url] [![Dev. Dependencies][dev-deps-image]][dev-deps-url] [![MIT License][license-image]][license-url] [![Build Status][travis-image]][travis-url]

A webpack loader which loads SVG file as utf-8 encoded DataUrl string.

Existing [`url-loader`](https://github.com/webpack/url-loader) always does Base64 encoding for data-uri.  As SVG content is a human-readable xml string, using base64 encoding is not mandatory.  Instead, one may only escape [unsafe characters](http://www.ietf.org/rfc/rfc1738.txt) and replace `"` with `'` as described [in this article](http://codepen.io/Tigt/post/optimizing-svgs-in-data-uris).  

There are some benefits for choosing utf-8 encoding over base64.  
1. Resulting string is shorter (can be ~2 times shorter for 2K-sized icons);  
2. Resulting string will be compressed better when using gzip compression;  
3. Browser parses utf-8 encoded string faster than its base64 equivalent.

## Supported parameters

Parameters can be passed both in a url or from webpack config file. See [Using loaders](http://webpack.github.io/docs/using-loaders.html) section in webpack documentation for more details.

The loader supports the following parameters:

### `noquotes`

Passing this parameter (or setting to `true`) tells to loader *not to include* resulting string in quotes. This can be useful if one wants to use data-url for SVG image as a value for JavaScript variable.


### `limit`

If given will tell the loader not to encode the source file if its content is greater than this limit.  
Defaults to no limit.  
If the file is greater than the limit the [`file-loader`](https://github.com/webpack/file-loader) is used and all query parameters are passed to it.

``` javascript
require("svg-url?limit=1024!./file.svg");
// => DataUrl if "file.png" is smaller that 1kb

require("svg-url?prefix=img/!./file.svg");
// => Parameters for the file-loader are valid too
//    They are passed to the file-loader if used.
```

It is also possible to specify limit using `url.dataUrlLimit` option in webpack configuration.

```javascript
module.exports = {
    //...
    url: {
        dataUrlLimit: 1024 //1kb
    },
    module: {
        loaders: [
            {test: /\.svg/, loader: 'svg-url-loader'}
        ]
    },
    //...
};
```

However, limit specified via query parameter will always override the one specified by `url.dataUrlLimit` configuration.

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

### In JS:
``` javascript
require("svg-url!./file.svg");
// => DataUrl for file.svg, enclosed in quotes

require("svg-url?noquotes!./file.svg");
// => DataUrl for file.svg, without quotes
```

### In CSS (with webpack.config.js below):
``` css
.icon {
    background: url('../images/file.svg');
}
```
``` javascript
module.exports = {
  //...
	module: {
		loaders: [
			{test: /\.svg/, loader: 'svg-url-loader'}
		]
	},
	//...
};
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)

[deps-image]: https://img.shields.io/david/bhovhannes/svg-url-loader.svg
[deps-url]: https://david-dm.org/bhovhannes/svg-url-loader

[dev-deps-image]: https://img.shields.io/david/dev/bhovhannes/svg-url-loader.svg
[dev-deps-url]: https://david-dm.org/bhovhannes/svg-url-loader#info=devDependencies

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[npm-url]: https://www.npmjs.org/package/svg-url-loader
[npm-version-image]: https://img.shields.io/npm/v/svg-url-loader.svg?style=flat
[npm-downloads-image]: https://img.shields.io/npm/dm/svg-url-loader.svg?style=flat

[travis-url]: https://travis-ci.org/bhovhannes/svg-url-loader
[travis-image]: https://img.shields.io/travis/bhovhannes/svg-url-loader.svg?style=flat
