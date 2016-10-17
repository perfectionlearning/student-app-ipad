//=============================================================================
// Image of unknown size that is loaded dynamically
//
//  id
//  url
//	dockObj
//
//=============================================================================
framework.widget.delayedImage = function()
{
	var that = this;

	// Preload even though we will use it immediately, just to keep a reference to the image
	var hasLoaded = false;
	var asset = fw.preloadAssets([that.url])[0];
	asset.addEventListener("load", loaded, false);
	asset.addEventListener("error", failed, false);

	//=======================================================
	// The image is done loading
	//=======================================================
	function loaded()
	{
		hasLoaded = true;

		if (that.success)
			that.success();

		// Add borders later
		that.w = asset.width;
		that.h = asset.height;

		that.add('dynamicImage', {
			url: that.url,
			w: that.w,
			h: that.h,
		}, that.dockObj);
	}

	//=======================================================
	//
	//=======================================================
	function failed()
	{
		if (that.error)
			that.error();
	}

	//=======================================================
	// If this widget is terminated before loading completes,
	// prevent the loaded event from occurring.  It will break
	// things.
	//=======================================================
	that.terminateSelf = function()
	{
		asset.removeEventListener("load", loaded, false);
		asset.removeEventListener("error", failed, false);
	}

}
