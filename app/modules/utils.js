module.exports = {
	getEndPointString: function(string) {
		string = string.substring(string.lastIndexOf('/') + 1);
		return string;
	}
};