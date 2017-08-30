//======================================================
//
// @FIXME/dg: Combine this and submissions into a single
// ToggleText widget
//
// @FIXME/dg: This destroys the text widget, recreates it, docks it, and redocks itself
// 			  That is a waste of time!  See submissions.js for a more efficient implementation.
//
// Arguments:
//	id
//	current: Value to display
//  maximum
//  isPercent: true for percent, false for points
//======================================================
framework.widget.score = function()
{
	var that = this;
	var style = app.style.score;
	this.w = 1000;
	this.isFinal = false;
	this.label = this.label || 'Score';
	var color = that.color || style.color;

	var wid;

	// Draw the number if we can right now.  Otherwise, the owner can do it later.
	if (defined(that.current))
		drawNum();

	//=======================================================
	// Construct display text for Percent mode
	//=======================================================
	function percentText()
	{
		var finalText = that.isFinal ? 'Final ' : '';
		var percent = Math.floor(that.current / that.maximum * 100);
		return finalText + that.label + ': ' + percent + '%';
	}

	//=======================================================
	// Construct display text for Points mode
	//=======================================================
	function pointText()
	{
		var finalText = that.isFinal ? 'Final ' : '';
		return finalText + that.label + ': ' +
				Math.round(that.current) +
				' / ' +
				Math.round(that.maximum);
	}

	//======================================================
	// Draw a number using a sprite-based font
	//======================================================
	function drawNum()
	{
		// Remove the old text
		wid && wid.terminate();

		// Ensure valid values
		that.current = that.current || 0;
		that.maximum = that.maximum || 0;

		// Figure out the correct text
		if (that.isPercent)
			var text = percentText();
		else
			text = pointText();

		wid = that.add('text', {
			text: text,
			color: color,
			font: style.font,
			cursor: 'pointer'
		});

		// Set the width of the widget
		that.w = wid.width();
		that.h = wid.height();

		// Dock to the base widget
		fw.dock(wid, {
			wid: that,
			my: 'top right',
			at: 'top right'
		});

		// Assign a toggler
		wid.applyAction('click', {
			click: toggleMode
		});
	}

	//=======================================================
	//
	//=======================================================
	function toggleMode()
	{
		// Toggle mode
		that.isPercent = !that.isPercent;

		// Create new text
		drawNum();

		// Reposition base widget based on our new width
		that.redock();

		// Notify our owner
		that.modeChange && that.modeChange(that.isPercent);
	}

	//=======================================================
	//=======================================================
	this.setScore = function(cur, max)
	{
		that.current = cur || 0;
		that.maximum = max || 0;
		drawNum();

		// Reposition base widget based on our new width
		that.redock();
	}

	//=======================================================
	//=======================================================
	this.finalScore = function()
	{
		that.isFinal = true;
		drawNum();
		that.redock();
	}

	//=======================================================
	//=======================================================
	this.update = function(cur)
	{
		that.current = cur || 0;
		drawNum();

		// Reposition base widget based on our new width
		that.redock();
	}

};
