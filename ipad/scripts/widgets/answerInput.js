//======================================================
// Generic Answer Input widget
//	Creates an answer input of the correct type, complete with Check and Help buttons
//	The parent view doesn't have to worry about positioning and displaying individual answer items
//	This widget maintains the visibility and interface for all different types
//
// Arguments:
//	id
//	x, y, w, h
//
//	type: Input type: equation, multi, radio, check
//
//	choices: Used by multiple choice
//  text: Used by multiInput
//  multiInput: style info for multiInputs
//	buttonAlign: "L" or "R"
//
//  buttonList: [{asset:, frame:, cb:}]
//  maxWidth: This is used to determine whether the buttons can be located to the right of the widget
//
// @TODO/dg: These need to be moved to style, but they can vary!  Pass in a style to use?
//	buttonAsset
//	buttonGap: Space between buttons
//	buttonX: Relative to right side of input
//	buttonY: Relative to bottom of input
//======================================================
framework.widget.answerInput = function()
{
	var that = this;
	var style = app.style.input;

	var input, buttons;
	var ht, wd;
	var buttonPos = 'right';	// Where the buttons are positioned, relative to the input.  Can be 'below' or 'right'
	var isClean = false;

	// Multi-input buttons need to be hidden
	if (that.type === 'multi' || that.type === 'multiPart')
		that.hidden = true;

	that.noButtons = (that.type === 'multiPart');
	
	var MC_RIGHT_BUFFER = 110; // Adjust right buffer for multiple choice, to give space for buttons.

	//=======================================================
	// Draw the correct input widget
	//=======================================================
	function drawInput()
	{
		var inputMap = {
			equation: equation,
			multi: freeInput,
			radio: multipleChoice,
			check: multipleChoice,
			paper: paper,
			graphPlot: graphPlot,
			graphConst: graphConst,
			multiPart: paper,
			essay: essay
		}

		var inputHandler = inputMap[that.type];

		if (inputHandler)
			return inputHandler(that.type);	// Pass the type as a parameter. Only multipleChoice uses it.
		else
			fw.error('Illegal input type: ' + that.type);
	}

	//=======================================================
	//=======================================================
	function equation()
	{
		input = that.add('ansEquation', {
			id: 'eq',
			pre: that.pre,
			post: that.post,
			isStep: that.isStep,
			transitionCallback: that.transitionCallback,
			hidden: that.hidden
		}, {
			top: that.id + ' top',
			left: that.id + ' left',
//			right: that.id + ' right'
		});

		return input.promise;
	}

	//=======================================================
	//=======================================================
	function freeInput()
	{
		input = that.add('freeInput', $.extend({
			text: that.text,
			isStep: that.isStep,
			renderComplete: showButtons,
			overflow: 'visible',		// Kind of a hack.  The element is wider than its initially reported width, causing its parent to be too narrow, thus clipping.
			hidden: that.hidden
		}, that.multiInput), {
			wid: that,
			my: 'top left',
			at: 'top left'
		});

		return input.promise;
	}

	//=======================================================
	//=======================================================
	function multipleChoice(subtype)
	{
		input = that.add('multipleChoice', {
			asset: subtype === 'radio' ? app.style.multipleChoice.radioAsset : app.style.multipleChoice.checkAsset,
			allowMulti: subtype !== 'radio',
			choices: that.choices,
			isStep: that.isStep,
			postRedock: showMc,
			hidden: true
		}, {
			top: that.id + ' top',
			left: that.id + ' left'
		});

		if (input.promise) {
			input.promise.then(dockMCToRight);
		}
		else {
			dockMCToRight();
		}

		return input.promise;
	}

	//=======================================================
	// Dock multiple choice items to right, instead of relying
	// on item width.
	//=======================================================
	function dockMCToRight() {
		console.log('dockMCToRight', input.width(), that.width());
		if (input.width() > that.width()-MC_RIGHT_BUFFER) {

			fw.dock(input, {
				top: that.id + ' top',
				left: that.id + ' left',
				right: that.id + ' right'},
			true);
		}
		else
			input.show();
	}
	
	//=======================================================
	// Bring multiple choice items out of hiding.
	//=======================================================
	function showMc() {
		input.show();
	}
	
	//=======================================================
	// Create an input widget stand-in.  It's much easier than
	// trying to deal with no input later on.
	//=======================================================
	function paper()
	{
		input = that.add('freeInput', $.extend({
			w: 1000,
			text: '&nbsp;',
			isStep: that.isStep,
			renderComplete: doNothing,
			overflow: 'visible',		// Kind of a hack.  The element is wider than its initially reported width, causing its parent to be too narrow, thus clipping.
			hidden: that.hidden
		}, that.multiInput), {
			wid: that,
			my: 'top left',
			at: 'top left'
		});

		return input.promise;
	}

	//=======================================================
	//=======================================================
	function essay()
	{
		input = that.add('essayInput', {
			isStep: that.isStep,
			hidden: that.hidden
		}, {
			top: that.id + ' top',
			left: that.id + ' left',
//			right: that.id + ' right'
		});

		return input.promise;
	}

	//=======================================================
	//
	//=======================================================
	function graphPlot()
	{
		var ratio = that.isStep ? 0.45 : 0.58;		// @FIXMEGRAPH/dg
		var size = Math.floor(that.w * ratio);

		input = that.add('graphPlotInput', {
			size: size,
			axis: that.axis,
			inputCount: that.eq[0].inCnt,
			isStep: that.isStep,
			hidden: that.hidden
		}, {
			top: that.id + ' top',
			left: that.id + ' left',
			right: that.id + ' right -14'
		});

		return input.promise;
	}

	//=======================================================
	//
	//=======================================================
	function graphConst()
	{
		var ratio = that.isStep ? 0.45 : 0.58;		// @FIXMEGRAPH/dg
		var size = Math.floor(that.w * ratio);

		input = that.add('graphConstInput', {
			size: size,		// @FIXMEGRAPH/dg
			axis: that.axis,
			eq: that.eq[0],
			params: app.graphParams(that.eq[0].type),
			isStep: that.isStep,
			hidden: that.hidden
		}, {
			top: that.id + ' top',
			left: that.id + ' left',
			right: that.id + ' right'
		});

		return input.promise;
	}

	//=======================================================
	//=======================================================
	function doNothing()
	{
	}

	//=======================================================
	// Draw the check and help buttons
	//=======================================================
	function drawButtons()
	{
		if (!that.noButtons)
		{
			buttons = that.add('iconBar', {
				iconList: that.buttonList,
				tipPos: style.tipPos,
				tipOfs: style.tipOfs,
				btnGap: that.buttonGap,
				hidden: true,
				depth: 1
			});
		}
	}

	//=======================================================
	// Dock the buttons, after we know where to put them
	//=======================================================
	function dockButtons()
	{
		if (that.noButtons)
			return;

		// Determine whether to use 'below' or 'right' layout options
		var w = buttons.width() < style.minButtonWidth ? style.minButtonWidth : buttons.width();
		var iw = input.width();	// Might be smaller than that.w
		if (defined(that.maxWidth) && ((iw + w) <= that.maxWidth))
			buttonPos = 'right';
		else
			buttonPos = 'below';

		if (buttonPos === 'below')
			buttonsBelow(buttons);
		else
			buttonsRight(buttons);

		buttons.show();

		/*
		 * This method uses fixed positioning, based on a few rules.
		 * Now that we don't draw buttons until the answer input finishes drawing,
		 * we can return to our dynamic positioning.
		 *
		if (that.isStep || that.type === 'graphPlot' || that.type === 'graphConst')
		{
			buttonPos = 'below';		// This gets queried externally, so we need to set it.
			buttonsBelow(buttons);
		}
		else
		{
			buttonPos = 'right';
			buttonsRight(buttons);
		}
		*/
	}

	//=======================================================
	// Draw the check and help buttons
	//=======================================================
	function buttonsBelow(btns)
	{
		fw.dock(btns, {
			top: input.id + ' bottom ' + that.buttonY,
			right: that.id + ' right ' + that.buttonX
		});
	}

	//=======================================================
	// Draw the check and help buttons
	//=======================================================
	function buttonsRight(btns)
	{
		// If the buttons are taller than the input, docking to the bottom right looks silly
		// Instead, center vertically.
		if (btns.height() > input.height())
			var vDock = 'center';
		else
			vDock = 'bottom';

		// Left align: Position right next to the input
		if (that.buttonAlign == "L")
		{
			var hDock = 'left';
			var hGap = style.rightGap;
		}
		// Right align: Add an offset based on maxWidth
		else
		{
			hDock = 'right';
			hGap = that.maxWidth - input.width();
		}

		fw.dock(btns, {
			wid: input,
			at: vDock + ' right',
			my: vDock + ' ' + hDock,
			ofs: hGap + ' 0'
		});
	}

	//=======================================================
	// Calculate the full width and height of the widget
	//=======================================================
	function calcSize()
	{
		// First height.  The complicated one.
		// Non-equations are simple
		if (buttonPos === 'below')
			ht = buttons.y + buttons.height() - input.y;
		else
			ht = input.height();

		// Equations are more complex.
		if (that.type === 'equation')
		{
			// If the icon height is larger than the check/help asset height, use it instead.
			var ah = fw.assetHeight(that.buttonAsset);
			var ih = input && input.iconHeight();

			if (ah < ih) 	// The icons are taller
				ht += ih - ah;
		}

		// Now width
		wd = this.w;		// fixme: Keep track of button dock location and calculate properly
	}

	//=======================================================
	// Set the focus on the input widget
	//=======================================================
	this.focus = function()
	{
		input.focus && input.focus();	// Focus on any inputs that support it
	}

	//=======================================================
	// Enable all buttons
	//=======================================================
	function showButtons()
	{
		if (buttons)
			buttons.show();
		else
			setTimeout(showButtons, 100);
	}

	//=======================================================
	// Returns the coordinates of the help button
	//=======================================================
	this.helpCoords = function()
	{
		var help = buttons && buttons.getButton('Menu');

		if (help)
			return [help.x, help.y];
		else
			return [0,0];
	}

	//=======================================================
	// Returns the help button
	// @FIXME/dg: This is bad architecture.
	//=======================================================
	this.helpButton = function()
	{
		return buttons && buttons.getButton('Menu');
	}

	//=======================================================
	//=======================================================
	this.getStepButton = function()
	{
		return buttons && buttons.getButton('Step');
	}

	//=======================================================
	// Fetch the button widget path.  Returning the entire
	// widget is too dangerous.
	//=======================================================
	this.buttonsID = function()
	{
		return buttons && buttons.path();
	}

	//=======================================================
	// Returns the relative position of the buttons:
	// "below" or "right".
	//=======================================================
	this.buttonsPos = function()
	{
		return buttonPos;
	}

	//=======================================================
	// Returns the value of the input
	//=======================================================
	this.value = function(val)
	{
		return input.value(val);	// Required interface
	}

	//=======================================================
	// Only used for multiInput, in which the question contains
	// the answers
	//=======================================================
	this.answers = function()
	{
		return input.answers && input.answers();
	}

	//=======================================================
	//=======================================================
	this.normalCheck = function()
	{
		buttons && buttons.enable('Check');

		this.allowInput();
	}

	//=======================================================
	//=======================================================
	this.fadeCheck = function()
	{
		buttons && buttons.disable('Check');

		this.readOnly();
	}

	//=======================================================
	//=======================================================
	this.normalHelp = function()
	{
		buttons && buttons.enable('Menu');
	}

	//=======================================================
	//=======================================================
	this.fadeHelp = function()
	{
		buttons && buttons.disable('Menu');
	}

	//=======================================================
	//=======================================================
	this.normalStep = function()
	{
		buttons && buttons.enable('Step');
	}

	//=======================================================
	//=======================================================
	this.fadeStep = function()
	{
		buttons && buttons.disable('Step');
	}

	//=======================================================
	// Pass the request on to the specific input widget
	//=======================================================
	this.showAnswer = function(answer)
	{
		input && input.showAnswer(answer);	// Show the answer AND make the input readonly
	}

	//=======================================================
	// Pass the request on to the specific input widget
	//=======================================================
	this.showSolution = function(answer)
	{
		input && input.showSolution(answer);	// Fill the answer into the equation in a transparent fashion
	}

	//=======================================================
	// Pass the request on to the specific input widget
	//=======================================================
	this.readOnly = function()
	{
		input && input.readOnly();
	}

	//=======================================================
	// Pass the request on to the specific input widget
	//=======================================================
	this.allowInput = function()
	{
		input && input.allowInput();
	}

	//=======================================================
	// Pass on wrong answer messages, if supported
	//=======================================================
	this.wrongAnswer = function(list)
	{
		input.wrongAnswer && input.wrongAnswer(list);
	}

	//=======================================================
	// Clear wrong answer messages, if supported
	//=======================================================
	this.clearWrongs = function()
	{
		input.clearWrongs && input.clearWrongs();
	}

	//=======================================================
	// @FIXME/dg: Architecture violation?  Where is this used??
	//=======================================================
	this.getInput = function()
	{
		return input;
	}

	//=======================================================
	// Remove the buttons, and return the top-left corner of
	// the buttons
	//=======================================================
	this.removeButtons = function()
	{
		buttons && buttons.hide();

		if (buttons)
			return [buttons.x, buttons.y];
		else
			return [0,0];
	}

	//=======================================================
	//=======================================================
	this.restoreButtons = function()
	{
		buttons && buttons.show();
	}

	//=======================================================
	// Clear the input
	//=======================================================
	this.clear = function()
	{
		buttons && buttons.terminate();
		input.terminate();

		input = buttons = null;

		this.docked();
	}

	//=======================================================
	// Reset the widget to a pristine state
	//=======================================================
	this.reset = function()
	{
		this.clear();
		this.fadeIn(0, 1);
		this.normalCheck();
		this.restoreButtons();
		this.allowInput();
		this.focus();
	}

	//=======================================================
	// Go into minimal read-only mode
	// Note that this is currently a one-way trip.
	//=======================================================
	this.cleanup = function()
	{
		isClean = true;
		this.readOnly();

		buttons && buttons.terminate();
		buttons = null;

		input.cleanup();

		ht = input.height();		// Update the height
	}

	//=======================================================
	//=======================================================
	this.height = function(h)
	{
		if (defined(h))
		{
			this.h = h;
			return h;
		}

		// Docking means some odd call ordering occurs.  The widget hasn't drawn itself
		// the first time(s) this is called, because they occur before docked() is called.
		// That means anything other than top left alignment won't work!
		// The only real way around this is for child widgets to handle resize events.
		// In practice, this widget uses a fixed height, so this routine shouldn't even be
		// called by the docking module.  The main issue is that 'this.h' is the box height,
		// not the real widget height.

//		return ht;


		if (input && buttons && buttonPos === 'below')
		{
			return buttons.y + buttons.height() - input.y;
		}
		else if (input)
			return input.height();
		else
			return 0;
	}

	//=======================================================
	// @FIXME/dg: Convert to realtime
	//=======================================================
	this.width = function(w)
	{
		if (defined(w))
		{
			this.w = w;
			return w;
		}

		return wd || this.w;
	}

	//=======================================================
	//
	//=======================================================
	function finishDock()
	{
		if (isClean)
			return;

		dockButtons();
		calcSize();

		// @FIXME/dg: This is an ugly hack, and also slow!
		// Dependents (namely, result text) is docked before
		// this widget is Jaxed and the final height is known.
		// This will move the result text when we're ready,
		// but it will always do it when it's rarely needed.
		fw.moveDependents();
	}

	//=======================================================
	// Don't draw until docking is complete
	//=======================================================
	this.docked = function()
	{
		that.maxWidth = that.w;	// Hacky

		// Draw the buttons, in a random location (hidden)
		drawButtons();

		// Draw the input
		var promise = drawInput();

		// When all MathJax is finished rendering, finish the docking procedure.
		// This is bound to create some wacky dependency issues!
		// AND IT DOES. YAY.
		// The buttons are expected to exist immediately.
		$.when(promise).done(finishDock);
	}

};
