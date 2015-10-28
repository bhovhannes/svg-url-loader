/*
 * @license MIT http://www.opensource.org/licenses/mit-license.php
 * @author  Hovhannes Babayan <bhovhannes at gmail dot com>
 */
var loaderUtils = require('loader-utils');

module.exports = function(content) {
	this.cacheable && this.cacheable();

	var query = loaderUtils.parseQuery(this.query);

	content = content.toString('utf8');
	content = content.replace(/"/g, "'");
	content = content.replace(/[{}\|\\\^~\[\]`"<>#%]/g, function(match) {
		return '%'+match[0].charCodeAt(0).toString(16).toUpperCase();
	});

	var data = 'data:image/svg+xml;charset=utf8,' + content;
	if (!query.noquotes) {
		data = '"'+data+'"';
	}

	return 'module.exports = ' + JSON.stringify(data);
};

module.exports.raw = true;