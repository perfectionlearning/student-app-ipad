//=============================================================================
// Expandable QC card
//
//  id
//  x, y
//  w, h: These are required.  Images are loaded via URL, so knowing the size is mandatory.
//  click: Callback on click
//  url: Image URL
//  scaleOrigin: One of: T, B, L, R, TL, TR, BL, BR
//  type: "wb" or "sum" -- wb needs extra pieces added to round the image
//
// Style: (qcCard)
//  startScale: Starting size
//  hoverScale: Scale factor at max size (relative to startScale)
//  iconAsset: Asset used for the overlayed "play" icon
//=============================================================================
framework.widget.qcCard = function()
{
	var that = this;
	var style = app.style.qcCard;

	var card, icon;

	var originMap = {
		T: "top",
		B: "bottom",
		L: "left",
		R: "right",
		TL: "top left",
		TR: "top right",
		BL: "bottom left",
		BR: "bottom right"
	}

	// [x, y] -- Offset multiplier from top left corner to compensate for origin relocation
	var offsetHack = {
		T: [0.5, 0],
		B: [0.5, 1],
		L: [0, 0.5],
		R: [1, 0.5],
		TL: [0, 0],
		TR: [1, 0],
		BL: [0, 1],
		BR: [1, 1]
	}

	// Add a click handler to the entire widget
	that.applyAction('click', {click: that.click});
	that.applyAction('hover', {
		inDelay: 100,
		inAction: hover,
		outDelay: 1,
		outAction: blur
	});

	// Draw a blank card as a placeholder
	drawBlank();

	// Draw card
	drawCard();

	// Add "play" icon
	drawIcon();

	//=======================================================
	// This and drawCard could be combined
	//=======================================================
	function drawBlank()
	{
		that.add('image', {
			image: that.blank,
			w: that.w,
			h: that.h,
			scale: style.startScale,
			origin: originMap[that.scaleOrigin || "TL"],
			cursor: 'pointer',
			depth: that.depth
		}, {
			wid: that,
			my: 'top left',
			at: 'top left'
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawCard()
	{
		// Draw the card
		card = that.add('image', {
			url: that.url,
			w: that.w,
			h: that.h,
			scale: style.startScale,
			origin: originMap[that.scaleOrigin || "TL"],
			cursor: 'pointer',
			depth: that.depth
		}, {
			wid: that,
			my: 'top left',
			at: 'top left'
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawIcon()
	{
		icon = that.add('image', {
			image: style.iconAsset,
			cursor: 'pointer',
			depth: that.depth+1
		});

		dockIcon();
	}

	//=======================================================
	//
	//=======================================================
	function dockIcon()
	{
		// Fun with offsets.  The x and y coordinates reported for a scaled
		// image are pre-scale!  We need to take that into account when
		// positioning the icon
		var ofs = offsetHack[that.scaleOrigin || "TL"];
		var ofsX = (that.w - that.w * style.startScale) * ofs[0];
		var ofsY = (that.h - that.h * style.startScale) * ofs[1];

		fw.dock(icon, {
			wid: card,
			/*
			my: 'bottom right',
			at: 'bottom right',
			ofs: '-15 -15'
			*/
			my: 'center',
			at: 'center',
			ofs: ofsX + ' ' + ofsY
		});
	}

	//=======================================================
	//
	//=======================================================
	function hover()
	{
		var scale = style.hoverScale;

		fw.scaleTo(card.el, scale, {
			rate:300,
			easing: 'swing',
			queue: false
		});

		// We can't use fadeOut because there's no way to prevent queueing
		icon.transform({
			rate:300,
			opacity: 0,
			queue: false
		});
	}

	//=======================================================
	//
	//=======================================================
	function blur()
	{
		fw.scaleTo(card.el, style.startScale, {
			rate:300,
			easing: 'swing',
			queue: false
		});

		// We can't use fadeIn because there's no way to prevent queueing
		icon.transform({
			rate:500,
			opacity: 1,
			queue: false
		});
	}
};