//===========================================================================================
// Low-level text handlers
//
//===========================================================================================
(function() {

	//=======================================================
	// Adds a text element
	//
	// Object Fields:
	//	id	// Optional -- will be randomly generated if one isn't supplied
	//	x	// Required
	//	y	// Required
	//	text	// Required -- Resource ID of image to use
	//	font	// Required -- css string format, i.e. "bold 12px serif"
	//	color	// Optional -- Default: black
	//	align	// Optional -- Default: left
	//	w		// Required if align is 'center' or 'right'
	//  h
	//	depth	// Optional -- Default: 0
	//	cursor	// Optional
	//	alpha	// Optional
	//	hidden	// Optional
	//	type	// Optional -- Non-unique ID -- Maps to 'class' in the DOM model
	//=======================================================
	framework.prototype.drawText = function(obj)
	{
		var id = obj.id || fw.randomID();
		fw.normalize(obj);

		// If the element already exists, the old one will be orphaned. -- This will leave duplicate elements in the DOM!
		fw.registerObject(id);

		var style = {
			left: obj.x + 'px',
			top: obj.y + 'px',

			font: obj.font,
			color: obj.color || "#FFFFFF",
			textAlign: obj.align,
			zIndex: obj.depth,
			cursor: obj.cursor,
			opacity: obj.alpha,	// Could be 0, so we can't use ||
			height: obj.h,
			width: obj.w,
			overflow: obj.overflow,
//			lineHeight: obj.lineHeight + 'px',
//			'-moz-user-select': 'none',		// This is only semi-useful.  We need to be able to disable it.  Other primitives need to be disabled as well.
//			'-webkit-user-select': 'none'
		};
		if (defined(obj.hidden))
			style.display = 'none';
		if (defined(obj.nowrap))
			style.whiteSpace = 'nowrap';

		if (app.FunctionalTestMode) {
			var elem = $('<div></div>').html(obj.text).attr({id: id, 'data-ft': obj.funcTest, 'class':obj.type}).css(style).appendTo(obj.container);
		}
		else {
			var elem = $('<div></div>').html(obj.text).attr({id: id, 'class':obj.type}).css(style).appendTo(obj.container);
		}

		return fw.processMathML(obj.text, elem);
	};

	//=======================================================
	// Change the text of a text element
	//=======================================================
	framework.prototype.setText = function(el, text)
	{
		if (fw.verifyObject(el, 'Changing text for'))
		{
			// Set the text
			el.html(text);

			// Perform typesetting if necessary
			return fw.processMathML(text, el);
		}
	};

	//=======================================================
	// Special handling of items containing MathML
	//
	// Some of this should occur at a higher level, but it's hard
	// to do cleanly.
	//=======================================================
	framework.prototype.processMathML = function(text, element)
	{
		// Only do anything if the text contains MathML
		if (text.indexOf('<math') !== -1)
		{
			// Create a deferred object
			var deferred = $.Deferred();

			// Hide while updating -- it's cleaner
			// Using .hide() in Chrome causes graphic glitches. Update hide/show to use 'visibility' instead of 'display'
			element.show();
			element.css('visibility', 'hidden');
			element.addClass('allowOverflow');

			// I generally avoid anonymous functions to prevent excess allocation, but
			// we need the obj.deferred variable in scope.
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, element[0], function() {
				element.css('visibility', '');
				deferred.resolve();
			}]);
		}
		else
			var deferred = null;

		return deferred;
	}

	//=======================================================
	// Returns the text of a text element
	//=======================================================
	framework.prototype.getText = function(el)
	{
		if (fw.verifyObject(el, 'Reading text for'))
			return el.html();	// was .text()
	};

	//=======================================================
	// Change the text of a text element
	//=======================================================
	framework.prototype.color = function(el, color)
	{
		if (fw.verifyObject(el, 'Setting color for'))
			el.css('color', color);
	};

	//=======================================================
	// Determine the correct size string to be used for fonts
	//
	// Numbers are assumed to be in pixels, but allow other
	// size types to be specified (as strings)
	//=======================================================
	function sizeStr(size)
	{
		// Numbers are assumed to be in pixels, but allow other size types to be specified (as strings)
		if (typeof size === "number")
			return size + 'px';
		else
			return size;
	}

	//=======================================================
	// Change the text of a text element
	//=======================================================
	framework.prototype.fontSize = function(el, size, lineHeight)
	{
		if (fw.verifyObject(el, 'Setting font size for'))
		{
			el.css('fontSize', sizeStr(size));

			if (defined(lineHeight))
				el.css('lineHeight', sizeStr(lineHeight));
		}
	};

	//=======================================================
	// Enable or disable wrapping in a text element
	//=======================================================
	framework.prototype.setWrapping = function(el, canWrap)
	{
		var wrap = canWrap ? 'normal' : 'nowrap';

		if (fw.verifyObject(el, 'Setting wrapping for'))
			el.css('whiteSpace', wrap);
	};

})();
