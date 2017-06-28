/*
 * @license MIT http://www.opensource.org/licenses/mit-license.php
 * @author  Hovhannes Babayan <bhovhannes at gmail dot com>
 */
var loaderUtils = require('loader-utils');

module.exports = function(content) {
	this.cacheable && this.cacheable();

	var query = loaderUtils.getOptions(this) || {};

	var limit = query.limit ? parseInt(query.limit, 10) : 0;

	if (limit <= 0 || content.length < limit) {
		content = content.toString('utf8');

		if (query.stripdeclarations) {
			content = content.replace(/^\s*<\?xml [^>]*>\s*/i, "");
		}

		content = content.replace(/"/g, "'");
		content = content.replace(/\s+/g, " ");
		content = content.replace(/[{}\|\\\^~\[\]`"<>#%]/g, function(match) {
			return '%'+match[0].charCodeAt(0).toString(16).toUpperCase();
		});

		var data = 'data:image/svg+xml,' + content.trim();
		if (!query.noquotes) {
			data = '"'+data+'"';
		}

		return 'module.exports = ' + JSON.stringify(data);
	}
	else {
		var fileLoader = require('file-loader');
		return fileLoader.call(this, content);
	}
};

module.exports.raw = true;
