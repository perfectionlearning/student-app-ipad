//===============================================================================
// Step by Step routines for Work View
//
//===============================================================================
;(function() {

	var view = app.Views.WorkView;

	var solutionTopMargin = 40+14;		// @FIXME/dg: Move this into styles -- Space between answer input widget and step widget when showing a solution

	var problem;
	view.isStepMode = false;

	//=======================================================
	//=======================================================
	view.stepModuleInit = function(prob)
	{
		problem = prob;
		fw.eventSubscribe('setFocus:input', setFocus);	// @FIXME/dg: This isn't really step-related!  Move it somewhere else!
	}

	//=======================================================
	// Get the current step
	//=======================================================
	view.curStep = function()
	{
		var stepWid = fw.getWidget('stepByStep');
		var curStep = stepWid.getStep();
		return problem.get('solve')[curStep];
	}

	//=======================================================
	// Get step-by-step docking info
	// This is used for: show solution, step-by-step mode
	//=======================================================
	var qBottom = 'question bottom 18';

	var stepDock = {
			left: 'question left', // put in line with question rather than with stage, so if question moves, ...
			right: 'question right',
			top: 'responseText top ' + solutionTopMargin,		//'answerInput top ' + (y + vMargin),
			bottom: 'stage bottom 0'
	};

	var bigSteps = {
			left: 'question left', // put in line with question rather than with stage, so if question moves, ...
			right: 'question right',
			top: qBottom,
			bottom: 'stage bottom 0'
	};

	//=======================================================
	//
	//=======================================================
	function getStepDock()
	{
		var ansInp = fw.getWidget('answerInput', true);

		return (ansInp ? stepDock : bigSteps);
	}

	//=======================================================
	// Post-toggle function.  Moved from an anonymous function
	// to here for efficiency
	//=======================================================
	function postToggle()
	{
		// Create the first step. We don't do it until the transition is
		// complete because we can't (easily) keep it hidden due to Jax crazyness.
		var wid = fw.getWidget('stepByStep');
		wid.firstStep();
		wid.show();

		// Display help if needed
		showStepHelp();

		// Focus/set target
		fw.eventPublish('toggleTo:input');
	}

	//=======================================================
	//
	//=======================================================
	function doTransition(wid, isSolveMode)
	{
		var ansInput = fw.getWidget('answerInput', true);

		if (!ansInput)
		{
			wid.show();

			if (!view.showingSolution)
				postToggle();

			return;
		}

		var stepBtn = ansInput.getStepButton();

		// Check for help button as well as step button, since the latter isn't
		// created in Quizboard mode.
		var btn = stepBtn || ansInput.helpButton();

		// Hack -- don't do the transition for solution mode.
		if (isSolveMode)
		{
			btn.terminate();
			wid.show();
			return;
		}

		fw.createWidget('transition', {
			id: 'solveTrans',
			from: btn,
			to: wid,
			done: isSolveMode ? null : postToggle,
			fadeInRate: 1500,
			fadeOutRate: 750
		});
	}

	//=======================================================
	// Enter step-by-step mode
	//=======================================================
	view.stepMode = function()
	{
		// Clear text

		app.resizeStageHeight(app.style.stageHeight);
		view.clearResponse();
		view.isStepMode = true;		// Do this after view.clearResponse, but before creating the steps

		// Create step-by-step widget
		var stepWid = fw.createWidget('stepByStep', view.widgetLists.stepByStep, getStepDock());

		// Create transition widget
		doTransition(stepWid);
	}

	//=======================================================
	// Enter step-by-step mode to display the solution
	//=======================================================
	view.solutionMode = function(problem) // problem is needed to retrieve problem's status (origStatus)
	{
		// If steps are visible, fade out and back in
		// If steps aren't visible, do a transition
		if (view.isStepModeActive())
		{
//			fw.getWidget('stepByStep').fadeOut(5000, 0, fadeTransition);
			fadeTransition(problem);
		}
		else
		{
			// Create step-by-step widget
			var stepWid = fw.createWidget('stepByStep', view.widgetLists.stepByStep, getStepDock());

			// Show solution and final status at end of steps (for iPad)
			stepWid.allSteps();
//			var msgObj = app.scoring.getMsgObj(problem.get('origStatus'), 'LastStep');
//			stepWid.showText(msgObj.text, msgObj.color);

			// Transition
			doTransition(stepWid, true);
		}
	}

	//=======================================================
	//=======================================================
	function fadeTransition(problem) // problem is needed to retrieve problem's status (origStatus)
	{
		// Remove the steps
		view.clearStepMode();

		// Create step-by-step widget
		var stepWid = fw.createWidget('stepByStep', view.widgetLists.stepByStep, getStepDock());

		// Show solution and final status at end of steps (for iPad)
		stepWid.allSteps();
//		var msgObj = app.scoring.getMsgObj(problem.get('origStatus'), 'LastStep');
//		stepWid.showText(msgObj.text, msgObj.color);

		// MathJaxed items are already visible, so this looks weird
//		stepWid.fadeIn(1500);
		stepWid.show();		// @FIXME/dg: Removed fade for multi-part. It's marginal with MathJax anyway.
	}

	//=======================================================
	//=======================================================
	view.clearStepMode = function()
	{
		// Delete the widgets
		var wid = fw.getWidget('stepByStep', true);
		wid && wid.terminate();
	}

	//=======================================================
	// Redock the steps to their normal position
	//=======================================================
	view.shrinkSteps = function()
	{
		var steps = fw.getWidget('stepByStep');
		steps.dockTarget = stepDock;

		// Massive hack! You're doing it wrong!
		var btn = fw.getWidget('responseText');
		btn.dockTarget = {
			top: 'continueBtn bottom 10',
			left: 'question left',
			right: 'question right'
		};

		fw.resetLayout();
	}

	//=======================================================
	//=======================================================
	view.stepShowHint = function()
	{
		// Clear text
//		view.clearResponse();

		fw.getWidget('stepByStep').showHint();
	}

	//=======================================================
	//=======================================================
	view.isStepModeActive = function()
	{
		return view.isStepMode;
	}

	//=======================================================
	// Sets the focus on the step or full answer, depending on which is active.
	//=======================================================
	function setFocus()
	{
		if (view.isStepModeActive())
			var wid = fw.getWidget('stepByStep');
		else
			var wid = fw.getWidget('answerInput', true);

		wid && wid.focus();
	}

	//=======================================================
	//=======================================================
	view.stepModuleCleanup = function()
	{
		view.isStepMode = false;
		fw.eventUnsubscribe('setFocus:input', setFocus);
	}

	//=======================================================
	// Used externally by functional tests
	//=======================================================
	app.isLastStep = function()
	{
		var stepWid = fw.getWidget('stepByStep', true);
		if (!stepWid)
			return false;

		var curStep = stepWid.getStep();
		var stepCnt = problem.get('solve').length;

		return (curStep >= stepCnt - 1)
	}

	//=======================================================
	//
	//=======================================================
	function showStepHelp()
	{
		var helpStr = "Use a question mark (?) for an unknown value.";	// @FIXME/dg: Move this elsewhere

		var wid = fw.getWidget('stepByStep', true);

		if (wid)
		{
			var ans = wid.answers();		// Get a list of answers (will this work for multiple choice?)
			if (ans && ans.indexOf && ans.indexOf('?') !== -1)
				wid.showText(helpStr, 'orange');	// @FIXME/dg: Don't hard-code the color!
		}
	}

})();
