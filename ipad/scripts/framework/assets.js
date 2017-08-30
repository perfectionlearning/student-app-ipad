//===========================================================================================
// Asset Management Module
//===========================================================================================
(function() {
	fw.registerModule("assets", {});

	var successCount = 0;
	var errorCount = 0;

	var cache = {};
	var atlasResource = {};
	var downloadQueue = {};

	var callback;
	var imageList;
	var audioLoaded = false;

	//===========================================================================================
	// Private functions
	//===========================================================================================

	//=======================================================
	// Check whether all assets have been loaded (or failed)
	//=======================================================
	function isDone() {
		return (Object.keys(downloadQueue).length == successCount + errorCount) && audioLoaded;
	}

	//--------------
	// Asset loaded
	//--------------
	function loaded() {
		successCount++;
		if (isDone())
			callback();
		this.removeEventListener("canplaythrough", loaded, false);	// This only works for audio assets, but fails gracefully for others
	}

	//--------------
	// Asset failed to load (Not currently used!)
	//--------------
	function error(src) {
		fw.error(src + ' load failed!');
		errorCount++;
		if (isDone())
			callback();
		this.removeEventListener("canplaythrough", loaded, false);	// This only works for audio assets, but fails gracefully for others
	}

	//--------------
	// Called when all audio assets have been loaded
	//--------------
	function audioDone() {
		audioLoaded = true;
		if (isDone())
			callback();
	}

	//=======================================================
	// Helper function to solve for loop closure issue.
	// Creates a minimal closure for error reporting.
	//=======================================================
	function errorFunc(proc, src) {
		return function() {
			proc(src);
		}
	}

	//===========================================================================================
	// API
	//===========================================================================================

	//=======================================================
	// Queue a group of assets for loading
	// @FIXME/dg: Doesn't check for duplicate asset names
	//=======================================================
	framework.prototype.queueImages = function(list) {
		imageList = list;	// @FIXME/dg: This assumes there is only a single image list, which is bad (we could move into the inner loop to fix this, but it's less efficient)

		$.each(list, function(key, val) {
			downloadQueue[key] = $.extend({type:"img", frames:1}, val);
		});
	};

	//=======================================================
	// Queue a group of assets for loading
	// @FIXME/dg: Doesn't check for duplicate asset names
	//=======================================================
	framework.prototype.queueAudio = function(list) {
		fw.audQueue(list);	// Let the audio module deal with it.  The asset module doesn't need to know the details.
	};


	//=======================================================
	// Perform the actual download
	//=======================================================
	framework.prototype.initAtlas = function(atlas) {
		atlasResource = atlas;
	};

	//=======================================================
	// Perform the actual download
	//=======================================================
	framework.prototype.downloadAll = function(downloadCallback, errorCallback) {
		callback = downloadCallback;

		fw.audLoad(audioDone, errorCallback);		// Perform the audio load

		if (Object.keys(downloadQueue).length === 0) {
			downloadCallback();
			return;
		}

		// Load each asset
		for (var key in downloadQueue) {
			if (downloadQueue[key].type == "img")
			{
				var asset = new Image();
				asset.src = downloadQueue[key].path;
				asset.addEventListener("load", loaded, false);
				asset.frameCnt = downloadQueue[key].frames;
			}
//			asset.addEventListener("error", errorFunc(asset.src), false);	// Use a function generator to avoid the for loop closure issue
			asset.addEventListener("error", errorFunc(errorCallback, asset.src), false);	// Use a function generator to avoid the for loop closure issue

			cache[key] = asset;
		}

	};

	//=======================================================
	// Simpler version of the above
	// Starts background downloads of images, but doesn't
	// care when it finishes (or whether it finishes at all).
	// This is just meant to speed image loads.
	//=======================================================
	framework.prototype.preloadAssets = function(list) {
		var asset;
		var out = [];
		$.each(list, function(key, name) {
			asset = new Image();
			asset.src = name;
			out.push(asset);
		});

		return out;
	};

	//=======================================================
	// OLD: Returns the handle to an asset
	//
	// New: Returns either the handle to an asset OR a data
	// structure about an atlased image.  It DOESN'T include
	// a handle to the atlas image, as you would expect.
	// @FIXME/dg: This should be split into 2 routines!
	// The only reason it works is because images are
	// currently rendered via 'assetPath' instead of 'getAsset'.
	//=======================================================
	framework.prototype.getAsset = function(key) {
		return cache[key] || atlasResource[key];
	};

	//=======================================================
	// Returns the path of an asset (used by the graphic module to construct an URL for the asset)
	//=======================================================
	framework.prototype.assetPath = function(key) {
		// first, check for non-atlas image; default to atlas.
		return imageList[key] && imageList[key].path || imageList.TextureAtlas.path;
	};

	//=======================================================
	// Returns the width, height, and source coordinates of an image
	//
	// Currently requires all widths to be equal.  Add the option for multiple widths.
	//=======================================================
	framework.prototype.imageData = function(id, frame) {
		// image data from atlas list:
		var img = fw.getAsset(id);	// @FIXME/dg: Use a different routine!  This is meant to return the underlying image!
		var frameCnt = img.frameData && img.frameData.frames || 1;

		// differentiate between background tiles and other images.
		// background tiles will not be part of the atlas and will have .width and .height properties.
		var w = (img.width ? img.width : img.w) / frameCnt;
		var h = img.height || img.h;

		// @FIXME/dg: Parameters [2] and [3] are broken for atlased images!
		// Interestingly, params [2] and [3] are most useful for atlases.  They aren't currently used
		// for non-atlased images, and ARE for atlases.  The calculations are done in 'atlasData' instead.
		return [w, h, w*(frame || 0), 0];
	};

	//=======================================================
	//
	//=======================================================
	framework.prototype.assetWidth = function(id) {
		if (!defined(id))
			return undefined;

		return fw.imageData(id, 0)[0];
	};

	//=======================================================
	//
	//=======================================================
	framework.prototype.assetHeight = function(id) {
		if (!defined(id))
			return undefined;

		return fw.imageData(id, 0)[1];
	};

	//=======================================================
	// @FIXME/dg: This assumes only atlased images have frames!
	//=======================================================
	framework.prototype.frameCount = function(id) {

		return atlasResource[id] &&
				atlasResource[id].frameData &&
				atlasResource[id].frameData.frames ||
				1;
//		return imageList[id].frames || 1;
	};

	//=======================================================
	// Looks up a frame number by name for a given asset
	//=======================================================
	framework.prototype.frameNumber = function(id, name) {

		// In some cases, the frame number is passed in instead of a name.  Just return it.
		if (typeof(name) !== 'string')
			return name;

		// @FIXME/dg: This assumes only atlased images have frames!
		return atlasResource[id].frameData && atlasResource[id].frameData[name];
//		return imageList[id][name];
	};


	//=======================================================
	// This seems like a terrible place for this function.
	// Where should it go?
	//=======================================================
	framework.prototype.injectScript = function(file, success, fail) {
		return $.ajax({
			url: file,
			dataType: "script",
//			cache: false			// Allow this to be set elsewhere, either in ajaxSetup or though an app cache
		}).done(success).fail(fail);
	};

})();
