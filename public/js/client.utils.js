function loadModelstoUI() {
	var filterCounter = 1;
	var filterCounterCollection = {};
	var $typeSelector = $('#sel-type');
	$typeSelector.append('<option> Select One </option>');
	$.each(_.pluck(MODELS,'type').sort(), function(key, type) {
		$typeSelector.append('<option>' + type + '</option>');
	})
	$typeSelector.on('change', function(evt) {
		changeQueryBuilderStatusHandler(evt, filterCounter, filterCounterCollection);
	});
	$('#add-filter').on('click', function(evt) { 
		// record filterCounter Obj, add loaded as value to avoid property value changing.
		filterCounterCollection[filterCounter] = { loaded: false };

		addFilterHandler(evt, filterCounter, filterCounterCollection);
		filterCounter++;
	});
	$('#run-query').on('click', runQueryHandler);
}

function changeQueryBuilderStatusHandler(evt, filterCounter, filterCounterCollection) {
	loadRelationshipTypes(evt);
	// Remove all filters when node type is changed.
	removeFilterHandler(true, filterCounterCollection);
}

function loadRelationshipTypes(evt) {
	var $relationshipSelector = $('#sel-relationships');
	$relationshipSelector.empty();
	$.each(MODELS, function(key, model) {
		if (model.type != evt.target.value) return;
		$.each(model.relationships.sort(), function(index, relationship) {
			$relationshipSelector.append('<option>' + relationship + '</option>');
		});
	});
}

function loadFilter(nodeTypeValue, filterCounterCollection) {
	$.each(filterCounterCollection, function(filterCounter, val) {
		var $propertiesSelector = $('#sel-property-' + filterCounter);
		if (val.loaded == true) return;

		$propertiesSelector.empty();
		$.each(MODELS, function(_, model) {
			if (model.type != nodeTypeValue) return;
			$.each(model.properties, function(_, property) {
				$propertiesSelector.append('<option>' + property + '</option>');
			});
		});

		var $operatorSelector = $('#sel-operator-' + filterCounter);
		$operatorSelector
			.append('<option>=</option>')
			.append('<option><></option>')
			.append('<option><</option>')
			.append('<option>></option>')
			.append('<option><=</option>')
			.append('<option>>=</option>')
			.append('<option>IS NULL</option>')
			.append('<option>IS NOT NULL</option>');

		val.loaded = true;
	});
	
}

function addFilterHandler(evt, filterCounter, filterCounterCollection) {
	evt.preventDefault();
	
	$(evt.target).parent()
		.before($('<div>').attr('id', 'filter-' + filterCounter).attr('class','panel panel-warning').css('margin-top', '5px')
			.append($('<div>').attr('class','panel-heading')
				.css('padding','5px 10px')
				.append($('<div>')
					.append($('<span>').text('Filter'))
				.append($('<a>').html('<span class="fa fa-times"></span>')
					.css('float', 'right')
					.css('cursor', 'pointer')
					.on('click', function() {
						removeFilterHandler(false, filterCounterCollection, filterCounter);
					}))))
			.append($('<div>').attr('class','panel-body')
				.append('<label for="sel-property-' + filterCounter + '">What type of Property?</label>')
				.append('<select name="prop-' + filterCounter + '" class="form-control input-sm" id="sel-property-' + filterCounter + '"></select>')
				.append('<label for="sel-operator-' + filterCounter + '">What type of operator?</label>')
				.append('<select name="operator-' + filterCounter + '" class="form-control input-sm" id="sel-operator-' + filterCounter + '"></select>')
				.append('<label for="sel-property-value-' + filterCounter + '">What is the value?</label>')
				.append('<input name="prop_value-' + filterCounter + '" type="text" class="form-control input-sm" id="sel-property-value-' + filterCounter + '">'))
			// Animation css
			.css({
				height: 0,
				opacity: 0.2
			})
			.animate({
				height: "225px",
				opacity: 1
			}));
	
	// Triger Node Type Change event
	var nodeTypeValue = $('#sel-type').val();
	loadFilter(nodeTypeValue, filterCounterCollection);
}

function removeFilterHandler(removeAll, filterCounterCollection, filterCounter) {
	$.each(filterCounterCollection, function(key) {
		if (removeAll == false) {
			if (key != filterCounter) return;
		}

		$('#filter-' + key)
			.animate({
				height: 0,
				opacity: 0.2
			}, function() {
				// Remove the container when animation is finished.
				$(this).remove();
			});

		delete filterCounterCollection[filterCounter];
	});	
}

function runQueryHandler() {
	// Get form data
	var form = $('form#query-builder')[0];
	var data = getFormData(form);
	// Create a newData object to hold reformmated data
	var newData = {};
	// Temporary filter array to hold each generated filter data
	var filters = [];
	// inherit "label" and "relationships" key/val pair, and push generated filter data to the temporary array.
	$.each(data, function(key, val) {
		if (key == "label" || key == "relationships") {
			newData[key] = val;
		} else {
			var obj = {};
			obj[key] = val;
			filters.push(obj);
		}
	});
	// Group filter by filterCounter number.
	var newFilters = _.groupBy(filters, function(item) {
		return Object.keys(item)[0].split('-')[1];
	})
	// Merge each key/val pair object.
	var mergedFilters = {};
	$.each(newFilters, function(index, array) {
		var obj = {};
		$.each(array, function(key, val) {
			_.extend(obj,val);
		})
		mergedFilters[index] = obj;
	})
	// Only add filters to the newData Object if any exists.
	if(_.size(mergedFilters) > 0) newData['filters'] = mergedFilters;
	
	console.log(newData)
}
