//===============================================================================
// Quizboard Module: Displays a list of all problems for a given quizboard
//===============================================================================
;(function() {

	var vw = app.Views.Quizboard = {};
	var style = app.style.quizboard;

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container) {
		fw.setLayout('Quizboard');
		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList(), drawList));
	};

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {

		Backdrop: [
			'backdrop', 'borderedBox', app.style.backdrop
		],


		directions: [
			'directions', 'text', {
				text: "Click on a question, then select your answer.",
				color: style.qColor,
				font: style.qFont,
			}
		],

		completed: [
			'score', 'score', {
				isPercent: false,
				label: "Completed",
				color: '#ef732e'
			}
		],

		list: [
			'probList', 'probList',
			{
				select: problemSelected,
				showChoices: true

			}
		],

		nextButton: [
			'nextButton', 'button', {
				image: 'STIcons',
				frame: 'Next',
				depth: fw.MIDPLUS,
				click: app.nextSection
			}
		],

		backButton: [
			'backButton', 'button', {
				image: 'STIcons',
				frame: 'Back',
				depth: fw.MIDPLUS,
				click: app.prevSection
			}
		]
	};

	//=======================================================
	// READY function
	//=======================================================
	vw.ready = function()
	{
		app.globalUIInit();

		app.curAssign = app.curObjName;
		loadQuizboard(app.curObjName);
	}

	//=======================================================
	// Fetch the proper assignment
	//=======================================================
	function loadQuizboard(assignID)
	{
		app.loadingBox();

		// We can't just check the ID, since we set it below before the assignment is successfully loaded.
		// We also check to make sure there are some problems loaded.  We clear them all below to make this fail.
		// Adding a flag to the collection would be more efficient.
		if (app.problemList.id === assignID && app.problemList.length)
			quizboardLoaded();
		else
		{
			app.problemList.reset();		// Empty the collection.  We use this to invalidate the collection.
			app.problemList.id = assignID;

			//app.problemList.fetch().done(quizboardLoaded).fail(probFetchError);
			app.problemList.fetch().done(quizboardLoaded).fail(loadFailure);
		}
	}

	//=======================================================
	// A problem set was successfully loaded
	//=======================================================
	var loadFailure = app.failHandler("problems");


	//=======================================================
	// A problem set was successfully loaded
	//=======================================================
	function quizboardLoaded()
	{
		app.clearLoadingBox();

		// Initialize problem states
		initStates();
/*
		// Reset the page for a new assignment
		app.PLPage = 0;

		// Preload problem images
		var imgList = app.getProblemImages();
		fw.preloadAssets(imgList);
*/
		var completed = calcCompleted();
		var completedWid = fw.getWidget('completed');
		completedWid && completedWid.setScore(completed[0], completed[1]);

		// Create the main widget
		showList();
	}

	//=======================================================
	// Initialize problem states
	//=======================================================
	function initStates()
	{
		// @FIXME/DG: This really needs to be moved out of this module!
		// Create a new state for each question. We're trying to limit memory allocation, but there's
		// no clean way to get around this.
		app.problemList.each(function(val, key) {
			var state = new app.pState();

			// Doubly link problem to state.  This is a bit messy, but prevents a ton of
			// info from being duplicated.  Should have an isolation layer instead.
			state.set({
				problem: val,	// Link problem to state
				correctInARow: val.get('curStreak'),
				maxStreak: val.get('maxStreak'),
				status: val.get('status')
			});

			val.set({state: state}, {silent:true});	// Link state to problem
		});
	}

	//=======================================================
	//
	//=======================================================
	function showList()
	{
		var wid = fw.getWidget('list');
		wid && wid.setShowChoices(true);
		wid && wid.setData(app.problemList);
	}


	//=======================================================
	// Context CLOSE function
	//=======================================================
	vw.close = function()
	{
		// Abort any requests in progress
		fw.abortAsync();
	}

	//=======================================================
	//
	//=======================================================
	function problemSelected(probIdx)
	{
//		var qz = app.quizboard.at(idx);
		app.curProbIndex = probIdx;
		var prob = app.problemList.at(probIdx);

		app.curProblem = prob.id;
		app.linkToObject('qzprob');
	}


	//=======================================================
	// Move this elsewhere
	//=======================================================
	function calcCompleted()
	{
		var set = app.problemList;
		var total = 0;
		var possible = 0;
		var cnt = set.size();

		for (var i = 0; i < cnt; i++)
		{
			var status = set.at(i).get('status');
			if (status !== 'New')
				total++;
		}

		return [total, cnt];
	}
})();
