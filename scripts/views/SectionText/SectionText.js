//===============================================================================
// Section Text view -- Displays text and clickable cards
//===============================================================================
;(function() {

	var vw = app.Views.SectionText = {};

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container) {
		loadData(app.curObject);

		var standards = app.standardData(app.curObjName);	// Returns null if no standards exist for this object

		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList(), drawList));

		var title = app.getSectionName(app.curNav);
		vw.drawList.setParam('sectionText', 'title', title);
		vw.drawList.setParam('sectionText', 'cards', app.curObject.ch || []);
		vw.drawList.setParam('sectionText', 'standards', standards);

		fw.setLayout('SectionText');
	};

	//=======================================================
	//=======================================================
	vw.ready = function() {
		app.globalUIInit();
	};

	//=======================================================
	//=======================================================
	vw.close = function() {
		fw.abortAsync();
	}

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {
		sectionText: [
			'sectionText', 'sectionText', {
				clickCard: clickCard,
				clickStandard: clickStandard
			}
		]
	};

	//=======================================================
	// Load the section's data file
	//=======================================================
	function loadData(object)
	{
		app.loadingBox();

		var chapPath = app.getTextPath(object);

        var model = app.sectionTextModel;
		model.clear();		// Wipe everything out
		model.url = chapPath + object.df[0];
		model.fetch({
			success: gotData,
			//error: failureLoadSectionData,
			error: loadFailure
		});
	}

	//=======================================================
	//
	//=======================================================
	var loadFailure = app.failHandler("section");

	//=======================================================
	// The data file was successfully loaded
	// Do some processing, including loading child data files
	//=======================================================
    function gotData(model)
    {
		app.clearLoadingBox();

		var sectionText = fw.getWidget('sectionText', true);
		if (sectionText)
		{
			// Start preloading all of the child data files
			if (app.curObject.ch)
				app.setVideoUrls(app.curObject.ch, false);

			// We're still loading the child data files, but do it in the background.  It's time to draw
			// the page.
			// The layout will have largely been drawn already (preInit()); however, now it's necessary to
			// fill in text and graphics that weren't available on the first drawing.
			sectionText.afterDataLoaded();

			if (app.FunctionalTestMode) {
				app.globalReadyForFunctionalTest();
			}
		}
	};

	//=======================================================
	//=======================================================
	function clickCard(idx)
	{
		if (!app.curObject.ch)
			return;

		var obj = app.curObject.ch[idx];

		if (obj)
			app.linkToObject(obj);
	}

	//=======================================================
	// A standards link was clicked
	//=======================================================
	function clickStandard(reference)
	{
		app.standardsClick(reference);
	}

})();
