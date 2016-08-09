//=============================================================================
// Creates a box that scales and translates between two states
//
// Arguments:
//  id
//
//  x: This is the FINAL state of the box
//  y: This is the FINAL state of the box
//	w: FINAL width of the box
//	h: FINAL height of the box
//
//	x1: Initial x coord of the box
//	y1: Initial y coord of the box
//	w1
//	h1
//
//  depth
//
//	color: Box color
//	rate: Time, in milliseconds, of the transformation
//	borderWidth
//	borderColor
//  fadeRate: Time, in milliseconds, for the box to fade when closing
//	isSlave: Define if this is a child widget (avoids self-termination)
//  callback: Object container handlers for various events {ready:, closed: }
//=============================================================================
framework.widget.explodingBox = function()
{
	var that = this;
	var didReady = false;
	var didClosed = false;

	var boxWid;

	//=======================================================
	// Expansion is complete
	//=======================================================
	function expandDone()
	{
		// With jQuery animation, we can get multiple events.  We want the last one, but can't detect that.
		// Use the first instead.
		if (!didReady)
		{
			didReady = true;

			// @FIXME/dg: Ugly hack, pending rewrite. We're still using x,y coordinates rather than
			// docking for this widget (and parents). On redock, the position is reset to the original
			// coordinates rather than the post-transform coordinates. Update the coordinates now
			// as a temporary measure.
			boxWid.x = that.x;
			boxWid.y = that.y;

			that.callback && that.callback.ready && that.callback.ready();
		}
	}

	//=======================================================
	// Called when the box is fully closed
	//=======================================================
	function closed()
	{
		if (!didClosed)
		{
			didClosed = true;
			that.callback && that.callback.closed && that.callback.closed();

			if (!defined(that.isSlave))
				that.terminate();
		}
	}

	//=======================================================
	// Close the box
	//=======================================================
	this.close = function()
	{
		// Fade box
		boxWid.fadeOut(that.fadeRate, 0, closed);
	}

	//=======================================================
	// Allow docking to set the target size
	//=======================================================
	this.docked = function()
	{
		boxWid = this.add('rect',
		{
			id: that.id + 'box',
			x: that.x1,
			y: that.y1,
			w: that.w1,
			h: that.h1,
			color: that.color,
			depth: that.depth,
			borderWidth: that.borderWidth,
			borderColor: that.borderColor
		});

		boxWid.transform(
		{
			left: that.x,
			top: that.y,
			width: that.w,
			height: that.h,

			rate: that.rate,
			done: expandDone
		});
	}
};
