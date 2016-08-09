//============================================================
// Search model
//
// Special cases.  Search tool will handle this, given the right query.
//                 No need to use the book definition.
//  obj:[obj name]
//  type:[e.g., qc, wb, &c.]
//============================================================
;(function()
{

	//========================================================
	// searchQuery.  Originally though to make this a class
	//      but decided for now to leave it as a function.
	//      It accepts the search term as an argument,
	//      parses it, and returns the resulting object,
	//      which is to be passed to the search program
	//      on the server.
	//      The reason to make it a class was that it comprises
	//      multiple functions for processing the term and
	//      generating the object.
	//      The reason to make it a function is that multiple
	//      instances aren't needed, and there would be no need
	//      for public methods or properties--just the returned result.
	//========================================================
	function searchQuery(term)
	{
		var schemes = [];
		//app.searchID = ['lessonPlan'];
		$.each(app.searchID, function(idx, scheme) {
			schemes.push('{"term":{"schemes":"' + scheme.toLowerCase() + '"}}');
		});
		//app.searchID = ['main','lessonPlan'];

		var searchSchemes = schemes.join(',');

		var basicQuery = '{"custom_filters_score":{"query":{"filtered":{"query":{"matchAll":{}},"filter":{"and":[{"query":{"match":{"text":{"query":"<%= term %>","operator":"or","fuzziness":0.7}}}},{"or":[' + searchSchemes + ']}]}}},"filters":[{"filter":{"and":[{"query":{"match_phrase":{"text":{"query":"<%= term %>","slop":0}}}},{"or":[' + searchSchemes + ']}]},"boost":100},{"filter":{"and":[{"query":{"match":{"text":{"query":"<%= term %>","operator":"and"}}}},{"or":[' + searchSchemes + ']}]},"boost":20},{"filter":{"and":[{"query":{"match":{"text":{"query":"<%= term %>","operator":"or"}}}},{"or":[' + searchSchemes + ']}]},"boost":10}],"score_mode":"total"}}';
		var queryList = {
// These three templates (basic, obj, type) include multiple schemes.  The originals are commented out below.
			basic: {
				template: _.template(basicQuery),
				size: 50
			},
			obj: {
				template: _.template('{"filtered":{"query":{"matchAll":{}},"filter":{"and":[{"term":{"objName":"<%= term %>"}},{"or":[' + searchSchemes + ']}]}}}'),
				size: 1
			},
			type: {
				template: _.template('{"filtered":{"query":{"matchAll":{}},"filter":{"and":[{"or":[{"term":{"objType":"<%= term %>"}},{"term":{"metaType":"<%= term %>"}}]},{"or":[' + searchSchemes + ']}]}}}'),
				size:1000000
			}
/*
			basic: {
				template: _.template('{"custom_filters_score":{"query":{"match":{"text":{"query":"<%= term %>","operator":"or","fuzziness":0.7}}},"filters":[{"filter":{"and":[{"query":{"match_phrase":{"text":{"query":"<%= term %>","slop":1}}}},{"or":[{"term":{"schemes":"main"}},{"term":{"schemes":"lessonplan"}}]}]},"boost":100},{"filter":{"and":[{"query":{"match":{"text":{"query":"<%= term %>","operator":"and"}}}},{"or":[{"term":{"schemes":"main"}},{"term":{"schemes":"lessonplan"}}]}]},"boost":20},{"filter":{"and":[{"query":{"match":{"text":{"query":"<%= term %>","operator":"or"}}}},{"or":[{"term":{"schemes":"main"}},{"term":{"schemes":"lessonplan"}}]}]},"boost":10}],"score_mode":"total"}}'),
				size: 50
			},
			obj: {
				template: _.template('{"filtered":{"query":{"matchAll":{}},"filter":{"and":[{"term":{"objName":"<%= term %>"}},{"or":[{"term":{"schemes":"main"}},{"term":{"schemes":"lessonplan"}}]}]}}}'),
				size: 1
			},
			type: {
				template: _.template('{"filtered":{"query":{"matchAll":{}},"filter":{"and":[{"or":[{"term":{"objType":"<%= term %>"}},{"term":{"metaType":"<%= term %>"}}]},{"or":[{"term":{"schemes":"main"}},{"term":{"schemes":"lessonplan"}}]}]}}}'),
				size:1000000
			}
*/
		}

		//========================================================
		// Make sure search value is cleaned for JSON
		//========================================================
		var sanitize = function(str) {
			// Primary concern is to remove double quotes and backslashes.
			str = str.replace(/("|\\)/g, '');
			return str;
		};

		//========================================================
		//========================================================
		var insertValue = function(template, value) {
			var queryStr = template({term: value});

			try {
				var queryObj = JSON.parse(queryStr);
			}
			catch(e)
			{
				var queryObj = {};
			}

			return queryObj;
		};

		//========================================================
		//========================================================
		var constructQuery = function(template, value) {
			var sanitized = sanitize(value);

			var query = insertValue(template, sanitized);
			return query;
		};

		//========================================================
		//========================================================
		var parseQuery = function(rawTerm) {
			var type,
				value;

			if (rawTerm.indexOf(':') != -1) {
				var parts = rawTerm.split(':');
				if (parts.length > 1) {
					var key = parts[0];
					value = parts[1];
					switch (key) {
						case 'obj':
							type = 'obj';
							break;
						case 'type':
							type = 'type';
							break;
						default:
							type = 'basic';
							value = rawTerm;
					}
				}
			}
			else {
				type = 'basic';
				value = rawTerm;
			}

			var queryObj = {
				type: type,
				value: value.toLowerCase()
			}
			return queryObj;
		};

		var queryData = parseQuery(term);
		var type = queryData.type;
		var value = queryData.value;

		var query = {
			json: constructQuery(queryList[type].template, value),
			size: queryList[type].size
		};
		return query;
	}



	//========================================================
	//========================================================
	app.Search = Backbone.Model.extend({
		defaults: {
		},

		url: app.paths.search,

		setTerm: function(term) {
			if (term !== undefined) {
				var queryObj = searchQuery(term);
				var searchParams = {"query": queryObj.json};
				if (queryObj.size) searchParams.size = queryObj.size;

				this.set(searchParams);
			}
		}
	});

	//========================================================
	//========================================================
	app.searchResults = new app.Search();

})();