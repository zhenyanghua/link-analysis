function loadModelstoUI() {
	var filterCounter = 1;
	$.each(MODELS, function(key, model) {
		$('#sel-type').append('<option>' + model.type + '</option>');
	})
	$('#add-filter').on('click', function(evt) { 
		addFilterHandler(evt, filterCounter);
		filterCounter++;
	});
}

function addFilterHandler(evt, filterCounter) {
	evt.preventDefault();
	console.log(filterCounter)
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
						removeFilterHandler(filterCounter);
					}))))
			.append($('<div>').attr('class','panel-body')
				.append('<label for="sel-property-' + filterCounter + '">What type of Property?</label>')
				.append('<select name="prop-' + filterCounter + '" class="form-control input-sm" id="sel-property-' + filterCounter + '"></select>')
				.append('<label for="sel-operation-' + filterCounter + '">What type of operation?</label>')
				.append('<select name="operation-' + filterCounter + '" class="form-control input-sm" id="sel-operation-' + filterCounter + '"></select>')
				.append('<label for="sel-property-value-' + filterCounter + '">What is the value?</label>')
				.append('<input name="prop-value-' + filterCounter + '" type="text" class="form-control input-sm" id="sel-property-value-' + filterCounter + '">')))
}

function removeFilterHandler(filterCounter) {
	$('#filter-' + filterCounter).remove();
}