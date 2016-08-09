//=============================================================================
// Top-level navigation widget.  Currently consists of 3 pulldowns
//
//  id
//  x, y
//  title
//  tabAsset: Image used as the tab underlay for the title and current selection text
//  data: Array of possible items on the pulldown
//  selection: Current selection from 'data'
//
// Style: (navPulldown)
//			titleFont:
//			titleColor:
//			locationFont:
//			locationColor:
//
//			headerFont:
//			headerColor:
//			headerMargin: Horizontal space between the left edge and header text
//			itemFont:
//			itemColor:
//			itemMargin: Horizontal space between headers and items
//			itemHighlightColor:
//			barColor:
//
//			tabOffsetX: Offset of the tab asset to the title text
//			tabOffsetY: Offset of the tab asset to the title text
//			bgColor:
//			bgAlpha:
//			bgBorder: 8 assets that make up the pulldown border
//=============================================================================
framework.widget.navPulldown = function()
{
	var that = this;
	var style = app.style.navPulldown;

	var title, location;
	var tab, bg, list;

	var isOpen = false;

	this.w = fw.assetWidth(this.tabAsset);
	this.h = fw.assetHeight(this.tabAsset);

	var tabDepth = that.depth || 0;
	var headDepth = tabDepth + 5;

	//=======================================================
	//
	//=======================================================
	function getSelected(list, idx)
	{
		for (var i = 0; idx >= 0; i++)
		{
			// Safety code, in case we're somehow getting a value that's out of range
			if (!list[i])
				break;

			if (list[i][0] !== '!')
				idx--;
		}

		var res = list[i-1] || "";

		// Check for special prefix ('?') and remove it
		if (res.length > 0 && res[0] === '?')
			return res.substring(1);

		return res;
	}

	//=======================================================
	// Display the title and text
	//=======================================================
	function drawHeader()
	{
		// Draw the title
		title = that.add('text', {
			text: that.title,
			font: style.titleFont,
			color: style.titleColor,
			depth: headDepth
		}, {
			wid: that,
			my: 'top left',
			at: 'top left',
		});

		// Draw the entry
		var data = that.data || [''];
		var sel = getSelected(data, that.selection || 0);

		location = that.add('text', {
			text: sel,
			font: style.locationFont,
			color: style.locationColor,
			depth: headDepth
		}, {
			wid: title,
			my: 'top left',
			at: 'bottom left'
		});
	}

	//=======================================================
	// Draw the background for the pulldown widget
	//=======================================================
	function drawTab()
	{
		tab = that.add('image', {
			image: that.tabAsset,
			funcTest: 'nav-tab',
			depth: tabDepth
		}, {
			wid: that,
			my: 'top left',
			at: 'top left',
			ofs: style.tabOffsetX + ' ' + style.tabOffsetY
		});
	}

	//=======================================================
	// Draw the entire list of data.  This is for a flat
	// list of selections without any categories.
	//
	// Do this before drawing the background, so we can set
	// the size of the background based on the text size
	//=======================================================
	function drawList()
	{
		var container = bg.getContainer();

		var activeHeaders = false;
		for (var i=0; i < that.data.length; i++)
		{
			if (that.data[i][0] === '?')
				activeHeaders = true;
		}

		list = container.add('textColumn', {
			x: style.itemHMargin,
			w: that.w - (2 * style.bgMargin) - style.itemHMargin - style.itemRMargin,
			text: that.data,
			font: style.itemFont,
			textColor: style.itemColor,
			hoverColor: style.itemHighlightColor,
			highlightColor: style.selectedColor,
			hoverBarColor: style.barColor,
			hoverBarXMargin: style.barHMargin,
			headerFont: style.headerFont,
			headerColor: style.headerColor,
			headerMargin: style.subItemMargin,
			margin: style.itemVMargin,
			click: that.click,
			fadeTime: 0,
			activeHeaders: activeHeaders,
			depth: headDepth
		});

		list.setSelection(that.selection);
	}

	//=======================================================
	// Draw the background for the pulldown widget
	//=======================================================
	function drawBG()
	{
		var borderHt = fw.assetHeight(style.bgBorder.t) + fw.assetHeight(style.bgBorder.b) + 1;
		bg = that.add('borderedBox', {
			images: style.bgBorder,
			useContainer: true,
			bgColor: style.bgColor,
			alpha: style.bgAlpha,
			depth: tabDepth
		}, {
			top: tab.id + ' bottom ' + style.bgTopMargin,
			left: tab.id + ' left ' + style.bgMargin,
			right: tab.id + ' right -' + style.bgMargin,
//			bottom: list.id + ' bottom ' + style.bgBottomMargin
			bottom: tab.id + ' bottom ' + (style.bgTopMargin + borderHt)
		});
	}

	//=======================================================
	// Draw the pulldown list.  Called when the header is
	// clicked or hovered over, depending on configured
	// behavior.
	//=======================================================
	function drawPulldown()
	{
		// Draw tab under title
		drawTab();

		// Draw the background under the entries
		drawBG();

		// Draw list of entries
		drawList();

		bg.resize(list.height() + style.bgBottomMargin,
			Math.max(that.data.length * (1000/30), 500));	// A semi-random speed determination based on list length
	}

	//=======================================================
	//
	//=======================================================
	function removePulldown()
	{
		tab.terminate();
		list.terminate();
		bg.terminate();
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		drawHeader();
		this.applyAction('hover', {
			inDelay: 100,
			outDelay: 300,
			inAction: drawPulldown,
			outAction: removePulldown
		});
	}

};