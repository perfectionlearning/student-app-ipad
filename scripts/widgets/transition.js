//======================================================
// Transitions between two widgets, doing a cross fade
// and other effects
//
// Arguments:
//	id
//  from: Widget to transition from
//  to: Widget to transition to
//  done: Callback called on completion
//  fadeInRate: Rate to fade in 'to' widget
//  fadeOutRate: Rate to fade out 'from' widget.  Also used for the transition effect.
//  deleteFrom: Set to true to terminate the 'from' widget on completion
//======================================================
framework.widget.transition = function()
{
	var that = this;

	var outline;
	var terminated = false;

	startTrans();

	//=======================================================
	// Start the transition effect
	//=======================================================
	function startTrans()
	{
		that.from.stopFade().fadeOut(that.fadeOutRate);	// This works better, but breaks transitions such as scrolling
		that.to.fadeIn(that.fadeInRate);

		// Create a rectangle
		outline = that.add('rect', {
			x: that.from.x,
			y: that.from.y,
			w: that.from.width(),
			h: that.from.height(),
			borderStyle: 'dashed',
			borderWidth: 1,
			depth: fw.TOP
		});

		outline.transform({
			rate: that.fadeOutRate,
			left: that.to.x,
			top: that.to.y,
			width: that.to.width(),
			height: that.to.height(),
			done: function() {
				if (!terminated)	// If we've already terminated, don't call shutDown!
					shutDown();
			}
		});
	}

	//=======================================================
	//=======================================================
	function shutDown()
	{
		outline.terminate();

		if (that.deleteFrom)
			that.from.terminate();
		else
			that.from.hide();	// If we're not terminating it, hide it so it can't be interacted with

		that.terminate();		// Delete self
		that.done && that.done();	// Call callback routine
	}

	//=======================================================
	// If there's a fadeout request during transition, stop everything
	//=======================================================
	that.fadeOutSelf = function()
	{
		shutDown();
	}

	//=======================================================
	// Request for termination
	//=======================================================
	this.terminateSelf = function()
	{
		terminated = true;
	}
}