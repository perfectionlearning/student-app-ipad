//===============================================================================
// Help Options for Work View, including the help menu
//===============================================================================
;(function() {

	var view = app.Views.WorkView;
	var problem;
	var style = app.style.steps;
	var qzHintNdx = 0; // for cycling through quizboard hints
	var helpOpts;

	//=======================================================
	// Choose a layout and initialize the widgets
	//=======================================================
	view.initHelp = function(prob)
	{
		// Initialize to first hint each time the problem is displayed.
		qzHintNdx = 0;

		// Shortcuts
		problem = prob;
		helpOpts = app.modes.getHelpOptions();
	}

//===============================================================================
// Help Menu Mechanics
//===============================================================================

	//=======================================================
	// Checks if a problem has steps
	//=======================================================
	function hasSteps()
	{
		if (!helpOpts.steps)
			return false;

		var ansType = problem.get('ansType');
		return (problem.get('solve').length > 0) && (ansType !== 'graphPlot' && ansType !== 'graphConst');
	}

	//=======================================================
	// Determines whether a whiteboard can be shown
	//=======================================================
	function hasWhiteboard()
	{
		if (!helpOpts.video)
			return false;

		var wb = problem.get('wb');
		return (wb && wb.length > 0);
	}

	//=======================================================
	// Determines whether a whiteboard can be shown in steps
	//=======================================================
	function hasWhiteboardStep()
	{
		if (!helpOpts.videoSteps)
			return false;

		var step = view.curStep();
		return (step.wb && step.wb.length > 0);
	}

	//=======================================================
	// Determines whether a hint can be shown
	//=======================================================
	function hasHint()
	{
		if (!helpOpts.hintSteps)
			return false;

		var step = view.curStep();
		return (step.hint && step.hint.length > 0);
	}

	//=======================================================
	// Determines whether a quizboard hint can be shown
	//=======================================================
	function hasQzHint()
	{
		if (!helpOpts.hintSteps)
			return false;

		// Also add check to see if a hint exists
		var hint = problem.get('hint');
		return !!hint;
	}

	//=======================================================
	// Determines whether a problem can be reset
	//
	// It must be VTPed.
	//=======================================================
	function canReset()
	{
		if (!helpOpts.tryAnother)
			return false;

		return (!problem.get('is_vtp'));
	}

	//=======================================================
	// Determines whether Show Solution is available
	//=======================================================
	function canSolve()
	{
		if (!helpOpts.showSolution)
			return false;

		return true;
	}

	//=======================================================
	// Determines whether the QC help video is available
	//=======================================================
	function canShowHelp()
	{
		if (!helpOpts.helpQuickcheck)
			return false;

		return true;
	}

	//=======================================================
	// This seems mostly applicable to free inputs.
	// It's also mostly applicable to physics.
	//=======================================================
	function canShowBoxHelp()
	{
		if (!helpOpts.helpInput)
			return false;

		var ansType = problem.get('ansType');
		return (ansType !== 'graphPlot' && ansType !== 'graphConst');
	}

	//=======================================================
	//=======================================================
	function alwaysTrue()
	{
		return true;
	}


//===============================================================================
// Help Menu Creation
//===============================================================================

	//=======================================================
	// Construct a help menu based on several options
	//=======================================================
	function constructHelpMenu(options)
	{
		// [Test function, help menu object {text, icon, action}]
		var helpList = {
			steps: [hasSteps, { t:'Step by step mode', icon: 'StepByStep', act: view.enterStepMode }],
			video: [hasWhiteboard, { t:'Watch a video', icon: 'Video', act: view.watchVideo }],
			stepvideo: [hasWhiteboard, { t:'Watch a video', icon: 'Video', act: view.watchVideo }],
			solution: [canSolve, { t:'Show solution', icon: 'Solution', act: helpShowSolution }],
			abort: [alwaysTrue, { t:'Never mind', icon: 'Abort', act: function(){} }],
			hint: [hasHint, { t:'I need a hint', icon: 'Hint', act: view.showHint }],
			qzHint: [hasQzHint, { t:'I need a hint', icon: 'Hint', act: view.showQzHint }],
			tryAnother: [canReset, {t: 'Try another', icon: 'TryAnother', act: view.tryAnother }],
			help: [canShowHelp, { t:'Quickcheck help', icon: 'Hint', act: view.helpVideo  }],
			boxHelp: [canShowBoxHelp, { t:'Input box help', icon: 'Hint', act: view.boxHelp  }]
		};

		var out = [];
		$.each(options, function(idx, val) {
			if (helpList[val] && helpList[val][0]())
				out.push(helpList[val][1]);
		});

		return out;
	}

	//=======================================================
	// Help Menu
	//=======================================================
//	var helpList = ['qzHint', 'video', 'solution', 'tryAnother', 'help', 'boxHelp', 'abort'];
	var helpList = ['qzHint', 'video', 'solution', 'tryAnother', 'help', 'abort'];

	view.helpMenu = function()
	{
		var xy = fw.getWidget('answerInput').helpCoords();
		var text = constructHelpMenu(helpList);

		// Terminate any open help menus
		instantMenuClose();

		// Create the help menu
		var menu = fw.createWidget('explodingMenu', {
			id: 'helpMenu',
			box: $.extend({
				x1: xy[0],
				y1: xy[1],
				w1: fw.assetWidth('WVIcons'),
				h1: fw.assetHeight('WVIcons')
			}, app.style.helpMenu.box),

			menu: $.extend({text: text}, app.style.helpMenu.menu)
		});

		var helpButton = fw.getWidget('answerInput').helpButton();
		var dock = getHelpDock(helpButton, menu);
		fw.dock(menu, dock);
	}

	//=======================================================
	//
	//=======================================================
	function getHelpDock(helpButton, menu)
	{
		var helpBtm = helpButton.y + helpButton.height();
		if (fw.stageSize()[1] - helpBtm <= (menu.height() + 10))	// 10 is the margin
		{
			return {
				wid: helpButton,
				my: 'bottom right',
				at: 'top right',
				ofs: '0 -10'
			}
		}
		else
		{
			return {
				wid: helpButton,
				my: 'top right',
				at: 'bottom right',
				ofs: '0 10'
			}
		}
	}

	//=======================================================
	// Help Menu
	//=======================================================
	view.stepHelpMenu = function()
	{
		var stepWid = fw.getWidget('stepByStep');
		var xy = stepWid.helpCoords();
		var buttonHt = fw.assetHeight('WVIcons');
		var text = constructHelpMenu(['hint', 'stepwb', 'stepvideo', 'solution', 'help', 'boxHelp', 'abort']);
		var owner = stepWid.getContainer();

		// Terminate any open help menus
		instantMenuClose();

		// Create the help menu
		var menu = owner.add('explodingMenu', {
			id: 'helpMenu',
			box: $.extend({
				x1: xy[0],
				y1: xy[1],
				w1: fw.assetWidth('WVIcons'),
				h1: buttonHt
			}, app.style.helpMenu.box),

			menu: $.extend({text: text}, app.style.helpMenu.menu)
		});

		// Pop up, down, or sideways, based on position
		var stepHt = stepWid.height();

		var offset = 6;
		var side = getBestPosition(stepHt, menu.height(), xy[1] - stepWid.scrollOffset(), buttonHt, offset);
		var help = stepWid.helpButton();

		// Clean this up!  Convert to an object lookup.  Use $.extend.
		switch (side)
		{
			case 'up':
				fw.dock(menu, {
					wid: help,
					my: 'bottom right',
					at: 'top right',
					ofs: '0 -' + offset
				});
				break;

			case 'down':
				fw.dock(menu, {
					wid: help,
					my: 'top right',
					at: 'bottom right',
					ofs: '0 ' + offset
				});
				break;

			case 'side':
				fw.dock(menu, {
					wid: help,
					my: 'center right',
					at: 'center left',
					ofs: -offset + ' 0'
				});
				break;
		}
	}

	//=======================================================
	// Determine the best place to dock a widget in a limited space
	//=======================================================
	function getBestPosition(containerHt, widHt, dockY, dockHt, offset)
	{
		if (dockY > containerHt/2)
		{
			// Go up, if it fits
			if ((dockY - widHt - offset) < 0)
				return 'side';

			return 'up';
		}
		else
		{
			// Go down, if it fits
			if ((dockY + dockHt + widHt + offset) > containerHt)
				return 'side';

			return 'down';
		}
	}

//===============================================================================
// Help Menu Actions
//===============================================================================

	//=======================================================
	// Help Menu: Enter step-by-step mode
	//=======================================================
	view.enterStepMode = function()
	{
		view.clearResponse();
		view.setCheck(true);		// Re-enable the Check button if it was disabled (only for certain options!)

		var wid = fw.getWidget('answerInput', true);
		wid && wid.fadeStep();

		// Get or create the widget
		var wid = fw.getWidget('stepByStep', true);
		if (wid)
			return;
		else
		{
			view.setStep(false);
			view.stepMode();
//			app.scoring.resetStep();
			app.scoring.enableSteps();		// Tell the model that we've entered step mode
		}
	}

	//=======================================================
	// Help Menu: Watch a video
	//=======================================================
	view.watchVideo = function()
	{
		view.clearResponse();
		var errWid = fw.getWidget("error", false);
		if (!errWid)
			view.setCheck(true);		// Re-enable the Check button if it was disabled (only for certain options!)

		var wb = problem.get('wb');

		// This loads the correct video for both top level and steps.
		// var video = view.getVideo();

		// This version uses the same video for the top level and the steps.  It is a temporary
		// measure due to a last-minute design change.
		var video = app.getVideoPath(wb) + wb;

		fw.createWidget('videoPlayer', {
			w: app.style.helpMenu.video.width,
			h: app.style.helpMenu.video.height,
			depth: fw.ZENITH,	// fw.TOP is below the navigation, which is a bit odd.
			url: video
		});
	}

	//=======================================================
	//
	//=======================================================
	view.helpVideo = function()
	{
		// This version uses the same video for the top level and the steps.  It is a temporary
		// measure due to a last-minute design change.
		var video = app.getVideoPath() + app.qcHelpVideo;

		fw.createWidget('videoPlayer', {
			w: 640,
			h: 480,
			depth: fw.ZENITH,	// fw.TOP is below the navigation, which is a bit odd.
			url: video
		});
	}

	//=======================================================
	//
	//=======================================================
	function instantMenuClose()
	{
		var wid = fw.getWidget('helpMenu', true);

		if (!wid)
		{
			var stepWid = fw.getWidget('stepByStep', true);
			if (stepWid)
				wid = stepWid.getContainer().getWidget('helpMenu', true);
		}

		wid && wid.terminate();
	}

	//=======================================================
	// Help menu: Show solution
	//=======================================================
	function helpShowSolution()
	{
		// Instantly close the help menu instead of fading out.  The animation conflicts
		// with the solution and loading animations.
		instantMenuClose();
		// If a solution is shown, ensure the next problem loaded is different.
		var problem = app.problemList.at(app.curProbIndex);
		problem.reloadDifferent();
		view.solution();
		problem.resetUrl();
	}

	//=======================================================
	// Help menu: Hint
	//=======================================================
	view.showHint = function()
	{
		view.setCheck(true);		// Re-enable the Check button if it was disabled
		app.scoring.resetWrongCnt();
		view.stepShowHint();
	}

	//=======================================================
	// Help menu: Quizboard Hint
	//=======================================================
	view.showQzHint = function()
	{
		view.setCheck(true);

		app.scoring.resetWrongCnt();
		var qzHint = problem.get('hint');
		if (qzHint && qzHint.length > 0)
		{
			view.showText(qzHint[qzHintNdx], style.hintColor);
			qzHintNdx++;
			if (!qzHint[qzHintNdx])
				qzHintNdx = 0;
		}
		else
			view.showText("No hints are available.", style.hintColor);
	}

	//=======================================================
	// Help menu: Try Another
	//=======================================================
	view.tryAnother = function()
	{
		// Close any existing error popups
		var wid = fw.getWidget('error', true);
		wid && wid.terminate();

		view.setCheck(false);
		view.setHelp(false);
		view.setStep(false);

		// Create the special problem reset indicator instead of the normal loading box
		var delay = app.delayedPromise(app.style.probCreateTime, app.curObject);
		app.loadingBox(app.style.probCreateText, app.style.probCreateBg);

		// Invalidate the problem in case the reload is aborted
		problem.set({invalid:true});
		// the "different" flag signals the model to use the REST call that loads the problem with different values.
		//var reload = view.reloadProblem({different:true}).fail(reloadFail);
		// @FIXME/dg: This is inefficient! If causes factory generation every time Try Another option is used!
		var reload = view.reloadProblem({different:true}).fail(tryAnotherFailure);

		// Create a combined promise for the reload and the indicator.  Do something when both are done.
		$.when(delay, reload).then(reloadComplete);
	}

	//=======================================================
	//=======================================================
	var tryAnotherFailure = app.failHandler("problem", app.resetTryAnother);

	//=======================================================
	//
	//=======================================================
	app.resetTryAnother = function() {
		view.tryAnother();
	}

	//=======================================================
	// Problem reload and the message minimum delay have both
	// completed.  As long as we're still on the original page,
	// reset the view.
	//=======================================================
	function reloadComplete(parm)
	{
		if (app.curObject === parm)
			app.resetView();
	}

	//=======================================================
	//=======================================================
	view.boxHelp = function()
	{
		instantMenuClose();

		var stageSize = fw.stageSize();

		// D7 = multiplication sign
		var text =
			"<b>Scientific Notation:</b> For answers greater than 10,000 or less than 0.001, enter your answer in scientific notation " +
			"using e for \xD710. For instance, use 2.0e4 for 2.0\xD710<sup>4</sup> or 3.0e-6 for 3.0\xD710<sup>-6</sup>." +
			"<br/><br/>" +
	//		"For answers in steps that require you to identify the variable, use a question mark (?) in " +
	//		"the input box to identify the unknown.";
			"<b>Unknown Variables:</b> In steps, identify unknown variables using a question mark (?) in " +
			"the input box.";

		var wid = fw.createWidget('textBox', {
			xStart: stageSize[0]/2,
			yStart: stageSize[1]/2,
			wStart: 1,
			hStart: 1,

			text: text,
			title: 'Input Boxes',
			font: '15px/18px Arial',
			depth: fw.ZENITH
		}, {
			wid: 'stage',
			my: 'center',
			at: 'center'
		});
	}

})();
