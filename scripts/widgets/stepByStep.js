//======================================================
// Step-by-step input widget
//
// Arguments:
//  id
//  x, y, w, h
//
//  steps: Array of steps
//  btnList: List of buttons, for equation inputs
//
// Style: (steps)
//  textSpace: Amount of space reserved below a step for result text
//  messageTime: Time that correct message is displayed
//  hintColor
//======================================================
framework.widget.stepByStep = function()
{
	var that = this;
	var style = app.style.steps;

	var timeout;
	var curStep = 0;

	var scroller, resultText;
	var stepWids = [];

	var textMargin = app.style.scroller.hMargin;

	// Events
	fw.eventSubscribe('setFocus:step', focusCurrentStep);
//	fw.eventSubscribe('focus:input', moveToEnd);	// @FIXME/dg: Temporarily removed, as a feature request.

	//=======================================================
	// This is called whenever an input box gets focus.
	// The input box could be the main problem entry, or a step.
	//
	// We use this to ensure the last step is fully on-screen.
	// Only clicking on a non-read-only step should do anything.
	// This would only occur if the last step is partially
	// on-screen.
	//=======================================================
	function moveToEnd(data)
	{
		if (data.wid.hasAncestor('stepByStep'))
		{
			if (scroller.scrollToEnd(function(){}))
				fadeOutText();
		}
	}

	//=======================================================
	// Set the focus on the current step
	// This is a simple step that could be done inline, but it's
	// used as a callback inside an if statement, which is confusing.
	//=======================================================
	function focusCurrentStep()
	{
		stepWids[curStep].focus();
	}

	//=======================================================
	//
	//=======================================================
	function createText()
	{
		var owner = scroller.getContainer();

		// Create a text display
		resultText = owner.add('text', {
			w: that.w - (textMargin * 2),
			text: '',
			font: style.textFont,
			depth: 1
		});
	}

	//=======================================================
	// Create a single step widget
	//=======================================================
	function createStep()
	{
		var owner = scroller.getContainer();

		var newStep = owner.add('step', {
			y: 0,
			w: that.w - (textMargin*2),
			stepNum: curStep,
			state: that.steps[curStep].status,
			step: that.steps[curStep],
			btnList: that.btnList,
			format: that.format,
			maxSubmits: that.maxSubmits,
			input: that.input || {},  // @FIXME/dg: Figure out more elegant parameter method
			hidden: true
		});

		stepWids.push(newStep);
		return newStep;
	}

	//=======================================================
	// Add another step to the list
	//=======================================================
	function addStep(skipFadeIn, dontScroll)
	{
		var wid = createStep();

		var addOpts = {useDivider:true};
		if (skipFadeIn)
			addOpts.skipFadeIn = true;
		if (dontScroll)
			addOpts.skipScroll = true;

		scroller.addWidget(wid, addOpts);
		// Step added; reposition input fields.
		fw.eventPublish('finished:step', that);
		return wid;
	}

	//=======================================================
	// Add another step to the list
	//=======================================================
	function addStepHidden()
	{
		var wid = createStep();
		scroller.addWidget(wid, {useDivider:true, skipFadeIn:true});  // Add to the scroller, with a divider, without a fadein
	}

	//=======================================================
	// Scrolling occurred
	//=======================================================
	function stepScroll()
	{
		fadeOutText();
		fw.eventPublish('step:scroll');
	}

	//=======================================================
	//
	//=======================================================
	function addTitle()
	{
		// Multi-part hack. We should instead have a top-level param to include or omit the title
		if (that.format === 'wide')
			return;

		that.add('image', {
			image: style.titleAsset,
			depth: 3,
			hidden: true
		},{
			wid: that,
			my: 'center left',
			at: 'top left'
		});
	}

//==========================================================================
// Action API
//==========================================================================

	//=======================================================
	//=======================================================
	this.firstStep = function()
	{
		addStep(true);
	}

	//=======================================================
	//=======================================================
	this.nextStep = function()
	{
		// Call cleanup() for the current step
		stepWids[curStep].cleanup();

		// Move the result text.  The desired position may have changed due to cleanup.
		// Ideally this will occur before it's visible in its last position
//		resultText.setPos(textMargin, scroller.bottom());
		fw.dock(resultText, scroller.bottom());

		scroller.disableArrows();

		if (app.FunctionalTestMode) {
			timeout = null;
			fadeOutText();

			curStep++;
			var wid = addStep();
			scroller.enableArrows();
			wid.focus();		// This places the focus within the next field.  Do it outside of addStep!
		}
		else
		{
			timeout = setTimeout(function() {
				timeout = null;
				fadeOutText();

				curStep++;
				var wid = addStep();
				scroller.enableArrows();
				wid.focus();		// This places the focus within the next field.  Do it outside of addStep!
			}, style.messageTime);
		}
	}

	//=======================================================
	// Identical to start of nextStep -- combine the routines
	//=======================================================
	this.lastStep = function()
	{
		// Call cleanup() for the current step
		stepWids[curStep].cleanup();

		// Move the result text.  The desired position may have changed due to cleanup.
		// Ideally this will occur before it's visible in its last position
//		resultText.setPos(textMargin, scroller.bottom());
		fw.dock(resultText, scroller.bottom());
		resultText.setText("");		// Text will be reported externally.  This seems a bit sketchy!

		// Lose focus on free inputs, in particular (especially if enter was pressed for the submission)
		fw.eventPublish('loseFocus:input');
	}

	//=======================================================
	//=======================================================
	this.allSteps = function(showFull)
	{
		if (!stepWids[curStep])			// A bit of a hack. Only occurs for multi-part.
			this.firstStep();

		// @KEYPAD
		scroller.disableArrows();		// Temporarily disable scrolling

		var startStep = curStep;
		for (var i = startStep; i < that.steps.length; i++)
		{
			if (i > startStep)	// Don't do this the first time through
				addStep(true, true);

			if (!showFull)
			{
				stepWids[curStep].showSolution(that.curAnswer());	// Fill in the answers
				stepWids[curStep].cleanup();		// Go into compact mode
			}

			curStep++;
		}

		curStep--;
		scroller.enableArrows();
//		resultText.setPos(textMargin, scroller.bottom());
		fw.dock(resultText, scroller.bottom());
	}

	//=======================================================
	// Shows all completed steps
	//=======================================================
	this.showCompleted = function()
	{
		// @KEYPAD
		scroller.disableArrows();		// Temporarily disable scrolling

		var startStep = curStep;
		for (var i = startStep; i < that.steps.length; i++)
		{
			if (i > startStep)	// Don't do this the first time through
				addStep(true, true);

			if (that.steps[curStep].status !== 'New')
			{
				stepWids[curStep].showSolution(that.curAnswer());	// Fill in the answers
				stepWids[curStep].cleanup();		// Go into compact mode
				curStep++;
			}
			else
			{
				focusCurrentStep();
				break;
			}
		}

		scroller.enableArrows();
//		resultText.setPos(textMargin, scroller.bottom());
		fw.dock(resultText, scroller.bottom());
	}

	//=======================================================
	//=======================================================
	this.showText = function(text, color)
	{
		fw.dock(resultText, scroller.bottom());
//		resultText.setPos(textMargin, scroller.bottom());
		resultText.color(color).setText(text);    // Make sure it's visible, even if it's about to fade in
		resultText.hide().fadeIn(style.textFadeRate);
	}

	//=======================================================
	//=======================================================
	this.clearText = function()
	{
		resultText.setText('&nbsp;');
	}

	//=======================================================
	//=======================================================
	function fadeOutText()
	{
		// Fade the text, and clear it when done
		resultText.fadeOut(style.textFadeRate, 0, function() {
			resultText.setText('&nbsp;');
		});
	}

	//=======================================================
	//=======================================================
	this.focus = function()
	{
		if (scroller.scrollToEnd(focusCurrentStep))
			fadeOutText();
	}

	//=======================================================
	//=======================================================
	function displayHint()
	{
		that.showText(that.steps[curStep].hint, style.hintColor);
		fw.eventPublish('focus:postHint');
	}


		//=======================================================
		//=======================================================
		this.showLastStepText = function()
		{
			that.showText("this is the text", style.hintColor);
			fw.eventPublish('focus:postHint');
		}

	//=======================================================
	//=======================================================
	this.showHint = function()
	{
		scroller.scrollToEnd(displayHint);
	}

	//=======================================================
	//=======================================================
	this.scrollToEnd = function(callback)
	{
		scroller.scrollToEnd(callback);
	}

	//=======================================================
	//=======================================================
	this.fadeCheck = function()
	{
		stepWids[curStep].fadeCheck();
	}

	//=======================================================
	//=======================================================
	this.normalCheck = function()
	{
		stepWids[curStep].normalCheck();
	}

	//=======================================================
	//=======================================================
	this.fadeHelp = function()
	{
		stepWids[curStep].fadeHelp();
	}

	//=======================================================
	//=======================================================
	this.normalHelp = function()
	{
		stepWids[curStep].normalHelp();
	}

	//=======================================================
	//=======================================================
	this.removeButtons = function()
	{
		stepWids[curStep].removeButtons();
	}

	//=======================================================
	//=======================================================
	this.wrongAnswer = function(list)
	{
		stepWids[curStep].wrongAnswer(list);
	}

	//=======================================================
	// Clear wrong answer messages
	//=======================================================
	this.clearWrongs = function()
	{
		stepWids[curStep].clearWrongs();
	}

	//=======================================================
	//=======================================================
	this.stepSolution = function()
	{
		stepWids[curStep].showSolution(that.curAnswer());
	}

	//=======================================================
	// Set the state of the step's status indicator
	//=======================================================
	this.setState = function(state)
	{
		stepWids[curStep].setState(state);
	}

	//=======================================================
	//=======================================================
	this.cleanStep = function()
	{
		stepWids[curStep].cleanup();
	}

//==========================================================================
// Status API
//==========================================================================

	//=======================================================
	//=======================================================
	this.curStep = function()
	{
		return curStep;
	}

	//=======================================================
	//=======================================================
	this.curAnswer = function()
	{
		return that.steps[curStep].a;
	}

	//=======================================================
	//=======================================================
	this.curType = function()
	{
		return that.steps[curStep].ansType;
	}

	//=======================================================
	//=======================================================
	this.answers = function()
	{
		return stepWids[curStep].answers();
	}

	//=======================================================
	//=======================================================
	this.value = function()
	{
		return stepWids[curStep].value();
	}

	//=======================================================
	// Return the current step
	//=======================================================
	this.getStep = function()
	{
		return curStep;
	}

	//=======================================================
	//=======================================================
	this.helpCoords = function()
	{
		// This will be relative to the stage
//		var xy = stepWids[curStep].helpCoords();
//		return [scroller.x + xy[0], scroller.y + xy[1]];

		return stepWids[curStep].helpCoords();	// These coords will be relative to the inside of the scroller
	}

	//=======================================================
	// @FIXME/dg: This is bad architecture!
	//=======================================================
	this.helpButton = function()
	{
		return stepWids[curStep].helpButton();
	}

	//=======================================================
	//=======================================================
	this.getStepButton = function()
	{
		return stepWids[curStep].getStepButton();
	}

	//=======================================================
	// Fetch the button widget ID.  Returning the entire
	// widget is too dangerous.
	//
	// This is better architecture.
	//=======================================================
	this.buttonsID = function()
	{
		return stepWids[curStep].buttonsID();
	}

	//=======================================================
	// Returns the relative position of the buttons:
	// "below" or "right".
	//=======================================================
	this.buttonsPos = function()
	{
		return stepWids[curStep].buttonsPos();
	}

	//=======================================================
	// @FIXME/dg: This is a bit hacky.  We need a better way of dealing with coordinate conversion!
	//=======================================================
	this.getContainer = function()
	{
		return scroller.getContainer();
	}

	//=======================================================
	// Determine the scroll offset of the scroller
	//=======================================================
	this.scrollOffset = function()
	{
		return scroller.scrollOfs();
	}

	//=======================================================
	//=======================================================
	this.updateSubmissions = function()
	{
		return stepWids[curStep].updateSubmissions();
	}

//==========================================================================
// Widget API
//==========================================================================

	//=======================================================
	// Default implementation to set or get a widget's height
	//=======================================================
	this.height = function(h)
	{
		if (defined(h))
		{
			this.h = h;
			return this;	// For chaining
		}
		else
			return this.h;
	}

	//=======================================================
	// Default implementation to set or get a widget's width
	//=======================================================
	this.width = function(w)
	{
		if (defined(w))
		{
			this.w = w;
			return this;
		}
		else
			return this.w;
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		// Create the scroller widget
		scroller = that.add('scrollerContainer', {
			scrollNotify: stepScroll,
			reserveSpace: style.textSpace,	// This COULD be modified to reserve enough space for the keypad (in a clean fashion, of course.  This module can't know about the keypad),
			bgColor: style.bgColor
		}, fw.dockTo(that));

		that.container = scroller.container;  // Steal our child's container.  This seems bad.

		// Create text
		createText();

		// Draw the first step
//		addStep(true);

		// Add the title bar
		addTitle();
	}

	//=======================================================
	// I think this was just for the toggler.  It's breaking
	// cross fades.
	//=======================================================
	/*
	this.fadeOutSelf = function(rate, to, action)
	{
		// Stop interval -- clear any pending actions (fading in steps, and most importantly the post fade-in focus)
		// Without this, the focus that occurs after the item is hidden can break the screen.
		// This is mostly redundant with the post fade-in action.  The redundant steps should be encapsulated.
		if (timeout)
		{
			that.clearText();

			curStep++;
			addStepHidden();
			scroller.enableArrows();

			clearInterval(timeout);
			timeout = null;
		}
	}
	*/

	//=======================================================
	//=======================================================
	this.terminateSelf = function()
	{
		timeout && clearInterval(timeout);	// Destroy any pending actions set with setTimeout.
		// Clean up event bindings
		fw.eventUnsubscribe('setFocus:step', focusCurrentStep);	// It's probably safe to completely unbind this event, but we'll trade clarity for certainty
		fw.eventUnsubscribe('focus:input', moveToEnd);
	}

}
