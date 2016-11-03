//===============================================================================
// Layout-related routines
// Works closely with the data supplied in widgetList.js to construct and modify
// widget layout.
//===============================================================================
;(function() {

	var view = app.Views.WorkView;
	var problem, drawList;
	var layout;

	//=======================================================
	// Choose a layout and initialize the widgets
	//=======================================================
	view.initLayout = function(prob)
	{
		// Shortcuts
		problem = prob;

		chooseBaseLayout();
		setLayoutOptions();

		createDrawList();

		initQuestion();
		initImage();
		initAnswer();
		initStreak();
		initButtons();
		view.initSteps();	// This gets called externally as well
		initStars();
		initScore();
		initTitle();
		initStatus();
		initKeypad();

		// Now draw everything
		fw.createScreen(drawList);

		fadeIn();
	}

	//=======================================================
	// This occurs when jumping to a similar question
	//=======================================================
	view.resetLayout = function()
	{
		chooseBaseLayout();
		initImage();

		initSteps();
	}

	//=======================================================
	// Chooses a layout for a given problem
	//=======================================================
	function chooseBaseLayout()
	{
		// There is an image.  Figure out if it fits the Wide or Tall layout better
		var size = problem.get('qImgSize').split(',');
		var w = parseInt(size[0], 10);
		var h = parseInt(size[1], 10);

		layout = {};
		layout.imgWidth = w;
		layout.imgHeight = h;
		layout.type = 'tall';
		fw.setLayout('WorkView2');
	}

	//=======================================================
	// Combine many different queries into a standard interface
	//=======================================================
	function setLayoutOptions()
	{
		$.extend(layout, app.modes.getLayoutOptions());

		layout.image = !!problem.get('qImg');

		layout.qType = problem.get('ansType');
		layout.ansInput = (layout.qType !== 'paper' && layout.qType !== 'multiPart');

		// Obsolete -- Remove from code
		layout.streak = false;	//problem.get('repetitions') > 1;
		layout.stars = false;

		layout.submits = (layout.score && layout.ansInput);
		layout.sumCard = !!problem.get('wb') && layout.vidPlayer;	// If there's a whiteboard, and the mode allows videos

		layout.divider = true;	// layout.image || layout.sumCard;	// DG: If this is false, Wide mode is used
//		layout.divider = (problem.get('ansType') === 'equation');

		layout.keypad = (problem.get('ansType') === 'equation');	// Only for equations
	}

	//=======================================================
	// Create the drawList out of the appropriate pieces
	//=======================================================
	function createDrawList()
	{
		var widLists = view.widgetLists;
		var components = [];

		if (layout.divider)
			components.push(widLists.divider);

		// Add the question image or read-only graph (but not both!)
		if (layout.image)
			components.push(widLists.qImage);

		if (layout.sumCard)
			components.push(widLists.sumCard);

		// Add streak animation
		if (layout.streak)
			components.push(widLists.streak);

		// Add stars
		if (layout.stars)
			components.push(widLists.stars);

		// Add score
		if (layout.score)
			components.push(widLists.score);

		if (layout.statusOverlay)
			components.push(widLists.statusOverlay);

		// Add submission
		if (layout.submits)
			components.push(widLists.submits);

		// Add dependent pieces
//		var q = (layout.divider ? widLists.questionLeft : widLists.questionCenter);	// Centered question mode
		var q = widLists.questionLeft;
		components.push(q);

		// Add the answer and result widgets
		if (layout.ansInput)
			components.push(widLists.answerWids);
//		else if (app.modes.getNavOptions().fwdBack)	// The presence of forward/back arrows acts as a proxy for determining whether a "Next Problem" button should appear
//			components.push(widLists.nextButton);

		// Response text
		components.push(widLists.responseText);

		// Add Up button
		if (layout.quizboardUpButton)
			components.push(widLists.quizboardUpButton);

		else if (layout.assignUpButton)
			components.push(widLists.assignUpButton);

		// Add assignment name
		if (layout.aName)
			components.push(widLists.aName);

		// Add equation input
		components.push(widLists.keypad);		// Always -- there might be equation steps. We could scan for that to be smarter.

		// Finally, add hidden chapter logo
//		if (app.isHiddenChapter())
//			components.push(widLists.logo);

		// Move this functionality into a routine!
		drawList = fw.drawList(components);
	}

	//=======================================================
	// Init the image
	//=======================================================
	function initImage()
	{
		//-------------
		// Question image
		//-------------
		if (layout.image)
		{
			drawList.setParam('qImage', 'w', layout.imgWidth);	// These can be NaN!
			drawList.setParam('qImage', 'h', layout.imgHeight);
			drawList.setParam('qImage', 'url', app.getImageName(problem.get('qImg')));
			drawList.setParam('qImage', 'overlays', problem.get('qImageText') || []);

			if (layout.qType === 'multiPart')
				drawList.setParam('qImage', 'mode', 'expandable');
		}

		//-------------
		// Whiteboards
		//-------------
		if (layout.sumCard)
		{
			var wb = problem.get('wb');
			drawList.setParam('card1', 'url', app.getCardImage(wb));

			var scaleOrigin = layout.image ? 'L' : 'TL';
			drawList.setParam('card1', 'scaleOrigin', scaleOrigin);

			// This isn't currently used, but may be in the future.  Send in a type ("sum" or "wb")
			// or convert to something more generic.  We're using the type to determine whether
			// we need to add a special rounding mask to the image.
			var obj = app.objectList[wb];
			if (obj)
				drawList.setParam('card1', 'type', obj.t);
	//		drawList.setParam('card2', 'url', app.getCardImage(wb));
		}
	}

	//=======================================================
	// Init question
	//=======================================================
	function initQuestion()
	{
//		drawList.setParam('question', 'numberText', app.curProblem + 1);

		var q = problem.get('q');

		// Append instructions to "paper" questions.  This is a
		// temporary measure!
		if (layout.qType === 'paper')
			q = "<b>Please submit your answer on paper.</b><br/><br/>" + q;

		drawList.setParam('question', 'text', q);
		drawList.setParam('question', 'instruct', problem.get('q_prefix'));
	}

	//=======================================================
	// Init answer
	//=======================================================
	function initAnswer()
	{
		if (!layout.ansInput)
			return;

		drawList.setParam('answerInput', 'type', layout.qType);

		if (layout.qType === 'multi')
			drawList.setParam('answerInput', 'text', problem.get('a'));
		else if (layout.qType === 'radio' || layout.qType === 'check')
			drawList.setParam('answerInput', 'choices', problem.get('choices'));
		else if (layout.qType === 'graphPlot' || layout.qType === 'graphConst')
		{
			drawList.setParam('answerInput', 'eq', problem.get('graphequations'));
			drawList.setParam('answerInput', 'axis', problem.get('graphparms'));
		}
		else if (layout.qType === 'equation')
		{
			drawList.setParam('answerInput', 'pre', problem.get('ansPrefix'));
			drawList.setParam('answerInput', 'post', problem.get('ansSuffix'));
		}
	}

	//=======================================================
	// Init question
	//=======================================================
	view.initSteps = function()
	{
		view.widgetLists.stepByStep.steps = problem.get('solve');
		view.widgetLists.stepByStep.maxSubmits = app.getMaxSubmissions();

		// Multi-part questions use wide mode
		view.widgetLists.stepByStep.format = (layout.qType === 'multiPart' ? 'wide' : '');
	}

	//=======================================================
	// Init the streak animation
	//=======================================================
	function initStreak()
	{
		if (layout.streak)
		{
			var reps = problem.get('repetitions');
			var cur = problem.get('state').get('correctInARow');
			var max = problem.get('state').get('maxStreak')

			// Set streak size
			drawList.setParam('streakAnim', 'count', reps);

			// Set current streak state.  If maxed, always place at the end (even if a streak was broken)
			if (max < reps)
				drawList.setParam('streakAnim', 'streak', cur);
			else
				drawList.setParam('streakAnim', 'streak', max);
		}
	}

	//=======================================================
	// Init the star state
	//=======================================================
	function initStars()
	{
		if (!layout.stars)
			return;

		var cur = problem.get('curStreak');
		var best = problem.get('maxStreak');
		var max = problem.get('repetitions');

		drawList.setParam('stars', 'cur', cur);
		drawList.setParam('stars', 'best', best);
		drawList.setParam('stars', 'max', max);
	}

	//=======================================================
	//
	//=======================================================
	function initScore()
	{
		if (layout.score)
		{
			var cur = problem.get('score');
			var max = problem.get('maxScore');
			drawList.setParam('score', 'current', cur);
			drawList.setParam('score', 'maximum', max);
		}

		if (layout.statusOverlay)
		{
			var score = app.calcDrillScore();
			drawList.setParam('statusOverlay', 'remaining', score.remaining);
			drawList.setParam('statusOverlay', 'mastered', score.mastered);
			drawList.setParam('statusOverlay', 'needsWork', score.needsWork);

			var assign = app.assignments.get(app.curAssign);
			var pastDue = assign && assign.get('pastdue') || problem.get("_pastdue") == true;
			drawList.setParam('statusOverlay', 'disabled', pastDue);
		}

		if (layout.submits)
		{
			cur = problem.get('submissions');
			drawList.setParam('submits', 'current', cur);

			max = app.getMaxSubmissions();
			var realMax = app.adjustedMaxSubmissions(max, problem.get('ansType'));
			drawList.setParam('submits', 'maximum', realMax);
		}
	}

	//=======================================================
	//=======================================================
//	var btnCheck = {asset: 'WVIcons', frame: 'Check', callback: view.doSubmit, tip: 'Check Answer'};
//	var btnMenu = {asset: 'WVIcons', frame: 'Menu', callback: view.helpMenu, tip: 'Menu'};
//	var btnSteps = {asset: 'WVStepIcon', frame: 'Step', callback: view.enterStepMode, tip: 'Steps'};

	var btnCheck = {asset: 'WVIcons', frame: 'Check', callback: view.doSubmit};
	//var btnMenu = {asset: 'WVIcons', frame: 'Menu', callback: view.helpMenu};
	var btnSteps = {asset: 'WVStepIcon', frame: 'Step', callback: view.enterStepMode};

	//=======================================================
	//
	//=======================================================
	function initButtons()
	{
		if (!layout.ansInput)
			return;

		var buttons = [btnCheck];	//, btnMenu];

		// OHW doesn't have a help menu unless there's a summary card.  Perhaps it should never have one.
		//if ( !layout.hideMenu || layout.sumCard )
	//		buttons.push(btnMenu);

		var steps = problem.get('solve');
		if (steps && steps.length > 0 && !layout.hideSteps)
			buttons.push(btnSteps);

		drawList.setParam('answerInput', 'buttonList', buttons);
	}

	//=======================================================
	//=======================================================
	function initTitle()
	{
		var title = app.modes.getProblemTitle(problem, app.curProbIndex);
		drawList.setParam('title', 'text', title);

		if (layout.aName)
		{
			var assign = app.assignments.get(app.curAssign);
			var name = assign ? assign.get('name') : '';
			drawList.setParam('aName', 'text', name);
		}
	}

	//=======================================================
	//=======================================================
	function initStatus()
	{
		var status = problem.get('status');
		drawList.setParam('status', 'state', status);
	}

	//=======================================================
	//
	//=======================================================
	function initKeypad()
	{
			if (layout.qType === 'essay' || layout.qType === 'graphPlot')
				drawList.setParam('keypad', 'hidden', true);
			else // if(layout.qType === 'graphConst') RT: not sure why this restriction was needed. Why not just display the keypad if the type isn't one of the above?
				drawList.setParam('keypad', 'hidden', false);
	}

	//=======================================================
	//
	//=======================================================
	function fadeIn()
	{
		fw.getWidget('question').fadeIn(800);
	}

})();
