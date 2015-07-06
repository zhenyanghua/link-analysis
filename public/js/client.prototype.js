String.prototype.capitalize = function () {
	return this.replace(/^./, function (match) {
		return match.toUpperCase();
	});
};

