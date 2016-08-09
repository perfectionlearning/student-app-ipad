//===========================================================================================
// Low-level canvas support
//
//===========================================================================================
(function() {

	//=======================================================
	// Adds a canvas element -- This assumes way too much.  The underlying graphic engine
	// could BE canvas.  However, it's a necessary hack since alternate methods
	// of creating graphs using an underlying DOM model are impractical.
	//
	// Object Fields:
	//	id		// Optional -- will be randomly generated if one isn't supplied
	//	x		// Required
	//	y		// Required
	//	w			// Required
	//	h			// Required
	//	depth		// Optional: z-index
	//	hidden		// Optional
	//	cursor		// Optional
	//	alpha		// Optional
	//	type	// Optional -- Non-unique ID -- Maps to 'class' in the DOM model
	//=======================================================
	framework.prototype.drawCanvas = function(obj)
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
			cursor: obj.cursor,
			borderWidth: obj.borderWidth,
			borderColor: obj.borderColor
		};
		if (defined(obj.hidden))
			style.display = 'none';

		var el = $('<canvas></canvas>').attr({id: id, 'class':obj.type, width:obj.w, height:obj.h}).css(style).appendTo(obj.container);

		return el;
	};

	//=======================================================
	//=======================================================
	framework.prototype.canvasCtx = function(el)
	{
		if (fw.verifyObject(el, 'Getting 2D context from'))
			return el[0].getContext("2d");
	}

})();
