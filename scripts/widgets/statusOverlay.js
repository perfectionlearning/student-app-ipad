//======================================================
//
//
// Arguments:
//	id
//	remaining, mastered, needsWork
//======================================================
framework.widget.statusOverlay = function()
{
	var that = this;
	var style = app.style.statusOverlay;

	var bg, button, remWid, mastWid, needsWid;

	that.remaining = defined(that.remaining) ? that.remaining : '';
	that.mastered = defined(that.mastered) ? that.mastered : '';
	that.needsWork = defined(that.needsWork) ? that.needsWork : '';

	drawBg();
	drawScores();
	drawButton();
	setButtonState();

	//=======================================================
	//=======================================================
	function drawBg()
	{
		bg = that.add('image', {
			image: 'DrillOverlay',
			depth: that.depth
		}, fw.dockTo(that));

		// This isn't dynamic, and is the non-optimal way to deal with sizes.
		// However, the background image has a fixed size, so it's fine.
		that.w = bg.width();
		that.h = bg.height();
	}

	//=======================================================
	//=======================================================
	function drawScores()
	{
		//----------------------
		remWid = that.add('text', {
			text: that.remaining,
			font: style.font,
			color: style.color,
			depth: that.depth
		},{
			centerx: that.id + ' left 35',		// Magic number! Move to style!
			centery: that.id + ' top 30'
		});

		//----------------------
		mastWid = that.add('text', {
			text: that.mastered,
			font: style.font,
			color: style.color,
			depth: that.depth
		},{
			centerx: that.id + ' left 99',		// Magic number! Move to style!
			centery: that.id + ' top 30'
		});

		//----------------------
		needsWid = that.add('text', {
			text: that.needsWork,
			font: style.font,
			color: style.color,
			depth: that.depth
		},{
			centerx: that.id + ' left 163',		// Magic number! Move to style!
			centery: that.id + ' top 30'
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawButton()
	{
		button = that.add('button', {
			image: 'SubmitAssignment',
			click: doSubmit,
			depth: that.depth
		},{
			centerx: that.id + ' center',
			centery: that.id + ' top 59'
		});
	}

	//=======================================================
	//
	//=======================================================
	function setButtonState()
	{
		var active = true;

		if (!defined(that.remaining) || !defined(that.mastered) || !defined(that.needsWork))
			active = false;

		if (that.mastered == 0 && that.needsWork == 0)
			active = false;

		if (that.disabled)
			active = false;

		if (active)
			button.enable();
		else
			button.disable(2);
	}

	//=======================================================
	//=======================================================
	this.disableButton = function()
	{
		that.disabled = true;
		setButtonState();
	}

	//=======================================================
	//
	//=======================================================
	function doSubmit()
	{
		that.doSubmit && that.doSubmit();
	}

	//=======================================================
	//
	//=======================================================
	this.update = function(obj)
	{
		if (defined(obj.remaining))
		{
			that.remaining = obj.remaining;
			remWid.setText(that.remaining);
			remWid.redock();
		}

		if (defined(obj.mastered))
		{
			that.mastered = obj.mastered;
			mastWid.setText(that.mastered);
			mastWid.redock();
		}

		if (defined(obj.needsWork))
		{
			that.needsWork = obj.needsWork;
			needsWid.setText(that.needsWork);
			needsWid.redock();
		}

		setButtonState();
	}

};
