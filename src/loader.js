const { getOptions, parseQuery } = require("loader-utils");

const REGEX_STYLE = /<style[\s\S]*?>[\s\S]*?<\/style>/i;
const REGEX_XML_DECLARATION = /^\s*<\?xml [^>]*>\s*/i;
const REGEX_MULTIPLE_SPACES = /\s+/g;
const REGEX_DOUBLE_QUOTE = /"/g;
const REGEX_UNSAFE_CHARS = /[{}\|\\\^~\[\]`"<>#%]/g;

module.exports = function (content) {
  this.cacheable && this.cacheable();

  let query = {
    encoding: "none",
    stripdeclarations: true,
    ...getOptions(this),
    ...(this.resourceQuery ? parseQuery(this.resourceQuery) : undefined),
  };

  let limit = query.limit ? parseInt(query.limit, 10) : 0;

  if (limit <= 0 || content.length < limit) {
    const originalSvgSource = content.toString("utf8");

    const transformedSvgSource = applyGeneralTransforms(
      originalSvgSource,
      query.stripdeclarations
    );

    let data;
    if (query.encoding === "base64") {
      data =
        "data:image/svg+xml;base64," +
        Buffer.from(transformedSvgSource).toString("base64");
    } else {
      data = "data:image/svg+xml," + uriEncode(transformedSvgSource);
    }

    if (
      !query.iesafe ||
      data.length <= 4096 ||
      !REGEX_STYLE.test(originalSvgSource)
    ) {
      return "module.exports = " + JSON.stringify(data);
    }
  }

  const fileLoader = require("file-loader");
  const childContext = Object.create(this);
  childContext.query = Object.assign({}, query);
  return fileLoader.call(childContext, content);
};

module.exports.raw = true;

function uriEncodeMatch(match) {
  return "%" + match[0].charCodeAt(0).toString(16).toLowerCase();
}

function uriEncode(svgSource) {
  svgSource = svgSource.replace(REGEX_DOUBLE_QUOTE, "'");
  svgSource = svgSource.replace(REGEX_UNSAFE_CHARS, uriEncodeMatch);
  return svgSource.trim();
}

function applyGeneralTransforms(svgSource, stripXmlDeclaration) {
  if (stripXmlDeclaration) {
    svgSource = svgSource.replace(REGEX_XML_DECLARATION, "");
  }
  svgSource = svgSource.replace(REGEX_MULTIPLE_SPACES, " ");
  return svgSource;
}
