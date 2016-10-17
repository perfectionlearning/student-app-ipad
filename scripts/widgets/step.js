//======================================================
// Single step input widget, generally part of a Step-by-step widget
//
// Arguments:
//	id
//	x, y, w, h
//
//	step: {q:, a:, ansType:, hint:, choices: [], wb:, equiv:}
//	btnList: List of buttons, for equation inputs
//	hidden: Define to hide all elements
//
//  input: Appears to just be passed on to ansInput.  Awkward propagation mechanism.
//
// Style: (steps)
//	qColor: Question color
//	qFont: Question font
//	qWidth: Width of question text area
//	qEqWidth: Width of question text area for equations (percentage of total width)
//  qGap: Horizontal gap between question and answer input
//======================================================
framework.widget.step = function()
{
	var that = this;
	var style = app.style.steps;

	var question, stepText, inp, icon, submissions;

	var wideMode = (that.format === 'wide');
	var depth = that.depth || 0;

	drawStep();

	//=======================================================
	//=======================================================
	function drawStep()
	{
		if (!wideMode)
		{
			drawQuestion();
			drawInput();
		}
		else
		{
			drawHeader();
			drawWideQuestion();
			drawWideInput();
		}
	}

	//=======================================================
	//=======================================================
	function drawQuestion()
	{
		var dock = {
			at: 'top right',
			ofs: '10 0'
		};

		drawQuestionCommon(dock);
	}

	//=======================================================
	//
	//=======================================================
	function drawWideQuestion()
	{
		var dock = {
//			wid: icon,
			at: 'bottom left',
			ofs: '0 4'
		};

		drawQuestionCommon(dock);
	}

	//=======================================================
	//
	//=======================================================
	function drawQuestionCommon(stepDock)
	{
//		if (!that.step.q_prefix && !that.step.q)
//			that.step.q_prefix = '&nbsp;';

		// Create the prompt
		question = that.add('text', {
			w: (wideMode ? that.w : style.qWidth),
			text: that.step.q_prefix || '',
			color: style.qColor,
			font: style.qFont,
			depth: depth,
			hidden: that.hidden
		},{
			top: icon ? (icon.id + ' bottom 4') : (that.id + ' top'),
			left: that.id + ' left'
		});

		// Create the step text, if any
		if (that.step.q)
		{
			stepDock.wid = stepDock.wid || question;
			stepText = that.add('text', {
				text: that.step.q,
				color: style.stepTextColor,
				font: style.stepTextFont,
				depth: depth,
				hidden: that.hidden
			}, stepDock);
		}
	}

	//=======================================================
	//=======================================================
	function drawInput()
	{
		// Should verify that the input fits!  If not, move it under the question
		var dock = {
			top: (stepText ? (stepText.id + ' bottom 4') : (question.id + ' top')),
			left: question.id + ' right 10'
		};

		var width = that.w - style.qWidth - style.qGap - style.rGap;	// Cache the width remaining for the answer input
		drawInputCommon(dock, width);
	}

	//=======================================================
	//=======================================================
	function drawWideInput()
	{
		var dock = {
			top: (stepText ? (stepText.id + ' bottom 6') : (question.id + ' bottom 6')),
			left: question.id + ' left'
		};

		drawInputCommon(dock, that.w);
	}

	//=======================================================
	//=======================================================
	function drawInputCommon(dock, width)
	{
		inp = that.add('answerInput', $.extend({
			w: width,
//			maxWidth: width,
			buttonAlign: (wideMode ? 'L' : 'R'),

			type: that.step.ansType,
			list: that.btnList,
			text: that.step.a,			// Free input only -- Kind of messy!
			choices: that.step.choices,	// Multiple choice only
			pre: that.step.ansPrefix,	// Equation only
			post: that.step.ansSuffix,	// Equation only
			eq: that.step.graphequations,	// graphPlot only
			axis: that.step.graphparms,		// graphPlot only
			isStep: true,
			depth: depth,
			hidden: that.hidden
		}, that.input), dock);
	}

	//=======================================================
	//
	//=======================================================
	function drawHeader()
	{
		icon = that.add('probStatus', {
			state: that.state || 'New',
			depth: depth + 1,
		}, {
			wid: that
		});

		var title = that.add('text', {
//			text: 'Part ' + (that.stepNum+1),
			text: 'Part ' + app.getNthLetter(that.stepNum, true),
			color: '#0C4F65',		// @FIXME/dg: Move to style!
			font: 'bold 18px Arial',
			depth: depth,
		}, {
			wid: icon,
			my: 'center left',
			at: 'center right',
			ofs: '6 2'
		});

		submissions = that.add('submissions', {
			current: that.step.submissions,
			maximum: app.adjustedMaxSubmissions(that.maxSubmits, that.step.ansType),
			depth: depth,
		}, {
			top: icon.id + ' top 3',
			right: that.id + ' right -14'
		});
	}

	//=======================================================
	// Cleans up a step so that it takes up minimal space.
	//=======================================================
	this.cleanup = function()
	{
		submissions && submissions.terminate();

		inp.cleanup();
	}

	//=======================================================
	//=======================================================
	this.focus = function()
	{
		inp && inp.focus();
	}

	//=======================================================
	//=======================================================
	this.helpCoords = function()
	{
		return inp.helpCoords();
	}

	//=======================================================
	// @FIXME/dg: This is bad architecture!
	//=======================================================
	this.helpButton = function()
	{
		return inp.helpButton();
	}

	//=======================================================
	// Fetch the button widget path/ID.  Returning the entire
	// widget is too dangerous.
	//
	// This is better architecture.
	//=======================================================
	this.buttonsID = function()
	{
		return inp.buttonsID();
	}

	//=======================================================
	// Returns the relative position of the buttons:
	// "below" or "right".
	//=======================================================
	this.buttonsPos = function()
	{
		return inp.buttonsPos();
	}

	//=======================================================
	//=======================================================
	this.fadeCheck = function()
	{
		inp && inp.fadeCheck();
	}

	//=======================================================
	//=======================================================
	this.wrongAnswer = function(list)
	{
		inp && inp.wrongAnswer && inp.wrongAnswer(list);
	}

	//=======================================================
	//=======================================================
	this.clearWrongs = function()
	{
		inp && inp.clearWrongs && inp.clearWrongs();
	}

	//=======================================================
	//=======================================================
	this.normalCheck = function()
	{
		inp && inp.normalCheck();
	}

	//=======================================================
	//=======================================================
	this.fadeHelp = function()
	{
		inp && inp.fadeHelp();
	}

	//=======================================================
	//=======================================================
	this.normalHelp = function()
	{
		inp && inp.normalHelp();
	}

	//=======================================================
	//=======================================================
	this.removeButtons = function()
	{
		inp && inp.removeButtons();
	}

	//=======================================================
	//=======================================================
	this.getStepButton = function()
	{
		return inp.getStepButton();
	}

	//=======================================================
	//=======================================================
	this.target = function()
	{
		return inp;
	}

	//=======================================================
	//=======================================================
	this.answers = function()
	{
		return inp.answers();
	}

	//=======================================================
	//=======================================================
	this.value = function()
	{
		return inp.value();
	}

	//=======================================================
	//=======================================================
	this.showAnswer = function()
	{
		inp.showAnswer();
	}

	//=======================================================
	//=======================================================
	this.showSolution = function(answer)
	{
		inp.showSolution(answer);
	}

	//=======================================================
	//=======================================================
	this.updateSubmissions = function()
	{
		submissions && submissions.increment();
	}

	//=======================================================
	//=======================================================
	this.setState = function(state)
	{
		icon.setState(state);
	}

	//=======================================================
	// Return the total height of the widget
	//=======================================================
	this.height = function()
	{
		var ht = question.height();

		var inpHeight = inp.y + inp.height() - that.y;
		ht = Math.max(ht, inpHeight);

		return ht;

		// HACK! Needs to take more into account (like what?)
	}

}
