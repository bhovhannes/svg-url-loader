/*
 * @license MIT http://www.opensource.org/licenses/mit-license.php
 * @author  Hovhannes Babayan <bhovhannes at gmail dot com>
 */
var loaderUtils = require('loader-utils');

module.exports = function(content) {
	this.cacheable && this.cacheable();

	var query = loaderUtils.parseQuery(this.query);

	var limit;
	if(query.limit) {
		limit = parseInt(query.limit, 10);
	}
	else {
		limit = (this.options && this.options.url && this.options.url.dataUrlLimit) || 0;
	}

	if(limit <= 0 || content.length < limit) {
		content = content.toString('utf8');
		content = content.replace(/"/g, "'");
		content = content.replace(/\s+/g, " ");
		content = content.replace(/[{}\|\\\^~\[\]`"<>#%]/g, function(match) {
			return '%'+match[0].charCodeAt(0).toString(16).toUpperCase();
		});

		var data = 'data:image/svg+xml;charset=utf8,' + content.trim();
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
