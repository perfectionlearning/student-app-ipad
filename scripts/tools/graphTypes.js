//=======================================================
// Problem model / Problem Set collection
//=======================================================
(function() {

	//=======================================================
	// Combine certain types into a metatype to keep the
	// graphTypes list clean and compact.
	//=======================================================
	var graphTypeMap = {
		hyperbolaxpos: 'hyperbola',
		hyperbolaypos: 'hyperbola',
		parabolax2: 'parabola',
		parabolay2: 'parabola',
	}

	//=======================================================
	//=======================================================
	var graphTypes = {
		point: {
			params: ['x', 'y'],	// Names of fields to be entered by the student in graphConst questions (in the same order as the database)
			plot: 1		// Number of points required to be plotted in graphPlot questions
		},

		line: {
			params: ['Slope (m)', 'y intercept (b)'],
			plot: 3
		},

		log: {
			params: ['a', 'b', 'h', 'k'],
			plot: 4
		},

		exponent: {
			params: ['a', 'b', 'h', 'k'],
			plot: 4
		},

		radical: {
			params: ['a', 'h', 'k', 'n'],
			plot: 4
		},

		rational: {
			params: ['a', 'h', 'k'],
			plot: 4
		},

		sin: {
			params: ['a', 'h', 'k'],
			plot: 4
		},

		cos: {
			params: ['a', 'h', 'k'],
			plot: 4
		},

		tan: {
			params: ['a', 'h', 'k'],
			plot: 4
		},

		circle: {
			params: ['Center x', 'Center y', 'Radius'],
			plot: 4
		},

		ellipse: {
			params: ['h', 'k', 'a', 'b'],
			plot: 4
		},

		hyperbola: {
			params: ['h', 'k', 'a', 'b'],
			plot: 4
		},

		parabola: {
			params: ['h', 'k', 'p'],
			plot: 4
		},

		parabolastd: {
			params: ['a', 'b', 'c'],
			plot: 4
		},

	}

	//=======================================================
	//=======================================================
	app.graphInputCnt = function(type)
	{
		// Convert to a metatype if one is available
		if (graphTypeMap[type])
			type = graphTypeMap[type];

		if (graphTypes[type])
			return graphTypes[type].plot;

		return 1;		// Unknown type. We need a default.
	}

	//=======================================================
	//=======================================================
	app.graphParams = function(type)
	{
		// Convert to a metatype if one is available
		if (graphTypeMap[type])
			type = graphTypeMap[type];

		if (graphTypes[type])
			return graphTypes[type].params;

		return ['Unknown'];		// Unknown type. Try to make it obvious.
	}

	//=======================================================
	// Converts a string graph definition to an object
	//=======================================================
	app.graphStrToObj = function(string)
	{
		if (!string || typeof(string) !== 'string' || string.indexOf('=') === -1)
			return {type: 'unknown'};

		var eqIdx = string.indexOf('=');
		var type = string.slice(0, eqIdx).toLowerCase();
		var params = string.slice(eqIdx+1);
		if (params)
			var paramList = params.split(',');

		return {type:type, params: paramList};
	}

})();
