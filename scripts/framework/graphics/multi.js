//===========================================================================================
// Multi (free) input wrapper.  Interfaces with and abstracts the jQuery plugin.
//
//===========================================================================================
(function() {

	//=======================================================
	// Adds a multi-input element
	//
	// Object Fields:
	//	id		// Optional -- will be randomly generated if one isn't supplied
	//	x		// Required
	//	y		// Required
	//	text	// Required -- Resource ID of image to use
	//	font	// Required -- css string format, e.g. "bold 12px serif"
	//	color	// Optional -- Default: black
	//	align	// Optional -- Default: left
	//	w		// Required if align is 'center' or 'right'
	//	depth	// Optional -- Default: 0
	//	cursor	// Optional
	//	alpha	// Optional
	//	hidden	// Optional
	//	type	// Optional -- Non-unique ID -- Maps to 'class' in the DOM model
	//=======================================================
	framework.prototype.drawMultiInput = function(obj)
	{
		var id = obj.id || fw.randomID();
		fw.normalize(obj);

		// If the element already exists, the old one will be orphaned. -- This will leave duplicate elements in the DOM!
		fw.registerObject(id);

		var style = {
			left: obj.x + 'px',
			top: obj.y + 'px',

			font: obj.font,
			color: obj.color || "black",
			textAlign: obj.align,
			zIndex: obj.depth,
			cursor: obj.cursor,
			opacity: obj.alpha,	// Could be 0, so we can't use ||
			height: obj.h,
			width: obj.w,
			overflow: obj.overflow,

			// BORDER
			borderWidth: obj.borderWidth,
			borderColor: obj.borderColor,
			padding: obj.padding
		};
//		if (defined(obj.hidden))
//			style.display = 'none';
		if (defined(obj.nowrap))
			style.whiteSpace = 'nowrap';

		if (app.FunctionalTestMode) {
			var elem = $('<div></div>').attr({id: id, 'data-ft': obj.funcTest, 'class':obj.type}).css(style).appendTo(obj.container).mmlAnswer(obj.text, obj.options);
		}
		else {
			var elem = $('<div></div>').attr({id: id, 'class':obj.type}).css(style).appendTo(obj.container).mmlAnswer(obj.text, obj.options);
		}

		// Perform typesetting if necessary
		return fw.processMathML('<math>', elem);	// Hackish: Force recognition of MathML
	};

	//=======================================================
	// Returns an array of values for a multiInput control
	// This is a bit hacky to place within this module, but
	// this is the only place we (should) deal directly with
	// jQuery.
	//=======================================================
	framework.prototype.getMultiAnswers = function(el)
	{
		if (fw.verifyObject(el, 'Getting answers from'))
			return el.data('mmlAnswer').answers();
	}

	//=======================================================
	// Returns an array of values for a multiInput control
	// This is a bit hacky to place within this module, but
	// this is the only place we (should) deal directly with
	// jQuery.
	//=======================================================
	framework.prototype.showMultiAnswer = function(el)
	{
		if (fw.verifyObject(el, 'Showing answers in'))
		{
			el.data('mmlAnswer').showAnswer();

			return fw.processMathML('<math>', el);	// Hackish: Force recognition of MathML
		}
	}

	//=======================================================
	//=======================================================
	framework.prototype.replaceMultiAnswers = function(el, ans)
	{
		if (fw.verifyObject(el, 'Replacing answers in'))
			return el.data('mmlAnswer').replaceAnswers(ans);
	}

	//=======================================================
	//=======================================================
	framework.prototype.getMultiBoxCount = function(el)
	{
		if (fw.verifyObject(el, 'Geting box count from'))
			return el.data('mmlAnswer').boxCount();
	}

	//=======================================================
	//=======================================================
	framework.prototype.getMultiBoxes = function(el)
	{
		if (fw.verifyObject(el, 'Getting boxes from'))
			return el.data('mmlAnswer').boxes();
	}

})();
