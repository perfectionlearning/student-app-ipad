//===============================================================================
// Text view -- Displays text
//===============================================================================
;(function() {

	var vw = app.Views.TextView = {};

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container) {
		fw.setLayout('TextView');

        app.loadingBox();
   		loadData(app.curObject);

		var standards = app.standardData(app.curObjName);	// Returns null if no standards exist for this object

		// This feels clumsy. Construct the drawlist in order: global, drawList, standards (if any), text
		var dls = app.globalDrawList();
		dls.push(drawList);
		if (standards)
			dls.push(standardDL);
		dls.push(textDL);
		vw.drawList = fw.drawList(dls);

		// Set parameters for various widgets
		var sec = app.getSectionName(app.curNav);
		vw.drawList.setParam('Title', 'text', sec);

		if (standards)
			vw.drawList.setParam('Standards', 'data', standards);
	};

	//=======================================================
	//=======================================================
	vw.ready = function() {
		if (app.FunctionalTestMode) {
			app.globalReadyForFunctionalTest();
		}

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
		Backdrop: [
			'Backdrop', 'borderedBox', app.style.backdrop
		],

		Title: [
			'Title', 'text', {
				text: '',
				color: app.style.sectionText.titleColor,
				font: app.style.sectionText.titleFont
			}
		]
	};

	//-------------------------------
	// Standards widget
	//-------------------------------
	var standardDL = {
		Standards: [
			'Standards', 'standards', {
				click: clickStandard
			}
		]
	};

	//-------------------------------
	// Text. Separated since it must come after standards.
	//-------------------------------
	var textDL = {
		Text: [
			'Text', 'text', {
				text: '',
				color: app.style.sectionText.textColor,
				font: app.style.sectionText.textFont
			}
		]
	};

	//=======================================================
	// Load the text view's data file
	//=======================================================
	function loadData(object)
	{
		var chapPath = app.getTextPath(object);

        var model = app.sectionTextModel;

		model.clear();		// Wipe everything out
		model.url = chapPath + object.df[0];	// @FIXME/dg: Fetch this from BookDefinition.js
		model.fetch({
			success: gotData,
			error: loadFailure
		});
	}

	//=======================================================
	//=======================================================
	var loadFailure = app.failHandler("section");

	//=======================================================
	// Wrap text in paragraphs
	//=======================================================
	function wrapParagraphs(item)
	{
		return '<p>' + item + '</p>';	// @FIXME/dg: HTML processing shouldn't occur here! We're trying to limit HTML dependencies!
	}

	//=======================================================
	// The data file was successfully loaded
	// Do some processing, including loading child data files
	//=======================================================
    function gotData(model)
    {
		app.clearLoadingBox();

		var wid = fw.getWidget('Text');
		var para = model.get('secText');
		var text = para.map(wrapParagraphs).join('');

		wid.setText(text);
	};

	//=======================================================
	// A standards link was clicked
	//=======================================================
	function clickStandard(reference)
	{
		app.standardsClick(reference);
	}

})();
