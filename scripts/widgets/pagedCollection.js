//======================================================
// A box that contains an arbitrary list of widgets.
// If more than one page occurs, next/previous buttons appear.
//
// Arguments:
//	id
//	x, y, w, h
//  bgColor
//  buttonAsset
//  buttonFrames: [next, prev]
//	buttonOffset: [x, y] -- Offset for Previous and Next buttons
//	gap: Vertical space between items
//	topMargin:    Space within the scrollable container between the top and the first line of text on any page
//	bottomMargin: Space reserved at the bottom of the scrollable container.  Anything in that area is considered part of the next page.
//
// Style: (pagedCollection)
//======================================================
framework.widget.pagedCollection = function()
{
	var that = this;
//	var style = app.style.pagedCollection;

	var container, boxWidget;
	var widgetList = [];
	var nextButton, prevButton;

	var curPage = 0, curItem = 0;
	var pageSize, curY, pageY, lastPage = 0;
	var pageIndices = [0];

	pageY = curY = that.topMargin;

	//=======================================================
	// Create the next and previous page buttons
	// Buttons are created outside of the scrollable window,
	// which allows actual scrolling without the arrows moving
	// around.
	// Actual scrolling is much more efficient than moving the
	// individual elements around, which degrades as the
	// number of elements increases.
	//=======================================================
	function createButtons()
	{
		// Adding to parents is bad form!  If we terminate this widget and not the parent, these will be left behind!
		// If we don't reset our own container, this wouldn't be necessary
		nextButton = that.parent.add('button', {
			image: that.buttonAsset,
			frame: that.buttonFrames[0],
			click: nextPage,
			depth: fw.FORE
		}, {
			wid: that,
			my: 'bottom right',
			at: 'bottom right',
			ofs: that.buttonOffset[0] + ' ' + that.buttonOffset[1]
		});

		prevButton = that.parent.add('button', {
			image: that.buttonAsset,
			frame: that.buttonFrames[1],
			click: prevPage,
			depth: fw.FORE
		},{
			wid: nextButton,
			my: 'bottom left',
			at: 'top left',
			ofs: '0 -' + that.buttonGap
		});

		nextButton.disable(2);
		prevButton.disable(2);
	}

	//=======================================================
	//
	//=======================================================
	function doScroll()
	{
		var newY = pageIndices[curPage];
		fw.transform(container.el, {scrollTop:newY, rate: 500, easing:'swing', queue: false});
	}

	//=======================================================
	//
	//=======================================================
	function nextPage()
	{
		if (curPage < lastPage)
		{
			// If we just hit the last page, disable the next page button
			if (++curPage === lastPage)
				nextButton.disable(2);

			prevButton.enable();
			doScroll();
		}
	}

	//=======================================================
	//
	//=======================================================
	function prevPage()
	{
		if (curPage > 0)
		{
			// If we just hit the last page, disable the next page button
			if (--curPage === 0)
				prevButton.disable(2);

			nextButton.enable();
			doScroll();
		}
	}

	//=======================================================
	// Add a widget to the collection
	//=======================================================
	this.addItem = function(newWid)
	{
		// Dock the widget (the first widget should be fine at 0,0)
		if (widgetList.length)
		{
			fw.dock(newWid, {
				wid: _.last(widgetList),
				my: 'top left',
				at: 'bottom left',
				ofs: '0 ' + that.gap
			});
		}

		widgetList.push(newWid);

		// Determine whether it will fit on the current page
		var h = newWid.height();

		if (pageY + h > pageSize)
		{
			//pageY = that.topMargin;
			//pageIndices.push(curY - that.topMargin);	// Save the index of a widget that won't fit
			//lastPage++;

			pageSize += h + that.gap;

			app.resizeStageHeight(pageY);
			$(window.parent).scrollTop(0);
			//console.log('resizing. pageY: ' + pageY + " h: " +h+" pageSize: "+pageSize + " that.gap: " + that.gap)
			//nextButton.enable();
		}

		curY += h + that.gap;	// Update the y position within the window
		pageY += h + that.gap;	// And the y position for the current page
	}

	//=======================================================
	// A redock just completed. Recalculate page indices.
	//=======================================================
	this.postRedock = function()
	{
		lastPage = 0;
		pageY = curY = that.topMargin + that.bottomMargin + 300;
		pageIndices = [0];

		$.each(widgetList, function(idx, wid) {
			// This is basically a copy of what occurs in addItem. Encapsulate!
			var h = wid.height();

			if (pageY + h > pageSize)
			{
				pageSize += h + that.gap;

				app.resizeStageHeight(pageY);
				$(window.parent).scrollTop(0);
			}

			curY += h + that.gap;	// Update the y position within the window
			pageY += h + that.gap;	// And the y position for the current page
		});

		// Ensure curPage isn't beyond the last page
		if (curPage > lastPage)
			curPage = lastPage;

		// Reset the scroll position
		doScroll();

		// Enable/disable scroll buttons
		(curPage > 0) ? prevButton.enable() : prevButton.disable();
		((lastPage > 0) && (curPage < lastPage)) ? nextButton.enable() : nextButton.disable();
	}

	//=======================================================
	// Clear out the container. Delete all widgets is holds.
	//=======================================================
	this.reset = function()
	{
		curPage = lastPage = 0;
		pageY = curY = that.topMargin + that.bottomMargin + 300;
		pageIndices = [0];

		$.each(widgetList, function(idx, wid) {
			wid.terminate();
		});

		widgetList = [];
		fw.setScroll(container.el, 0);

		nextButton.disable(2);
		prevButton.disable(2);
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		container = that.add('container', {
			color: that.bgColor,
			borderWidth: that.borderWidth,
			borderColor: that.borderColor
		}, fw.dockTo(that));

		// @FIXME/dg: This is bad!  We should leave our internal container alone.
		// We would then need a mechanism for callers to get the container widget so they
		// can add children to the correct parent.
		that.container = container.container;

		// Shrink the view to the correct size, now that we know it.
		pageSize = that.h - that.bottomMargin;

		// This is magic.  It allows us to scroll past the end of the content.
		container.add('text', {x: 0, y: 9999, text: '&nbsp;'});

		createButtons();
	}
}
