//======================================================
// A box that contains an arbitrary list of widgets, ordered as lines.
//
// Arguments:
//	id
//	items
//
// Style: (navMenu)
//
//======================================================
framework.widget.navMenu = function()
{
	var that = this;
	var style = app.style.navMenu;

	var depth = that.depth || 1;
	var timeout;

	var container;
	var lineWids = [];

	createMenu();

	//=======================================================
	//=======================================================
	function createContainer()
	{
		container = that.add('borderedBox', {
			images: {
				tl: 'PDSlicesTL2',
				tr: 'PDSlicesTR2',
				bl: 'PDSlicesBL',
				br: 'PDSlicesBR',
				t: 'PDSlicesT2',
				b: 'PDSlicesB',
				l: 'PDSlicesL',
				r: 'PDSlicesR'
			},
			bgColor: app.style.navPulldown.bgColor,
			alpha: app.style.navPulldown.bgAlpha,
			depth: depth
		}, fw.dockTo(that));
	}

	//=======================================================
	//
	//=======================================================
	function createEntries()
	{
		var wid;

		that.w = 0;
		var firstOfs = style.hMargin + ' ' + style.vMargin;
		var otherOfs = '0 ' + style.itemGap;

		$.each(that.items, function(idx, val) {

			if (defined(val.enable) && !val.enable)
				return true;	// continue

			wid = that.add('menuLine', {
				// Varies each line
				frame: val.icon,
				text: val.t,
				click: val.act,

				// Always the same.  We can't store this externally to prevent allocation.  It gets modified.
				asset: 'MenuIcons',
				font: style.font,
				color: app.style.navPulldown.itemColor,
				barColor: app.style.navPulldown.barColor,
				iconGap: style.iconGap,
				margin: style.itemMargin,
				depth: depth + 2
			}, {
				wid: (idx === 0 ? that : wid),
				my: 'top left',
				at: (idx === 0 ? 'top left' : 'bottom left'),
				ofs: (idx === 0 ? firstOfs : otherOfs)
			});

			that.w = Math.max(that.w, wid.width());

			lineWids.push(wid);
		});

		that.w += style.hMargin * 2;
		that.h = wid.y + wid.height() - lineWids[0].y + style.vMargin * 2;	// Measure distance from top to bottom, and add margins
	}

	//=======================================================
	// Create highlight/hover bars for each entry line
	// Do this after all lines have been created, so we know how wide to make them
	// (We could have created them all at once, and scaled them).
	//=======================================================
	function createBars()
	{
		$.each(lineWids, function(idx, val) {
			val.addBar(style.barLMargin, style.itemGap / 2, that.w - style.hMargin*2 + style.barLMargin + style.barRMargin);
		});
	}

	//=======================================================
	//
	//=======================================================
	function createMenu()
	{
		createEntries();
		createBars();
		createContainer();
		attachEvents();
	}

	//=======================================================
	//
	//=======================================================
	function attachEvents()
	{
		that.applyAction('hover', {
			inAction: setActive,
			outAction: close,
			outDelay: style.closeDelay
		});
	}

	//=======================================================
	//
	//=======================================================
	function setActive()
	{
		clearTimeout(timeout);
	}

	//=======================================================
	//=======================================================
	function close()
	{
		that.animTo(-that.w, that.y, style.easeOutRate, null, style.easeOut);
		clearTimeout(timeout);
	}

	//=======================================================
	//=======================================================
	this.open = function()
	{
		that.animTo(-6, that.y, style.easeInRate, null, style.easeIn);
		timeout = setTimeout(close, style.autoClose);	// Close unless the mouse enters in time
	}

	//=======================================================
	//=======================================================
	this.close = function()
	{
		close();
	}

}