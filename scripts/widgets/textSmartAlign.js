//======================================================
// Attempts to intelligently align text vertically.
// Centering text is easy through docking (assuming a single widget
// rather than two different edges) but we often need to apply
// a maximum height.  If the text is taller than the max
// height, it is instead top-aligned and the excess is
// masked off.
//
// Currently this assumes a fixed width.  Later, smart alignment
// should extend to width calculations as well.
//
// Arguments:
//	w
//	id
//	text
//	font
//	color
//======================================================
framework.widget.textSmartAlign = function()
{
	var that = this;

	var wid;

	//=======================================================
	// Switch to top-left alignment
	//=======================================================
	function topLeftAlign()
	{
		fw.dock(wid, fw.dockTo(that));
	}

	//=======================================================
	// Vertically center the text within this container
	//=======================================================
	function center()
	{
		fw.dock(wid, {
			wid: that,
			my: 'center left',
			at: 'center left'
		});
	}

	//=======================================================
	//
	//=======================================================
	function chooseAlignment()
	{
		if (wid.height() > that.h)
			topLeftAlign();
		else
			center();
	}

	//======================================================
	// Update our layout based on external changes
	//======================================================
	this.relayout = function()
	{
		wid.width(that.w);
		chooseAlignment();
	}

	//======================================================
	// We need final width and height info for the container
	// to format the text.
	//======================================================
	this.docked = function()
	{
		wid = that.add('text', {
			text: that.text,
			font: that.font,
			color: that.color,
			w: that.w
		});

		chooseAlignment();
	}
};
