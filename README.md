# svg-url-loader
A webpack loader which loads SVG files either as url or as data-uri if file is shorter than the given limit.

Existing `url-loader` always does base64 encoding for data-uri. For SVG it is not manadatory and it is possible to achieve higher compression ratios using UTF8 character encoding.

