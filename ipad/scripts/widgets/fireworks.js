//===============================================================================
// Creates a graph display with optional input
//
// Arguments:
//	id
//	x, y, w, h
//  size: 0-100
//
// Style: (fireworks)
//	assetList
//	minDuration
//	extraDuration
//===============================================================================
framework.widget.fireworks = function()
{
	var that = this;
	var style = app.style.fireworks;

	var bg;
	var small, medium, large;	// Count of each remaining
	var deltaTime;				// Average time between fireworks (varies slightly)
	var triggerCount = 0;		// Number triggered

	var brackets = [
		{ max:   5, cnt: 0.2, s: 100, m: 0,  l: 0 },
		{ max:  25, cnt: 0.2, s: 60,  m: 40, l: 0 },
		{ max:  49, cnt: 0.3, s: 30,  m: 70, l: 0 },
		{ max:  74, cnt: 0.5, s: 30,  m: 70, l: 0 },
		{ max:  89, cnt: 0.7,   s: 25,  m: 50, l: 25 },
		{ max: 100, cnt: 1.0, s: 25,  m: 40, l: 35 }
	];

	// Create a blackout layer
	createBackdrop();

	// Determine the density settings
	calcShow();

	// Start the show
	doFirework();

	//=======================================================
	//
	//=======================================================
	function createBackdrop()
	{
		var sSize = fw.stageSize();
		bg = that.add('rect', {
			id: that.id + 'bg',
			x: 0,
			y: 0,
			w: sSize[0],
			h: sSize[1],
			color: 'black',
			alpha: 0.66,
			depth: fw.FORE-1
		});
	}

	//=======================================================
	// Determine the density settings
	//=======================================================
	function calcShow()
	{
		// Choose a bracket
		for (var i = 0; i < brackets.length; i++)
		{
			if (that.size <= brackets[i].max)
				break;
		}

		// Figure out the number of each type
		var brk = brackets[i];
		var total = that.size * brk.cnt;
		small = Math.round(total * brk.s / 100);
		medium = Math.round(total * brk.m / 100);
		large = Math.round(total * brk.l / 100);

		if ((large + medium + small) === 0)
			small = 1;

		// Determine time between fireworks: Desired time / total firework count
		var totalTime = style.minDuration + (total * style.extraDuration);
		deltaTime =  totalTime / total;	// Average delta time
	}

	//=======================================================
	// Choose a size for the next firework
	//=======================================================
	function pickSize()
	{
		var total = small + medium + large;		// Total fireworks remaining
		var rnd = Math.random() * (total-1);

		if (rnd < small)
		{
			small--;
			return 0;
		}
		else if (rnd < (small + medium))
		{
			medium--;
			return 1;
		}
		else
		{
			large--;
			return 2;
		}
	}

	//=======================================================
	//=======================================================
	function animSpark(sprite)
	{
		sprite.playAnim(style.riseFrameRate, function() { animSpark(sprite) });
	}

	//=======================================================
	//
	//=======================================================
	function createSpark()
	{
		// Pick a size
		var size = pickSize();

		// Create sparkle with link to explosion
		var type = ['small', 'medium', 'large'][size];
		var x = fw.tools.random(style.hMargin, that.w - style.hMargin);

		var cnt = style[type].list.length;
		var img = fw.tools.random(0, cnt);
		var destY = fw.tools.random(style.maxBurst, style.minBurst);

		var sprite = that.add('image', {
			x: that.x + x,
			y: that.y + that.h,
			image: style[type].list[img][0],
			depth: fw.TOP
		});

		triggerCount++;
		animSpark(sprite);
		var riseTime = fw.tools.random(style.minRiseTime, style.maxRiseTime);
		sprite.animTo(x, that.y + destY, riseTime, function(){ explode(sprite, type, img) });
	}

	//=======================================================
	// Start a single firework animation
	//=======================================================
	function doFirework()
	{
		createSpark();

		// Determine whether the show is done
		if (small + medium + large === 0)
			return;

		// Calculate time for next firework
		setTimeout(doFirework, deltaTime);
	}

	//=======================================================
	// Boom!
	//=======================================================
	function explode(sprite, size, index)
	{
		var x = sprite.x - style[size].xOffset;
		var y = sprite.y - style[size].yOffset;

		sprite.terminate();

		var boom = that.add('image', {
			x: x,
			y: y,
			image: style[size].list[index][1],
			depth: fw.TOP
		});

		var rate = fw.tools.random(style.boomFrameRate-style.boomRateDelta, style.boomFrameRate+style.boomRateDelta);

		boom.playAnim(rate, function() { boomDone(boom) });
	}

	//=======================================================
	//=======================================================
	function boomDone(sprite)
	{
		sprite.terminate();

		// If all sprites have been terminated, terminate this entire widget
		if ((--triggerCount === 0) && (small === 0) && (medium === 0) && (large === 0))
			that.terminate();
	}
}
