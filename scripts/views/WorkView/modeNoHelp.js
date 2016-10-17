//===============================================================================
// OHW "Classic" mode (which includes quizes and exams) plugin
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
		fwdBack: true,
		bookNav: false
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
//		score: true,			// Show score indicator
		aName: true,			// Show assignment name
		assignUpButton: true,	// "Up to problem list" button
//		vidPlayer: true,		// Show the "summary card" video player
		hideSteps: true,		// Hide steps
		hideMenu: true
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
	};

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
		return 'prob/' + problemID;
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
		return "Question " + (probIndex+1);
	}

	//=======================================================
	// Returns the name of the scoring mode to use.
	//
	// RETURNS:
	//   String: Name of scoring model. A string is used rather
	//           than a reference to promote decoupling.
	//=======================================================
	API.getScoringModel = function(problem)
	{
		if (problem.get('ansType') !== 'multiPart')
			return "OHWSingle";

		return "OHWMulti";
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
		return app.modes.setProbIndex(assignID, problemID);
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
		var prob = assign.at(probIndex);
		var status = prob.get('status');

		var lockedStatus = ['Locked', 'Correct', 'Pending'];
		return (lockedStatus.indexOf(status) !== -1);
	}

	//=======================================================
	// List of extra actions to take when an answer is
	// correct.
	//=======================================================
	API.correctActions = function()
	{
		return ['updateScore'];
	}

	//=======================================================
	// List of extra actions to take when an answer is
	// incorrect.
	//=======================================================
	API.incorrectActions = function()
	{
		return ['updateSubmissions'];
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
		return 'nextQuestion';
	}

	//=======================================================
	// Register this mode plugin
	//=======================================================
	app.modes.register("NoHelp", API);

})();
