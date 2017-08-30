//===========================================================================================
// Low-level image handlers
//
//===========================================================================================
(function() {

	//=======================================================
	//
	//=======================================================
	function getRepeat(rep)
	{
		if (!defined(rep))
			return 'no-repeat';

		switch (rep.toLowerCase())
		{
			case 'x':
				return 'repeat-x';
			case 'y':
				return 'repeat-y';
			case 'xy':
				return 'repeat';
			default:
				return 'no-repeat';
		}
	}

	//=======================================================
	// Draw an image.  Supports frames but not scaling.
	//
	// Object Fields:
	//	id		// Optional -- will be randomly generated if one isn't supplied
	//	image	// Required -- Resource ID of image to use
	//	x		// Required
	//	y		// Required
	//	frame	// Optional
	//	depth	// Optional: z-index
	//	repeat	// Optional: x, y, xy
	//	w		// Optional: only useful if using a horizontal repeat
	//	h		// Optional: only useful if using a vertical repeat
	//	cursor	// Optional
	//	alpha	// Optional
	//	type	// Optional -- Non-unique ID -- Maps to 'class' in the DOM model
	//	url		// Optional -- For dynamic images.  URL of image.  If this is supplied, h and w are required.
	//=======================================================
	framework.prototype.draw = function(obj)
	{
		var id = obj.id || fw.randomID();
		fw.normalize(obj);

		// If the element already exists, the old one will be orphaned. -- This will leave duplicate elements in the DOM!
		fw.registerObject(id);

		var fr = Math.floor(obj.frame || 0);	// Should be safe.  If frame is 0, it will use the second clause rather than the first, but they are identical
		var url = obj.url || fw.assetPath(obj.image);

		var w = defined(obj.w) ? obj.w : fw.assetWidth(obj.image);
		var h = defined(obj.h) ? obj.h : fw.assetHeight(obj.image);
		var backgroundX = obj.atlasData ? -(fr*w+obj.atlasData.x) : -(fr*w);
		var backgroundY = obj.atlasData ? -(obj.atlasData.y) : 0;

		if (obj.scale)
			var scale = "scale(" + obj.scale + ")";

		var style = {
			left: obj.x + 'px',
			top: obj.y + 'px',
			backgroundImage: 'url(' + url + ')',
			backgroundPosition: backgroundX + 'px ' + backgroundY + 'px',
			width: w,
			height: h,
			zIndex: obj.depth,
			cursor: obj.cursor,
			opacity: obj.alpha,

			transform: scale,
			transformOrigin: obj.origin,

			// BORDER
			borderWidth: obj.borderWidth,
			borderColor: obj.borderColor
		};
		if (defined(obj.repeat))
			style.backgroundRepeat = getRepeat(obj.repeat);

		if (defined(obj.hidden))
			style.display = 'none';

		var el = $('<div></div>');
		el.attr({id: id, 'class':obj.type}).css(style).appendTo(obj.container);

		if (app.FunctionalTestMode)
			el.attr({'data-ft': obj.funcTest});

		return el;
	};

	//=======================================================
	// Draw an image.  Supports scaling but not frames.
	//
	// Object Fields:
	//	id		// Optional -- will be randomly generated if one isn't supplied
	//	image	// Required -- Resource ID of image to use
	//	x		// Required
	//	y		// Required
	//	depth	// Optional: z-index
	//	w		// Optional
	//	h		// Optional
	//	cursor	// Optional
	//	alpha	// Optional
	//	type	// Optional -- Non-unique ID -- Maps to 'class' in the DOM model
	//	url		// Optional -- For dynamic images.  URL of image.  If this is supplied, h and w are required.
	//=======================================================
	framework.prototype.drawDynamicImage = function(obj)
	{
		var id = obj.id || fw.randomID();
		fw.normalize(obj);

		// If the element already exists, the old one will be orphaned. -- This will leave duplicate elements in the DOM!
		fw.registerObject(id);

		var fr = Math.floor(obj.frame || 0);	// Should be safe.  If frame is 0, it will use the second clause rather than the first, but they are identical
		if (!defined(obj.url))
			var w = fw.assetWidth(obj.image);
		else
			var w = obj.w;
		var url = obj.url || fw.assetPath(obj.image);

		var style = {
			left: obj.x + 'px',
			top: obj.y + 'px',
			width: obj.w || w,
			height: obj.h || fw.assetHeight(obj.image),
			zIndex: obj.depth,
			cursor: obj.cursor,
			opacity: obj.alpha,

			// BORDER
			borderWidth: obj.borderWidth,
			borderColor: obj.borderColor
		};
		if (defined(obj.hidden))
			style.display = 'none';

		var img = $('<img>').attr({id: id, src: url, 'class':obj.type}).css(style).appendTo(obj.container);

		return img;
	};

	//=======================================================
	// Set the frame of an image
	//=======================================================
	framework.prototype.frame = function(el, frame, resourceId)
	{
		if (fw.verifyObject(el, 'Setting frame for'))
		{
			frame = Math.floor(frame);	// Just in case!  Fractional frame numbers do amusing things.

			if (resourceId) {
				// @FIXME/dg: getAsset needs a name change!
				var obj = fw.getAsset(resourceId);  // Fetching from resource list.
				// target frame; if beyond last frame index, default to 0.
				var goFrame = obj.frameData && obj.frameData.frames > frame ? frame : 0;
				var w = obj.w / (obj.frameData && obj.frameData.frames || 1);
				var backgroundX = -(goFrame*w+obj.x);
				var backgroundY = -(obj.y);
				var pos = backgroundX + 'px ' + backgroundY + 'px';
			}
			else {
				w = el.width();	// @FIXME/dg: This is slow and silly.  Fetch the information from the resource list (we need the resource ID!)
				pos = -(frame*w) + 'px 0px';
			}

			el.css('backgroundPosition', pos);
		}
	};

	//=======================================================
	// Sets the url of a dynamic image
	//=======================================================
	framework.prototype.setUrl = function(el, url)
	{
		if (fw.verifyObject(el, 'Setting URL for'))
			el.attr({src: url});
	};

	//=======================================================
	// Sets the url of a dynamic image
	//=======================================================
	framework.prototype.setScale = function(el, scale)
	{
		var str = "scale(" + scale + "," + scale + ")";
		if (fw.verifyObject(el, 'Scaling'))
			el.css({transform: str});
	};
})();
