//======================================================
// Creates a fake HTML link, essentially a text button
//
// Arguments:
//	id
//	x, y, w, h
//  text
//  font
//  color
//  hoverColor
//  click
//  refCode: Optional ID for the link, which can be queried later
//======================================================
framework.widget.fakeLink = function()
{
	var that = this;
//	var style = app.style.fakeLink;

	var text;

	// Draw the text now, so a width and height are established for docking
	drawText();
	attachActions();

	//=======================================================
	//
	//=======================================================
	function drawText()
	{
		text = that.add('text', {
			text: that.text,
			font: that.font,
			color: that.color,
			cursor: 'pointer',
			hidden: that.hidden,
			depth: that.depth,
			data: that.data
		},
			fw.dockTo(that)
		);

		that.w = text.width();
		that.h = text.height();
	}

	//=======================================================
	// Apply click and hover behaviors
	//=======================================================
	function attachActions()
	{
		// Attach the hover action
		text.applyAction('hover', {
			inAction: hover,
			outAction: unhover
		});

		// Attach the click action
		text.applyAction('click', {
			click: clickHandler
		});
	}

	//=======================================================
	//
	//=======================================================
	function hover()
	{
		text.color(that.hoverColor);
	}

	//=======================================================
	//
	//=======================================================
	function unhover()
	{
		text.color(that.color);
	}

	//=======================================================
	// Use a custom clickhandler since the click action is on
	// the text widget and not this one.
	//=======================================================
	function clickHandler(wid)
	{
		that.click(wid, that.refCode);	// Include our reference code, if there is one
	}

};
