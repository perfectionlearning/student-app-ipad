//===============================================================================
// Problem loading and assignment management for WorkView
//
// Different modes are handled via plugins. This module both manages the plugins
// and contains some common code.
//
// @FIXME/dg: "TEST" mode MUST be removed before shipping!  It will allow easy cheating!
//
// @FIXME/dg: We have both a view. and app.modes. namespace! Why two?
// view appears to be the external API, mostly.
// app.modes routines in here are shared code used by the mode plugins.
// HOWEVER, the redirect to the plugins also uses app.modes. This needs to be cleaned up!
//===============================================================================
;(function() {

	app.modes = {};			// Public interface object
	var modePlugins = {};	// Registered plugins
	var curMode = '';		// Current mode name (for caching)

	var requiredAPI = [
		"getNavOptions",
		"formatRoute",
		"getHelpOptions",
		"getLayoutOptions",
		"getProblemTitle",
		"getScoringModel",
		"loadProblem",
		"reloadProblem",
		"isLockedOut",
		"correctActions",
		"incorrectActions",
		"postQuestionAction"
	];

	var view = app.Views.WorkView;

	// These are routines that can be kicked off by modes for correct and incorrect answers
	var resultActionHandlers = {
		updateStatus: view.updateStatus,
		updateScore: view.updateScore,
		updateSubmissions: view.updateSubmissions
	};

//===============================================================================
// Generic Mode Interface
//===============================================================================

	//=======================================================
	// Register a new mode plugin
	//=======================================================
	app.modes.register = function(name, API)
	{
		// Validate the plugin: ensure all required API items exist
		for (var i = 0, len = requiredAPI.length; i < len; i++)
		{
			if (!API[requiredAPI[i]])
				return fw.warning('Attempting to register a mode plugin with an incompatible API: ' + name);
		}

		if (modePlugins[name])
			return fw.warning('Attempting to register a mode plugin with an identical name: ' + name);

		modePlugins[name] = API;
	}

	//=======================================================
	//
	//=======================================================
	function setModeHandlers(modeName)
	{
		// Ensure a plugin exists for the requested mode
		if (!modePlugins[modeName])
		{
			fw.warning("The requested mode doesn't have a registered plugin: " + modeName);
			return false;
		}

		// Forward the API
		for (var i = 0, len = requiredAPI.length; i < len; i++)
		{
			var funcName = requiredAPI[i];
			app.modes[funcName] = modePlugins[modeName][funcName];
		}

		return true;
	}

	//=======================================================
	//
	//=======================================================
	function setMode(modeName)
	{
		// If the mode hasn't changed, don't do anything
		if (curMode === modeName)
			return true;

		// Set the mode handlers for the current mode
		if (setModeHandlers(modeName))
		{
			curMode = modeName;
			return true;
		}

		return false;
	}

	//=======================================================
	//=======================================================
	view.setMode = function()
	{
		var modeName = getMode();
		var success = setMode(modeName);

		if (!success)
			alert('Unknown workview mode! The application is about to crash.');
	}

	//=======================================================
	// Determine which mode to use.
	//
	// This routine uses external data to make the decision.
	// Therefore, it technically shouldn't be in this module.
	//=======================================================
	function getMode()
	{
		if (app.curObjName === 'prob')
		{
			if (app.modes.isNoHelpMode())
				return "NoHelp";
			else if (!app.modes.isDrillMode())
				return "OHW";
			else
				return "Drill";
		}
		else
			return "TEST";
	}

	//=======================================================
	// This is bad. We can determine this through a mode call.
	// Here in modes, we need to do it this way, but it can be
	// a private function. Consider moving it outside of this module, though.
	//
	// Externally, we could use getLayoutOptions, which is
	// better design.
	// The problem is that outside of WorkView a mode isn't
	// currently activated.
	//
	// Fix this at some point!
	//=======================================================
	app.modes.isDrillMode = function()
	{
		var assign = app.assignments.length && app.assignments.get(app.curAssign);
		var type = assign && assign.get('type').toLowerCase();
		if (type === 'ihomework' || type === 'practice')
			return true;

		return false;
	}

	//=======================================================
	// This is probably equally bad.
	//=======================================================
	app.modes.isNoHelpMode = function() {
		var assign = app.assignments.length && app.assignments.get(app.curAssign);
		var type = assign && assign.get('type').toLowerCase();
		if (type === 'test' || type === 'quiz')
			return true;

		return false;
	}
	
//===============================================================================
// Shared Mode code
//===============================================================================

	//=======================================================
	// Assignment management -- Load a problem and ensure that
	// it's valid.
	//=======================================================
	view.assignmentManager = function()
	{
		return $.when(getProblem()).then(ensureValid);
	}

	//=======================================================
	// OHW: The assignment is assumed to be already loaded
	// TEST: Create a new assignment with a length of 1, and load a problem into it
	// QC: Check the QC_chapter list.  If it isn't currently loaded, load it.
	// QZ: Quizboard
	//=======================================================
	function getProblem()
	{
		return app.modes.loadProblem(app.curAssign, app.curProblem);
	}

	//=======================================================
	//
	//=======================================================
	function ensureValid()
	{
		// The problem has been loaded.  Ensure that it's valid.
		var problem = app.problemList.at(app.curProbIndex);

		if (problem.get('invalid') === true)
			return view.reloadProblem();		// If invalid, reload the problem
		else
			return {};		// Immediately succeed
	}

	//=======================================================
	// Initialize the state for a new problem
	//=======================================================
	app.modes.createState = function()
	{
		var problem = app.problemList.at(app.curProbIndex);
		var state = new app.pState();

		// Doubly link problem to state.  This is a bit messy, but prevents a ton of
		// info from being duplicated.  We should have an isolation layer instead.
		var steps = problem.get('solve');
		state.set({
			problem: problem,	// Link problem to state
			correctInARow: problem.get('curStreak'),
			maxStreak: problem.get('maxStreak'),
			status: problem.get('status'),
			stepStatus: _.pluck(steps, 'status'),
		});

		problem.set({state: state}, {silent:true});	// Link state to problem
	}

	//=======================================================
	// Set the current problem index
	//=======================================================
	app.modes.setProbIndex = function(assignID, probID)
	{
		var prob = app.problemList.get(probID);
		app.curProbIndex = app.problemList.indexOf(prob);
	}

	//=======================================================
	// Determine the correct ID for a problem.
	//=======================================================
	view.getProbId = function()
	{
		return app.curProblem;
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
	view.reloadProblem = function(options)
	{
		var problem = app.problemList.at(app.curProbIndex);
		return app.modes.reloadProblem(options, problem);
	}

	//=======================================================
	// Check to see if a problem is locked out (can't be edited)
	//=======================================================
	view.isLockedOut = function()
	{
		var isModeLocked = app.modes.isLockedOut(app.problemList, app.curProbIndex);

		var assign = app.assignments.get(app.curAssign);
		var problem = app.problemList.at(app.curProbIndex);
		// assign.pastdue: assignment was past due when loaded;
		// problem._pastdue: problem is past due, but assignment was loaded before the due date.
		var pastDue = assign && assign.get('pastdue') || problem.get("_pastdue") == true;

		return (isModeLocked || pastDue);
	}

	//=======================================================
	// Perform any mode-specific actions for correct answers
	//=======================================================
	view.correctActions = function()
	{
		var list = app.modes.correctActions();

		list && $.each(list, function(idx, val) {
			resultActionHandlers[val] && resultActionHandlers[val]();
		});
	}

	//=======================================================
	// Perform any mode-specific actions for incorrect answers
	//=======================================================
	view.incorrectActions = function()
	{
		var list = app.modes.incorrectActions();

		list && $.each(list, function(idx, val) {
			resultActionHandlers[val] && resultActionHandlers[val]();
		});
	}

})();
