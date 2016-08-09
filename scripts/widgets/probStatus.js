//======================================================
// Problem Status Icon
//
// Arguments:
//	id
//	x, y
//
// Style: (probStatus)
//	asset
//======================================================
framework.widget.probStatus = function()
{
	var that = this;
	var style = app.style.probStatus;

	var icon;

	drawIcon();

	//=======================================================
	//
	//=======================================================
	function drawIcon()
	{
		icon = that.add('image', {
			image: style.asset,
			frame: that.state,
			
			cursor: that.cursor,
			depth: that.depth
		}, fw.dockTo(that));
	}

	//=======================================================
	//=======================================================
	this.setState = function(state)
	{
		icon.frame(state);
	}

	//=======================================================
	//=======================================================
	this.width = function()
	{
		return icon.width();
	}

	//=======================================================
	//=======================================================
	this.height = function()
	{
		return icon.height();
	}
};
