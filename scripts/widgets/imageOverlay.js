//=============================================================================
// Video Player
//
//  id
//  x, y, w, h
//  url
//
// Style: (points)
//=============================================================================
framework.widget.imageOverlay = function()
{
	var that = this;
	var sSize = fw.stageSize();

	var bg, image, exitWid;

	var imgOfsX, imgOfsY, closeOfsX, closeOfsY;

	var isClosed = false;

	//=======================================================
	//=======================================================
	function createBackdrop() {
		bg = that.add('rect', {
			id: that.id + 'bg',
			type: 'backdrop',
			x: 0,
			y: 0,
			w: sSize[0],
			h: sSize[1],
			color: 'black',
			alpha: 0.66,
			depth: that.depth-1
		});
	}

	//=======================================================
	// Return a structure instead of setting global vars!
	//=======================================================
	function calcCoords()
	{
		var w = that.w + (2*that.borderWidth);
		var h = that.h + (2*that.borderWidth)
		var scaledW = w * that.scale;
		var scaledH = h * that.scale;

		imgOfsX = (w - scaledW) / 2 - that.borderWidth;
		imgOfsY = (h - scaledH) / 2 - that.borderWidth;

		closeOfsX = scaledW / 2 - that.borderWidth;
		closeOfsY = -scaledH / 2 + that.borderWidth;
	}

	//=======================================================
	//=======================================================
	function drawImage()
	{
		image = that.add('qImage', {
			w: that.w,
			h: that.h,
			url: that.url,
			overlays: that.overlays,
			scale: that.scale,
//			hidden: true,
			bgColor: that.bgColor,
			borderWidth: that.borderWidth,
			borderColor: 'black',
			depth: that.depth
		}, {
			wid: bg,
			at: 'center',
			my: 'center',
			ofs: imgOfsX + ' ' + imgOfsY
		});

//		image.fadeIn(200, 1);
	}

	//=======================================================
	// Draw the X icon that closes the video popup
	//=======================================================
	function drawX()
	{
		exitWid = that.add('button', {
			id: 'exitButton',
			image: 'VideoExit',
			alpha: 0.7,
			depth: that.depth + 1,
			click: close
		},{
			wid: bg,
			at: 'center',
			my: 'center',
			ofs: closeOfsX + ' ' + closeOfsY
		});
	}

	//=======================================================
	//=======================================================
	function bindEvents()
	{
		bg.applyAction('click', {click: close});
	}

	//=======================================================
	//=======================================================
	function fadeComplete()
	{
		// This is called once per child widget. Only terminate once.
		if (!isClosed)
		{
			isClosed = true;
			that.terminate();
		}
	}

	//=======================================================
	// Stop playing the video and prepare to exit
	//=======================================================
	function close()
	{
		that.fadeOut(200, 0, fadeComplete);
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		calcCoords();

		createBackdrop();
		drawImage();
		drawX();
		bindEvents();
	}

	//=======================================================
	//=======================================================
	this.close = function()
	{
		close();
	}

};
