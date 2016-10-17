//======================================================
// Creates a "free input", which is MathML with embedded inputs
//
// Arguments:
//  id
//  x
//  y
//	text		// Required
//	depth		// Optional -- Default: 0
//	hidden		// Optional -- Currently ignored.  We can't query box positions if the element is hidden.  It is currently deferred until the widget is made visible, which requires a mandatory hidden attribute.
//
// Style: (freeInput)
//	font		// css string format, e.g. "bold 12px serif"
//	color		// Optional -- Default: black
//======================================================
framework.widget.freeInput = function()
{
	var that = this;
	var style = app.style.freeInput;

	var boxCount;
	var inputs = [];
	var isReadOnly = false;

	// Create the equation, substituting placeholders for <maction> tags
	var displayWid;
	createMathContainer();

	// Create inputs, even though we can't size or position them yet
	createInputs();
	displayWid.promise && displayWid.promise.done(fadingIn);
	that.promise = displayWid.promise;

	// Subscribe to events from the underlying input boxes
	fw.eventSubscribe('focus:inputbox', gotFocus);	// The input boxes say they got focus
	fw.eventSubscribe('blur:inputbox', lostFocus);	// The input boxes say they lost focus
	fw.eventSubscribe('loseFocus:input', blurBoxes);	// Something external wants us to blur the boxes
	fw.eventSubscribe('keypress:Enter', enterInputBox); // Enter key pressed in input box.

	// The rest is all deferred until the widget is made visible.  Until displayWid is visible, we can't proceed.

	//======================================================
	//======================================================
	function createMathContainer()
	{
		displayWid = that.add('multiInput', {
				text: that.text,
				overflow: 'visible',	// Kind of a hack.  The element is wider than its initially reported width, causing its parent to be too narrow, thus clipping.
				depth: that.depth,
				font: style.font,
				color: style.color,
				align: that.align,
				options: {digitWidth: app.charWidth},
				borderWidth: that.borderWidth,
				borderColor: that.borderColor,
				notify: true,
				funcTest: 'math-container',
				padding: that.padding,		// @FIXME/dg: This is bad!
				widthAdjust: that.widthAdjust || 0,	// @FIXME/dg: Is this used?  What is it?
				hidden: true,	//that.hidden
				type: 'multiInput',
				isEqInput: true,		// Flag used by keypad
		},{
			top: that.id + ' top',
			left: that.id + ' left'
//			right: that.id + ' right'	// Used for centering and preventing wrapping due to a Firefox bug
		});

		boxCount = displayWid.boxCount();
	}

	//======================================================
	//======================================================
	function fadingIn()
	{
		if (displayWid)
			showInputs();
		else
			fw.warning('Attempting to display non-existant free inputs.');

		that.renderComplete();
	}

	//=======================================================
	//
	//=======================================================
	function showInputs()
	{
		// Request the list of inputs
		boxExtents = displayWid.getBoxes();

		// Create input widget overlays for each input box
		positionInputs(boxExtents);
	}

	//=======================================================
	// Create input boxes, even though we can't position them yet
	//=======================================================
	function createInputs()
	{
		for (var i=0; i < boxCount; i++)
		{
			inputs.push(that.add('inputBox', {
				x: -10,
				y: -10,
				depth: (that.depth || 0) + 1,
				funcTest: 'qc_input',
//				hidden: true			// The inputs won't be visible for a bit, but without some work the box has to be visible to get focus.
			}));
		}
	}

	//=======================================================
	// Place the inputs, now that we know where
	// It might seem better to create the inputs on fadeInSelf.
	// However, that occurs after the fade starts, so we can't fade in
	// the inputs as well!  This way the inputs will automatically fade
	// in at the proper rate.
	//
	// Also, and just as importantly, fadeInSelf gets called multiple times.
	// Without some kind of protection, we would just keep adding inputs.
	// Calling this each time fadeIn occurs is redundant as well, but
	// is less harmful.  Still, disabling the routine after one call
	// would help efficiency.
	//=======================================================
	function positionInputs(boxExtents)
	{
		$.each(inputs, function(idx, boxWid) {
			if (idx < boxExtents.length)
			{
				// Setting the position isn't safe. We need to use docking to ensure that we
				// can reflow as needed when redocks occur.
				//boxWid.setPos(boxExtents[idx].x, boxExtents[idx].y);
				fw.dock(boxWid, {
					top: that.id + ' top ' + boxExtents[idx].dy,
					left: that.id + ' left ' + boxExtents[idx].dx
				});

				// Setting the width and height should be safe. This only occurs after the MML
				// is Jaxed and the promise resolves.
				boxWid.width(boxExtents[idx].w + 2);		// I have no idea why the +2 is needed! @FIXME/dg
				boxWid.height(boxExtents[idx].h + 0);
			}
		});
	}

	//=======================================================
	// Find the first empty input box.
	// @FIXME/dg: Use the last wrong answer
	// If none are empty, use the last full box.
	//=======================================================
	function findEmpty()
	{
		var firstEmpty = -1, lastFull = -1;

		$.each(inputs, function(idx, val) {
			if (val.value() == '')
			{
				if (firstEmpty === -1)
					firstEmpty = idx;
			}
			else
				lastFull = idx;
		});

		return (firstEmpty !== -1 ? firstEmpty : lastFull);
	}

	//======================================================
	// One of the input boxes says it got focus.  Tell the world.
	//======================================================
	function gotFocus(data)
	{
		// The notice may have come from another free input's box!
		// There are 3 options:
		//	1) Filter events to determine whether we own the sender
		//  2) Disable other free inputs so they aren't listening for events
		//  3) Add a DOM-like bubble event system that only notifies ancestors

		// #3 may be best long-term, but it adds a fair amount of complexity.
		// #2 is hard because notifying other inputs requires more events or routing, possibly a LoD violation
		// #1 is potentially hacky and messy, but it's the quickest to implement.  It requires writing a messy, custom filter everywhere we receive events!

		// Filter event.  Make sure data.id matches the id of one of our inputs.

		$.each(inputs, function(idx, val) {
			if (val.id === data.id)
			{
				fw.eventPublish('focus:input', {
					owner: data,
					wid: that,
					x: that.x,
					y: that.y,
					h: that.height(),
					w: that.width()
				});

				return false;	// break
			}
		});
	}

	//======================================================
	// The input boxes say they lost focus.  Tell the world.
	//======================================================
	function lostFocus(data)
	{

		// Filter event.  Make sure data.id matches the id of one of our inputs.
		$.each(inputs, function(idx, val) {
			if (val.id === data.id)
			{
				fw.eventPublish('blur:input', {
					owner: data,
					wid: that
				});
			}
		});
	}

	//=======================================================
	// Something external wants us to blur the boxes
	//=======================================================
	function blurBoxes()
	{
		$.each(inputs, function(idx, val) {
			val.blur();
		});
	}

	//=======================================================
	// Enter key pressed in input box
	// Cycle through inputs, based on pattern in gotFocus.
	//
	// If the event field isn't the last one in the set,
	// simply advance to the next one.
	//
	// If the event field is the last one, we need to submit
	// the answer.  However, before we can do that, we need
	// to determine whether this is from the answerInput or a
	// stepByStep widget, since they have different handlers.
	//=======================================================
	function enterInputBox(data)
	{
		$.each(inputs, function(idx, val) {
			if (val.id === data.id)
			{
				if (idx+1 == boxCount)
				{
					if (!that.isStep)
						fw.eventPublish('doSubmit:input');
					else
						fw.eventPublish('stepSubmit:input');
				}
				else
					inputs[idx+1].focus();

				return false;	// break
			}
		});
	}

	//======================================================
	//======================================================
	this.width = function(w)
	{
		return displayWid.width(w);
	}

	//======================================================
	//======================================================
	this.height = function(h)
	{
		return displayWid.height(h);
	}

	//======================================================
	//======================================================
	this.focus = function()
	{
		// Don't do anything if the inputs are read-only
		if (isReadOnly)
			return;

		// This should be impossible, but it's happening.  The following
		// step had no inputs, so everything was getting confused.
		var curInp = findEmpty();
		if (curInp >= 0)
			inputs[curInp].focus();


		// Ensure the keypad is visible
		fw.eventPublish('show:inputEntry');		// This enables the equation input
	}

	//=======================================================
	// @FIXME/dg: Only setting the last input is allowed
	// This is highly risky!
	//=======================================================
	function setVal(val)
	{
		val = parseFloat(val);
		if (isNaN(val))
			val = 0;

		_.last(inputs).value(val);
	}

	//======================================================
	//======================================================
	this.value = function(val)
	{
		if (defined(val))
			return setVal(val);

		var out = [];
		$.each(inputs, function(idx, val) {
			out.push(val.value());
		});

		return out;
	}

	//======================================================
	//======================================================
	this.readOnly = function()
	{
		isReadOnly = true;	// Store the state for this widget

		// And let all the input boxes know too
		$.each(inputs, function(idx, val) {
			val.readOnly(true);
		});
	}

	//======================================================
	//======================================================
	this.allowInput = function()
	{
		isReadOnly = false;	// Store the state for this widget

		// And let all the input boxes know too
		$.each(inputs, function(idx, val) {
			val.readOnly(false);
		});
	}

	//======================================================
	// Mandatory function.  No need to actually do anything.
	//======================================================
	this.cleanup = function()
	{
	}

	//======================================================
	//======================================================
	this.answers = function()
	{
		// Fetch embedded answers
		return displayWid.answers();
	}

	//======================================================
	//======================================================
	this.showAnswer = function(ans)
	{
		// If an answer is passed in as MathML code, extract the answers from it.
		if (ans) {
			var answers = app.getFreeAnswer(ans);
		}
		// Otherwise, use the answers embedded in the input field.
		else {
			answers = displayWid.answers();
		}
		$.each(inputs, function(idx, val) {
			val.value(answers[idx]);
		});
	}

	//======================================================
	//======================================================
	this.wrongAnswer = function(list)
	{
		list && $.each(list, function(idx, val) {
			inputs[val].wrongAnswer();
		});
	}

	//=======================================================
	//=======================================================
	this.clearWrongs = function()
	{
		$.each(inputs, function(idx, val) {
			val.clearWrongs();
		});
	}

	//======================================================
	//======================================================
	this.showSolution = function(ans)
	{
		if (ans)
			displayWid.replaceAnswers(ans);

		// Display the answer in the display widget
		displayWid.showAnswer();

		// Remove the overlay boxes
		$.each(inputs, function(idx, val) {
			val.terminate();
		});

		inputs = [];	// Empty the input list
	}

	//======================================================
	//======================================================
//	this.fadeInSelf = function()
//	{
//		fadingIn();	// Just starting to fade in -- note that if fading is queued, it hasn't actually started yet at the item is still hidden
//	}

	//======================================================
	//======================================================
	this.terminateSelf = function()
	{
		// Messy, but probably necessary. Break any pending promises on termination.
		if (displayWid.promise)
			displayWid.promise.reject();

		fw.eventUnsubscribe('focus:inputbox', gotFocus);
		fw.eventUnsubscribe('blur:inputbox', lostFocus);
		fw.eventUnsubscribe('loseFocus:input', blurBoxes);
		fw.eventUnsubscribe('keypress:Enter', enterInputBox); // Enter key pressed in input box.
	}
}
