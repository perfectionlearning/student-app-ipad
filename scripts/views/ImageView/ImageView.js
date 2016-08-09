//===============================================================================
// Simple view that shows a single static image
//===============================================================================
;(function() {

	var vw = app.Views.ImageView = {};

	//=======================================================
	// Initialize the page
	// container seems to be the HTML tag.
	//=======================================================
	vw.init = function(container)
	{
		app.loadingBox();

		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList(), drawList));

		if (app.curObject)
		{
			var path = app.getImagePath(app.curObject);
			vw.drawList.setParam('Image', 'url', path + app.curObject.df[0]);
		}

		fw.setLayout('ImageView');
	};

	//=======================================================
	// READY function
	//=======================================================
	vw.ready = function()
	{
		app.globalUIInit();
	}

	//=======================================================
	// This shouldn't be necessary in this module.  Do it anyway.
	//=======================================================
	vw.close = function()
	{
		fw.abortAsync();
	}

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {

		Backdrop: [
			'Backdrop', 'borderedBox', app.style.backdrop
		],

		Image: [
			'image', 'delayedImage', {
				dockObj: {
					wid: '/Backdrop',	// The full path is needed here
					my: 'center',
					at: 'center'
				},

				success: app.clearLoadingBox,
				//error: failed,
				error: loadFailure
			}
		]
	};

	//=======================================================
	// Failed to load image
	//=======================================================
	var loadFailure = app.failHandler("image");

})();
