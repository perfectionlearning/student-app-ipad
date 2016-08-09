//======================================================
// A scrollable container.  Anything inside this widget will scroll.
//
// @FIXME/dg: This should be combined with pagedCollection!
//   With just a little work, they could use the same core, which could scroll by
//	 either an entire page, or a single widget.
//
// Arguments:
//	id
//	x, y, w, h
//  reserveSpace
//  bgColor: Background color (should match the parent color)
//
// Style: (scroller)
//	hMargin: Space between left edge and each item
//	vMargin: Space between top edge and the first item
//
//	scrollRate: Scroll rate when arrows are use to scroll by a single step
//	forcedScrollRate: Scroll rate when forced scrolling occurs
//	gap: Vertical space between items
//  lineAsset: Asset for divider line between items
//	widFadeInRate: Rate to fade in newly added widgets
//======================================================
framework.widget.scroller = function()
{
	var that = this;
	var style = app.style.scroller;

	var items = [];
	var dividers = [];	// Dividers preceding each item (There isn't one before the first item, so add a null as a placeholder)
	var container, target;

	var topItem = 0;	// First item displayed
	var scrollTop = 0;	// Top coordinate (used by the scolling mechanism)

	//=======================================================
	// This is a hack to fool the docking system. It allows
	// coordinate conversion from global to relative (container).
	//=======================================================
	function createDockTarget()
	{
		target = that.add('rect', {w:0, h:0}, {top: 'stage top', left: 'stage left'});
	}

	//=======================================================
	//
	//=======================================================
	function createContainer()
	{
		container = that.add('container', {
			w:0,
			h:0,
			color: that.bgColor,
		}, fw.dockTo(that));

		// @FIXME/dg: This is bad!  We should leave our internal container alone.
		// We would then need a mechanism for callers to get the container widget so they
		// can add children to the correct parent.
		that.container = container.container;

		// This is magic.  It allows us to scroll past the end of the content.
		container.add('text', {x: 0, y: 9999, text: '&nbsp;'});
	}

	//=======================================================
	// Draw a divider line between items
	//=======================================================
	function drawDivider(dock)
	{
		dock.right = that.id + ' right -' + (style.hMargin + that.x);	// This is dangerous and will fail under some circumstances

		var div = that.add('image', {
			image: style.lineAsset,
			hidden: true,
			repeat: 'x'
		}, dock);

		dividers.push(div);

		return {
			left: div.id + ' left',
			top: div.id + ' bottom ' + style.gap
		};
	}

	//=======================================================
	//
	//=======================================================
	function scrollTo(ofs, rate, callback)
	{
		scrollTop = ofs;
		fw.transform(container.el, {scrollTop: ofs, rate: rate, done: callback});
	}

	//=======================================================
	// Scroll down by one item, which is an arbitrary height
	//=======================================================
	this.scrollForward = function()
	{
		var lastItem = items.length - 1;

		// Make sure it's possible to go forward
		if (topItem >= lastItem)
			return;

		// Scroll all
		scrollTo(items[topItem+1].y - style.vMargin, style.scrollRate);

		topItem++;

		return true;
	}

	//=======================================================
	// Display one previous item
	//=======================================================
	this.scrollBack = function()
	{
		// Make sure it's possible to go back
		if (topItem === 0)
			return;

		var lastItem = items.length - 1;

		// Scroll all
		scrollTo(items[topItem-1].y - style.vMargin, style.scrollRate);

		topItem--;

		return true;
	}

	//=======================================================
	// Determine whether the widget will fit.  If not, scroll up until it will
	//=======================================================
	function scrollToFit(widget, callback)
	{
		var desiredBottom = widget.y + widget.height() + style.gap + that.reserveSpace - 1 - scrollTop;
		var conBottom = that.h;	// - style.vMargin;	// Currently ignoring the bottom margin, to try to fit a bit more
		var minDelta = desiredBottom - conBottom;

		// Scroll up at least minDelta
		var newTop = topItem;
		var saved = 0;
		var lastItem = items.length - 1;

		while (saved < minDelta)
		{
			// If we can't scroll anymore, give up
			if (newTop >= lastItem)
				break;

			saved += items[newTop].height() + (style.gap * 2);
			newTop++;
		}

//		fw.debug('bottom: ' + desiredBottom + ', to: ' + conBottom + ', minDelta: ' + minDelta + ', saved: ' + saved + ', newTop: ' + newTop);

		if (saved === 0)
		{
			callback && callback();	// Do the callback if there is one
			return false;
		}

		// Do the scroll
		scrollTo(scrollTop + saved, style.forcedScrollRate, callback);

		topItem = newTop;

		return true;
	}

	//=======================================================
	// Determine whether the widget will fit.  If not, scroll up until it will
	//=======================================================
	this.scrollToEnd = function(callback)
	{
		return scrollToFit(items[items.length-1], callback);
	}

	//=======================================================
	// Returns the y coordinate of the bottom of a given item
	//=======================================================
	function getBottom(idx)
	{
		// Make sure idx is in range
		if (idx >= items.length)
		{
			fw.warning('Scroller: attempting to getBottom for illegal index: ' + idx);
			idx = items.length - 1;
		}

		// If at the top, return the scroller's margin
		if (idx < 0)
		{
			return {
				left: target.id + ' left ' + style.hMargin,
				top: target.id + ' top ' + style.vMargin
			};
		}

		return {
			left: items[idx].id + ' left',
			top: items[idx].id + ' bottom ' + style.gap
		}
	}

	//=======================================================
	// Add a widget to the end of the list
	//=======================================================
	this.addWidget = function(widget, options)
	{
		var lastIdx = items.length - 1;
		var dock = getBottom(lastIdx);

		// Add a divider (if requested)
		if (options.useDivider && lastIdx >= 0)
			dock = drawDivider(dock);
		else
			dividers.push(null);

		// Position the widget
		fw.dock(widget, dock);

		/* DG: Removed -- Needs to dock rather than use direct positioning
		if (app.FunctionalTestMode) {
			placeholder = that.add('image', {
				image: style.lineAsset,
				x: style.hMargin,
				y: y,
				w: that.w - (2 * style.hMargin),
				funcTest: 'step-by-step ' + (widget.y + widget.height() + style.gap + that.reserveSpace - 1),
				hidden: true,
				repeat: 'x'
			});
		}
		*/

		// Add the widget to our internal list
		items.push(widget);

		// Determine whether the widget will fit.  If not, scroll up until it will
		if (!options.skipScroll)
			scrollToFit(widget);

		// Fade in the divider and widget
		lastIdx++;

		if (!options.skipFadeIn)
		{
			dividers[lastIdx] && dividers[lastIdx].fadeIn(style.widFadeInRate);
			items[lastIdx].fadeIn(style.widFadeInRate);
		}
	}

	//=======================================================
	// Remove any widget from the list
	// Widgets below the one removed are moved up
	//=======================================================
	this.removeWidget = function(idx)
	{
		// Doesn't actually terminate the widget.  That is assumed to occur externally
		dividers[idx] && dividers[idx].terminate();
		dividers.splice(idx, 1);

		// Figure out how much to move everything up
		var delta = items[idx].height();

		// Remove the widget
		items.splice(idx, 1);

		// Move everything below up (instantly -- should scroll!)
		for (var i = idx, len = items.length; i < len; i++)
			items[i].adjustPos(0, -delta);
	}

	//=======================================================
	//=======================================================
	this.bottom = function()
	{
		var lastIdx = items.length - 1;
		return getBottom(lastIdx);
	}

	//=======================================================
	//=======================================================
	this.scrollOfs = function()
	{
		return scrollTop;
	}

	//=======================================================
	// Fading out or some other aspect of the transition process
	// causes the scroll index to be reset to 0.  As soon as we're
	// visible, immediately reset the scroll index to where it should be.
	//=======================================================
	this.fadeInSelf = function()
	{
		fw.setScroll(container.el, scrollTop);
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		createDockTarget();
		createContainer();
	}

}