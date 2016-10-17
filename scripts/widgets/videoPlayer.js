//=============================================================================
// Video Player
//
//  id
//  x, y, w, h
//  url
//
// Style: (points)
//=============================================================================
framework.widget.videoPlayer = function()
{
	var that = this;
	var sSize = fw.stageSize();

	var bg;
	var vidWid;
	var exitWid;

	createBackdrop();
	drawVideo();
	drawX();
	bindEvents();

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
	//=======================================================
	function drawVideo()
	{
		vidWid = that.add('video', {
			id: 'video',
			url: that.url,
			controls: true,
			w: that.w,
			h: that.h,
			hidden: true,
			borderWidth: 2,
			borderColor: 'black',
			depth: that.depth
		}, {
			wid: bg,
			at: 'top center',
			my: 'center',
			ofs: '0 300'
		});

		vidWid.fadeIn(500, 0.99);
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
			wid: vidWid,
			at: 'top right',
			my: 'center',
			ofs: '0'
		});
	}

	//=======================================================
	//=======================================================
	function bindEvents()
	{
		bg.applyAction('click', {
			click: close
		});
	}

	//=======================================================
	//=======================================================
	function fadeComplete()
	{
		that.terminate();
	}

	//=======================================================
	// Stop playing the video and prepare to exit
	//=======================================================
	function close()
	{
		vidWid.shutDown();

		bg.fadeOut(200);
		exitWid.fadeOut(200);
		vidWid.fadeOut(200, 0, fadeComplete);
	}

	//=======================================================
	// We can't combine this with close() without reordering the
	// code.  close() is hoisted to the top, but this.close()
	// isn't, so it's not in scope when referenced above.
	//=======================================================
	this.close = function()
	{
		close();
	}

};
