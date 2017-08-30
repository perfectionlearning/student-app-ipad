//=============================================================================
// Points widget
//
// The key is able to do real right-alignment, meaning it determines its
// post-rendered width and adjusts its x coordinate appropriately.
//
//  id
//  x, y
//	current: number of points
//	maximum: max number of points
//  align: If 'right', will right-align from the supplied x coordinate
//	hidden: Optional
//
// Style: (points)
//	background
//	font
//	margin: Space between left edge of background image and number
//	numWidth: Width of area for number display
//	yAdjust: Pixels to adjust text for proper positioning within background
//=============================================================================
framework.widget.points = function()
{
	var that = this;
	var style = app.style.points;

	var txtWid;

	drawBg();
	drawPoints();

	//=======================================================
	//
	//=======================================================
	function drawBg()
	{
		that.add('image', {
			x: that.x,
			y: that.y,
			image: style.background
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawPoints()
	{
		var text = that.current + '/' + that.maximum;

		txtWid = that.add('text', {
			x: that.x + style.margin,
			y: that.y + style.yAdjust,
			text: text,
			font: style.font,
			hidden: true
		});

		var wid = txtWid.width();
		txtWid.adjustPos((style.numWidth - wid) / 2, 0);

		if (!defined(that.hidden))
			txtWid.show();
	}

	//=======================================================
	// Change the number of points displayed
	//=======================================================
	this.set = function(value)
	{
		that.current = value;
		txtWid.terminate();
		drawPoints();
		txtWid.show();
	}

	//=======================================================
	//=======================================================
	this.width = function()
	{
		return fw.imageData(style.background)[0];
	}

	//=======================================================
	//=======================================================
	this.height = function()
	{
		return fw.imageData(style.background)[1];
	}
};
