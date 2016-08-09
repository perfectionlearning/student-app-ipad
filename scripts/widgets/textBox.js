//=============================================================================
// Pop up text box
//
//  id
//	title
//  text
//
// xStart, yStart, wStart, hStart: Pre-scale position and size of box
//
// Style: (textBox)
//=============================================================================
framework.widget.textBox = function()
{
	var that = this;
	var style = app.style.textBox;

	var depth = that.depth || 0;
	var maxWidth = 500;
	var maxHeight = 400;

	var title, text, box;
	var isClosed = false;

	// Start by drawing the title and text, so we can figure out what our final size will be
	drawTitle();
	drawText();
	setSizes();

	//=======================================================
	// Draw the text, fade it in
	//=======================================================
	function drawTitle()
	{
		title = that.add('text', {
			text: that.title,
			font: style.titleFont,
			color: style.titleColor,
			depth: depth + 1,		// The box will be at "depth" so be sure to go on top of it
			hidden: true
		});

		if (title.width() > maxWidth)
			title.width(maxWidth);
	}

	//=======================================================
	//
	//=======================================================
	function chooseSize()
	{
		if (that.text.length < 40)
			var w = 200;		// Arbitrary small width (move to style!)
		else if (that.text.length < 300)
			w = 300;
		else
			w = maxWidth;

		// Try to prevent the title from wrapping
		if (title.width() > w)
			w = title.width();

		if (w > maxWidth)
			w = maxWidth;

		return w;
	}

	//=======================================================
	// Draw the text, using an appopriate width
	//=======================================================
	function drawText()
	{
		// Choose a width based on the character count
		var w = chooseSize();

		// Draw the text
		text = that.add('text', {
			w: w,
			text: that.text,
			font: that.font || style.font,
			color: style.color,
			align: style.align,
			depth: depth + 1,		// The box will be at "depth" so be sure to go on top of it
			hidden: true
		});
	}

	//=======================================================
	//
	//=======================================================
	function setSizes()
	{
		that.w = text.width() + style.padding * 2;
		that.h = title.height() + style.titleGap + text.height() + style.padding * 2;

		if (that.h > maxHeight)
		{
			var th1 = text.height();		// Old height

			// Adjust by the amount we're shrinking the whole widget
			// Borders really mess with calculations
			text.height(th1 - (that.h - maxHeight) + style.borderWidth*2);
			that.h = maxHeight;
		}
	}

	//=======================================================
	// Create the background rectangle
	//=======================================================
	function drawModal()
	{
		var sSize = fw.stageSize();
		var bg = that.add('rect', {
			x: 0,
			y: 0,
			w: sSize[0],
			h: sSize[1],
			color: 'black',
			depth: depth
		});

		bg.hide().fadeIn(style.scaleRate, 0.66);

		bg.applyAction('click', {
			click: close
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawBox()
	{
		box = that.add('explodingBox', {
			x1: that.xStart,
			y1: that.yStart,
			w1: that.wStart,
			h1: that.hStart,

			color: style.boxColor,
			rate: style.scaleRate,
			borderWidth: style.borderWidth,
			borderColor: style.borderColor,
			fadeRate: style.boxFadeRate,
			depth: depth,

			callback: {
				ready: boxReady
			}

		}, fw.dockTo(that));
			/*
			top: that.id + ' top -' + style.borderWidth,
			bottom: that.id + ' bottom -' + style.borderWidth,
			left: that.id + ' left -' + style.borderWidth,
			right: that.id + ' right -' + style.borderWidth
		});
			*/
	}

	//=======================================================
	//
	//=======================================================
	function drawX()
	{
		that.add('button', {
			id: 'exitButton',
			image: 'VideoExit',
			alpha: 0.7,
			depth: depth + 1,
			click: close
		},{
			wid: box,
			at: 'top right',
			my: 'center',
			ofs: '3 3'
		});
	}

	//=======================================================
	//
	//=======================================================
	function showText()
	{
		// Move the title and text to the correct position
		fw.dock(title, {
			wid: that,
			my: 'top center',
			at: 'top center',
			ofs: style.borderWidth + ' ' + style.padding		// Borders throw things off
		});

		fw.dock(text, {
			top: title.id + ' bottom ' + style.titleGap,
			centerx: that.id + ' center ' + style.borderWidth	// Borders throw things off
		});

		// Fade in the title and text
		title.fadeIn(style.textFadeRate);
		text.fadeIn(style.textFadeRate);
	}

	//=======================================================
	//
	//=======================================================
	function boxReady()
	{
		if (isClosed)
			return;

		showText();
		drawX();
	}

	//=======================================================
	//
	//=======================================================
	function close()
	{
		isClosed = true;
		that.terminate();
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		drawModal();
		drawBox();
	}
}
