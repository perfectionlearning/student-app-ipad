//===========================================================================================
// Low-level rectangle handlers
//
//===========================================================================================
(function() {

	//=======================================================
	// Draw a rectangle
	//
	// Object Fields:
	//	id		// Optional -- will be randomly generated if one isn't supplied
	//	x		// Required
	//	y		// Required
	//	w			 // Required
	//	h			 // Required
	//	color		 // Semi-required.
	//	depth		 // Optional: z-index
	//  borderWidth	 // Optional
	//	borderColor	 // Optional
	//  borderStyle	 // Optional
	//  borderRadius // Optional
	//	hidden		 // Optional
	//	cursor		 // Optional
	//	alpha		 // Optional
	//	type	// Optional -- Non-unique ID -- Maps to 'class' in the DOM model
	//=======================================================
	framework.prototype.drawRect = function(obj)
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
			backgroundColor: obj.color,
			zIndex: obj.depth,
			opacity: obj.alpha,
			cursor: obj.cursor,

			// BORDER
			borderWidth: obj.borderWidth,
			borderColor: obj.borderColor,
			borderStyle: obj.borderStyle,
			borderRadius: obj.borderRadius
		};
		if (defined(obj.hidden))
			style.display = 'none';

		var attr = {id: id, 'class': obj.type};

		if (app.FunctionalTestMode)
			attr['data-ft'] = obj.funcTest;

		if (obj.canFocus)
			attr.tabindex = 0;

		var el = $('<div></div>');
		el.attr(attr).css(style).appendTo(obj.container);

		return el;
	};

	//=======================================================
	// Change the border width of a rectangle element
	//=======================================================
	framework.prototype.borderSize = function(el, size)
	{
		if (fw.verifyObject(el, 'Setting border size for'))
			el.css('borderWidth', size);
	};

	//=======================================================
	// Change the border color of a rectangle element
	//=======================================================
	framework.prototype.borderColor = function(el, color)
	{
		if (fw.verifyObject(el, 'Setting border color for'))
			el.css('borderColor', color);
	};

	//=======================================================
	// Change the background color of a rectangle element
	//=======================================================
	framework.prototype.bgColor = function(el, color)
	{
		if (fw.verifyObject(el, 'Changing background color for'))
			el.css('backgroundColor', color);
	};

})();
