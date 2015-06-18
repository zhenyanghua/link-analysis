var _ = require("underscore");

module.exports = {
	getEndPointString: function(string) {
		string = string.substring(string.lastIndexOf('/') + 1);
		return string;
	},
	containsObject: function(obj, list) {
		for (var i = 0; i < list.length; i++) {
			if (_.isEqual(obj, list[i]))
				return true;
		}
		return false;
	}
};