//===============================================================================
// Work View Module: Question Display and Answer Input
//
// General view interface:
//  preInit: Called before init.  Used for blocking states that are needed before init. (OPTIONAL)
//  init: Called when the view is being created (before the drawList is rendered) (REQUIRED)
//  drawList: List of widgets to create for the view (REQUIRED)
//  ready: Called on view creation, after the drawList is rendered (OPTIONAL)
//  close: Called when a view is being destroyed (OPTIONAL)
//===============================================================================
;(function() {
	var view = app.Views.WorkView = {};

	view.responseColor = '#BF3508';

	var problem, probId, promise;
	var reloading = false;

//===============================================================================
// Basic View Definition
//===============================================================================

	//=======================================================
	// View init
	//=======================================================
	view.init = function(container)
	{
		view.container = container;

		// We need to set a layout.  We don't know which one to use yet.  We have to deal with it anyway.
		// We only draw generic items for now, so just about any layout will do.
		fw.setLayout('WorkView2');

		// Set the mode, install the correct mode plugin
		view.setMode();

		// Create drawlist based on mode
		var navOptions = app.modes.getNavOptions();
		var globalNav = {};
		if (!navOptions.bookNav)
			globalNav.noNav = true;

		var dls = app.globalDrawList(globalNav);	// Add global items, depending on options
		dls.push(view.widgetLists.preLoad);			// Always add this one

		if (navOptions.fwdBack)
			dls.push(view.widgetLists.arrows);		// Optionally add this one

		view.drawList = fw.drawList(dls);

		// Determine the width of input box characters.  This only needs to be done once.
		if (!app.charWidth)
			app.charWidth = app.calcCharWidth(app.style.freeInput.font);


		app.resizeStageHeight(app.style.stageHeight);
		$(window.parent).scrollTop(0);
		// Init the problem
		initProblem();

		var routeString = app.modes.formatRoute(app.curAssign, probId);
		routeString && app.router.navigate(routeString);
	}

	//=======================================================
	// READY function
	//=======================================================
	view.ready = function()
	{
		// We might not have a valid problem.  Determine whether we do, and hang out if we don't
		$.when(promise).done(postInit).fail(loadFailure);

		app.globalUIInit();
	}

	//=======================================================
	//=======================================================
	var loadFailure = app.failHandler("problem");

	//=======================================================
	// CLOSE function
	//=======================================================
	view.close = function()
	{
		fw.abortAsync();	// Stop any pending AJAX

		// This is a bit of a hack.  Invalidate the problem so it will be reloaded.
//		problem.set({chID:''}, {silent:true});

		// Perform cleanup for any sub-modules that require it
		view.closeFocusManager();	// Close the focus manager (unbinds events)
		view.stepModuleCleanup();
		view.submitModuleCleanup();
	}

//===============================================================================
// Initialization (Draw, problem load)
//===============================================================================

	//=======================================================
	// Starts loading the correct problem, if necessary
	//=======================================================
	function initProblem()
	{
		if (reloading)
		{
			app.loadingBox(app.style.probCreateText, app.style.probCreateBg, app.style.probCreateTime);
			reloading = false;
		}
		else
			app.loadingBox();

		promise = view.assignmentManager();
		probId = view.getProbId();
	}

	//=======================================================
	// Continue initialization -- occurs after validateProblem is satisfied
	//=======================================================
	function postInit()
	{

		problem = app.problemList.at(app.curProbIndex);

		// Set some global variables (messy)
		view.showingSolution = false;

		// Attach to the result handler (this can't happen earlier, since it is defined after the view)
		view.initResultHandler(problem);

		// Layout init
		view.initLayout(problem);

		// Set the problem status appropriately
		handleLockouts();

		// Init any modules that require it
		view.initFocusManager();
		view.stepModuleInit(problem);
		view.initHelp(problem);	
	
		// Open steps if required -- move to an answerType-based plugin system!
		modeSpecific();

		if (app.FunctionalTestMode) {
			app.globalReadyForFunctionalTest();
		}

		app.clearLoadingBox();
	}

	//=======================================================
	//
	//=======================================================
	view.reload = function()
	{
		reloading = true;
		app.resetView();
	}

	//=======================================================
	// Under certain circumstances, a problem is considered
	// locked out.  Don't allow input or most buttons.
	//=======================================================
	function handleLockouts()
	{
		if (view.isLockedOut())
			view.doLockout();
		else
			setFocus();
	}

	//=======================================================
	// Answer-type specific hacks go here, until we have
	// a mode robust system.
	//=======================================================
	function modeSpecific()
	{
		if (problem.get('ansType') === 'multiPart')
		{
			if (!view.showingSolution)
			{
				view.stepMode();
				var steps = fw.getWidget('stepByStep');
				steps.showCompleted();
				steps.show();			// They're not visible at this point (though most pieces are)
			}
		}
	}

//===============================================================================
// Data Access
//===============================================================================

	//=======================================================
	// Get the current whiteboard
	//=======================================================
	view.getWhiteboard = function()
	{
		if (view.isStepModeActive())
		{
			var step = view.curStep();
			return step.wb || "";
		}
		else
			return problem.get('wb');
	}

	//=======================================================
	// Returns the student's submitted answer
	//=======================================================
	view.getSubmission = function()
	{
		var ans = fw.getWidget('answerInput').value();

		var type = problem.get('ansType');
		if (type === 'radio' || type === 'check' )		// @FIXME/dg: This should be inside multiple choice .value()!
			ans = getIDs(ans);

		return ans;
	}

	//=======================================================
	// Convert from a list of indices to a list of IDs
	// for multiple choice problems.
	//=======================================================
	function getIDs(indices)
	{
		var choices = problem.get('choices');
		var out = [];
		_.each(indices, function(val, idx) {
			if (val !== 0)
				out.push(choices[idx].id);
		});

		return out;
	}

	//=======================================================
	// Returns the student's submitted step answer
	//=======================================================
	view.getStepSubmission = function(type)
	{
		var ans = fw.getWidget('stepByStep').value();

		if (type === 'radio' || type === 'check' )		// This should be a tool snippet!
			ans = getStepMCIDs(ans);

		return ans;
	}

	//=======================================================
	// Convert from a list of indices to a list of IDs
	// for multiple choice problems within steps.
	//=======================================================
	function getStepMCIDs(indices)
	{
		var step = view.curStep();
		var choices = step.choices;
		var out = [];
		_.each(indices, function(val, idx) {
			if (val !== 0)
				out.push(choices[idx].id);
		});

		return out;
	}

//===============================================================================
// Actions (Simple UI routines triggered by various events in other Workview modules)
//===============================================================================

	//=======================================================
	// This should probably be adapted to work in step-by-step mode as well
	//=======================================================
	function setFocus()
	{
		var wid = fw.getWidget('answerInput', true);
		wid && wid.focus();
	}

	//=======================================================
	// Display result text
	//=======================================================
	view.showText = function(text, color)
	{
		var wid = fw.getWidget('responseText', true);
		wid && wid.hide().color(color).setText(text).fadeIn(300);
	}

	//=======================================================
	// Clear the response text
	//=======================================================
	view.clearResponse = function()
	{
		var wid = fw.getWidget('responseText', true);
		wid && wid.setText('&nbsp;');
	}

	//=======================================================
	// Display the answer (not the solution!) to the current problem
	//=======================================================
	view.showAnswer = function()
	{
		var wid = fw.getWidget('answerInput', true);
		wid && wid.showAnswer(problem.get('a'));  // This also makes the input readonly
	}

	//=======================================================
	// Display the solution to the current problem
	//=======================================================
	view.showSolution = function(doShowAnswer)
	{
//		view.clearStepMode();
		view.readOnly();
		view.setCheck(false);
		view.setHelp(false);

		var wid = fw.getWidget('answerInput', true);
		wid && wid.fadeStep();

		// Make sure there is a solution to show
		var steps = problem.get('solve');
		if (steps.length === 0)
		{
			view.showAnswer();		// Show the expected answer, regardless of whether it was requested.  We have nothing else to show.
			return;
		}

		if (doShowAnswer)
			view.showAnswer();		// Show the expected answer, if requested

		view.showingSolution = true;

		// Create the widget
		app.scoring.resetStep();		// We need this, just for data lookup.  It's not really state-related.
		view.solutionMode(problem); // add: pass problem, so the model is available to solutionMode.
	}

	//=======================================================
	//=======================================================
	view.reward = function()
	{
	}

	//=======================================================
	// Wrong answer events
	//=======================================================
	view.wrong = function()
	{
	}

	//=======================================================
	// Switch the answer input widget to read only mode
	//
	// This doesn't work on steps
	//=======================================================
	view.readOnly = function()
	{
		var wid = fw.getWidget('answerInput', true);
		wid && wid.readOnly();
	}

	//=======================================================
	//=======================================================
	view.setCheck = function(bEnable)
	{
		var wid1 = fw.getWidget('stepByStep', true);
		var wid2 = fw.getWidget('answerInput', true);

		if (bEnable && !view.isFinalized)
		{
			wid1 && wid1.normalCheck();    // Re-enable the Check button if it was disabled (only for certain options!)
			wid2 && wid2.normalCheck();    // Re-enable the Check button if it was disabled (only for certain options!)
		}
		else
		{
			wid1 && wid1.fadeCheck();    // Disable the Check button
			wid2 && wid2.fadeCheck();    // Disable the Check button
		}
	}

	//=======================================================
	//=======================================================
	view.setHelp = function(bEnable)
	{
		var wid1 = fw.getWidget('stepByStep', true);
		var wid2 = fw.getWidget('answerInput', true);

		if (bEnable && !view.isFinalized)
		{
			wid1 && wid1.normalHelp();    // Re-enable the Help button if it was disabled (only for certain options!)
			wid2 && wid2.normalHelp();    // Re-enable the Help button if it was disabled (only for certain options!)
		}
		else
		{
			wid1 && wid1.fadeHelp();    // Disable the Help button
			wid2 && wid2.fadeHelp();    // Disable the Help button
		}
	}

	//=======================================================
	//=======================================================
	view.setStep = function(bEnable)
	{
		var wid = fw.getWidget('answerInput', true);
		if (!wid)
			return;

		if (bEnable)
			wid.normalStep();    // Re-enable the Check button if it was disabled (only for certain options!)
		else
			wid.fadeStep();    // Re-enable the Check button if it was disabled (only for certain options!)
	}

	//=======================================================
	// DG: Move initial behavior into mode plugins.
	// This can be a default actions used by most.
	// Drill Mode has the option of coming here, based on pre-conditions.
	//=======================================================
	view.setNextQMode = function()
	{
		var actionList = {
			nextQuestion: nextQuestion,
			sameQuestion: sameQuestion,

			submitAllCorrect: submitAllCorrect,
			submitMixedResults: submitMixedResults,

			'default': nextQuestion
		};

		// Perform the action dictated by the current mode
		var actionName = app.modes.postQuestionAction();
		var action = actionList[actionName] || actionList['default'];
		action();

		// Perform any global actions
		globalNextQActions();
	}

	//=======================================================
	//=======================================================
	function nextQuestion()
	{
		drawContinueButton(false);
	}

	//=======================================================
	//=======================================================
	function sameQuestion()
	{
		drawContinueButton(true);
	}

	//=======================================================
	//=======================================================
	function submitAllCorrect()
	{
		app.infoPopup('Assignment Complete',
					  "You completed this assignment with a perfect score. Nice work!",
//					  {noBG: true, action: app.submitAssignment}
					  {noBG: true}
		);
	}

	//=======================================================
	//=======================================================
	function submitMixedResults()
	{
		app.infoPopup('Round Complete',
					  "Click Submit Assignment to see your results.",
//					  {noBG: true, action: app.submitAssignment}
					  {noBG: true}
		);
	}

	//=======================================================
	// Actions taken after a question is complete, regardless of mode
	//=======================================================
	function globalNextQActions()
	{
		// Multi-part: Make room for response text, continue button
		if (problem.get('ansType') === 'multiPart')
			view.shrinkSteps();
	}

	//=======================================================
	//=======================================================
	function drawContinueButton(isSameQ)
	{
		var wid = fw.getWidget('answerInput', true);

		var id = wid &&wid.buttonsID();
		var pos = wid && wid.buttonsPos();

		if (!isSameQ)
			var frame = 'NextProblem';
		else if (problem.get('is_vtp') == true)
			frame = 'TryAnother';
		else
			frame = 'TryAgain';

		if (!wid)
			dock = {wid: fw.getWidget('question'), my: 'top left', at: 'bottom left', ofs: '0 4'};
		else if (pos === "right")
			dock = {wid: id, my: 'top left', at: 'top left', ofs: '-5 0'};
		else
			dock = {wid: id, my: 'top right', at: 'top right'};

		fw.createWidget('button', {
			id: 'continueBtn',
			image: 'WVMoveOn',
			frame: frame,
			click: frame === 'NextProblem' ? view.handleNextProblem : view.reload
		}, dock);

		// Clear the old buttons
		wid && wid.removeButtons();
	}

	view.handleNextProblem = function()
	{
		app.loadingBox();
		var wid1 = fw.getWidget('continueBtn');
		if (!!wid1) {
			wid1.hide();
		}
		window.setTimeout(view.nextProblem,0);
	}
	
	view.handlePrevProblem = function()
	{
		app.loadingBox();
		window.setTimeout(view.prevProblem,0);
	}


	//=======================================================
	//=======================================================
	view.disableInput = function()
	{
		view.readOnly();
		view.setStep(false);
		view.setCheck(false);
		view.setHelp(false);
	}

	//=======================================================
	//=======================================================
	function loadProblem()
	{
		app.loadingBox();
		// Clear the ID, forcing a reload
		//		problem.set({chID: ''});

		// Ensure we're requesting a valid problem
		if (app.curProbIndex >= 0 && app.curProbIndex < app.problemList.length)
		{
			app.curProblem = app.problemList.at(app.curProbIndex).get('id');
			app.resetView();
		}
	}

	//=======================================================
	//=======================================================
	view.nextProblem = function()
	{
		app.loadingBox();
		var len = app.problemList.length;
		if (++app.curProbIndex >= len)
			app.curProbIndex = 0;

		loadProblem();
	}

	//=======================================================
	//=======================================================
	view.prevProblem = function()
	{
		app.loadingBox();
		var len = app.problemList.length;
		if (--app.curProbIndex < 0)
			app.curProbIndex = len-1;

		loadProblem();
	}

	//=======================================================
	//
	//=======================================================
	view.hideTries = function()
	{
		var wid = fw.getWidget('submits', true);
		wid && wid.hide();
	}

	//=======================================================
	//=======================================================
	view.scoreModeChange = function()
	{
		var wid = fw.getWidget('aName', true);
		wid && wid.redock();
		wid && wid.relayout();
	}

	//=======================================================
	//=======================================================
	view.updateScore = function()
	{
		var cur = problem.get('score');
		var wid = fw.getWidget('score', true);
		wid && wid.update(cur);
	}

	//=======================================================
	//=======================================================
	view.updateSubmissions = function()
	{
		var cur = problem.get('submissions');
		var wid = fw.getWidget('submits', true);
		wid && wid.update(cur);
	}

	//=======================================================
	//=======================================================
	view.updateStepSubmissions = function()
	{
		var wid = fw.getWidget('stepByStep', true);
		wid && wid.updateSubmissions();
	}

	//=======================================================
	//=======================================================
	view.updateStatus = function()
	{
		var cur = app.calcDrillScore();
		var wid = fw.getWidget('statusOverlay', true);
		wid && wid.update(cur);
	}

})();
