//===========================================================================================
// Low-level video support
//
//===========================================================================================
(function() {

	var disableCaching = false;

	//=======================================================
	// Adds a video element
	//
	// Object Fields:
	//	id		// Optional -- will be randomly generated if one isn't supplied
	//	x		// Required
	//	y		// Required
	//	w		// Required
	//	h		// Required
	//  url		// Required -- The video to play
	//  autoplay	// Optional (default true) -- Play the audio immediately
	//	depth	// Optional: z-index
	//	hidden	// Optional
	//	cursor	// Optional
	//	alpha	// Optional
	//	type	// Optional -- Non-unique ID -- Maps to 'class' in the DOM model
	//=======================================================
	framework.prototype.drawVideo = function(obj)
	{
		var id = obj.id || fw.randomID();
		fw.normalize(obj);

		// If the element already exists, the old one will be orphaned. -- This will leave duplicate elements in the DOM!
		fw.registerObject(id);

		var style = {
			left: obj.x + 'px',
			top: obj.y + 'px',
			width: obj.w + 'px',
			height: obj.h + 'px',
			zIndex: obj.depth,
			opacity: obj.alpha,
			borderWidth: obj.borderWidth,
			borderColor: obj.borderColor,
			cursor: obj.cursor
		};
		if (defined(obj.hidden))
			style.display = 'none';

		// The outer div controls the position and depth (these are ignored in the video tag)
		var div = $('<div></div>').attr({
			id: id,
			'class': obj.type
		}).css(style);

		// The video tag requires width, height, and a controls setting
		var vidAttribs = {
			width: obj.w,
			height: obj.h,
		};

		if (obj.controls)
			vidAttribs.controls = "controls";

		// Check for autoplay option
		if (!defined(obj.autoplay) || obj.autoplay != false)
			vidAttribs['autoplay'] = "autoplay";

		var video = $('<video></video>').attr(vidAttribs);

		var cacheString = disableCaching ? '?t=' + new Date().getTime() : '';

		// The source tag(s) contain the URL and type of video
		var source1 = $('<source></source>').attr({
			src: obj.url + '.mp4' + cacheString,
			type: "video/mp4"
		});

		// The source tag(s) contain the URL and type of video
		var source2 = $('<source></source>').attr({
			src: obj.url + '.webm' + cacheString,
			type: "video/webm"
		});

		// Wacky append chaining
		video.append(source1).append(source2);
//		video.append(source2);
		obj.container.append(div.append(video));

		video.on('pause', null, paused);
		video.on('play', null, played);
		video.on('seeking', null, seeking);
		video.on('seeked', null, seeked);
		video.on('ended', null, ended);
		video.on('canplay', null, ready);
		source1.on('error', null, error);
		source2.on('error', null, error);

        if (obj.timeUpdate)
            video.on('timeupdate', null, obj.timeUpdate);

		return div;
	};

	//=======================================================
	// The video was paused, or in some cases was completed
	//=======================================================
	function paused()
	{
		fw.eventPublish('pause:video');
	}

	//=======================================================
	// The video was paused, or in some cases was completed
	//=======================================================
	function played()
	{
		fw.eventPublish('play:video');
	}

	//=======================================================
	// The video is about to seek
	//=======================================================
	function seeking()
	{
		fw.eventPublish('seeking:video');
	}

	//=======================================================
	// The video was seeked
	//=======================================================
	function seeked()
	{
		fw.eventPublish('seeked:video');
	}

	//=======================================================
	// The video has ended
	//=======================================================
	function ended()
	{
		fw.eventPublish('ended:video');
	}

	//=======================================================
	// The video has ended
	//=======================================================
	function ready()
	{
		fw.eventPublish('ready:video');
	}

	//=======================================================
	// Any error has occurred.  We want to filter this
	// down to ones we care about.
	//=======================================================
	function error(ev)
	{
		// Errors fire on individual <source> elements, not the parent <video> element
		// However, the network state is only available on the <video> element
		var el = ev.currentTarget.parentNode;
		if (el.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)
			fw.eventPublish('loadFail:video');
	}

	//=======================================================
	//=======================================================
	framework.prototype.videoTerminate = function(el)
	{
		if (fw.verifyObject(el, 'Terminating video in'))
		{
			var vidEl = el.children('video')[0];
			if (vidEl)
			{
				vidEl.pause();
//				vidEl.src = "";		// This was causing a Firefox warning
			}
		}
	}

	//=======================================================
	//=======================================================
	framework.prototype.videoPause = function(el)
	{
		if (fw.verifyObject(el, 'Pausing video in'))
		{
			var vidEl = el.children('video')[0];
			vidEl && vidEl.pause();
		}
	}

	//=======================================================
	//=======================================================
	framework.prototype.videoResume = function(el)
	{
		if (fw.verifyObject(el, 'Resuming video in'))
		{
			var vidEl = el.children('video')[0];
			vidEl && vidEl.play();
		}
	}

	//=======================================================
	//=======================================================
	framework.prototype.videoStop = function(el)
	{
		if (fw.verifyObject(el, 'Stopping video in'))
		{
			var vidEl = el.children('video')[0];
			vidEl && vidEl.pause();
		}
	}

	//=======================================================
	//=======================================================
	framework.prototype.videoCurrentTime = function(el)
	{
		if (fw.verifyObject(el, 'Querying video in'))
		{
			var vidEl = el.children('video')[0];
			if (vidEl)
			{
				if (arguments.length == 2)
				{
					if (vidEl.readyState > 0)
						vidEl.currentTime = arguments[1];
					else
					{
						vidEl.startAt = arguments[1];
						vidEl.oncanplay = function() { this.currentTime = this.startAt; this.oncanplay = null; };
					}
				}
				else
					return vidEl.currentTime;
			}
		}
	}

	//=======================================================
	//=======================================================
	framework.prototype.videoDuration = function(el)
	{
		if (fw.verifyObject(el, 'Querying video in'))
		{
			var vidEl = el.children('video')[0];
			return vidEl && vidEl.duration;
		}
	}

})();
