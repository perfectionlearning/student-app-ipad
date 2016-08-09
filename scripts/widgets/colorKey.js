//=============================================================================
// Creates a color key, most frequently associated with a grid
//
// The key is able to do real right-alignment, meaning it determines its
// post-rendered width and adjusts its x coordinate appropriately.
//
//  id
//  x
//  y
//	colors: The data: Object containing arrays of color/text entries
//
// Style: (colorKey)
//  font
//	textColor
//	boxWidth: width of color box
//	boxHeight: height of color box
//	margin: space between the color box and the text
//	gap: space between text and the next color box
//  align: If 'right', will right-align from the supplied x coordinate
//=============================================================================
framework.widget.colorKey = function()
{
	var that = this;
	var style = app.style.colorKey;

	createKey();

	//=======================================================
	// Create the key
	//=======================================================
	function createKey()
	{
		var x = 0;		// Use any small x.  If it's large, overflow:hidden will break the width check

		$.each(that.colors, function(key, val) {
			that.add('rect', {
				x: x,
				y: that.y,
				w: style.boxWidth,
				h: style.boxHeight,
				color: val[0],
				hidden: true
			});

			x += style.boxWidth + style.margin;

			that.add('text', {
				id: 'key' + key,
				x: x,
				y: that.y,
				font: style.font,
				color: style.textColor,
				text: val[1],
				hidden: true
			});

			var wid = fw.getWidth('key' + key);
			x += wid + style.gap;
		});

		that.w = x - style.gap;
		that.h = style.boxHeight;

		that.show();
	}

};