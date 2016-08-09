//===============================================================================
// Whiteboard Container -- Single video with headlines and controls
//===============================================================================
;(function() {

	var vw = app.Views.Whiteboard = {};

    // flag to distinguish between stop at video end, or pause while waiting for initial JSON load,  and any other kind of pause.
    // This is used to control of the display of the pause / resume button.
    var videoPreOrPost;
	var videoMgr = {};
	var isPausedBetweenSlides;
	var vcrWid;

	var type, metatype;

	// Determine a whiteboard container width, based on whiteboard type.
	// The height is fixed, so the width will vary to maintain the aspect ratio.
	// Some WBs also have a border, which must be accounted for here as well.
	var wbWidths = {
		wb: 821 + app.style.whiteboard.borderWidth*2,
		sum: 821 + app.style.whiteboard.borderWidth*2,
		defaultType: Math.round(590 * 1.33333333)		// Full-screen videos
	}

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container) {
		app.containerColor('Stage', '#0D5065');
		fw.setLayout('Whiteboard');
		app.loadingBox();

		type = app.curObject.t;
		metatype = app.curObject.mt;

		if (!videoInList())
			loadData();
		else
			alreadyLoaded();
	}

	//=======================================================
	// The data files are already loaded.  Keep it simple.
	//=======================================================
	function alreadyLoaded()
	{
		// Set the video index based on the current video
		videoMgr.ndx = findVideo();

		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noStatus: true}), drawList));
		setParams(vw.drawList);
	}

	//=======================================================
	//
	//=======================================================
	function loadData()
	{
		var dl = app.globalDrawList({noStatus: true});
		vw.drawList = fw.drawList(dl);

		//app.setVideoUrls([app.curObject, app.curObject], true);
		app.setVideoUrls([app.curObjName], true);

		videoMgr.ndx = 0;		// If we're loading, only a single whiteboard will be visible.  This is safe.

		// @FIXME/dg: This is a terrible hack!  I need something working immediately.
		if (type === 'appsec' || metatype === 'singlevideo')
			loadComplete();
	}

	//=======================================================
	// Data files have been loaded.  Add the whiteboard widgets
	//
	// NOTE: Currently, this is reached on success OR failure!
	//=======================================================
	function loadComplete()
	{
		var dl = fw.drawList(drawList);
		setParams(dl);
		fw.createScreen(dl);

		initVcrControls();
	}

	//=======================================================
	//
	//=======================================================
	function setParams(dl)
	{
		dl.setParam('whiteboard', 'videoList', videoMgr.list);
		dl.setParam('whiteboard', 'videoNdx', videoMgr.ndx);
		dl.setParam('whiteboard', 'type', type);	// @FIXME/dg: Pass through an API!  But we want type, not metatype.
		dl.setParam('whiteboard', 'w', getWbWidth());
		dl.setParam('whiteboard', 'h', getWbHeight());
	}

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {

		whiteboard: [
			'whiteboard', 'whiteboard', {
				pauseNotify: isPaused,
				playNotify: isPlaying,
                waitNotify: isWaiting,
                lastSlideNotify : lastSlide,
                firstSlideNotify : firstSlide,
                moreSlidesNotify : moreSlides,
                earlierSlidesNotify : earlierSlides,
				endedNotify: hasEnded
			}
		],

		vcrControls: [
			'vcrControls', 'vcrControls', {
				depth: 3,
				image: 'VCRControls',
				controls: {
					replay: { name: 'WBReplayBackNext', frame: 'Replay', xOfs: 2, yOfs: 6, action: videoReplay},
					back: { name: 'WBReplayBackNext', frame: 'Back', xOfs: 30, yOfs: 6, action: videoBack},
					pausePlay: { name: 'WBPlayPause', frame: 'Play', altFrame: 'Pause', xOfs: 59, yOfs: 2, action: videoPause},
					next: { name: 'WBReplayBackNext', frame: 'Next', xOfs: 93, yOfs: 6, action: videoNext }
				}
			}
		]
	};


	//=======================================================
	// READY function
	//=======================================================
	vw.ready = function()
	{
		app.globalUIInit();
		initVcrControls();
	}

	//=======================================================
	// This occurs after the view is ready.  The data files haven't necessarily been loaded.
	//=======================================================
	function initVcrControls()
	{
		vcrWid = fw.getWidget('vcrControls', true);

		// @FIXME/dg: This is getting out of hand.  Create a simple behavior table.
		// Also, encapsulate the button enable/disable/frame control inside simple
		// behavior-based functions!
		if (vcrWid)
		{
			if (isApplication() || metatype === 'singlevideo') {
				vcrWid.setFrame('pausePlay', 'Play');
				vcrWid.enable('pausePlay');
			}
			else {
				vcrWid.disable('pausePlay');
			}

			if (videoMgr.ndx === 0 || isApplication())
				vcrWid.disable('back');
			else
				vcrWid.enable('back');

			// Disable the Next button if we're on the final video in the section.
			// This is necessarily the case for singlevideo metaTypes.
			// if (isApplication() || videoMgr.ndx + 1 === videoMgr.loadCount)
			if ( (videoMgr.ndx + 1 === videoMgr.loadCount) || isApplication() )
				vcrWid.disable('next');
		}
	}

	//=======================================================
	// CLOSE function
	//
	// @FIXME/dg: This routine gets missed sometimes (very rarely)
	// Missing it is semi-fatal though!  It causes resource leaks.
	//=======================================================
	vw.close = function()
	{
		fw.abortAsync();
	}

	//=======================================================
	// Width needs to vary to maintain the aspect ratio for
	// various types of whiteboards
	//=======================================================
	function getWbWidth()
	{
		var width = wbWidths[type] || wbWidths.defaultType;
        return width;
	}

	//=======================================================
	//
	//=======================================================
	function getWbHeight()
	{
		var wbHeight = 600-10;	// Fixed height for the container
        return wbHeight;
	}

	//=======================================================
	//
	//=======================================================
	function videoBack()
	{
        fw.getWidget('whiteboard').back();
	}

	//=======================================================
	//
	//=======================================================
	function videoNext()
	{
        fw.getWidget('whiteboard').next();
	}

	//=======================================================
	//
	//=======================================================
	function videoPause()
	{
		fw.getWidget('whiteboard').pause();
	}

	//=======================================================
	//
	//=======================================================
	function videoResume()
	{
		fw.getWidget('whiteboard').resume();
	}

	//=======================================================
	//
	//=======================================================
	function videoReplay()
	{
		fw.getWidget('whiteboard').replay();
	}

	//=======================================================
	//
	//=======================================================
	function isPaused()
	{
		isPausedBetweenSlides = arguments && arguments[0];
        if (videoPreOrPost)
		{
			vcrWid.setFrame('pausePlay', 'Pause');
			vcrWid.disable('pausePlay');
		}
        else
		{
		// if not isPausedBetweenSlides, toggle between Pause and Resume buttons.
            if (!isPausedBetweenSlides)
			{
				vcrWid.setFrame('pausePlay', 'Play');
				vcrWid.enable('pausePlay');
			}
        }
	}

	//=======================================================
	//
	//=======================================================
	function isPlaying()
	{
		if (vcrWid)
		{
			vcrWid.enable('pausePlay');
			vcrWid.setFrame('pausePlay', 'Pause');
			isPausedBetweenSlides = false;
			videoPreOrPost = false;
		}
	}

	//=======================================================
	//
	//=======================================================
	function isWaiting()
	{
        videoPreOrPost = true;
    }

	//=======================================================
	//
	//=======================================================
	function hasEnded()
	{
        videoPreOrPost = true;
		isPaused();
		vcrWid.enable('replay');
	}

	//=======================================================
	//
	//=======================================================
	function earlierSlides()
	{
		vcrWid && vcrWid.enable('back');
	}

	//=======================================================
	//
	//=======================================================
	function moreSlides()
	{
		vcrWid && vcrWid.enable('next');
	}

	//=======================================================
	//
	//=======================================================
	function lastSlide()
	{
		vcrWid && vcrWid.disable('next');
	}

	//=======================================================
	//
	//=======================================================
	function firstSlide()
	{
		vcrWid && vcrWid.disable('back');
	}

	//=======================================================
	//
	//=======================================================
	function findVideo()
	{
		if (videoMgr.list)
		{
			for (var i = 0, len = videoMgr.list.length; i < len; i++)
			{
				if (videoMgr.list[i].obj.df[0] == app.curObject.df[0])	// @FIXME/dg: Fetch this from BookDefinition.js
					return i;
			}
		}

		return -1;
	}

	//=======================================================
	//=======================================================
	function videoInList()
	{
		var idx = findVideo();
		return (idx !== -1);
	}

	//=======================================================
	//=======================================================
	function makeVideoUrl(obj, dataFile)
	{
		if (app.getObjType(obj) === 'appsec')
			var url = app.getVideoPath(obj) + dataFile;	// Keep the extension
		else
			url = app.getVideoPath(obj) + dataFile.substr(0, dataFile.indexOf('.'));	// Strip the extension (videos can be different types -- extension is chosen by platform)

		return url;
	}

	//=======================================================
	// Loads the datafiles for a set of whiteboards
	// This can either get called internally (via direct link or application problems)
	// or by sectionText to preload the files.
	// Set isBlocking to true if the view can't complete until
	// the files are successfully loaded.
	//
	// objs:  array of object names
	//=======================================================
	app.setVideoUrls = function(objs, isBlocking)
	{
		videoMgr.list = [];
		videoMgr.loadCount = 0;

		// Construct the list and load all of the data files now
		// @FIXME/dg: Note that we have no mechanism in place to ensure data is loaded before it is used!
		// This will break! (And does)
		$.each(objs, function(idx, objName) {

			var obj = app.objectList[objName];	// @FIXME/dg: Operating with the object directly is BAD!
			var dfList = app.getDataFiles(objName);

			for (var i = 0, len = dfList.length; i < len; i++)
			{
				// Only name and video are used in the whiteboard widget
				// obj is used in this module, but only to look up the datafile
				// data is (was) used immediately below, but is otherwise unused
				var item = {
					video: makeVideoUrl(obj, dfList[i]),
//					data: app.getWbPath(obj) + dfList[0],	// Load the first file? Does this make sense? I think it's assuming there is always one data file.
					obj: obj,
//					type: app.getObjType(obj, true),
					name: objName
				};

				// Add it to the list
				videoMgr.list.push(item);

				// Preload it, if possible
				if (isDataLoadable(obj))
					preloadData(app.getWbPath(obj) + dfList[i], idx, isBlocking);
			}
		});
	}

	//=======================================================
	// urls:  array of object references
	//=======================================================
	function isDataLoadable(obj)
	{
		var type = app.getObjType(obj);

		// appsec has datafiles, but no json files
		if (!obj.df[0] || type === 'activity' || type === 'appsec' || type === 'singlevideo')
			return false;

		return true;
	}

	//=======================================================
	// Preload the section data files
	// url: absolute path to the data file
	// ndx: the array index of url
	//=======================================================
	function preloadData(url, ndx, isBlocking)
	{
		// Will probably want to use a factory with object pooling to make a new model.
        var model = app.wbModelArr[ndx];
		if (!model) return;

		model.clear();	// Wipe everything out
		model.url = url;

		// This is crazy, but treat an error as success.  Let the rest of the code deal with missing data.
		// Note that this is called in parallel, once for each data file, instead of occurring in bulk.
		model.fetch().always(function(){dataLoaded(isBlocking)});
	}

	//=======================================================
	//=======================================================
	function dataLoaded(isBlocking)
	{
		videoMgr.loadCount++;

		// Use the callback when everything is loaded
		if (videoMgr.loadCount >= videoMgr.list.length)
		{
			if (isBlocking)
				loadComplete();
		}
	}

	//=======================================================
	// Currently broken
	//=======================================================
	app.isActivityWhiteboard = function()
	{
		type = app.curObjType();
		return type == 'actwb';	// Ideally this will be cleaned up
	}

	//=======================================================
	// Check for object of Application type, which will use a slightly modified Activity Whiteboard layout.
	//=======================================================
	function isApplication()
	{
		var type = app.curObjType(app.curObject);
//		console.log('type ', mt, t, type, gettype);

		return type == 'appsec';
	}

})();
