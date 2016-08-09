//=============================================================================
// Displays a solution
//
//  id
//  x:
//  y: This is the bottom of the solution box.  Grow upwards as needed
//	w:
//	text: The solution: an array of text
//
// Style: (solution)
//  font
//	color
//	bgColor
//	borderColor
//	borderWidth
//	hMargin: Space between the border and the text
//	vMargin: Space between the border and the text
//	gap: Space between solution lines
//=============================================================================
framework.widget.solution = function()
{
	var that = this;
	var style = app.style.solution;

	var lines = [];		// Solution text widgets
	var box;			// Background widget

	drawSolution();

	//=======================================================
	// Draw the question
	//=======================================================
	function drawSolution()
	{
		var y = that.y + style.vMargin;
		var ht = 0;
		var txt, skip;

		for (var i = 0; i < that.text.length; i++)
		{
			txt = that.add('text', {
				x: that.x + style.hMargin,
				y: y,
				w: that.w - (style.hMargin*2),
				text: that.text[i],
				color: style.color,
				font: style.font,
				depth: fw.FORE
			});

			skip = txt.height() + style.gap;
			ht += skip;
			y += skip;

			lines.push(txt);
		}
		ht -= style.gap;

		box = that.add('rect', {
			x: that.x,
			y: that.y,
			w: that.w,
			h: ht + (style.vMargin*2),
			color: style.bgColor,
			borderColor: style.borderColor,
			borderWidth: style.borderWidth,
			depth: fw.FORE-1
		});
	}

	//=======================================================
	// Move the solution to the correct location
	//=======================================================
	function placeSolution()
	{
		that.animTo(that.xDest, that.y, 1000);
	}

	//=======================================================
	// Return the height of the solution
	//=======================================================
	this.height = function()
	{
		return box.height();
	}

	//=======================================================
	// Return the width of the solution
	//=======================================================
	this.width = function()
	{
		return this.w;
	}

	//=======================================================
	//=======================================================
	this.setPosSelf = function(x, y)
	{
		box.setPos(that.x, that.y);
	}

	//=======================================================
	// Return the width of the solution
	//=======================================================
	this.docked = function()
	{
		placeSolution();
	}
};
