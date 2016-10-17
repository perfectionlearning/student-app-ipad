//======================================================
// A box that contains an arbitrary list of widgets.
//
// Arguments:
//	id
//	x, y, w, h
//  list: List of entries to display on the menu [{indent:, text:, icon:, tip:, action:, dest:}]
//  openAnim: Callback to trigger an animation when opening
//  closeAnim: Callback to trigger an animation when closing
//
// Style: (slideOut)
//  bgColor
//  easeIn:
//  easeInRate:
//  easeOut:
//  easeOutRate:
//  tabSize: Width, in pixels, of each indent level
//  overhang: Width hidden beyond the left edge.  Due to easing, the overhang is briefly visible.
//  itemHMargin
//  itemVMargin
//======================================================
framework.widget.slideOut = function()
{
	var that = this;
	var style = app.style.slideOut;

	var bg, items;

	//=======================================================
	//
	//=======================================================
	function drawItems()
	{
		var wid;

		// We can't dock since we're using different coordinate systems
		var x = style.itemHMargin + style.overhang;
		var y = style.itemVMargin;

		var lastType = that.list[0].type;

		// Step through the list
		$.each(that.list, function(idx, val) {

			// @TEMP
			if (val.type !== lastType)
			{
				lastType = val.type;
				y += 6;
			}

			// Create a text button widget

			// Create icon, if any

			// Create text
			wid = bg.add('textButton', {
				text: val.text,
				color: style.textColor,
				font: style.font,
				x: x + (val.indent * style.tabSize),	// Take indent level into consideration
				y: y
			});

			// Attach tip, if any

			y += style.lineHeight;
		});
	}

	//=======================================================
	//
	//=======================================================
	function attachHover()
	{
		bg.applyAction('hover', {
			inDelay: 0,
//			inAction: that.open,
			outDelay: 500,
			outAction: that.close
		});
	}

	//=======================================================
	//=======================================================
	this.open = function()
	{
		// Scroll open
		fw.transform(bg.el, {
			left: -style.overhang,
			rate: style.easeInRate,
			easing: style.easeIn,
//			action: attachHover,
			queue: false
		});

		// Trigger external actions
		that.openAnim && that.openAnim(style.easeInRate);
	}

	//=======================================================
	//=======================================================
	this.close = function()
	{
		// Scroll closed
		fw.transform(bg.el, {
			left: -that.w - 2,
			rate: style.easeOutRate,
			easing: style.easeOut,
			queue: false
		});

		// Trigger external actions
		that.closeAnim && that.closeAnim(style.easeOutRate);
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		bg = that.add('container', {
			color: style.bgColor,
			alpha: style.bgAlpha,
			borderColor: style.bgBorderColor,
			borderWidth: style.bgBorderWidth,
			depth: fw.ZENITH-2
		}, fw.dockTo(that));

		drawItems();

		attachHover();
	}
}
