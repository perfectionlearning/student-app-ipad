//===========================================================================================
// Equation Input wrapper -- interfaces with and abstracts MathQuill
//
//===========================================================================================
(function() {

	var contentType = 'latex';	// Keep track of whether we have HTML/MathML or LaTeX content
	var isReadOnly = false;		// Keep track of whether the element is in read-only (HTML) mode.  We could infer this from contentType.

	//=======================================================
	// Adds an equation element
	//
	// Object Fields:
	//	id		// Optional -- will be randomly generated if one isn't supplied
	//	x		// Required
	//	y		// Required
	//	text	// Required -- Resource ID of image to use
	//	font	// Required -- css string format, i.e. "bold 12px serif"
	//	color	// Optional -- Default: black
	//	align	// Optional -- Default: left
	//	w		// Required if align is 'center' or 'right'
	//	depth	// Optional -- Default: 0
	//	cursor	// Optional
	//	alpha	// Optional
	//	hidden	// Optional
	//	type	// Optional -- Non-unique ID -- Maps to 'class' in the DOM model
	//=======================================================
	framework.prototype.drawEquation = function(obj)
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
			overflow: obj.overflow
		};
		if (defined(obj.hidden))
			style.display = 'none';
		if (defined(obj.nowrap))
			style.whiteSpace = 'nowrap';

		var canEdit = defined(obj.edit) ? 'editable' : undefined;

		var el = $('<div/>')
			.html(obj.text)
			.attr({id: id, 'class':obj.type})
			.css(style)
			.appendTo(obj.container)
			.mathquill(canEdit);

		if (app.FunctionalTestMode) {
			el.attr('data-ft', obj.funcTest);
		}

		if (obj.owner)
		{
			el.on('keydown', 'textarea', {owner: obj.owner}, keyPress);
			el.on('blur', 'textarea', {owner: obj.owner}, lostFocus);	// The textarea inside is getting the blur event
			el.on('touchstart click focus select', {owner: obj.owner}, gotFocus);

			// Add additional focus handler here.  Make sure it's not redundant.  We're missing
			// focus events when clicking outside the browser then back in.
			// Or, maybe this is too trivial and we can deal with it later (@FIXME/dg)
		}

		return el;
	};

	//=======================================================
	//
	//=======================================================
	function gotFocus(ev)
	{
		fw.eventPublish('focus:eq', ev.data.owner);
	}

	//=======================================================
	//
	//=======================================================
	function lostFocus(ev)
	{
		fw.eventPublish('blur:eq', ev.data.owner);
	}

	//=======================================================
	// Notify on enter pressed
	//=======================================================
	function keyPress(ev)
	{
		if (ev.which === 13)
			fw.eventPublish('keypress:Enter', ev.data.owner);
	}

	//=======================================================
	//
	//=======================================================
	framework.prototype.eqClear = function(el)
	{
		if (fw.verifyObject(el, 'EQ Clearing'))
			el.mathquill('latex', '');
	}

	//=======================================================
	//=======================================================
	framework.prototype.eqWrite = function(el, text)
	{
		if (fw.verifyObject(el, 'EQ Writing'))
			el.mathquill('cmd', text);
	}

	//=======================================================
	// NOTE: This changes the box from MathQuill to a standard <div>, which will properly display MathML
	// This can't be used to write LaTeX into a MathQuill box!
	// If this is followed by eqReadOnly or eqAllowInput, they will fail.
	//=======================================================
	framework.prototype.eqWriteHtml = function(el, text)
	{
		if (fw.verifyObject(el, 'EQ Writing'))
		{
			el.mathquill('revert').html(text);
			return fw.processMathML('<math>', el);
		}
	}

	//=======================================================
	//
	//=======================================================
	framework.prototype.eqRead = function(el)
	{
		if (fw.verifyObject(el, 'EQ Reading'))
			return el.mathquill('latex');
	}

	//=======================================================
	// Convert from MathQuill edit to MathQuill display
	//=======================================================
	framework.prototype.eqReadOnly = function(el)
	{
		if (fw.verifyObject(el, 'EQ Making read only'))
		{
			var data = el.mathquill('latex');
			// Replace HTML tag opening and closing brackets with HTML entities so
			// values with the less than sign don't get truncated.
			var htmlData = data.replace(/</g, "&lt;");
			htmlData = htmlData.replace(/>/g, "&gt;");
			el.mathquill('revert').html(htmlData);

			// Crude way to determine whether content is MathML or LaTeX
			// Since it was extracted from MathQuill as LaTeX, this is a bit messy
			// Ideally, an equation would keep track of type at all times, and route accordingly.
			// There is already a "writeHtml" function, so bypassing this routine would also be an option.
			if (!data || data.indexOf('<math') === -1)
				el.mathquill();
		}
	}

	//=======================================================
	//
	//=======================================================
	var ltgt = {'<': '&lt;', '>': '&gt;'};
	framework.prototype.eqAllowInput = function(el)
	{
		if (fw.verifyObject(el, 'EQ Allowing input for'))
		{
			var data = el.mathquill('latex');
			// Replace < and > in input with &lt; and &gt;. This is to fix a truncation issue when < was used in answer.
			data = data.replace(/[<>]/g, function(s) { return ltgt[s]; }); 
			el.mathquill('revert').html(data).mathquill('editable');
		}
	}

	//=======================================================
	//
	//=======================================================
	framework.prototype.eqBackspace = function(el)
	{
		if (fw.verifyObject(el, 'Backspacing'))
			el.mathquill('backspace');
	}

	//=======================================================
	//
	//=======================================================
	framework.prototype.eqAlignment = function(el, align)
	{
		if (fw.verifyObject(el, 'Aligning'))
			el.css({textAlign: align});
	}

	//=======================================================
	// @FIXME/dg: MathQuill focus command is wacky!
	//=======================================================
	framework.prototype.eqFocus = function(el)
	{
		if (fw.verifyObject(el, 'Focusing equation'))
			el.find('textarea').focus();	//mathquill('focus');
	}

	//=======================================================
	// @FIXME/dg: MathQuill blur command is wacky!
	//=======================================================
	framework.prototype.eqBlur = function(el)
	{
		if (fw.verifyObject(el, 'Blurring equation'))
			el.find('textarea').blur();	//mathquill('blur');
	}

})();
