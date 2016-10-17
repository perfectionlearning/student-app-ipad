//=============================================================================
// Creates a box that scales and translates between two states
//
// @FIXME/dg: This needs a major overhaul!  It requires coordinates and sizes.
//            It should instead size itself based on the content size.
//
// Arguments:
//	id
//	x, y, w, h: Mandatory!
//
//	box: box arguments
//
//	topMargin:
//	title: Text
//	titleFont
//	titleColor
//
//	textFont:
//	textColor:
//	textAlign:
//	textMargin: Space between the title and the text
//	leftMargin:
//	text:
//
//	iconAsset:
//	iconList: [{frame: , callback:}]
//	iconMargin: Space between the text and the icons
//	iconGap: Space between icons
//
//	fadeInRate
//	fadeOutRate
//
//=============================================================================
framework.widget.iconPopup = function()
{
	var that = this;
	var isClosing = false;

	var bg, box, title, text;	// Widget references

	that.box.callback = {
		ready: boxReady,
	};

	var depth = fw.TOP - 5;		// A little hackery. Pulldowns were only partially covering this.

	//=======================================================
	// The box is done expanding
	//=======================================================
	function boxReady()
	{
		if (isClosing)	// Prevent the text and icons from appearing if it hasn't already
			return;

		drawText();
		drawIcons();
	}

	//=======================================================
	//
	//=======================================================
	function drawText()
	{
		var y = that.y + that.topMargin;

		// Draw the title
		title = that.add('text', {
			id: that.id + 'title',
			text: that.title,
			align: 'center',
			font: that.titleFont,
			color: that.titleColor,
			depth: depth
		},{
			top: that.id + ' top ' + that.topMargin,
			left: that.id + ' left',
			right: that.id + ' right'
		});
		title.hide().fadeIn(that.fadeInRate, 1);

		// Draw the main text
		var lMarg = that.leftMargin || 0;
		text = that.add('text', {
			id: that.id + 'text',
			text: that.text,
			align: that.textAlign,
			font: that.textFont,
			color: that.textColor,
			depth: depth
		},{
			top: title.id + ' bottom ' + (that.textMargin || 0),
			left: that.id + ' left ' + lMarg,
			right: that.id + ' right -' + lMarg
		});
		text.hide().fadeIn(that.fadeInRate, 1);
	}

	//=======================================================
	//=======================================================
	function drawIcons()
	{
		// If there are no icons, this widget can act as a simple popup box
		if (!defined(that.iconAsset))
			return;

		// This no longer supports more than one icon!
		var i = 0;
		var icon = that.add('button', {
			id: that.id + 'puIcon' + i,
			image: that.iconAsset,
			frame: that.iconList[i].frame,
			cursor: 'pointer',
			depth: depth,
			click: that.iconList[i].callback
		});

		// This is terrible. Location should be externally controllable and a lot smarter than this.
		// Use an icon bar widget?
		if (that.iconPos === 'center')
		{
			fw.dock(icon, {
//				top: text.id + ' bottom ' + that.iconMargin,
				bottom: that.id + ' bottom -' + that.iconMargin,
				centerx: that.id + ' center'
			});
		}
		else
		{
			fw.dock(icon, {
//				top: text.id + ' bottom ' + that.iconMargin,
				bottom: that.id + ' bottom -' + that.iconMargin,
				right: that.id + ' right -' + 10	// Move to style!
			});
		}

		icon.hide().fadeIn(that.fadeInRate, 1);
	}

	//=======================================================
	//=======================================================
	this.close = function()
	{
		// Prevent reentrance
		if (!isClosing)
		{
			isClosing = true;

			box.close();
			bg && bg.fadeOut(that.fadeOutRate, 0);	// Should probably fade at a different rate since it's not fully opaque

			if (defined(title))
			{
				title.fadeOut(that.fadeOutRate, 0);
				text.fadeOut(that.fadeOutRate, 0);
			}

			// Fade the icons
			// @FIXME/dg: Don't use that.cmd!  Keep an array of icon widget references
			for (var i = 0; i < that.iconList.length; i++)
				that.cmd(that.id + 'puIcon' + i, 'fadeOut', that.fadeOutRate, 0, doneClosing);
		}
	}

	//=======================================================
	// This restores the context by using "that"
	//=======================================================
	function doneClosing()
	{
		that.terminate();
	}

	//=======================================================
	//=======================================================
	this.terminateSelf = function()
	{
		isClosing = true;		// Prevent boxReady from creating text since we're closing
	}

	//=======================================================
	//=======================================================
	this.setTitle = function(text)
	{
		that.title = text;		// Replace, in case the title hasn't been drawn yet

		if (defined(title))
			title.setText(text);
	}

	//=======================================================
	//=======================================================
	this.setText = function(content)
	{
		that.text = content;		// Replace, in case the title hasn't been drawn yet

		if (defined(text))
			text.setText(content);
	}

	//=======================================================
	// Due to docking timing, we don't want to do our main
	// draw until
	//=======================================================
	this.docked = function()
	{
		// Copy layout data from the parent to the box
		$.extend(that.box, {
			x: that.x,
			y: that.y,
			w: that.w,
			h: that.h,
			isSlave: true,
			depth: depth
		});

		// Create the background rectangle
		if (!that.noBG)
		{
			var sSize = fw.stageSize();
			bg = that.add('rect', {
				x: 0,
				y: 0,
				w: sSize[0],
				h: sSize[1],
				color: 'black',
				depth: depth-1	// This will allegedly break the exploding box widget
			});
			bg.hide().fadeIn(that.fadeInRate, 0.66);
		}

		// Create the box
		box = this.add('explodingBox', that.box);
		box.docked();
	}

};
