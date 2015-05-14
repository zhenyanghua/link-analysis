var PeopleCollection = Backbone.Collection.extend({
	model: Person,
	url: '/reset'
});
var RelatedCollection = Backbone.Collection.extend({
	model: Person,
	url: '/search-related'
});

var WhereCollection = Backbone.Collection.extend({
	model: Person,
	url: '/search-where'
});

var RelatedWhereCollection = Backbone.Collection.extend({
	model: Person,
	url: '/search-related-where'
});