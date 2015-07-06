var PeopleCollection = Backbone.Collection.extend({
	model: Person,
	url: '/reset'
});
var RelatedCollection = Backbone.Collection.extend({
	model: Person,
	url: '/search-related'
});
