//======================================================
// Arguments:
//	id
//	current: Number of submissions used
//  maximum: Total number of submissions
//======================================================
framework.widget.submissions = function()
{
	var that = this;
	var style = app.style.submissions;

	var wid;

	// Draw the number if we can right now.  Otherwise, the owner can do it later.
	if (defined(that.current))
		drawText();

	//=======================================================
	// Determine what text to display
	//=======================================================
	function getText()
	{
		if (that.showUsed)
			return "Tries used: " + that.current;
		else
			return "Tries left: " + (that.maximum - that.current);
	}

	//======================================================
	// Draw a number using a sprite-based font
	//======================================================
	function drawText()
	{
		// Figure out the correct text
		var text = getText();

		wid = that.add('text', {
			text: text,
			color: style.color,
			font: style.font,
			cursor: 'pointer'
		});

		// Set the width of the widget
		that.w = wid.width();

		// Assign a toggler
		wid.applyAction('click', {
			click: toggleMode
		});
	}

	//=======================================================
	//
	//=======================================================
	function updateText()
	{
		if (!wid)
			return;

		var text = getText();
		wid.setText(text);

		// Set the width of the widget
		that.w = wid.width();

		that.redock();
	}

	//=======================================================
	//
	//=======================================================
	function toggleMode()
	{
		// Toggle mode
		that.showUsed = !that.showUsed;

		// Create new text
		updateText();

		// Notify our owner
//		that.modeChange && that.modeChange(that.showUsed);
	}

	//=======================================================
	//=======================================================
	this.update = function(cur)
	{
		that.current = cur;
		updateText();
	}

	//=======================================================
	//=======================================================
	this.increment = function()
	{
		that.current++;
		updateText();
	}
};
