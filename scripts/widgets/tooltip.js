//======================================================
// Arguments:
//	id
//  text: Text to display
//  dock: {wid: widref, pos: dockstr, ofs:[x,y]} Docking object (simple mode only!)
//  maxWidth: Maximum width of the tooltip (to enforce wrapping)
//
// Style: (tooltip)
//	textColor: Text color
//	font: Text font
//  boxColor: Box color
//  boxBorder: Border size, in pixels (default: 0)
//  borderColor: Border color, if there is a border
//	hMargin: Extra space to the left and right of the text
//	vMargin: Extra space to the top and bottom of the text
//======================================================
framework.widget.tooltip = function()
{
	var that = this;
	var style = app.style.tooltip;

	var tipMap = {
		L: {my: "right center", at: "left center"},
		R: {my: "left center", at: "right center"},
		T: {my: "bottom center", at: "top center"},
		B: {my: "top center", at: "bottom center"},
		TL: {my: "bottom right", at: "top left"},
		TR: {my: "bottom left", at: "top right"},
		BL: {my: "top right", at: "bottom left"},
		BR: {my: "top left", at: "bottom right"}
	}

	// Allow overrides
	var hMargin = that.hMargin || style.hMargin;
	var vMargin = that.vMargin || style.vMargin;
	var font = that.font || style.font;

	// Create the tooltip
	var dock = createDock();
	createTip(dock);

	//=======================================================
	//
	//=======================================================
	function createDock()
	{
		if (tipMap[that.dock.pos])
			var mapped = tipMap[that.dock.pos];
		else
			mapped = tipMap.T;		// Random default

		var ofs = that.dock.ofs || [0,0];

		return {
			wid: that.dock.wid,
			my: mapped.my,
			at: mapped.at,
			ofs: ofs[0] + ' ' + ofs[1]
		};
	}

	//=======================================================
	// Create the tooltip
	//=======================================================
	function createTip(dock)
	{
		// Create the text first, even though it goes on top.
		// We need to use the text width to create the box under it
		var txt = that.add('text', {
			x: hMargin,
			y: vMargin,
			text: that.text,
			w: that.maxWidth,
			color: style.textColor,
			font: font,
			depth: fw.ZENITH+1,
			hidden: true				// If visible beforep positioned, it can break hover
		});

		var bg = that.add('rect', {
			color: style.boxColor,
			borderColor: style.borderColor,
			borderWidth: style.boxBorder,
			depth: fw.ZENITH,
			alpha: style.boxAlpha,
			hidden: true
		}, {
			top: txt.id + ' top -' + vMargin,
			bottom: txt.id + ' bottom ' + vMargin,
			left: txt.id + ' left -' + hMargin,
			right: txt.id + ' right ' + hMargin
		});

		// Update width and height
		that.w = bg.width();
		that.h = bg.height();

		fw.dock(that, dock);
//		that.show();
		that.fadeIn(style.fadeInTime);
	}

};