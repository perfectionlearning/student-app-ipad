//===============================================================================
// Arguments:
//  id
//  x, y, w, h
//  hidden: Optional
//  depth: Optional
//
// Style: (whiteboard)
//	bgColor: Background color (border around the video)
//	borderWidth: width of the border around the video
//	borderHeight: height of the border around the video
//	titleHeight: box height
//	titleFont: font used for title text
//	titleColor: color of title text
//	titleHmargin: space between the left edge of the video and the title
//	titleVmargin: space between the title and the top of the title box
//	textBoxHeight: text box height
//	textFont: font used by slide text
//	textColor: slide text color
//	textHmargin: Space between the left edge of the text box and the headline
//	textVmargin: Space between the text and the top of the text box
//	bulletVMargin: Space between the header and the bullets
//===============================================================================
framework.widget.whiteboard = function()
{
	var that = this;
	var style = app.style.whiteboard;

	// Essentially, no limit to bullet points that can be displayed.
	var EliminatePauseButton = true;
	var playing = false;
    var videoStarted = false;
	var justLoaded = true;
	var goToLastSlide = false;
	var lastMarker = [];
    var curModel;
	var slidesArray; // store slides in local variable rather than retrieving from model each time.
	var duration = null;
	var isPausedBetweenSlides = false;
	var treatReplayAsBack = false; // for when paused between slides.

	var ftSlideNdx = 0;

	var gui;	// Fixed widgets

    var lastNdx = -1;

	// A map to check whether a given WB type has text associated with it
	var hasData = ['wb', 'actwb', 'sum'];

	// Listen for certain events
	initEvents();
	app.loadingBox();

	//=======================================================
	//
	//=======================================================
	function initEvents()
	{
		fw.eventSubscribe('pause:video', isPaused);
		fw.eventSubscribe('play:video', isPlaying);
		fw.eventSubscribe('seeked:video', hasSeeked);
		fw.eventSubscribe('ended:video', hasEnded);

		fw.eventSubscribe('ready:video', loadDone);
		fw.eventSubscribe('loadFail:video', loadFailed);
	}

	//=======================================================
	// Select next video to load.
	//=======================================================
	function nextVideo(direction)
	{
        if (direction == -1 && that.videoNdx > 0) {
            that.videoNdx--;
            if (that.videoNdx == 0)
                goToLastSlide = true;
	        setVideo(that.videoNdx);

			// changeContext, because the next video may require a different whiteboard.
			// @FIXME/dg: Major architectural violation.
			app.linkToObject(that.videoList[that.videoNdx].name);

        }
        else if (direction == 1 && that.videoNdx < that.videoList.length - 1) {
            that.videoNdx++;

			// This section is BAD!
			if (app.curObjType() !== 'appsec')		// @FIXME/dg: Major hack
				app.linkToObject(that.videoList[that.videoNdx].name);	// @FIXME/dg: Major architectural violation.
			else
			{
		        setVideo(that.videoNdx);		// Only used for application videos (hack!)
				that.firstSlideNotify();			// @FIXME/dg: Major hack
			}
        }
		// If neither condition is met, don't set a video.
    }

	//=======================================================
	// Load the whiteboard data file
    // This should only happen if data weren't already loaded in sectionText
	//=======================================================
	function loadData(idx)
	{
		// curModel should have already been loaded (SectionText.js preloadData)
		successLoadData();
	}

	//=======================================================
	// Error handling
	//=======================================================
    function failureLoadData(model, xhr, options)
    {
        console.log('Video data not available; using generic data instead.');
        var data = [
			{
				bullets: [],
				headlines: [],
				markerName: '',
				narrations: [],
				time: 0
			}
		];

        model.set('Title', '');
        model.set('Slides', data);
    }

	//=======================================================
	// Initial processing, once data file is loaded.
	//=======================================================
    function successLoadData()
    {
		errorHandler(curModel.get('Errors'));

        var title = curModel.get('Title');
        gui.setTitle(title);
		slidesArray = curModel.get('Slides') || []; // default to empty array to accommodate Application.  If slidesArray is not defined, video will not play.
		if (!slidesArray)
			return failureLoadData(curModel);

        if (!defined(lastMarker[that.videoNdx])) {
			var lastSlideNdx = slidesArray.length - 1;
			lastMarker[that.videoNdx] = 0;
			// set the last marker for this video; if no slides, default to 0.
			if (slidesArray[lastSlideNdx]) {
				lastMarker[that.videoNdx] = slidesArray[lastSlideNdx].time;
			}
        }

		// This seems a good place to disable the "next" button if this is the last video and the slides array is empty.
		if (that.videoNdx + 1 == that.videoList.length && slidesArray.length == 0)
			that.lastSlideNotify && that.lastSlideNotify();
        curTime();
    }

	//=======================================================
	// Given a slide index, display the slide content.
    // ndx: zero-based index of slide within Slides array.
	//=======================================================
    function showSlide(slideNdx)
    {
        var slide = slidesArray && slidesArray[slideNdx];
        // status of Next button.
		// Disable Next button if:
		// 1) This is the last video in the section and the slides array is empty, or
		// 2) This is the last video and this is the last slide.
		// Note that because showSlide is only called at the beginning of a video meeting the first
		// criterion, it is necessary to also perform this check periodically; therefore, in curTime.
		// Also note:  with condition 1) being checked in curTime, it really isn't necessary to check
		// here, as well.  However, it remains here, in case the condition in curTime is removed in
		// favor of a better approach.
		//if ((slidesArray.length == 0 || slideNdx + 1 == slidesArray.length) && that.videoNdx + 1 == that.videoList.length) {
        //    that.lastSlideNotify && that.lastSlideNotify();
		//}
        //else
        //    that.moreSlidesNotify && that.moreSlidesNotify();

        // status of Back button.
		// Disable Back button if first slide of first video.
		// New (13/2/6):  Disable Back button if anywhere in first video.
//        if (slideNdx == 0 && that.videoNdx == 0) {
        if (that.videoNdx == 0) {
            that.firstSlideNotify && that.firstSlideNotify();
        }
        else
            that.earlierSlidesNotify && that.earlierSlidesNotify();

		if (slide) {
        // set actual slide content.
			// multiple elements are possible in the headlines array; if so, separate with an HTML line break.
			var headline = slide.headlines && slide.headlines[0] ? slide.headlines.join('<br/>') : '';
			gui.setHeadline(headline);
			// use slide.bullets if non-empty array exists; otherwise, use empty array.
			// this makes it easy to test with arbitrary array data, if array is empty.
			var bullets = slide.bullets && slide.bullets.length > 0 ? slide.bullets : [];
			gui.setBullets(bullets);

			if (app.FunctionalTestMode) {
				// Not only in Functional Test mode but within a test frame.
				if (parent && parent.ft && parent.ft.uitest) {
					ftSlideNdx += 1;
					ftData = { testName: 'Slide ' + ftSlideNdx };
					if (ftSlideNdx < slidesArray.length) {
						app.globalReadyForFunctionalTest(ftData);
		                showSlide(ftSlideNdx);
					}
					else {
						ftData.next = true;
						app.globalReadyForFunctionalTest(ftData);
					}
				}
			}


		}
    }

	//=======================================================
	// Find slide for current seconds; do not redisplay same slide.
    // Takes an optional argument:
    // 1: move to the next slide. ("Next" button)
    // 0: move to the beginning of the current slide. ("Replay" button)
    // -1: move to the beginning of the previous slide. ("Back" button)
	//=======================================================
    function findSlide()
    {
        if (!videoStarted && hasData.indexOf(that.type) !== -1) { return; } // videoStart is false until the slides JSON data are loaded.

		if (!duration) { duration = gui.videoDuration(); }
        var slideOffset = null;
        if (arguments.length == 1) {
			if (arguments[0] == 'seeked')
				var fromSeeked = true;
			else if (arguments[0] == 'replay') {
				// set replayButton flag, and also set slideOffset to 0 for its default.
				var replayButton = true;
				slideOffset = 0;
			}
			else if (Math.abs(arguments[0]) <= 1 || arguments[0] == 99)
				slideOffset = arguments[0];
        }

        var t = gui.vidCurrentTime();

        if (goToLastSlide) {
            t = lastMarker[that.videoNdx] / 1000;
            slideOffset = 0;
        }

//        var slides = curModel.get('Slides');
        var showNdx = slidesArray.length == 0 ? 0 : -1;  // if no slides, set showNdx to 0.
        var slideTransitionPause = false;
        var markers = [];

        // get list of time markers and the one that's the best match for the current time.
        $.each(slidesArray, function(ndx, s) {
			// adjusting the startTime by 750 because that's what seems to work with the scuba video.
			// In theory, there should not need to be any adjustment here, as startTime should be
			// the correct position at which to begin the slide.  However, using just startTime seems
			// to resume play a hair into the narration.
			var markerMs = s.startTime == 0 ? 0 : (s.startTime) / 1000;
			// Store marker value exactly as it is in the JSON file, though in seconds.
			// This is so the next button will take us to the point stored in the JSON file.
            if (markerMs < duration) markers.push(markerMs);  // add marker only if within video duration.
			// To get pause point, adjust the JSON value by one second.
			//var endTime = (s.startTime - 1000) / 1000;
			// When we disabled the Pause button, the timing was thrown off; so reducing the one-second offset.
			var endTime = (s.startTime - 250) / 1000;
            if (t >= endTime) {
                showNdx = ndx; // showNdx: index of slide text content to display
            }
        });


		var noPauseMarkers = markers.slice(0, 1);
		if (EliminatePauseButton) {
			var markersToUse = noPauseMarkers;
			var showNdxToUse = 0;
		}
		else {
			markersToUse = markers;
			showNdxToUse = showNdx;
		}

        // if responding to back or next button, go to the appropriate marker, and show slide.
        if (slideOffset !== null) {
            gui.setHeadline('');
            gui.setBullets([]);
			// Replay button
			if (replayButton) {
				if (treatReplayAsBack) slideOffset -= 1;
				var goToTime = markersToUse[showNdxToUse + slideOffset] || 0;
                gui.vidCurrentTime(goToTime);
                lastNdx = showNdxToUse + slideOffset;
                showSlide(showNdxToUse + slideOffset);
			}
			// Next or Back button
            else if (showNdxToUse + slideOffset >= 0 && showNdxToUse + slideOffset < markersToUse.length) {
				goToTime = markersToUse[showNdxToUse + slideOffset] || 0;
	            goToLastSlide = false;
                gui.vidCurrentTime(goToTime);
                lastNdx = showNdxToUse + slideOffset;
                showSlide(showNdxToUse + slideOffset);
            }
            else {
                // advance to next video, or go back to previous one.
                nextVideo(slideOffset);
            }
			treatReplayAsBack = false; // reset this flag if the replay, back, or next button is clicked.
        }

		// else if responding to manual position change
        else if (fromSeeked && showNdx > -1) {
			treatReplayAsBack = false; // reset this flag if position manually changed.
            lastNdx = showNdx;
            showSlide(showNdx);
        }

        // else if responding to timeupdate check
        else if (showNdx != -1 && showNdx != lastNdx) {
            lastNdx = showNdx;
            // display text content for slide at or before current time position.
            // need to figure out a way to not do this if arrived at transition during normmal play.
            slideTransitionPause = showNdx > 0;
            if (!slideTransitionPause) {
                showSlide(showNdx);
			}
        }

		// make sure back button gets disabled on first slide.
		// New (13/2/6): Disable Back button anywhere in first video.
//		else if (showNdx == 0 && that.videoNdx == 0) {
		else if (that.videoNdx == 0) {
            that.firstSlideNotify && that.firstSlideNotify();
		}

        return slideTransitionPause;
    }

	//=======================================================
	// Error handler routine
	//=======================================================
	function errorHandler(errList)
	{
		var err = errList ? errList[0] : null;
		if (err === 'ERROR: Keyframe count does not match cell count.')
			err = "ERROR: Camtasia marker count doesn't match Word slide count";

		if (!defined(errList) || errList.length < 1)
			return;

		if (headline) {
			that.add('text', {
				text: err,
				color: 'red',
				font: '26px Arial',
				depth: fw.TOP
			},
			{
				wid: headline,
				at: 'top left',
				my: 'top left',
				ofs: '-30 25'
			});
		}
	}

//===============================================================================
// Event handlers
//===============================================================================

	//=======================================================
	// Received notification that the video is paused
	//=======================================================
	function isPaused()
	{
		playing = false;
		// Tell the outside world
		that.pauseNotify && that.pauseNotify(isPausedBetweenSlides);
		isPausedBetweenSlides = false;
	}

	//=======================================================
	// Received notification that the video is playnig
	//=======================================================
	function isPlaying()
	{
		playing = true;

		// Tell the outside world
		that.playNotify && that.playNotify();
	}

	//=======================================================
	// Check timeupdate; believed to happen four times a second
	//=======================================================
    function curTime()
    {
		var vid = gui.getVideo();

		if (!vid) {
			// If vid isn't defined, it's probably because JSON files didn't load.
			// This will allow the video to play, though without text.
//			errorHandler(['Error loading data.  JSON file may be missing.']);
			return;
		}

        // before starting the slide show,
        if (!videoStarted) {
            // check that the JSON slide data loaded; pause if not.
            if (!slidesArray) {
                that.waitNotify && that.waitNotify();
                vid.pause();
                return;
            }
			if (justLoaded && hasData.indexOf(that.type) === -1) {
				justLoaded = false;
				vid.pause();
				return;
			}
            // data loaded: resume play.
            vid.resume();
            videoStarted = true;
        }

		// Special case for disabling Next button: single slide in final video; e.g., Summary.
		// The usual check for disabling Next (in showSlide) doesn't work in this case,
		// because showSlide is called only before the Next button is available to be disabled.
		// Two downsides of calling lastSlideNotify from here:
		// 1) The call is also made in showSlide,
		// 2) The call is made even when Next has already been disabled.
		//    The disable method (framework/button.js) does not return a value; therefore,
		//    the Whiteboard does not know whether the call to disable had the desired visual
		//    effect.  An early attempt to disable the button will succeed; however, the program
		//    does not receive a notification of this.  Hence the continued calls.
		if (slidesArray.length == 0 && that.videoNdx + 1 == that.videoList.length) {
			that.lastSlideNotify && that.lastSlideNotify();
		}

        // findSlide returns true if the next slide is encountered during play.
        if (findSlide()) {
			if (EliminatePauseButton) {
				findSlide('seeked');
				return;
			}
			else {
				isPausedBetweenSlides = true;
				treatReplayAsBack = true;

	            vid.pause();

			// @FIXME/dg: This widget can't know about other non-child widgets!
			// This should use a callback or event instead!
			    var pb = fw.getWidget('pauseButton');
	            pb && pb.disable(2);
			}
        }
    }

	//=======================================================
	// Received notification of manual seek
	//=======================================================
    function hasSeeked()
    {
        findSlide('seeked');
        gui.videoResume();
    }

	//=======================================================
	// Received notification that the video has ended
	//=======================================================
	function hasEnded()
	{
		playing = false;

		gui.videoStop();		// The video is still considered to be playing, even though it has ended.  Force the issue!

		// Tell the outside world
		that.endedNotify && that.endedNotify();
	}

	//=======================================================
	// The video has loaded enough to start playing
	//=======================================================
	function loadDone()
	{
		app.clearLoadingBox();
	}

	//=======================================================
	// The video failed to load
	//
	// This is a data file load failure rather than a REST failure.
	// No 403 check is required.
	//=======================================================
	function loadFailed()
	{
		app.loadFailed('video');
	}

	//=======================================================
	//=======================================================
	function setVideo(idx)
	{
		// @FIXME/dg: This should have been passed in!
        curModel = app.wbModelArr[idx];
		var url = that.videoList[idx].video;
        that.videoNdx = idx;
        videoStarted = false;
		duration = null;

        // Models should have been loaded in sectionText, allowing this setVideo to just choose one
        //    without having to reload it.
        if (curModel.get('Title') || curModel.get('Slides') || hasData.indexOf(that.type) === -1) {
		    gui.createVideo(url);
            successLoadData();
        } else {
		    // Load the data file.  Start it before the video since we'd really prefer to have it loaded
    		// by the time the video is ready
      		loadData(idx);
		    gui.createVideo(url);
        }
	}

//===============================================================================
// Video Control API
//===============================================================================

	//=======================================================
	// A play or pause request was received
	//=======================================================
	this.pause = function()
	{
		if (playing)
			gui.videoPause();
		else
			gui.videoResume();
	}

	//=======================================================
	//=======================================================
	this.replay = function()
	{
		// was passing 0; changed to replay to avoid confusion with "next" button
		findSlide('replay');
	}

	//=======================================================
	//=======================================================
    this.next = function()
    {
		// 2013/2/21 - if Next button clicked, advance to next video unconditionally
		findSlide(1);
    }

	//=======================================================
	//=======================================================
    this.back = function()
    {
		// if Back button clicked, Next should be enabled.
		// This assumes Back button goes to beginning of previous slide,
		// not beginning of current slide or, if at a pause, to beginning of slide just finished.
		that.moreSlidesNotify && that.moreSlidesNotify();
        findSlide(-1);
    }

//===============================================================================
// Standard widget API
//===============================================================================

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		// Set the type and create the widgets
		gui = that.add('wbContainer', {
			type: that.type,
			firstVid: !(that.videoNdx > 0),
			timerUpdate: curTime,
			nextFunc: that.next			// This feels messy, but we need to let the gui know what to do when the application Next button is pressed
		}, fw.dockTo(that));

		// A docking routine isn't required.  However, we do need to ensure that the entire
		// module has been loaded before running setVideo.  We could either place the setVideo
		// call at the very end, or just use a docked routine.
		if (that.videoNdx !== null)
			setVideo(that.videoNdx);
	}

	//=======================================================
	//=======================================================
	this.terminateSelf = function()
	{
		fw.eventUnsubscribe('pause:video', isPaused);
		fw.eventUnsubscribe('play:video', isPlaying);
		fw.eventUnsubscribe('ended:video', hasEnded);
		fw.eventUnsubscribe('seeked:video', hasSeeked);
		fw.eventUnsubscribe('timeupdate:video', curTime);
		fw.eventUnsubscribe('ready:video', loadDone);
		fw.eventUnsubscribe('loadFail:video', loadFailed);
	}

};
