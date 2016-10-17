//======================================================
// Generic Answer Input widget
//	Creates an answer input of the correct type, complete with Check and Help buttons
//	The parent view doesn't have to worry about positioning and displaying individual answer items
//	This widget maintains the visibility and interface for all different types
//
// Arguments:
//	id
//	x
//	y: This is the bottom of the animation, not the top!
//
//  count: Number of items to display
//	streak: Starting position within the animation
//
//  bg: Background asset
//  char: Character asset
//  object: Object asset (0: normal init, 1: normal result, 2: final init)
//  action: Action animation asset
//  motion: Motion animation asset
//  end: Ending animation asset
//
// Style: (streak)
//  rate: Frame rate for all animations
//  margin: Space between the left edge and the first object
//  objectSkip: Distance between objects
//======================================================
framework.widget.streakAnim = function()
{
	var that = this;
	var style = app.style.streak;

	// If there's no streak, don't bother
	if (that.count < 2)
		return;

	var ht = fw.assetHeight(that['char']);	// Common asset height

	var charWid = null;
	var objWids = [];
	var anim = null;

	var streak = this.streak || 0;		// Current position
	var state = 'idle';	// idle, action, moving, final

	drawInitial();

	//=======================================================
	// Draw the background image
	//=======================================================
	function drawBG()
	{
		that.add('image', {
			image: that.bg,
			x: that.x,
			y: that.y,
			repeat: 'x',
			w: that.w	// Repeat
		});
	}

	//=======================================================
	// Draw all of the objects
	//=======================================================
	function drawObjects()
	{
		var x = that.x + style.margin;

		// Draw the normal objects
		for (var i = 0; i < (that.count-1); i++)
		{
			objWids.push(that.add('image', {
				image: that.object,
				x: x,
				y: that.y,
				frame: i < streak ? 'Post' : 'Pre',
				depth: 1
			}));

			x += style.objectSkip;
		}

		// Draw the final object -- OR draw the final frame of the final animation
		if (streak != that.count)
		{
			objWids.push(that.add('image', {
				image: that.object,
				x: x,
				y: that.y,
				frame: 'FinalPre',
				depth: 1
			}));
		}
		else
		{
			objWids.push(that.add('image', {
				image: that.end,
				x: x,
				y: that.y,
				frame: fw.frameCount(that.end)-1,
				depth: 1
			}));
		}
	}

	//=======================================================
	// Draw the character, in the correct position
	//=======================================================
	function drawCharacter()
	{
		// Draw the final object
		if (streak != that.count)
		{
			charWid = that.add('image', {
				image: that['char'],
				x: that.x + style.margin + (streak * style.objectSkip),
				y: that.y
			});
		}
	}

	//=======================================================
	// Create the widget in the initial state
	//=======================================================
	function drawInitial()
	{
		drawBG();
		drawObjects();
		drawCharacter();
	}

	//=======================================================
	// Reset objects to their initial state
	//=======================================================
	function resetObjs()
	{
		for (var i = 0; i < (that.count-1); i++)
			objWids[i].show().frame('Pre');

		objWids[i].show().frame('FinalPre');
	}

	//=======================================================
	// An animation is already playing.  Stop it.
	//=======================================================
	function cleanAnim()
	{
		anim.stopAnim();
		anim.terminate();
		anim = null;

		state = 'idle';

		// Restore the character -- actually, it's about to be removed so don't bother
//r		if (charWid === null)
//r			drawCharacter();

		// Restore the object
		objWids[streak-1].show().frame('Post');
	}

	//=======================================================
	// Reset the widget to its initial state
	//=======================================================
	this.reset = function()
	{
		streak = 0;

		// Clear any animations
		if (anim != null)
		{
			anim.stopAnim();
			anim.terminate();
			anim = null;
		}

		// Reset the character
		if (charWid != null)
			charWid.terminate();
		drawCharacter();

		// Reset all objects
		resetObjs();

		state = 'idle';
	}

	//=======================================================
	// Advance to the next state
	//=======================================================
	this.advance = function()
	{
		// Make sure we CAN advance
		if (streak >= that.count)
			return;

		// If we're already in an animation, clean up first
		if (state !== 'idle')
			cleanAnim();

		// Update the streak number now, even though we need the old number.
		// It's important this happens in case an animation is aborted.
		streak++;

		// Remove the character image
		if (charWid !== null)
		{
			charWid.terminate();
			charWid = null;
		}

		// Remove the object image
		objWids[streak-1].hide();

		// If not at the penultimate position, play the action and movement animations
		if (streak < that.count)
			startNormal();
		else		// If at the penultimate position, play the final animation
			startFinal();
	}

	//=======================================================
	// Starts the 'final' animation
	//=======================================================
	function startFinal()
	{
		state = 'final';

		anim = that.add('image', {
			image: that.end,
			x: that.x + style.margin + ((streak-1) * style.objectSkip),
			y: that.y
		});

		anim.playAnim(style.rate);
	}

	//=======================================================
	// Starts the normal 'action' animation
	//=======================================================
	function startNormal()
	{
		state = 'action';

		anim = that.add('image', {
			image: that.action,
			x: that.x + style.margin + ((streak-1) * style.objectSkip),
			y: that.y
		});

		anim.playAnim(style.rate, doMove);
	}

	//=======================================================
	// The 'action' animation is done.  Transition to the 'move' animation.
	//=======================================================
	function doMove()
	{
		// Make sure the animation hasn't been terminated
		if (anim === null)
			return;

		anim.terminate();
		objWids[streak-1].show().frame('Post');

		anim = that.add('image', {
			image: that.motion,
			x: that.x + style.margin + ((streak-1) * style.objectSkip),
			y: that.y
		});

		anim.playAnim(style.rate, finishAnim);
		state = 'moving';
	}

	//=======================================================
	// The 'move' animation is complete.  Clean up.
	//=======================================================
	function finishAnim()
	{
		// Make sure the animation hasn't been terminated
		if (anim === null)
			return;

		anim.terminate();
		anim = null;
		state = 'idle';
		drawCharacter();
	}

	//=======================================================
	//
	//=======================================================
	this.terminateSelf = function()
	{
		// Clear any animations
		if (anim != null)
			anim.stopAnim();
	}

	//=======================================================
	//
	//=======================================================
	this.width = function()
	{
		return that.w;
	}

	//=======================================================
	//
	//=======================================================
	this.height = function()
	{
		return ht;
	}

}
