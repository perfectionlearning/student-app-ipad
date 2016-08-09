//======================================================
// Some text with an icon next to it
//
// Arguments:
//	id
//	w: Used to extrapolate the text width.  If omitted, the text will not be constrained.
//  asset
//	frame
//	text
//	font
//	color
//	barColor
//	click
//  depth
//	iconGap: Space between the icon and the text
//
// Style: (menuLine)
//======================================================
framework.widget.menuLine = function()
{
	var that = this;
//	var style = app.style.menuLine;

	var icon, text, bar;
	var iconWidth = fw.assetWidth(that.asset);
	var depth = that.depth || 0;

	drawIcon();
	drawText();
//	drawBar();

	//=======================================================
	//
	//=======================================================
	function drawIcon()
	{
		icon = that.add('image', {
			image: that.asset,
			frame: that.frame || 0,
			cursor: 'pointer',
			depth: depth
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawText()
	{
		if (that.w)
			var textWidth = that.w - icon.width() - that.iconGap;

		text = that.add('text', {
			text: that.text,
			color: that.color,
			font: that.font,
			cursor: 'pointer',
			w: textWidth,
			depth: depth
		},{
			left: icon.id + ' right ' + that.iconGap,
			centery: icon.id + ' center'
		});

		if (!that.w)
			that.w = icon.width() + that.iconGap + text.width();

		that.h = Math.max(text.height(), icon.height());
	}

	//=======================================================
	//
	//=======================================================
	function drawBar(hMargin, vMargin, w)
	{
		var iconHt = icon.height();
		var textHt = text.height();
		var tallest = (iconHt > textHt) ? icon.id : text.id;

		bar = that.add('rect', {
			color: that.barColor,
			w: w,
			cursor: 'pointer',
			alpha: 0,
			depth: depth - 1
		}, {
			left: icon.id + ' left -' + hMargin,
			top: tallest + ' top -' + vMargin,
			bottom: tallest + ' bottom ' + vMargin
		});
	}

	//=======================================================
	//=======================================================
	that.addBar = function(hMargin, vMargin, w)
	{
		drawBar(hMargin, vMargin, w);
		attachEvents();
	}

	//=======================================================
	//
	//=======================================================
	function attachEvents()
	{
		that.applyAction('hover', {
			inAction: doHover,
			outAction: doBlur,
			outDelay: 1
		});

		that.applyAction('click', {
			click: that.click
		});
	}

	//=======================================================
	//=======================================================
	function doHover()
	{
		bar.setAlpha(1);
	}

	//=======================================================
	//=======================================================
	function doBlur()
	{
		bar.setAlpha(0);
	}
}
