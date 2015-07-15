MODELS = [
	{
		type: "FieldInterview",
		relationships: [
			"TALKEDTO",
			"RECORDED",
			"HAPPENED"
		],
		properties: [
			"Narrative",
			"DateTime",
			"InterviewNumber"
		]
	},
	{
		type: "Location",
		relationships: [
			"HAPPENED"
		],
		properties: [
			"Alias",
			"Address"
		]
	},
	{
		type: "Arrest",
		relationships: [
			"CHARGED",
			"RECORDED",
			"HAPPENED"
		],
		properties: [
		]
	},
	{
		type: "Crime",
		relationships: [
			"HAPPENED",
			"VICTIMIZED",
			"COMMITTED"
		],
		properties: [
			"Pattern",
			"DateTime",
			"Charge"
		]
	},
	{
		type: "Vehicle",
		relationships: [
			"STOLEN",
			"RECORDED"
		],
		properties: [
			"PlateNumber",
			"Make",
			"Model",
			"Color",
			"RegisteredOwner"
		]
	},{
		type: "Person",
		relationships: [
			"COMMITTED",
			"TALKEDTO",
			"CHARGED",
			"VICTIMIZED",
			"KNOWS"
		],
		properties: [
			"FirstName",
			"LastName",
			"Alias",
			"Gender"
		]
	}
];