//======================================================
// Toggles between two widgets.  Only one will be visible at a time,
// with the other "minimized" to a button.
// Activating the button will minimize the current widget,
// restore the minimized widget, remove the current button,
// and create a new button.
//
// Widget 1 is assumed to be visible.  Widget 2 should exist but be hidden.
//
// @FIXME/dg: Arguments contain a bunch of arrays.  That's silly!  Group widget data together, instead of splitting it up!
//
// Arguments:
//	id
//
//  item1: {path: widget path, asset: button asset, frame: button frame, x: button x, y: button y}
//  item2: {path: widget path, asset: button asset, frame: button frame, x: button x, y: button y}
//  startAction: 'button' | 'minimize' -- Start with a button, or start with a minimize action
//  rate: Minimize/maximize/fade rate
//	fadeInRate: Fade in rate for maximizing.  Separated from rate because it looks better.
//	preToggle: Function to call before any toggle
//	postToggle: Function to call after any toggle is completed
//
// Style: ()
//======================================================
framework.widget.widgetToggler = function()
{
	var that = this;

	// Set defaults for options
	this.fadeInRate = this.fadeInRate || 1500;
	this.rate = this.rate || 750;
	this.startAction = this.startAction || 'minimize';

	var curState = 0;		// Which widget is currently active?

	var widgets = [null, null];
	widgets[0] = fw.getWidget(that.item1.path);
	widgets[1] = fw.getWidget(that.item2.path);

	var buttonSizes = [];
	buttonSizes[0] = fw.imageData(that.item1.asset);
	buttonSizes[1] = fw.imageData(that.item2.asset);

	var buttons = [];
	buttons[0] = createButton(0);
	buttons[1] = createButton(1);

	// Create the button to restore widget 2
	if (that.startAction !== 'button')
	{
		minimize(0);
		maximize(1);
	}

	//=======================================================
	//=======================================================
	function createButton(idx)
	{
		var item = (idx === 0 ? 'item1' : 'item2');

		return that.add('button', {
			x: that[item].x,
			y: that[item].y,
			image: that[item].asset,
			frame: that[item].frame,
			click: toggle,
			hidden: true
		});
	}

	//=======================================================
	//=======================================================
	function toggle()
	{
		minimize(curState);
		maximize(curState^1);
	}

	//=======================================================
	// External interface: Allow the outside world to cause toggles
	//=======================================================
	this.toggle = function()
	{
		toggle();
	}

	//=======================================================
	// Toggle states immediately (usually used before terminating)
	//=======================================================
	this.instantToggle = function()
	{
		instantMinimize(curState);
		instantMaximize(curState^1);
	}

	//=======================================================
	// Minimize action routine
	//=======================================================
	function minimize(idx)
	{
//		buttons[idx].show();		// About to fade in from hidden state -- doesn't appear to be necessary
		buttons[idx^1].disable();

		that.add('transition', {
			from: widgets[idx],
			to: buttons[idx],
			fadeInRate: that.fadeInRate,
			fadeOutRate: that.rate
		});
	}

	//=======================================================
	// Minimize action routine
	//=======================================================
	function instantMinimize(idx)
	{
		// Hide the button
		buttons[idx^1].hide();

		// Hide the widget
		widgets[idx].hide();
	}

	//=======================================================
	//=======================================================
	function maximize(idx)
	{
		curState = idx;		// Update curState immediately, so this.state will return the proper value

		that.preToggle && that.preToggle(curState);

		that.add('transition', {
			from: buttons[idx],
			to: widgets[idx],
			fadeInRate: that.fadeInRate,
			fadeOutRate: that.rate,
			done: function() {
				buttons[idx^1].enable();	// Enable the button (simplifies life if it doesn't work until now)
//				widgets[idx].show();		// Emergency handler.  Occasionally an element wouldn't be visible because the implicit show didn't work.
				that.postToggle && that.postToggle(curState);
			}
		});
	}

	//=======================================================
	//=======================================================
	function instantMaximize(idx)
	{
		// Show the button
		buttons[idx^1].show().setAlpha(1).enable();

		// Show the widget
		widgets[idx].show().setAlpha(1);

		curState = idx;
	}

	//=======================================================
	// Returns the current state
	//=======================================================
	this.state = function()
	{
		return curState;
	}

}
