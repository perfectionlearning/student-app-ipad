//===============================================================================
// Simple view that shows a single static image
//===============================================================================
;(function() {

	var vw = app.Views.Classes = {};

	var activeClass;
	var classWids;	// This feels wrong. Normally we use controller widgets for logic like this. Controllers should be more generic though.
	var errorCount = 0;

	var MAX_RETRIES = 5;

/*
	var mockData = [
		{id: 0, name: 'An introduction to modern psychology as influenced by pop culture, most notably My Little Pony and Breaking Bad', teacher: 'Jesse Pinkiepie', section: 'Morning'},
		{id: 1, name: 'First Person Physiques', teacher: 'Billy Blanks', section: 'Afternoon'},
		{id: 5, name: 'People will eat anything', teacher: 'Ronald McDonald', section: '8'},
		{id: 2, name: 'Physics for Mormons', teacher: 'Mitt Romney', section: ''},
		{id: 9, name: 'Things I found in my bathtub', teacher: 'Bert', section: '1'},
		{id: 12, name: "Wow, I'm in a lot of classes", teacher: 'Bubba McGee', section: ''}
	];
*/

	//=======================================================
	// Initialize the page
	// container seems to be the HTML tag.
	//=======================================================
	vw.init = function(container)
	{
		// Drop a nav anchor
		app.router.navigate('classes');

		// Init variables
		classWids = [];

		// Set the drawlist
		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true}), drawList));
		// Remove MathX logo if no MathX product.
		if (!app.hasMathX) {
			delete vw.drawList.Logo;
		}

		// Select the layout
		fw.setLayout('Classes');
	};

	//=======================================================
	// READY function
	//=======================================================
	vw.ready = function()
	{
		app.globalUIInit();

		app.loadingBox();
		getActiveClass().done(loadClassList);
	}

	//=======================================================
	// This shouldn't be necessary in this module.  Do it anyway.
	//=======================================================
	vw.close = function()
	{
		fw.abortAsync();
	}

//===============================================================================
//===============================================================================

	//=======================================================
	// Create error handlers
	//=======================================================
	var loadFailure = app.failHandler("classes");

	//=======================================================
	// Get the ID of the currently active class
	//=======================================================
	function getActiveClass()
	{
		return app.currentClass.getClass().done(storeCurrent).fail(loadFailure);
	}

	//=======================================================
	// Get the ID of the currently active class
	//=======================================================
	function storeCurrent()
	{
		activeClass = app.currentClass.get('current');
	}

	//=======================================================
	// Fetch the proper assignment
	//=======================================================
	function loadClassList()
	{
		if (app.classList.length > 0)
			classesLoaded();
		else
			app.classList.fetch().done(classesLoaded).fail(loadFailure);
	}

	//=======================================================
	//=======================================================
	function classesLoaded()
	{
		app.clearLoadingBox();

		if (app.classList.length > 1)
			populateList();
		else
			goToAssignmentList();
	}

	//=======================================================
	//
	//=======================================================
	function populateList()
	{
		var container = fw.getWidget('listWid');
		var cw = container.width();

		app.classList.each(function(model, idx) {
			var record = model.toJSON();	// Slightly lazy method

			var item = container.add('classDisplay', {
				w: cw,
				data: record,
				active: (record.id === activeClass),
				callback: setActive
			});

			container.addItem(item);
			classWids.push(item);
		});
	}

	//=======================================================
	// If only one class, go directly to assignments.
	//=======================================================
	function goToAssignmentList() {
		app.router.assignments();
	}

//===============================================================================
//===============================================================================

	//=======================================================
	//
	//=======================================================
	function setActive(id)
	{
		// Ignore clicks during server communications

		// Switch the display
		var oldIdx = idToIndex(activeClass);
		var newIdx = idToIndex(id);

		if (oldIdx !== -1)
			classWids[oldIdx].deactivate();	// Deactivate the old class

		classWids[newIdx].activate();			// Activate the new class
		activeClass = id;

		// Also set the new book ID
		app.book_id = app.classList.at(newIdx).get('book_id') * 1;
		app.assignments.resetURL();

		// Tell the server to switch classes
		app.loadingBox();
		errorCount = 0;
		selectClass(id);
	}

	//=======================================================
	//
	//=======================================================
	function selectClass(id)
	{
		app.currentClass.setClass(id).done(setSuccess).fail(setError);
	}

	//=======================================================
	//=======================================================
	function setSuccess()
	{
		app.assignList();
	}

	//=======================================================
	//=======================================================
	function setError()
	{
		// Retry with limit
		if (errorCount++ < MAX_RETRIES)
			selectClass(activeClass);
		else
			loadFailure();
	}

//===============================================================================
//===============================================================================

	//=======================================================
	//
	//=======================================================
	function idToIndex(id)
	{
		for (var i = 0, len = app.classList.length; i < len; i++)
		{
			if (app.classList.at(i).id === id)
				return i;
		}

		return -1;
	}

//===============================================================================
//===============================================================================

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {

		backdrop: [
			'backdrop', 'borderedBox', app.style.backdrop
		],

		Logo: [
			'Logo', 'image', {
				image: 'Logo'
			}
		],

		listWid: [
			'classList', 'pagedCollection', {
				bgColor: 'white',
				buttonAsset: 'TOCArrows',
				buttonFrames: ['Down', 'Up'],
				buttonOffset: [56, -5],
				buttonGap: 4,
				gap: 10,
				topMargin: 10,
				bottomMargin: 10,
				borderWidth: 0,
				borderColor: 'black'
			}
		],
	};

})();
