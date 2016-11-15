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
framework.widget.orientation = function()
{
	var that = this;

	var box, rotate, anim;	// Widget references

	var minTime = that.minTime || 0;
	var canClose = true;

	// Draw the rotation image
	drawImage();

	// Draw a box under the message
	drawBox();

	// Move the text and animation into the box, so that when this widget is docked, all
	// will be repositioned in one step
	rotate.move(box);

	//=======================================================
	//
	//=======================================================
	function drawImage()
	{
		// Draw the image
		rotate = that.add('image', {
			x: 0,
			y: 0,
			image: 'Rotate',
			depth: fw.TOP,
			w: 786,
			h: 1024
		});

	}

	//=======================================================
	//
	//=======================================================
	function drawBox()
	{
		var left = that.anim ? anim.id : rotate.id;

		// Copy layout data from the parent to the box
		box = that.add('rect', {
//			color: that.bgColor,
			borderWidth: that.borderWidth,
			borderColor: that.borderColor,
			depth: fw.TOP-1
		},{
			top: rotate.id + ' top -' + that.boxVPad,
			bottom: rotate.id + ' bottom ' + that.boxVPad,
			left: left + ' left -' + that.boxHPad,
			right: rotate.id + ' right ' + that.boxHPad
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
	//=======================================================
	this.close = function()
	{
		that.terminate();
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
	}

};
