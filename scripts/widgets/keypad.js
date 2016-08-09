//======================================================
// Creates a keypad, primarily for mobile devices
//
// @FIXME/dg: Clean up this whole module!  It was done poorly!
//
// Arguments:
//	id
//	x
//	y
//	list: chapter specific buttons
//	coreList: permanent buttons
//
// Style: (keypad)
//  lineHeight:
//  borderColor:
//  backgroundColor:
//  padding:
//======================================================
framework.widget.keypad = function()
{
	var that = this;
	var style = app.style.keypad;

	var buttons, background;
	var intervalID;
	var inputID;
	var enabled = true;
	var visible = !that.hidden;

//	fw.eventSubscribe('focus:input', newInput);
	fw.eventSubscribe('hide:inputEntry', hideKeypad);
	fw.eventSubscribe('show:inputEntry', showKeypad);

	drawBackground();
	drawButtons();

	if (visible)
		that.fadeIn(undefined, 1, null, true);	// Don't queue. We might receive a show() immediately followed by a hide()

	//=======================================================
	//=======================================================
	function drawButtons()
	{
		buttons = that.add('kineticInput', {
			id: 'keypadInput',
			depth: fw.FORE-4,
			hidden: true
		},{
			top: that.id + ' top ' + style.padding,
			left: that.id + ' left ' + style.padding
		})
	}

	//=======================================================
	// This has to wait until after we know the
	// height and width of the buttons;
	//=======================================================
	function drawBackground()
	{
		background = that.add('image', {
			image: style.background,
			depth: fw.FORE-5,
			hidden: true,
		}, fw.dockTo(that));
	}

	//=======================================================
	//
	//=======================================================
	function lostFocus()
	{
//		intervalID = setTimeout(hideKeypad, style.fadeDelay);
	}

	//=======================================================
	//=======================================================
	function hideKeypad()
	{
		if (visible)
		{
			visible = false;
			that.fadeOut(style.fadeRate, 0, null, true);	// Don't queue. We might receive a show() immediately followed by a hide()
		}
	}

	//=======================================================
	//=======================================================
	function showKeypad()
	{
		if (!visible)
		{
			visible = true;
			that.fadeIn(undefined, 1, null, true);	// Don't queue. We might receive a show() immediately followed by a hide()
		}
	}

	//=======================================================
	//=======================================================
	function instantClear()
	{
		visible = false;
		that.hide();
	}

	//=======================================================
	// DG: This is an attempt to hide the keypad when focusing
	// on a non-eq input. It's great in theory, but fails under
	// some circumstances.
	// When there is a top-level eq and a free input step, pressing
	// check will fade out the keypad, fade it back on due to allowInput,
	// then fade it back out when the free input is auto-focused.
	// Short of disabling queuing, this will be difficult to stop.
	// A debounce feature could work too.
	//=======================================================
	function newInput(data)
	{
		/*
		if (data.owner.isEqInput)
			showKeypad();
		else
			hideKeypad();
		*/
	}

//==========================================================================
// Input Device API
//==========================================================================

	//=======================================================
	//=======================================================
	this.enable = function()
	{
		enabled = true;
	}

	//=======================================================
	//=======================================================
	this.disable = function()
	{
		enabled = false;
	}

//==========================================================================
// Widget API
//==========================================================================

	//=======================================================
	//=======================================================
	this.width = function()
	{
		return background.width();
	}

	//=======================================================
	//=======================================================
	this.height = function()
	{
		return background.height();
	}

	//=======================================================
	//=======================================================
	this.terminateSelf = function()
	{
		clearInterval(intervalID);

//		fw.eventUnsubscribe('focus:input', newInput);
		fw.eventUnsubscribe('hide:inputEntry', hideKeypad);
		fw.eventUnsubscribe('show:inputEntry', showKeypad);
	}
}
