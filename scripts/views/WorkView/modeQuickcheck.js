//===============================================================================
// Quickcheck mode plugin
//
// Plugin required API:
//   getNavOptions
//   formatRoute
//   getHelpOptions
//   getLayoutOptions
//   getProblemTitle
//   getScoringModel
//   loadProblem
//   reloadProblem
//   isLockedOut
//	 correctActions
//	 incorrectActions
//	 postQuestionAction
//===============================================================================
;(function() {

	var API = {};

	//----------------------------------------------------
	// Navigation flags. Options are fwdBack and bookNav.
	//----------------------------------------------------
	var navOptions = {
		fwdBack: false,
		bookNav: true
	};

	//----------------------------------------------------
	// Layout flags, which determine which items appear on the screen.
	// Possible options:
	//   score: Show score indicator
	//   aName: Show assignment name
	//   assignUpButton: Show "up to problem list" button
	//   quizboardUpButton: Show the quizboard up button
	//   vidPlayer: Show the "summary card" video player
	//   hideSteps: Don't display the steps button
	//   hideMenu: Don't display the help menu button
	//----------------------------------------------------
	var layoutOptions = {
		vidPlayer: true			// Show the "summary card" video player
	};

	//----------------------------------------------------
	// Help menu flags. List of items that can appear on the help menu.
	// Possible options:
	//   hintQuiz: Show hint at the top level.
	//   tryAnother: Show "Try another"
	//   showSolution: Show "Show Solution"
	//   helpQuickcheck: Show "Quickcheck help"
	//   helpInput: Show "Input help"
	//
	// Not currently used, but may be:
	//   video: Show video (whiteboard) at top level
	//   videoSteps: Show video (whiteboard) in steps
	//   hintSteps: Show hints in steps
	//   steps: Show steps button (technically not on the help menu -- move to a different call?)
	//----------------------------------------------------
	var helpOptions = {
		tryAnother: true,
		showSolution: true,
		helpQuickcheck: true,
		helpInput: true,

		video: true,
		videoSteps: true,
		hintSteps: true,
		steps: true
	};

	//----------------------------------------------------
	// Problem title
	//----------------------------------------------------
	var title = "Quickcheck";

	//----------------------------------------------------
	// Scoring model name
	//----------------------------------------------------
	var model = "Quickcheck";

	var qcPromise;

	//=======================================================
	// Returns a list of navigation helpers for the current mode,
	// specifically whether forward/back navigation,
	// pulldown navigation, and up button navigation should appear.
	//
	// RETURNS:
	//   Object: {up: Boolean, fwdBack: Boolean, bookNav: Boolean}
	//=======================================================
	API.getNavOptions = function()
	{
		return navOptions;
	}

	//=======================================================
	// Returns a route string for this mode.
	//
	// RETURNS:
	//   String: Properly formatted route string.
	//=======================================================
	API.formatRoute = function(assignID, problemID)
	{
		return '';		// No special routing for quickchecks
	}

	//=======================================================
	// Returns an array of items that should be enabled
	// (or disabled, whichever is more efficient).
	// The main help menu logic is still used, but the
	// permissions array is cross-referenced.
	//=======================================================
	API.getHelpOptions = function()
	{
		return helpOptions;
	}

	//=======================================================
	// Returns a list of items that should be disabled (or enabled),
	// assuming other external checks allow it.
	//=======================================================
	API.getLayoutOptions = function()
	{
		return layoutOptions;
	}

	//=======================================================
	// Returns the title displayed above a problem, e.g.
	// "Question 1" or "Quickcheck".
	//=======================================================
	API.getProblemTitle = function(problem, probIndex)
	{
		return title;
	}

	//=======================================================
	// Returns the name of the scoring mode to use.
	//
	// RETURNS:
	//   String: Name of scoring model. A string is used rather
	//           than a reference to promote decoupling.
	//=======================================================
	API.getScoringModel = function()
	{
		return model;
	}

	//=======================================================
	// If an assignment is pre-loaded, return the desired
	// problem instance. If not, create an assignment for it
	// and load the problem.
	//
	// PARAMS:
	//   assignID: Assignment ID, if known
	//   problemID: Problem assignment ID (is assignment ID specified) or problem ID
	//
	// RETURNS:
	//   Promise: The problem is guaranteed loaded when the
	//            promise resolves.
	//=======================================================
	API.loadProblem = function(assignID, problemID)
	{
		// I'd prefer to do this externally, but it's definitely QC-only logic.
		// That belongs here.
		var name = app.curObjName;
		app.curProblem = name.substring(name.indexOf('_') + 1);

		var chID = app.chapterID();
		app.qcAssignments.chapterMode(chID);

		// Unfulfilled promise to be used later
		qcPromise = new $.Deferred();

		if (chID !== app.curQcChapter)
		{
			// Assignment load promise
			var assignPromise = app.qcAssignments.fetch().done(loadQcProbs);	// No .fail required. The promise is just passed along.

			// We need to return a promise, so combine the two
			return $.when(assignPromise, qcPromise);
		}
		else
		{
			loadQcProbs();
			return qcPromise;
		}
	}

	//=======================================================
	// We now have the assignment number for this chapter's QCs.  Load the entire assignment.
	//=======================================================
	function loadQcProbs()
	{
		// Reality check. Each chapter should only have 1 assignment.
		if (app.qcAssignments.length !== 1)
			return qcPromise.reject({status:0});	// No return value needed. This is an early out.

		app.curAssign = app.qcAssignments.at(0).id;

		// Check to see if the QC assignment is already loaded
		// This seems redundant. We have a similar check in loadProblem(), based on chapter IDs.
		if ((app.problemList.id === app.curAssign) && (app.findProblem() !== null))
			return qcLoadDone();			// No return value needed. This is an early out.

		app.problemList.id = app.qcAssignments.at(0).id;
		app.problemList.fetch().done(qcLoadDone).fail(qcLoadFail);
	}

	//=======================================================
	// QCs should always get here, barring an early exit failure.
	// We also need to check for invalidated problems.
	//=======================================================
	function qcLoadDone()
	{
		// Mark the chapter as loaded, so it won't happen again.  Don't do it until successful.
		app.curQcChapter = app.chapterID();

		// Find the correct problem from the assignment
		var prob = app.findProblem();

		if (prob === null)
			qcPromise.reject({status:0});
		else
		{
			app.curProbIndex = prob;
			app.modes.createState();
			qcPromise.resolve();
		}
	}

	//=======================================================
	//=======================================================
	function qcLoadFail(err)
	{
		qcPromise.reject(err);
	}

	//=======================================================
	// Reload the current problem, possibly with new VTP
	// substitution.
	//
	// The server generally determines whether substitution
	// is required, but sometimes the client needs to force
	// problem regeneration.
	// The server should be smart enough to know whether this
	// is valid or not.
	//
	// PARAMS:
	//   options: Object containing various requests.
	//            The only currently valid option is "different",
	//            which is a Boolean.
	//=======================================================
	API.reloadProblem = function(options, problem)
	{
		problem.setMode('assign');

		// if the "different" flag is set, change the model to use the "reload with different values" REST call.
		if (options && options.different)
		{
			problem.reloadDifferent();
			var promise = problem.fetch();
			problem.resetUrl();		// restore the model's URL.
		}
		else
			promise = problem.fetch();

		return promise;
	}

	//=======================================================
	// Determines whether the current problem within an
	// assignment is "locked out", meaning it can't be
	// answered anymore.
	//
	// PARAMS:
	//   Assignment reference
	//   Index of current problem within that assignment
	//
	// RETURNS:
	//   Boolean: TRUE if the requested problem is locked out
	//=======================================================
	API.isLockedOut = function(assign, probIndex)
	{
		// There will be a stored status if previously answered correctly, but we
		// never want to actually lock the student out.
		return false;
	}

	//=======================================================
	// List of extra actions to take when an answer is
	// correct.
	//=======================================================
	API.correctActions = function()
	{
		return [];
	}

	//=======================================================
	// List of extra actions to take when an answer is
	// incorrect.
	//=======================================================
	API.incorrectActions = function()
	{
		return [];
	}

	//=======================================================
	// Determine the action to perform after a question has
	// been answered correctly. Similar to correctActions, but
	// this occurs afterwards. correctActions is optional;
	// this is a mandatory action to do things like move on to
	// the next question.
	//=======================================================
	API.postQuestionAction = function()
	{
		return 'sameQuestion';
	}

	//=======================================================
	// Register this mode plugin
	//=======================================================
//	app.modes.register("Quickcheck", API);
	app.modes.register("QC", API);

})();
