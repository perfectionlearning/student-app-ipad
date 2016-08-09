//=============================================================================
// Stars widget
//
//  id
//  x
//  y
//	max: max number of stars
//	best: best star count achieved
//  cur: current number of stars
//  hidden: optional
//
// Style: (stars)
//	asset: star asset
//	gap: space between stars
//=============================================================================
framework.widget.stars = function()
{
	var that = this;
	var style = app.style.stars;

	var wids = [];

	drawStars();
	setFrames();

	//=======================================================
	//
	//=======================================================
	function drawOneStar(frame, x)
	{
	}

	//=======================================================
	// Draw the stars
	//=======================================================
	function drawStars()
	{
		var x = 0;		// Use any small x.  If it's large, overflow:hidden will break the width check
		var w = fw.assetWidth(style.asset);

		for (var i = 0; i < that.max; i++)
		{
			wids.push(that.add('image', {
				x: x,
				y: that.y,
				image: style.asset,
				hidden: that.hidden
			}));

			x += w + style.gap;
		}
	}

	//=======================================================
	//
	//=======================================================
	function setFrames()
	{
		for (var i = 0; i < that.cur; i++)
			wids[i].frame('On');

		for (var i = that.cur; i < that.best; i++)
			wids[i].frame('Lost');

		for (var i = that.best; i < that.max; i++)
			wids[i].frame('Off');
	}

	//=======================================================
	// Change the number of stars displayed
	//=======================================================
	this.setCur = function(cur)
	{
		if (cur < 0)
			cur = 0;
		if (cur > that.max)
			cur = that.max;

		if (cur > that.best)
			that.best = cur;

		setFrames();
	}

	//=======================================================
	//
	//=======================================================
	this.width = function()
	{
		return (fw.imageData(style.asset)[0] + style.gap) * that.max - style.gap;
	}

	//=======================================================
	//
	//=======================================================
	this.height = function()
	{
		return fw.imageData(style.asset)[1];
	}
};