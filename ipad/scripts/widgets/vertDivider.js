//=============================================================================
// Creates a simple reward animation
//
//  id
//  x
//  y
//	assets: {t:'', m:'', b:''}
//
//=============================================================================
framework.widget.vertDivider = function()
{
	var that = this;

	//=======================================================
	//=======================================================
	function createDivider()
	{
		// Create the top
		var top = that.add('image', {image: that.assets.t},
        {
			top: that.id + ' top',
			left: that.id + ' left'
        });

		// Create the bottom
		var bottom = that.add('image', {image: that.assets.b},
        {
			bottom: that.id + ' bottom',
			left: that.id + ' left'
        });

		// Create the middle
		that.add('image', {image: that.assets.m},
        {
            top: top.id + ' bottom',
            bottom: bottom.id + ' top',
            left: that.id + ' left'
        });
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		// Internal resizing occurs, so we can't draw until after docking
		createDivider();
	}
}
