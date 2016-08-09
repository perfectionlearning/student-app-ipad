//===============================================================================
//	search widget
//===============================================================================
framework.widget.search = function()
{
	var that = this;
	var style = app.style.search;

	var results;
	var searchMast, searchField, searchButton, searchDesc;
	var searchResultList;

	//=======================================================
	//
	//=======================================================
	var failure = function() {
		app.clearLoadingBox();
		searchDesc.setText('Search failed! Check your Internet connection and try again.');	// @FIXME/dg: Replace with better error handling
	}

	//=======================================================
	//
	//=======================================================
	var empty = {hits:[]};	// Define once to limit allocation

	function success()
	{
		app.clearLoadingBox();

		var results = that.model.get('hits') || empty;
		that.createResultRows(results.hits);
	}

	//=======================================================
	//
	//=======================================================
	var linkTo = function(obj) {
		if (obj.objName) {
			var objName = obj.objName;
			var scheme = obj.scheme;
			var loc = app.findObject(objName, scheme);
			var ch = loc[0],
				un = loc[1],
				top = loc[2],
				sec = loc[3],
				sch = loc[4];
		}
		else if (obj.nav) {
			ch = obj.nav.chapter;
			un = obj.nav.unit;
			top = obj.nav.topic;
			sec = obj.nav.section;
			sch = obj.nav.scheme;
		}

		app.navJump(ch, un, top, sec, sch);
	}

	//=======================================================
	// search.  Invoked for either the URL query or for
	// input of a search term on the search page.
	// Note the use of ajaxSetup to set the withCredentials flag.
	// This is not at all idea; however, due to cross-domain issues,
	// the search will not work with the flag set to true, but
	// other parts of the product will not work with the flag
	// set to false.
	//=======================================================
	var search = function(term) {
		if (term) {
			app.loadingBox();

			// Message to the user of this widget.
			that.searchNotification(term);

			// Put the search term into the field.
			searchField.value(term);
			that.model.clear();
			that.model.setTerm(term);

			var results = that.model.save().done(success).fail(failure);
		}
	}

	//=======================================================
	// Bridge from search button click to search function
	//=======================================================
	var processSearchClick = function() {
		if (searchField) {
			search(searchField.value());
		}
	}

	//=======================================================
	// Bridge from Enter within search field to search function
	//=======================================================
	var processKeyPress = function(key) {
		if (key == app.Keys.Enter && searchField) {
			search(searchField.value());
		}
	}

	//=======================================================
	// To perform search on page load when URL contains search term
	//=======================================================
	this.processSearchURL = function(term) {
		if (term) {
			search(term);
		}
	}

	//=======================================================
	//
	//=======================================================
	createSearchField = function() {
		searchField = that.add('inputPrimitive', {
			w: style.fieldWidth
		});
		searchButton = that.add('button', {
			image: 'SearchBtn',
			click: processSearchClick,
			depth: 1
		});
		fw.dock(searchField, {
			wid: searchMast,
			my: 'top center',
			at: 'bottom center',
			ofs: (style.searchBtnGap + searchButton.width()) / -2 + ' 15'
		});
		fw.dock(searchButton, {
			wid: searchField,
			my: 'top left',
			at: 'top right',
			ofs: style.searchBtnGap + ' -4'
		});
		searchField.applyAction('keypress', { press: processKeyPress });
	}

	//=======================================================
	//
	//=======================================================
	this.createResultRows = function(results)
	{
		searchResultList.reset();
		var rows = [];
		var lastRow = that;

		var searchResults = that.processResults(results);
		searchResults.sort(that.sortResults);

		searchDesc.setText(searchResults.length + ' results');

		if (searchResults.length > 0) {
			$.each(searchResults, function(idx, item) {
//console.log(item.score, item.rowText);
				// Create a unit block
				var wid = searchResultList.add('searchResult', {
					x: 0,
					y: 0,
					w: searchResultList.width() - 10,	// @FIXME/dg: Weird and arbitrary
					objName: item.obj,
					resultText: item.rowText,
					nav: item.nav,
					scheme: item.scheme,
					schemes: item.schemes,
					click: linkTo
				});
				// Place the unit block inside the "pagedCollection" sectionList
				searchResultList.addItem(wid);
			});
		}
//		else {
//			noResults.show();
//		}
	}


//===============================================================================
// Standard widget API
//===============================================================================

	//=======================================================
	// Called after the widget has been docked
	//=======================================================
	this.docked = function()
	{
		search();
		searchMast = that.add('image', {
			image: 'SearchMasthead'
		}, {
			wid: that,
			my: 'top center',
			at: 'top center'
		});

		createSearchField();
		searchDesc = that.add('text', {
			text: '',
			font: style.searchDescFont,
			color: style.searchDescColor,
			w:400,
			h:20
		},{
			top: searchField.id + ' bottom ' + style.sectionTopGap, // This is to align the results count with the results, not with the search field.
			left: searchField.id + ' left ' + style.searchFieldPad,
			right: that.id + ' right -' + style.sectionSideMargin
		});

		searchResultList = that.add('pagedCollection', {
			bgColor: 'white',
			buttonAsset: 'TOCArrows',
			buttonFrames: ['Down', 'Up'],
			buttonOffset: [style.pageButtonOffsetX + (style.searchBtnGap + searchButton.width()/2+19), style.pageButtonOffsetY],
			buttonGap: style.pageButtonGap,
			gap: style.unitGap,
			topMargin: style.sectionTopGap,
			bottomMargin: style.sectionBottomGap
		},
		{
			top: searchDesc.id + ' bottom ', // change to something else.
			bottom: that.id + ' bottom -' + style.sectionBottomMargin,
			left: searchField.id + ' left ' + style.searchFieldPad,
			right: searchButton.id + ' right -' + (style.searchBtnGap + searchButton.width())
		});

		searchField.focus();
	}

};
