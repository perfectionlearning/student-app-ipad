//======================================================
// Creates an equation input (math input box plus symbol input buttons)
//
// Arguments:
//  id
//  x
//  y
//  transitionCallback: Function to call before a transition during cleanup
//
// Style: (eqInput)
//  boxBorderWidth
//  boxBorderColor
//  boxColor
//  (global)readOnlyColor
//======================================================
framework.widget.ansEquation = function()
{
	var that = this;
	var style = app.style.eqInput;

	var box, inp, prefix, suffix;
	var isReadOnly = false;

	that.h = style.height;	// Unconventional!
	that.w = that.w || style.width;

	// Subscribe to events from the underlying equation input
	fw.eventSubscribe('focus:eq', gotFocus);
	fw.eventSubscribe('blur:eq', lostFocus);
	fw.eventSubscribe('loseFocus:input', blur);	// Something external wants us to blur the input
	fw.eventSubscribe('keypress:Enter', enterInputBox); // Enter key pressed in input box.

	//=======================================================
	//
	//=======================================================
	function drawPrefix()
	{
		prefix = that.add('text', {
			text: that.pre,
			color: style.color,
			font: style.qFont
		}, {
			wid: that,
			my: 'top left',
			at: 'top left'
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawSuffix()
	{
		suffix = that.add('text', {
			text: that.post,
			color: style.color,
			font: style.qFont
		}, {
			wid: that,
			my: 'top right',
			at: 'top right'
		});
	}

	//=======================================================
	// Create the background box
	//=======================================================
	function createBox()
	{
		return that.add('rect', {
			color: style.boxColor,
			borderWidth: style.boxBorderWidth,
			borderColor: style.boxBorderColor,
			depth: 1,
		});

		return wid;
	}

	//=======================================================
	// Create the equation input
	//=======================================================
	function createInput()
	{
		var wid = that.add('equation', {
			text:'',
			color: style.color,
			edit: true,
			type: 'ansInput',
			isEqInput: true,		// Flag used by keypad
			funcTest: 'qc_input',
			depth: 1
		});

//		var w = wid.width();
//		var h = wid.height();
//		wid.setBounds(w, h);		// Doesn't work yet!

		return wid;
	}

	//=======================================================
	//
	//=======================================================
	function dockNormal()
	{
		var leftDock = prefix ? (prefix.id + ' right') : (that.id + ' left');
		var rightDock = suffix ? (suffix.id + ' left') : (that.id + ' right');

		fw.dock(box, {
			top: that.id + ' top',
			bottom: that.id + ' bottom',
			left: leftDock,
			right: rightDock
		});

		fw.dock(inp, {
			top: box.id + ' top ' + style.margin,
			bottom: box.id + ' bottom -' + style.margin,
			left: box.id + ' left ' + style.margin,
			right: box.id + ' right -' + style.margin
		});
	}

	//=======================================================
	//
	//=======================================================
	function dockCompact(inpWid, boxWid, sizeHack)
	{
		// Place the input
		fw.dock(inpWid, {
			top: that.id + ' top ' + style.cleanedMargin,
			left: prefix ? (prefix.id + ' right ' + style.cleanedMargin) : (that.id + ' left ' + style.cleanedMargin)
		});

		// Place the box around it
		var brMargin = sizeHack ? style.cleanedMargin2 : style.cleanedMargin;
		fw.dock(boxWid, {
			top: inpWid.id + ' top -' + style.cleanedMargin,
			left: inpWid.id + ' left -' + style.cleanedMargin,
			bottom: inpWid.id + ' bottom ' + brMargin,
			right: inpWid.id + ' right ' + brMargin
		});

		// Attach the suffix to the box
		suffix && fw.dock(suffix, {
			wid: boxWid,
			my: 'top left',
			at: 'top right'
		});
	}

	//=======================================================
	// Enter key pressed in input box
	//=======================================================
	function enterInputBox(data)
	{
		if (inp.id === data.id)
		{
			if (!that.isStep)
				fw.eventPublish('doSubmit:input');
			else
				fw.eventPublish('stepSubmit:input');
		}
	}

	//======================================================
	// We received a focus notification from the equation primitive
	//======================================================
	function gotFocus(ev)
	{
		var data = ev.data.owner;
		// Don't do anything if the input is read-only
		if (isReadOnly)
			return;

		// Filter event.  Make sure data.id matches the id of one of our inputs.
		if (data.id === inp.id)
		{
			fw.eventPublish('focus:input', {
				owner: data,
				wid: that,
				x: that.x,
				y: that.y,
				h: that.height(),
				w: that.width()
			});
		}

	}

	//======================================================
	// The underlying equation is notifying us that it has blurred
	//======================================================
	function lostFocus(data)
	{
		// Filter event.  Make sure data.id matches the id of one of our inputs.
		if (data.id === inp.id)
		{
			fw.eventPublish('blur:input', {
				owner: data,
				wid: that
			});
		}
	}

	//======================================================
	// Set the focus on the equation
	//======================================================
	this.focus = function()
	{
		// Don't do anything if the input is read-only
		if (isReadOnly)
			return;

		inp.focus();

		// This is only needed the first time
		fw.eventPublish('focus:input', {
			owner: inp,
			wid: that
		});

		// Ensure the keypad is visible
		fw.eventPublish('show:inputEntry');		// This enables the equation input
	}

	//=======================================================
	// Something external wants us to blur the input
	//=======================================================
	function blur()
	{
		inp.blur();
	}

	//======================================================
	// This returns the height of icons
	//======================================================
	this.iconHeight = function()
	{
		return 0;
	}

	//======================================================
	// Required Interface: Returns the equation in the box
	//======================================================
	this.value = function(isInternal)
	{
		var val = inp.value();

		if (!isInternal)
			val = latexToMathML.translate(val);

		return val;
	}

	//=======================================================
	// Pass the request on to the specific input widget
	//=======================================================
	this.showAnswer = function(answer)
	{
		inp.clear();
		inp.showAnswer(answer);

		// Read Only functionality, but without setting read-only on the input box (which erases it!)
		// @FIXME/dg: This requires too much knowledge of the underlying widget's internal operations.
		// Just set it to read only and let it worry about maintaining its content.
		box.color(app.style.readOnlyColor);

		fw.eventPublish('hide:inputEntry');
	}

	//=======================================================
	// Enable solution mode
	// This doesn't do anything now.  Later, the widget will
	// undergo cleanup().  At that point, use the solution
	// passed in here.
	//
	// This is a bit awkward.  Solution mode creates everything
	// in input mode, fills in the answer, then instantly asks
	// it to go into compact mode (via cleanup).
	// It would be a bit more efficient to go directly into
	// compact mode.
	//
	// That inefficiency can be forgiven, but the real issue
	// is that cleanup() assumes latex data, while this routine
	// supplies MathML data.  This widget shouldn't know anything
	// about that, but it's failing because of it.
	// Ideally, somewhere externally it should detect LaTeX vs. MathML.
	//=======================================================
	this.showSolution = function(answer)
	{
		this.solutionMode = true;
		this.solution = answer;

		inp.terminate();
		box.terminate();
	}

	//=======================================================
	// Pass the request on to the specific input widget
	//=======================================================
	this.readOnly = function()
	{
		isReadOnly = true;

		box.color(app.style.readOnlyColor);
		inp.readOnly();
		fw.eventPublish('hide:inputEntry');
	}

	//=======================================================
	// Pass the request on to the specific input widget
	//=======================================================
	this.allowInput = function()
	{
		isReadOnly = false;

		box.color(style.boxColor);
		inp.allowInput();
		fw.eventPublish('show:inputEntry');		// This enables the equation input
	}

	//=======================================================
	// This creates a new box and read-only equation "input"
	//=======================================================
	function createSecondaryElements()
	{
		// In this case, these two need to be reversed. Draw the input (read-only) and dock the box to it.
		var newBox = createBox();
		var newInp = createInput();

		// This is a good place for an architecture-violating hack.  A better solution would be
		// much harder to architect.  An equation would have to know its underlying data format.

		var sizeHack = false;

		// If a solution was set, use that.  Otherwise, pull from the equation input
		// The solution is in MathML, inp.value is in LaTeX!
		if (that.solution)
			newInp.showAnswer(that.solution);
		else
		{
			newInp.write(inp.value(true));
			sizeHack = true;
		}

		newInp.readOnly();
		newBox.color(app.style.readOnlyColor);

		// Dock AFTER setting the content. Setting the color and going to read-only mode probably
		// won't change the size, but do this last anyway.
		dockCompact(newInp, newBox, sizeHack);

		return newBox;
	}

	//=======================================================
	// Go into a compact read-only state
	//=======================================================
	this.cleanup = function()
	{
		// Remove the KI buttons
		fw.eventPublish('hide:inputEntry');

		// Create a second input and box
		var wid = createSecondaryElements();

		// Do a callback to allow repositioning
		that.transitionCallback && that.transitionCallback(wid);

		// Create a transition between the old and new boxes
		// Don't do this if we're showing the solution (which happens instantly)
		if (!this.solutionMode)
		{
			that.add('transition', {
				from: box,
				to: wid,
				fadeInRate: 700,    // Style!
				fadeOutRate: 400,
				done: function() {
					inp.terminate();		// We can't just use "deleteFrom".  inp was being hidden but not deleted.
					box.terminate();
				}
			});
		}
	}

	//=======================================================
	//=======================================================
	this.clear = function()
	{
		inp.clear();
	}

	this.backspace = function()
	{
		inp.backspace();
	}

	//=======================================================
	// @FIXME/dg: This is an architecture violation!  Keep external hands off our private members!
	//=======================================================
	this.target = function()
	{
		return inp;
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		if (that.pre)
			drawPrefix();

		box = createBox();
		inp = createInput();

		if (that.post)
			drawSuffix();

		dockNormal();

		// Equation inputs have no MathML (initially -- they do for solution mode)
		that.promise = null;

//		if (that.post)
//			drawSuffix();
	}

	//======================================================
	//======================================================
	this.terminateSelf = function()
	{
		fw.eventUnsubscribe('focus:eq', gotFocus);
		fw.eventUnsubscribe('blur:eq', lostFocus);
		fw.eventUnsubscribe('loseFocus:input', blur);
		fw.eventUnsubscribe('keypress:Enter', enterInputBox);
	}
};
