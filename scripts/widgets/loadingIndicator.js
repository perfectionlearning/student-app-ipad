//=============================================================================
// Displays a message over a blackened screen
//
// Arguments:
//	id
//	x, y, w, h
//
//	text: Text
//	font
//	color
//  padding: Space between box and text
//=============================================================================
framework.widget.loading = function()
{
	var that = this;

	var box, text, anim;	// Widget references

	var minTime = that.minTime || 0;
	var canClose = true;

	// Draw the message text
	drawText();

	// Add an optional animation
	if (that.anim)
		drawImage();

	// Draw a box under the message
	drawBox();

	// Move the text and animation into the box, so that when this widget is docked, all
	// will be repositioned in one step
	text.move(box);
	if (that.anim)
		anim.move(box);

	//=======================================================
	//
	//=======================================================
	function drawImage()
	{
		// Draw the title
		anim = that.add('image', {
			image: that.anim,
			depth: fw.TOP
		},{
			wid: text,
			my: 'right center',
			at: 'left center',
			ofs: '-' + that.animMargin + ' 0'
		});

		anim.playAnim(that.animRate, null, true);
	}

	//=======================================================
	//
	//=======================================================
	function drawText()
	{
		// Draw the title
		text = that.add('text', {
			text: that.text,
			font: that.font,
			color: that.color,
			depth: fw.TOP
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawBox()
	{
		var left = that.anim ? anim.id : text.id;

		// Copy layout data from the parent to the box
		box = that.add('rect', {
			color: that.bgColor,
			borderWidth: that.borderWidth,
			borderColor: that.borderColor,
			depth: fw.TOP-1
		},{
			top: text.id + ' top -' + that.boxVPad,
			bottom: text.id + ' bottom ' + that.boxVPad,
			left: left + ' left -' + that.boxHPad,
			right: text.id + ' right ' + that.boxHPad
		});

		that.w = box.width();
		that.h = box.height();
	}

	//=======================================================
	//
	//=======================================================
	function drawDimRect()
	{
		// Create the background rectangle
		that.add('rect', {
			color: 'black',
			alpha: 0.66,
			depth: fw.TOP-2	// This will allegedly break the exploding box widget
		},{
			top: 'stage top',
			bottom: 'stage bottom',
			left: 'stage left',
			right: 'stage right'
		});
	}

	//=======================================================
	// The minimum time has expired
	//=======================================================
	function timesUp()
	{
		// If a termination was already requested, honor the request now
		if (canClose)
			that.terminate()
		else
			canClose = true;	// Let the terminate function know it's safe to close immediately
	}

	//=======================================================
	//=======================================================
	this.close = function()
	{
		// If it's safe to close, go ahead and do so
		if (!that.minTime || canClose)
			that.terminate();
		else
			canClose = true;	// Flag as safe to close when the minimum time expires
	}

	//=======================================================
	//=======================================================
	that.docked = function()
	{
		// Do this after docking so it doesn't get shifted
//		drawDimRect();

		fw.dock(box, {
			wid: that,
			my: 'center',
			at: 'center'
		});

		if (that.minTime)
		{
			canClose = false;
			setTimeout(timesUp, that.minTime);
		}
	}

};
