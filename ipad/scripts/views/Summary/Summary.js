//===============================================================================
// Problem List Module: Displays a list of all problems for a given assignment
//===============================================================================
;(function() {

	var vw = app.Views.Summary = {};


	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container)
	{
		var that = this;
		var title = app.getSectionName(app.curNav);

		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList(), drawList));

		// Preload video list.  This makes the Next button go from one summary video to the next one.
		app.setVideoUrls(app.curObject.ch, false);

		vw.drawList.setParam('summary', 'title', title);
		vw.drawList.setParam('summary', 'cards', app.curObject.ch);
		vw.drawList.setParam('summary', 'clickCard', clickCard);

		fw.setLayout('Summary');
	}

	//=======================================================
	//=======================================================
	vw.ready = function()
	{
		if (app.FunctionalTestMode) {
			app.globalReadyForFunctionalTest();
		}

		app.globalUIInit();
	}

	//=======================================================
	//=======================================================
	vw.close = function()
	{
		fw.abortAsync();
	}

	//=======================================================
	//=======================================================
	function clickCard(wid)
	{
		var obj = app.curObject.ch[wid.idx];
		app.linkToObject(obj);
	}

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {

		summary: [
			'summary', 'summary', {
			}
		],

		blankCard: [
			'blankSumCard', 'image', {
				image:'SUMBlankCard',
				depth:-1
			}
		]
	};
})();
