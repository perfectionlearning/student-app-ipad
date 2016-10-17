//======================================================
// Displays Status Line Text
// This should probably take an array of functions that act as text widget factories, or
// something else similarly more generic and reusable.
// The factories have temporarily been placed inside this widget, which is a bit silly.
// If we're going to the trouble to use factories at all, they should be placed externally.
//
// Arguments:
//	id
//	x, y, w
//
// Style: (statusLine)
//  gap
//	font: Font used for the entire status line.  I don't think we'll need to change them independently.
//	crColor
//	crString: Copyright string
//	verColor
//======================================================
framework.widget.statusLine = function()
{
	var that = this;
	var style = app.style.statusLine;

	var strings = [], widList = [];

	// Draw the text
	strings.push(makeVersion());
	strings.push(makeSeparator());
	strings.push(makeCopyright());

	//drawStrings(strings);

	//=======================================================
	//
	//=======================================================
	function makeSeparator()
	{
		return {
			text: style.separator,
			color: style.sepColor
		}
	}

	//=======================================================
	// Text Factory: Construct Copyright
	//=======================================================
	function makeCopyright()
	{
		return {
			text: style.crString,
			color: style.crColor
		}
	}

	//=======================================================
	// Text Factory: Construct Version object
	//=======================================================
	function makeVersion()
	{
		return {
			text: app.getVersionString(),
			color: style.verColor
		}
	}

    //=======================================================
    //=======================================================
	function drawStrings(strings)
	{
		var x = 0;
		var wid;
		that.h = 0;

		$.each(strings, function(idx, val) {
			wid = that.add('text', {
				x: x,			// This is just for relative spacing between strings
				text: val.text,
				font: style.font,
				color: val.color,
				depth: that.depth
			});

			widList.push(wid);

			x += wid.width() + style.gap;
			var h = wid.height();
			that.h = Math.max(that.h, h);	// Use the tallest text widget as the whole widget's height
		});

		that.w = x - style.gap;
	}

};
