//===============================================================================
// Search Module: Search results page
//===============================================================================
;(function() {

	var vw = app.Views.Search = {};

	var objLocMemo = {}; // To remember objects that have already been looked up
	var locationResultObtained = {}; // For preventing multiple results for a single object

	var navPrep = function(term) {
		term = encodeURIComponent(term);
		return term;
	}

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container) {
		var that = this;
		var title = app.getSectionName(app.curNav);
		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav:true, noSearch:true}), drawList));
		vw.drawList.setParam('search', 'term', app.searchTerm);
		vw.drawList.setParam('search', 'model', app.searchResults);
		if (app.searchTerm) {
			var navTerm = navPrep(app.searchTerm);
			app.router.navigate('search/'+navTerm);  // FIXME/rt app.searchTerm just to get going; fix later.
		}
		else
			app.router.navigate('search');

		fw.setLayout('Search');
	}

	//=======================================================
	//=======================================================
	vw.ready = function() {
		app.globalUIInit();
		if (app.searchTerm) {
			fw.getWidget('search').processSearchURL(app.searchTerm);
		}
	}

	//=======================================================
	//
	//=======================================================
	vw.close = function()
	{
		fw.abortAsync();
	}

	//=======================================================
	//
	//=======================================================
	var searchResultLinkTemplate = _.template(
		'<%= refNum %>.  <%= chapter %>, <%= topic %>, <%= section %>'
	);

	//=======================================================
	//
	//=======================================================
	var navSearchResultLinkTemplate = _.template(
		'<%= refNum %>: <%= chapter %>, <%= unit %>, <%= topic %>, <%= section %>'
	);

	//=======================================================
	//
	//=======================================================
	var makeReference = function(nav) {
		var ch = nav.chapter + 1;
		var top = app.getLinearTopic(nav.chapter, nav.unit, nav.topic, nav.scheme);
		top = app.getTranslatedTopic(nav.scheme, nav.chapter, top) + 1;
		var sec = app.getNthLetter(nav.section);
		var ref = ch + '.' + top + '.' + sec;
		return ref;
	}

	//=======================================================
	//
	//=======================================================
	var formatNavSearchResultLink = function(data) {
		var nav = data.nav;
		var refNum = makeReference(nav);
		var obj = null;

		var chapterName = data.chapter && data.chapter.trim();
		var unitName = data.unit && data.unit.trim();
		var topicName = data.topic && data.topic.trim();
		var sectionName = data.section && data.section.trim();
		var item = navSearchResultLinkTemplate({refNum: refNum, chapter: chapterName, unit: unitName, topic: topicName, section: sectionName });
		return item;
	}


	//=======================================================
	//
	//=======================================================
	var formatSearchResultLink = function(obj, loc) {
		var nav = {
			chapter: loc[0],
			unit: loc[1],
			topic: loc[2],
			section: loc[3],
			scheme: loc[4]
		};
		// need chapter, topic, section
		var refNum = makeReference(nav);

		var chapterName = app.getChapterName(nav).trim();
		var topicName = app.getTopicName(nav).trim();
		var sectionName = app.getSectionName(nav).trim();
		var item = searchResultLinkTemplate({obj: obj, nav: nav, refNum: refNum, chapter: chapterName, topic: topicName, section: sectionName });
		return item;
	}


	//=======================================================
	// getNavigationData.  Use result location to get navigation data.
	//
	//   location:  property within '_source' from search
	//				results array
	//=======================================================
	var getNavParts = function(location) {
		var parts = location.split(':',2);
		var locParts = parts[1].split('|');
		return locParts;
	};

	//=======================================================
	//
	//=======================================================
	var getNavigationData = function(location) {
		var locParts = getNavParts(location);

		var nav = {
			chapter: 1*locParts[1],
			unit: 1*locParts[2],
			topic: 1*locParts[3],
			section: 1*locParts[4],
			scheme: locParts[0]
		};

		var navData = {
			chapter: app.getChapterName(nav),
			unit: app.getUnitName(nav),
			topic: app.getTopicName(nav),
			section: app.getSectionName(nav),
			nav: nav
		}

		return navData;
	}

	//=======================================================
	// getObjectType.  Extract object type from search result.
	//
	//   location:  property within '_source' from search
	//				results array
	//=======================================================
	var getObjectType = function(location) {
		var parts = location.split(':',2);
		return parts[0];
	}

	//=======================================================
	// processObjResult.  Process search results for type OBJ
	//
	//   searchResultObj:  '_source' object, within array of objects
	//						within 'hits' object,
	//						within 'hits' object of JSON response.
	//=======================================================
	var processObjResult = function(searchResultObj) {
		var obj = searchResultObj.objName,
			processed = [],
			loc,
			schemes = searchResultObj.schemes;

		$.each(schemes, function(idx, scheme) {
			var loc = null;
			var key = obj + '_' + scheme;
			if (objLocMemo[key]) {
				loc = objLocMemo[key];
			}
			else {
				var tmp = app.findObject(obj, scheme);
				if (tmp) {
					loc = tmp;
					objLocMemo[key] = loc;
				}
			}
			if (loc) {
				// avoid findObject for same object.

				var locKey = loc.join('_');
				// only one search result per locKey (chapter+unit+topic+section+scheme).
				if (loc.length > 0 && locationResultObtained[locKey] == undefined) {
					var rowText = formatSearchResultLink(obj, loc);
					processed.push({
						obj: obj,
						scheme: scheme,
						rowText: rowText,
						text: searchResultObj.text,
					});
					locationResultObtained[locKey] = locKey;
				}
			}
		});
/*
		// avoid findObject for same object.
		if (objLocMemo[obj])
			loc = objLocMemo[obj];
		else {
			loc = app.findObject(obj);
			objLocMemo[obj] = loc;
		}
		var locKey = loc.join('_');
		// only one search result per locKey (chapter+unit+topic+section+scheme).
		if (loc.length > 0 && locationResultObtained[locKey] == undefined) {
			var rowText = formatSearchResultLink(obj, loc);
			var processed = {
				obj: obj,
				rowText: rowText,
				text: searchResultObj.text,
			};
			locationResultObtained[locKey] = locKey;
		}
*/
		return processed;
	}

	//=======================================================
	// processNavResult.  Process search results for type NAV
	//
	//   searchResultObj:  '_source' object, within array of objects
	//						within 'hits' object,
	//						within 'hits' object of JSON response.
	//=======================================================
	var processNavResult = function(searchResultObj) {
		var processed = null;

		var locParts = getNavParts(searchResultObj.location);
		locParts.push(locParts.shift());
		var locKey = locParts.join('_');
		if (locationResultObtained[locKey] == undefined) {

			var data = getNavigationData(searchResultObj.location);

			var rowText = formatNavSearchResultLink(data);
			var processed = {
				rowText: rowText,
				nav: data.nav
			};
			locationResultObtained[locKey] = locKey;
		}

		return processed;
	}

	//=======================================================
	// processResults.  A routine to be passed to the 'search' widget for
	// 	 processing the results returned from the search request.
	//
	//   results:  'hits' object, within 'hits' object of JSON response.
	//		The 'hits' object is an array of objects.  Each object in this array
	//      contains a '_source' object, which holds the data of primary interest
	//      for the search results output.
	//
	//   returned:  this routine returns an array of objects containing
	//		the data to be used for the search results output:
	//		obj - name of object within the book; e.g., pwsec_j374
	//		rowText - clickable text to be displayed as search result.
	//		text - the actual text returned by the search.  Generally longer than
	//			   what is wanted for display.
	//=======================================================
	var processResults = function(results) {
		var processed = [];

		objLocMemo = {};
		locationResultObtained = {};

		$.each(results, function(idx, item) {
			var objectType = getObjectType(item._source.location);
			switch (objectType) {
				case 'OBJ':
					var tmp = processObjResult(item._source);
					if (tmp) {
						$.each(tmp, function(idx,t) { t.score = item._score; });
						processed = processed.concat(tmp);
					}
					break;
				case 'NAV':
					tmp = processNavResult(item._source);
					if (tmp) {
						tmp.score = item._score;
						processed.push(tmp);
					}
					break;
			}

		});
		return processed;
	}

	//=======================================================
	//
	//=======================================================
	var getOrderRef = function(obj) {
		var ref = obj.rowText.substr(0, obj.rowText.indexOf(' ') - 1);
		var parts = ref.split('.');
		parts = $.map(parts, function(p, idx) { return ('0' + p).slice(-2); });
		return parts.join('');
	}

	//=======================================================
	//
	//=======================================================
	var sortResults = function(a, b) {

		var compare = 0;
		var aOrderRef = getOrderRef(a);
		var bOrderRef = getOrderRef(b);

		if (a.score < b.score)
			compare = 1;
		else if (a.score > b.score)
			compare = -1;
		else {
			if (aOrderRef < bOrderRef)
				compare = -1;
			else if (aOrderRef > bOrderRef)
				compare = 1;
		}

		return compare;
	}

	//=======================================================
	//
	//=======================================================
	var updateRouting = function(term) {
		app.router.navigate('search/'+navPrep(term));
	}

	//=======================================================
	//
	//=======================================================
	var searchNotification = function(term) {
		updateRouting(term);
	}

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {
		backdrop: [
			'backdrop', 'borderedBox', app.style.backdrop
		],

		search: [ // connect to all four edges of backdrop.
			'search', 'search', {
				processResults: processResults,
				sortResults: sortResults,
				searchNotification: searchNotification
			}
		]
	};

})();
