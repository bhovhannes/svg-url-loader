const { getOptions } = require("loader-utils");

const REGEX_STYLE = /<style[\s\S]*?>[\s\S]*?<\/style>/i;
const REGEX_DECLARATION = /^\s*<\?xml [^>]*>\s*/i;

const REGEX_DOUBLE_QUOTE = /"/g;
const REGEX_MULTIPLE_SPACES = /\s+/g;
const REGEX_UNSAFE_CHARS = /[{}\|\\\^~\[\]`"<>#%]/g;

module.exports = function (content) {
  this.cacheable && this.cacheable();

  let query = getOptions(this) || {};
  query.encoding = query.encoding || "none";

  let limit = query.limit ? parseInt(query.limit, 10) : 0;

  if (limit <= 0 || content.length < limit) {
    let newContent = content.toString("utf8");

    let hasStyleElement = REGEX_STYLE.test(newContent);

    if (!("stripdeclarations" in query) || query.stripdeclarations) {
      newContent = newContent.replace(REGEX_DECLARATION, "");
    }
    newContent = newContent.replace(REGEX_MULTIPLE_SPACES, " ");

    let data;
    if (query.encoding === "base64") {
      if (typeof newContent === "string") {
        newContent = Buffer.from(newContent);
      }
      data = "data:image/svg+xml;base64," + newContent.toString("base64");
    } else {
      newContent = newContent.replace(REGEX_DOUBLE_QUOTE, "'");
      newContent = newContent.replace(REGEX_UNSAFE_CHARS, function (match) {
        return "%" + match[0].charCodeAt(0).toString(16).toUpperCase();
      });

      data = "data:image/svg+xml," + newContent.trim();
    }

    if (!(query.iesafe && hasStyleElement && data.length > 4096)) {
      return "module.exports = " + JSON.stringify(data);
    }
  }

  const fileLoader = require("file-loader");
  const childContext = Object.create(this);
  childContext.query = Object.assign({}, query);
  childContext.query.esModule = false;
  return fileLoader.call(childContext, content);
};

module.exports.raw = true;
