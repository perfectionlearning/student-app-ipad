//======================================================
// Arguments:
//	id
//	x
//	y
//	points: Current points
//	possible: Possible points
//
// Style: (progressMeter)
//	asset: Asset of meter
//	numberAsset: Asset of number sprites
//	numY: Y position of the numbers, relative to the "possible score" element
//	numGap: Pixels between numbers
//======================================================
framework.widget.progressMeter = function()
{
	var that = this;
	var style = app.style.progressMeter;

	// Draw the image
	that.add('image', {
		x: that.x,
		y: that.y,
		image: style.asset
	});

	var digitsPoints = fw.tools.countDigits(that.points);
	var digitsPossible = fw.tools.countDigits(that.possible);

	var digitWidth = fw.assetWidth(style.numberAsset) + style.numGap;
	var offsetX = (fw.assetWidth(style.asset) - (digitsPoints + digitsPossible + 1) * digitWidth) / 2;

	// Draw the first number
	drawNum(that.x + offsetX, that.y + style.numY, that.points, digitsPoints);

	// Draw the '/' image:
	offsetX += digitsPoints * digitWidth;
	that.add('image', {
		x: that.x + offsetX,
		y: that.y + style.numY,
		image: style.numberAsset,
		frame: 'Slash'
	});

	// Draw the first number:
	offsetX += digitWidth;
	drawNum(that.x + offsetX, that.y + style.numY, that.possible, digitsPossible);

	// We should have an update function, but it might not be necessary

	//======================================================
	// Draw a number using a sprite-based font
	//======================================================
	function drawNum(x, y, num, digits)
	{
		var wid = fw.assetWidth(style.numberAsset) + style.numGap;
		x += wid * (digits-1);

		for (var i = 0; i < digits; i++)
		{
			that.add('image', {
				x: x,
				y: y,
				image: style.numberAsset, // image for numbers
				frame: num % 10         // index into the slot of the image
			});

			num = Math.floor(num / 10);
			x -= wid;
		}
	}

	//=======================================================
	//=======================================================
	this.width = function()
	{
		return fw.imageData(style.asset)[0];
	}

	//=======================================================
	//=======================================================
	this.height = function()
	{
		return fw.imageData(style.asset)[1];
	}
};
