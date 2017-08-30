//======================================================
// Maintains a bank of icons with hover states and destinations
//
// Arguments:
//	id
//	x, y
//	barAsset: Optional, but very common.  Use this if all icons are contained in one asset.  Otherwise add the "asset" field to iconList
//	iconList: array of icons to display: [{frame:xx, callback: xx, tip:'xx', disabled:true/false, asset:}]
//  tipPos: General position of tooltips
//  tipOfs: Offset between icon and tooltip
//
// Style: (navIcons)
//	margin: Space between icons	-- This can be overridden by that.btnGap
//======================================================
framework.widget.iconBar = function()
{
	var that = this;
	var style = app.style.navIcons;

	var buttons = [];

	// Draw the images
	drawIcons();

    //=======================================================
    //=======================================================
	function drawIcons()
	{
		var wid = that;
		var at = 'top left';
		var ofs = '0 0';
		var maxH = 0;
		var gap = defined(that.btnGap) ? that.btnGap : style.margin;

		for (var i=0; i < that.iconList.length; i++)
		{
			wid = that.add('button', {
				id: 'icon'+i,
				image: that.iconList[i].asset || that.barAsset,
				frame: that.iconList[i].frame,
				tip: {text: that.iconList[i].tip, pos: that.tipPos, ofs: that.tipOfs, delay: style.tipDelay},
				depth: that.depth,
				funcTest: 'button_' + that.iconList[i].frame,
				hidden: that.hidden,
				click: that.iconList[i].callback
			}, {
				wid: wid,
				my: 'top left',
				at: at,
				ofs: ofs
			});

			if (that.iconList[i].disabled)
				wid.disable(2);

			var h = wid.height();
			if (h > maxH)
				maxH = h;

			at = 'top right';
			ofs = gap + ' 0';

			buttons.push(wid);
		}

		that.w = wid.x + wid.width() - that.x;
		that.h = maxH;
	}

	//=======================================================
	// Find a button index by name
	//=======================================================
	function findButton(name)
	{
		for (var i = 0; i < that.iconList.length; i++)
		{
			if (that.iconList[i].frame === name)
				return i;
		}

		return -1;		// Not found!
	}

	//=======================================================
	//=======================================================
	this.disable = function(button)
	{
		var btn = findButton(button);
		if (btn >= 0)
			buttons[btn].disable(2);
	}

	//=======================================================
	//=======================================================
	this.enable = function(button)
	{
		var btn = findButton(button);
		if (btn >= 0)
			buttons[btn].enable();

	}

	//=======================================================
	//=======================================================
	this.getButton = function(button)
	{
		var btn = findButton(button);
		if (btn >= 0)
			return buttons[btn];

		return null;
	}
};
