//======================================================
// Scrolls through an arbitrary list of widgets
// This contains the outer UI: scroll buttons and a border
//
// Arguments:
//	id
//	x, y, w, h
//	scrollNotify: Called when scrolling occurs due to arrows
//  reserveSpace
//  bgColor: Background color (should match the parent color)
//
// Style: (scroller)
//	boxColor
//	boxBorderColor
//	boxBorderWidth
//
//  arrowAsset: Asset for arrows
//	arrowFadedAlpha
//	arrowFadeInRate
//	arrowFadeOutRate
//======================================================
framework.widget.scrollerContainer = function()
{
	var that = this;
	var style = app.style.scroller;

	var box, scroller;
	var buttons = [];

	var canScroll = true;

	//=======================================================
	// Create a border around the entire area
	//=======================================================
	function createBorder()
	{
		box = that.add('rect', {
			color: style.boxColor,
			borderWidth: style.boxBorderWidth,
			borderColor: style.boxBorderColor || 'black',
			hidden: true
		}, fw.dockTo(that));
	}

	//=======================================================
	//=======================================================
	function createArrows()
	{
		buttons[0] = that.add('button', {
			image: style.arrowAsset,
			frame: 'Up',
//			alpha: style.arrowFadedAlpha,
//			fadeInRate: style.arrowFadeInRate,
//			fadeOutRate: style.arrowFadeOutRate,
			hidden: true,
			depth: fw.MIDPLUS,
			click: scrollBack
		}, {
			wid: box,
			at: 'top right',
			my: 'top right',
			ofs: -style.boxBorderWidth + ' ' + style.boxBorderWidth
		});

		buttons[1] = that.add('button', {
			image: style.arrowAsset,
			frame: 'Down',
//			alpha: style.arrowFadedAlpha,
//			fadeInRate: style.arrowFadeInRate,
//			fadeOutRate: style.arrowFadeOutRate,
			hidden: true,
			depth: fw.MIDPLUS,
			click: scrollForward
		}, {
			wid: box,
			at: 'bottom right',
			my: 'bottom right',
			ofs: -style.boxBorderWidth + ''
		});
	}

	//=======================================================
	//
	//=======================================================
	function createScroller()
	{
		scroller = that.add('scroller', {
			bgColor: that.bgColor,				// Pass it on
			reserveSpace: that.reserveSpace		// Pass it on
		},{
			top: that.id + ' top ' + style.boxBorderWidth,
			bottom: that.id + ' bottom -' + style.boxBorderWidth,
			left: that.id + ' left ' + style.boxBorderWidth,
			right: that.id + ' right -' + style.boxBorderWidth,
		});
	}

	//=======================================================
	//
	//=======================================================
	function scrollBack()
	{
		if (canScroll)
		{
			if (scroller.scrollBack())
				that.scrollNotify();
		}
	}

	//=======================================================
	//
	//=======================================================
	function scrollForward()
	{
		if (canScroll)
		{
			if (scroller.scrollForward())
				that.scrollNotify();
		}
	}

	//=======================================================
	//=======================================================
	this.scrollToEnd = function(callback)
	{
		scroller.scrollToEnd(callback);
	}

	//=======================================================
	//=======================================================
	this.addWidget = function(widget, options)
	{
		scroller.addWidget(widget, options);
	}

	//=======================================================
	//=======================================================
	this.removeWidget = function(idx)
	{
		scroller.removeWidget(idx);
	}

	//=======================================================
	//=======================================================
	this.disableArrows = function()
	{
		canScroll = false;
		buttons[0].disable();
		buttons[1].disable();
	}

	//=======================================================
	//=======================================================
	this.enableArrows = function()
	{
		canScroll = true;
		buttons[0].enable();
		buttons[1].enable();
	}

	//=======================================================
	//=======================================================
	this.bottom = function()
	{
		return scroller.bottom();
	}

	//=======================================================
	//=======================================================
	this.scrollOfs = function()
	{
		return scroller.scrollOfs();
	}

	//=======================================================
	// External widgets need to add widgets directly to the
	// scroller for them to have the right owner (specifically,
	// to have the correct containing DOM element in the DOM model).
	//=======================================================
	this.getContainer = function()
	{
		return scroller;
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		createBorder();
		createArrows();
		createScroller();
	}

}