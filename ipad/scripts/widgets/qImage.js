//=============================================================================
// Question Image, including overlays
//
// Params:
//  id
//  x, y
//  w, h: These are required.  Images are loaded via URL, so knowing the size is mandatory.
//  url: Image URL
//
// Style: (qImage)
//=============================================================================
framework.widget.qImage = function()
{
	var that = this;
//	var style = app.style.qImage;

	var docker, container, img, overlay;

	// Add a click handler to the entire widget
	if (that.mode === 'expandable')
	{
		that.applyAction('click', {click: click});
		that.applyAction('hover', {
			inDelay: 100,
			inAction: hover,
			outDelay: 1,
			outAction: blur
		});
	}

	//=======================================================
	//=======================================================
	function createContainer()
	{
		// This is a hack to fool the docking system. It allows
		// coordinate conversion from global to relative (container).
		docker = that.add('rect', {w:0, h:0}, {top: 'stage top', left: 'stage left'});

		// Create the actual container
		container = that.add('container', {
			color: that.bgColor,
			depth: that.depth,
			hidden: that.hidden,
		}, {
			top: that.id + ' top',
			left: that.id + ' left',
			bottom: that.id + ' bottom ' + 2*that.borderWidth,
			right: that.id + ' right ' + 2*that.borderWidth,
		});

		if (that.scale)
			fw.setScale(container.el, that.scale);
	}

	//=======================================================
	//=======================================================
	function drawImage()
	{
		// Draw the card
		img = container.add('dynamicImage', {
			url: that.url,
			w: that.w,
			h: that.h,
			cursor: (that.mode === 'expandable' ? 'pointer' : ''),
			borderWidth: that.borderWidth,
			depth: that.depth,
			hidden: that.hidden,
		}, {
			wid: docker
		});
	}

	//=======================================================
	//=======================================================
	function drawOverlays()
	{
		if (that.overlays && that.overlays.length)
		{
			container.add('overlayList', {
				list: that.overlays,
				cursor: (that.mode === 'expandable' ? 'pointer' : ''),
				depth: that.depth,
				hidden: that.hidden,
			}, {
				wid: docker
			});
		}
	}

	//=======================================================
	//
	//=======================================================
	function hover()
	{
		var scale = 1.33;

		fw.scaleTo(container.el, scale, {
			rate:300,
			easing: 'swing',
			queue: false
		});
	}

	//=======================================================
	//
	//=======================================================
	function blur()
	{
		fw.scaleTo(container.el, 1, {
			rate:300,
			easing: 'swing',
			queue: false
		});
	}

	//=======================================================
	//
	//=======================================================
	function click()
	{
		// This is a bit of a violation, but we can't add the widget to ourselves, or the hover event
		// will be attached to it as well.
		overlay = fw.createWidget('imageOverlay', {
			w: that.w,
			h: that.h,
			scale: 2.5,
			overlays: that.overlays,
			bgColor: that.bgColor,
			borderWidth: that.borderWidth,
			depth: fw.ZENITH,	// fw.TOP is below the navigation, which is a bit odd.
			url: that.url
		}, {
			wid: 'stage',
			my: 'center',
			at: 'center'
		});
	}

	//=======================================================
	//=======================================================
	that.docked = function()
	{
		// Create container
		createContainer();

		// Draw image
		drawImage();

		// Draw overlays, if any
		drawOverlays();
	}

};