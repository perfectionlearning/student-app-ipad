//===============================================================================
// Problem List Module: Displays a list of all problems for a given assignment
//===============================================================================
;(function() {

	var vw = app.Views.ProblemList = {};

	var assign;
	var curMode;
	var score;

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container) {
		fw.setLayout('ProblemList');

		assign = app.assignments.length && app.assignments.get(app.curAssign);
		curMode = app.modes.isDrillMode() ? 'drill' : 'score';

		var infoWid = (curMode === 'drill' ? drillMode : scoreMode);

		var dl = app.addToArray(app.globalDrawList({noNav: true, upButton: true}), drawList, infoWid);
		vw.drawList = fw.drawList(dl);

		vw.drawList.setParam('goUp', 'image', 'HomeworkUp');

		// Check for direct link to problem within assignment.
		if (app.directProblem) {
			app.directProblemRoute = 'assignprob/' + app.curAssign + '/' + app.directProblem;
			app.curProblem = app.directProblem;
			app.directProblem = null;
      app.resizeStageHeight(app.style.stageHeight);
		  $(window.parent).scrollTop(0);
			app.router.navigate(app.directProblemRoute);
		} else {
			app.directProblemRoute = null;
      app.resizeStageHeight(app.style.stageHeight);
		  $(window.parent).scrollTop(0);
			app.router.navigate('assign/' + app.curAssign);
		}
	};

	//=======================================================
	// READY function
	//=======================================================
	vw.ready = function()
	{
		app.globalUIInit();
		checkAssignmentMeta();
//		loadAssignment(app.curAssign);

//		app.TurnIn = Backbone.Model.extend({urlRoot: app.commRoot + '/turnin'});
	}

	//=======================================================
	// Check for assignment meta data - it's possible to load
	// assignment directly, without first getting metadata
	//=======================================================
	function checkAssignmentMeta() {
		if (app.assignments.length == 0) {
			app.assignments.fetch().done(loadAssignmentsSuccess).fail(loadFailure);
		}
		else {
			loadAssignment(app.curAssign);
		}
	}

	//=======================================================
	// Check for assignment meta data - it's possible to load
	// assignment directly, without first getting metadata
	//=======================================================
	function loadAssignmentsSuccess() {
		//checkPastDueForTeacher();
		loadAssignment(app.curAssign);
	}

	var loadFailure = app.failHandler("list");

	//=======================================================
	// Fetch the proper assignment
	//=======================================================
	function loadAssignment(psetID)
	{
		app.loadingBox();
		var loginType = app.loginResults.get('type');

		// We can't just check the ID, since we set it below before the assignment is successfully loaded.
		// We also check to make sure there are some problems loaded.  We clear them all below to make this fail.
		// Adding a flag to the collection would be more efficient.
		if (loginType !== 'student' && app.problemList.id === psetID && app.problemList.length) {
			//probSetLoaded();
			checkPastDueForTeacher();
		}
		else
		{
			app.problemList.reset();		// Empty the collection.  We use this to invalidate the collection.
			app.problemList.id = psetID;

			//app.problemList.fetch().done(probSetLoaded).fail(loadFailure);
			var callback = loginType === 'student' ? probSetLoaded : checkPastDueForTeacher;
			app.problemList.fetch().done(callback).fail(loadFailure);
		}
	}

	//=======================================================
	// A problem set was not successfully loaded
	//=======================================================
	var loadFailure = app.failHandler("problems");

	//=======================================================
	// Fetch the proper assignment
	//=======================================================
	function checkPastDueForTeacher() {
		var _tmpAry = app.assignments.map(function(m) {
				return _.pick(m.toJSON(), ["id", "pastdue"])
			}).filter(function(m){
				return m.id==app.curAssign && m.pastdue;
			});
		// Array has length > 0 only if assignment's pastdue flag is true.
		if (_tmpAry.length > 0) {
			var futureDue = {
				id: app.curAssign,
				due: '2116-12-25', // Arbitrary future date. 2116 is 46^2.
			}

			app.singleAssignment.setUserDueDateToFuture();
			app.singleAssignment.set(futureDue);
			// REST call to set due date ahead an arbitrary amount
			app.singleAssignment.save().done(successUpdateDueDate).fail(function() {console.log('failed saving teacher due date');});
		}
		else
			//loadAssignment(app.curAssign);
			probSetLoaded();

	}

	//=======================================================
	//=======================================================
	function successUpdateDueDate() {
		app.assignments.reset();
		checkAssignmentMeta();
	}

	//=======================================================
	// A problem set was successfully loaded
	//=======================================================
	function probSetLoaded()
	{
		app.clearLoadingBox();

		// Mark this assignment as successfully loaded, preventing future reloads

		// Initialize problem states
		initStates();

		// Reset the page for a new assignment
		app.PLPage = 0;

		// Preload problem images
		var imgList = app.getProblemImages();
		fw.preloadAssets(imgList);

		// Determine whether the assignment is complete
		if (isAssignmentComplete())
			return showCompletePopup();	// Display a helpful popup

		// Also check for an empty assignment
		if (app.problemList.length === 0)
			return showEmptyPopup();

		// Display the current score, based on mode
		showScore();

		// Show the assignment name (docks to score - do after)
		showAssignName();

		// Go directly to problem within assignment, or Show the problem list
		if (app.directProblemRoute) {
			app.linkToObject('prob');
		}
		else {
			showList();
		}
	}

	//=======================================================
	// Initialize problem states
	//=======================================================
	function initStates()
	{
		// @FIXME/DG: This really needs to be moved out of this module!
		// There is a near identical version of this in modes.js!
		// Create a new state for each question. We're trying to limit memory allocation, but there's
		// no clean way to get around this.
		app.problemList.each(function(val, key) {
			var state = new app.pState();
			var steps = val.get('solve');

			// Doubly link problem to state.  This is a bit messy, but prevents a ton of
			// info from being duplicated.  Should have an isolation layer instead.
			state.set({
				problem: val,	// Link problem to state
				correctInARow: val.get('curStreak'),
				maxStreak: val.get('maxStreak'),
				status: val.get('status'),
				stepStatus: _.pluck(steps, 'status'),
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
		wid && wid.setData(app.problemList);
	}

	//=======================================================
	// Update the score values
	//=======================================================
	function showScore()
	{
		if (curMode === 'drill')
			showScoreDrill()
		else
			showScoreNormal();
	}

	//=======================================================
	//
	//=======================================================
	function showScoreNormal()
	{
		var score = calcPoints();
		var scoreWid = fw.getWidget('score', true);
		scoreWid && scoreWid.setScore(score[0], score[1]);

		// Check for past due
		if (assign && assign.get('pastdue'))
			scoreWid && scoreWid.finalScore();
	}

	//=======================================================
	//
	//=======================================================
	function showScoreDrill()
	{
		var score = app.calcDrillScore();
		var scoreWid = fw.getWidget('statusOverlay', true);
		scoreWid && scoreWid.update(score);

		// Check for past due
		if (assign && assign.get('pastdue'))
			scoreWid && scoreWid.disableButton();
	}

	//=======================================================
	//
	//=======================================================
	function showAssignName()
	{
		var name = assign ? assign.get('name') : '';

		// We can't dock until the score widget is finalized, so using the
		// drawList is right out (unless we start hidden and redock).
		fw.createWidget('textSmartAlign', {
			id: 'aName',
			text: name,
			font: app.style.assignName.font,
			color: app.style.assignName.color
		}, {
			top: 'stage top 3',
			bottom: 'Backdrop top -2',	// -5 is good
			left: 'goUp right 12',
			right: 'score left -12',
			right2: 'statusOverlay left -12'
		});
	}

	//=======================================================
	// If we're in i-Practice (drill) mode and the assignment
	// is already complete, take special action.
	// @TODO/dg: Replace this with better server-side behavior.
	//=======================================================
	function isAssignmentComplete()
	{
		if (curMode !== 'drill')
			return false;

		var score = app.calcDrillScore();
		if (score.remaining > 0 || score.needsWork > 0)
			return false;

		return true;
	}

	//=======================================================
	//=======================================================
	function showCompletePopup()
	{
		var scoreWid = fw.getWidget('statusOverlay', true);

		app.infoPopup('Assignment Complete',
					  "You completed this assignment with a perfect score. Nice work!",
					  {noBG: true, action: assignComplete}
		);
	}

	//=======================================================
	//=======================================================
	function showEmptyPopup()
	{
		app.infoPopup("No questions asked",
					  "This assignment doesn't have any problems.",
					  {noBG: true, action: assignComplete}
		);
	}

	//=======================================================
	//
	//=======================================================
	function assignComplete()
	{
		app.linkToObject('assignList');
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
		app.curProbIndex = probIdx;
		var prob = app.problemList.at(probIdx);

		app.curProblem = prob.id;
		app.linkToObject('prob');
	}

	//=======================================================
	// Move this elsewhere
	//=======================================================
	function calcPoints()
	{
		var set = app.problemList;
		var total = 0;
		var possible = 0;
		var cnt = set.size();

		for (var i = 0; i < cnt; i++)
		{
			var sc = (set.at(i).get('score') *1) || 0;
			total += sc;

			var max = (set.at(i).get('maxScore') *1) || 0;
			possible += max;
		}

		return [total, possible];
	}

	//=======================================================
	// @FIXME/dg: Move this elsewhere!
	//=======================================================
	app.calcDrillScore = function()
	{
		var set = app.problemList;
		var mastered = 0;
		var needsWork = 0;
		var cnt = set.size();
		var remaining = cnt;
		var score = 0;
		var possible = 0;
		var wrong = 0;

		for (var i = 0; i < cnt; i++)
		{
			var sc = (set.at(i).get('score') *1) || 0;
			score += sc;

			var max = (set.at(i).get('maxScore') *1) || 0;
			possible += max;

			if (set.at(i).get('status') !== 'New')
			{
				remaining--;

				if (sc == max)
					mastered++;		// Perfect
				else
				{
					needsWork++;	// Wrong or partial

					if (sc === 0)
						wrong++;		// Failure
				}
			}
		}

		return {
			remaining: remaining,
			mastered: mastered,
			needsWork: needsWork,
			score: score,
			totalPoints: possible,
			wrong: wrong
		};
	}

	//=======================================================
	//
	//=======================================================
	function changeScoreMode(isPercent)
	{
		var wid = fw.getWidget('list');
		wid && wid.setScoreMode(isPercent);

		wid = fw.getWidget('aName');
		wid && wid.redock();
		wid && wid.relayout();		// Ideally this would happen automatically on redock.  We need a redock override system in the framework.
	}

	//=======================================================
	//=======================================================
	function resubmit()
	{
		// Temporarily restore problemList ID
		app.problemList.id = app.turnIn.id;
		app.clearLoadingBox();

		app.submitAssignment();
	}

	//=======================================================
	// @FIXME/dg: This needs to be moved into Modes
	//=======================================================
	app.submitAssignment = function()
	{
		// Do the submit
		app.loadingBox();

		app.turnIn.id = app.problemList.id;
		app.problemList.id = null;		// Force cache invalidation
		app.turnIn.save().done(submitDone).fail(submitFailure);
	}

	//=======================================================
	//
	//=======================================================
	function submitDone()
	{
//r		app.clearLoadingBox();	// Switching contexts completely rebuilds the screen. This will just slow things down.

		app.linkToObject('drillResults');
	}

	//=======================================================
	//=======================================================
	var submitFailure = app.failHandler("results", resubmit);

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {

		goUp: [
			'goUp', 'button', {
				image: 'HomeworkUp',
				click: app.homework,
				depth: fw.MIDPLUS
			}
		],

		Backdrop: [
			'backdrop', 'borderedBox', app.style.backdrop
		],

		list: [
			'probList', 'probList',
			{
				select: problemSelected
			}
		]
	};

	//------------------------------------------
	var scoreMode = {
		score: [
			'score', 'score',
			{
				isPercent: false,
				modeChange: changeScoreMode
			}
		]
	};

	//------------------------------------------
	var drillMode = {
		statusOverlay: [
			'statusOverlay', 'statusOverlay',
			{
				doSubmit:  app.submitAssignment,
				depth: 50
			}
		]
	};

})();
