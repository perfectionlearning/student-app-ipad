//======================================================
// Maintains a bank of icons with hover states and destinations
//
// Arguments:
//	id
//	x
//	y
//	barAsset
//	iconList: array of icons to display: [{frame:xx, callback: xx, help:'xx', disabled:true/false}]
//
// Style: (vcrControls)
//	margin: Space between icons
//======================================================
framework.widget.vcrControls = function()
{
	var that = this;
	var style = app.style.vcrControls;

	var terminated = false;

	var vcrControlFrame;
	var buttonWids = {};

	// Draw the images
    drawVCRControls();
	drawButtons();

    //=======================================================
    //=======================================================
	function drawVCRControls()
	{
		vcrControlFrame = that.add('image', {
			id: 'vcrControlFrame',
			image: 'VCRControls',
			depth: that.depth
		});
	}

    //=======================================================
    //=======================================================
	function drawButtons()
	{
		var wid = that;
		var at = 'top left';
		var ofs = '0 0';

		$.each(that.controls, function(key, val) {
			ofs = val.xOfs + ' ' + val.yOfs;
			var wid = that.add('button', {
				id: key,
				image: val.name,
				depth: that.depth,
				frame: val.frame,
				cursor: 'pointer',
				click: val.action
			}, {
				wid: that,
				my: 'top left',
				at: at,
				ofs: ofs
			});

			buttonWids[key] = wid;
		});
	}

	//=======================================================
	//=======================================================
	this.disable = function(btn)
	{
		if (!terminated)
			buttonWids[btn].disable(2);
	}

	//=======================================================
	//=======================================================
	this.enable = function(btn)
	{
		if (!terminated)
			buttonWids[btn].enable();
	}

	//=======================================================
	// @FIXME/dg: This widget is for VCR controls.  It should
	// know about Pause, Play, etc.  Sending in a generic list
	// of buttons is silly.  Right now this is just a very
	// slightly enhanced version of iconBar!
	//=======================================================
	this.setFrame = function(btn, frame)
	{
		if (!terminated)
			buttonWids[btn].setFrame(frame);
	}

	//=======================================================
	//
	//=======================================================
	this.width = function()
	{
		return vcrControlFrame.width();
	}

	//=======================================================
	//
	//=======================================================
	this.height = function()
	{
		return vcrControlFrame.height();
	}

	//=======================================================
	//=======================================================
	this.terminateSelf = function()
	{
		terminated = true;
	}
};
