//=============================================================================
// Creates a box that scales and translates between two states
//
// @FIXME/dg: Modernize this widget! Convert to actions. Use docking instead of x,y.
// Calc. dimensions real-time instead of caching.
//
// Arguments:
//  id
//  x
//  y
//	w
//
//	lineHeight: height of each line of text
//	font: Text font
//	color: Text color
//	align: Text alignment
//	textGap: Space between icon and text
//	text: Array of objects: {t: text, a: attrib, icon: frame, act: callback}
//	barColor:
//	barAdjustY: Y position adjustment for the bar, in case it doesn't center properly around the text
//	iconAsset: assetID
//	hMargin: space between the left of the widget and the icon (or text if no icon)
//	vMargin: space between the top of the widget and the first line of text
//  fadeRate: Time, in milliseconds, for text items to fade in
//	fadeDelay: Time between line fade in events
//	fadeOut: Time, in milliseconds, for all elements to fade out when closing
//	isSlave: Define if this is a child widget (avoids self-termination)
//  callback: Object container handlers for various events {clicked:, closed: }
//=============================================================================
framework.widget.menu = function()
{
	var that = this;

	var textID = that.id + 'txt';
	var iconID = that.id + 'icon';
	var barID = that.id + 'bar';

	var curItem = 0;
	var ht, wd;
	var textWids = [];
	var iconWids = [];
	var barWids = [];
	var forceClose = false;
	var disabled = false;

	//=======================================================
	// Returns data about the line clicked on
	//=======================================================
	function lineInfo(id)
	{
		var regex = /[^0-9]+([0-9]+)/i;
		var match = id.match(regex);

		if (!match) return -1;

		return parseInt(match[1], 10);
	}

    //=======================================================
	// View -- For capturing events
    //=======================================================
    var menuView = Backbone.View.extend({
	    el: that.container,

	    events: {
		    "click .menuItem" : 'click',
		    "touchstart .menuItem" : 'click',
			"mouseenter .menuItem" : 'hover',
			"mouseleave .menuItem" : 'stopHover'
	    },

	    click: function(ev) {
			if (!disabled)
			{
				disabled = true;		// Prevent more clicks
				var id = lineInfo(ev.currentTarget.id);
				that.text[id].act();	// Call the action routine for an option
				that.callback.clicked && that.callback.clicked(id);	// Notify the parent that a selection occurred
			}
	    },

	    hover: function(ev) {
			var id = lineInfo(ev.currentTarget.id);
			$('#' + barID + id).show();	// Bad!
	    },

	    stopHover: function(ev) {
			var id = lineInfo(ev.currentTarget.id);
			$('#' + barID + id).hide();	// Bad!
	    }
    });

    var view = new menuView();

	// Start the construction process
	drawLines();

	//=======================================================
	// Draw an icon for a single line (if one is defined)
	//=======================================================
	function drawIcon(x, y, idx)
	{
		if (defined(that.text[idx].icon))
		{
			iconWids.push(that.add('image', {
				id: iconID + idx,
				image: that.iconAsset,
				frame: that.text[idx].icon,
				x: x,
				y: y + (that.iconYAdjust||0),
				depth: that.depth,
				cursor: 'pointer',
//				alpha: 0,
				hidden: true,
				type: 'menuItem'
			}));
		}
	}

	//=======================================================
	// Draw the text for a single line
	//=======================================================
	function drawText(x, y, idx)
	{
		var iconWid = that.iconAsset ? fw.assetWidth(that.iconAsset) : 0;

		var txt = that.add('text', {
			id: textID + idx,
			x: x + that.textGap + iconWid,
			y: y,
			text: that.text[idx].t,
			font: that.font,
			color: that.color,
			id: textID + idx,
			align: that.align,
			depth: that.depth,
			cursor: 'pointer',
//			alpha: 0,
			hidden: true,
			type: 'menuItem'
		});

		textWids.push(txt);

		return txt;
	}

	//=======================================================
	// Draw selection bars for each time (for highlight/click use)
	//=======================================================
	function drawBars()
	{
		var x = that.x + that.hMargin;
		var y = that.y + that.vMargin;
		for (var i = 0; i < that.text.length; i++)
		{
			barWids.push(that.add('rect', {
				id: barID + i,
				x: x - that.hMargin,
				y: y + (that.barAdjustY || 0),
				w: wd,
				h: that.lineHeight,
				color: that.barColor,
				depth: that.depth - 1,		// Behind text and icon
				cursor: 'pointer',
//				alpha: 0,			// Normally alpha causes issues, but this one is okay
				hidden: true,
				type: 'menuItem'
			}));

			y += that.lineHeight;
		}

		return y;
	}

	//=======================================================
	// Fade in a line of text
	//=======================================================
	function drawLines()
	{
		var y = that.y + that.vMargin;
		var x = that.x + that.hMargin;
		wd = 0;

		var iconWid = that.iconAsset ? fw.assetWidth(that.iconAsset) : 0;
		var overhead = that.textGap + iconWid + (that.hMargin * 2);

		// Draw text and icon
		for (var i = 0; i < that.text.length; i++)
		{
			// Icon
			drawIcon(x, y, i);

			// Text
			var txt = drawText(x, y, i);

			var lineWidth = txt.width() + overhead;
			if (lineWidth > wd)
				wd = lineWidth;

			y += that.lineHeight;
		}

		// Draw bars behind the other items
		y = drawBars();

		var lastY = y - that.lineHeight;	// Top of last line
		var lastLineHt = textWids[textWids.length-1].height();	// Real height of last line (using text height instead of lineHeight)
		ht = lastY + lastLineHt - that.y + that.vMargin;
	}

	//=======================================================
	//=======================================================
	function fadeLine()
	{
		textWids[curItem].fadeIn(that.fadeRate);
		iconWids[curItem] && iconWids[curItem].fadeIn(that.fadeRate);
//		barWids[curItem].show();	// I don't know why this was here.

		if (++curItem != that.text.length)	// Update the state if we're done
			fw.setCountdown(textID, that.fadeDelay, fadeLine);
	}

	//=======================================================
	// Close the menu
	//=======================================================
	this.close = function()
	{
		fw.deleteCountdown(textID);	// Stop creating the menu

		// If we're closing due to an external terminate, don't bother fading out.
		if (forceClose)
			return;

		for (var i = 0; i < textWids.length; i++)
		{
			textWids[i].stopFade();	// Stop fading in.  Also causes early deletion since the first line of text ends quicker

			if (i === 0)
				textWids[i].fadeOut(that.fadeOut, 0, closed);
			else
				textWids[i].fadeOut(that.fadeOut, 0);

			barWids[i].terminate();		// Could fadeOut, but unless we disable the mouseenter event the bar can still be highlighted
		}

		$.each(iconWids, function(idx, val) {
			val.stopFade().fadeOut(that.fadeOut, 0);
		});
	}

	//=======================================================
	// The menu has finished closing
	//=======================================================
	function closed()
	{
		if (!defined(that.isSlave))
			that.terminate();

		that.callback.closed && that.callback.closed(that.id);	// Notify that we're finished closing
	}

	//=======================================================
	//=======================================================
	that.terminateSelf = function()
	{
		forceClose = true;	// This can happen before close() is called

		view.undelegateEvents();
		delete(view);
	}

	//=======================================================
	//=======================================================
	this.appear = function()
	{
		fadeLine();
	}

	//=======================================================
	//=======================================================
	this.height = function()
	{
		return ht;
	}

	//=======================================================
	//=======================================================
	this.width = function()
	{
		return wd;
	}
};
