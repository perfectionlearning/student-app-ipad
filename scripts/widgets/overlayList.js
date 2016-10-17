//======================================================
// Arguments:
//   list
//======================================================
framework.widget.overlayList = function()
{
	var that = this;
	var style = app.style.overlayList;

	drawList();

	//=======================================================
	//
	//=======================================================
	function drawList()
	{
		$.each(that.list, function(idx, val) {
			drawText(val);
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawText(entry)
	{
		// Skip entries with missing coordinates. Otherwise the app may crash.
		if (!defined(entry.x) || !defined(entry.y))
			return;

		// text, x, y, font, color, size (strings, ends in 'pt')
		var txt = that.add('text', {
			text: entry.text,
			font: style.font,
			color: entry.color,
			overflow: 'visible',	// This covers up a Firefox bug
			cursor: that.cursor,
			depth: that.depth + 10,
			hidden: that.hidden
		}, {
			top: that.id + ' top ' + (entry.y + style.borderWidth),
			left: that.id + ' left ' + (entry.x + style.borderWidth),
		});

		txt.fontSize(entry.size);
	}
};
