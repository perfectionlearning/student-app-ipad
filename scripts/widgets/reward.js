//=============================================================================
// Creates a simple reward animation
//
//  id
//  x
//  y
//	asset: Asset to display
//	frame: Frame to display
//
// Style: (reward)
//	preFadeTime: Time before fading begins
//	fadeTime: Time before the asset fades away
//=============================================================================
framework.widget.reward = function()
{
	var that = this;
	var style = app.style.reward;

	var exists = true;		// Set to false on termination, so the fadeout callback won't try to
							// terminate the widget if it has already been done

	// Create the image
	var img = this.add('image', {
		x: that.x,
		y: that.y,
		image: that.asset,
		frame: that.frame,
		depth: fw.FORE
	});

	fw.audPlay('SFXCorrect');
	fw.setCountdown("reward", style.preFadeTime, fadeOut);

	//=======================================================
	// Fade it out, and delete this entire widget when it's done
	//=======================================================
	function fadeOut()
	{
		img.fadeOut(style.fadeTime, 0, function() {	// rate, fadeTo, action
			if (exists)
				that.terminate()
		});
	}

	//=======================================================
	// Notify self if the widget has been terminated
	//=======================================================
	this.terminateSelf = function()
	{
		exists = false;
	}
}
