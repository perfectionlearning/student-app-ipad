//===========================================================================================
// Low-level input box
//
//===========================================================================================
(function() {

	//=======================================================
	// Draw an input box
	//
	// Object Fields:
	//	id		// Optional -- will be randomly generated if one isn't supplied
	//	x		// Required
	//	y		// Required
	//	w			// Required
	//	h			// Required
	//	color		// Semi-required.
	//	bgColor 	// Optional
	//  borderWidth	// Optional
	//	borderColor	// Optional
	//  borderStyle	// Optional
	//	depth		// Optional: z-index
	//	hidden		// Optional
	//	type	// Optional -- Non-unique ID -- Maps to 'class' in the DOM model
	//=======================================================
	framework.prototype.drawInput = function(obj)
	{
		var id = obj.id || fw.randomID();
		fw.normalize(obj);

		// If the element already exists, the old one will be orphaned. -- This will leave duplicate elements in the DOM!
		fw.registerObject(id);

		// Support multiple input types
		var inpType = obj.inpType || 'input';

		var style = {
			width: obj.w + 'px',
//			height: obj.h + 'px',
			color: obj.color,
			backgroundColor: obj.bgColor,
			opacity: obj.alpha,
			cursor: obj.cursor,

			// BORDER
			borderWidth: obj.borderWidth,
			borderColor: obj.borderColor,
			borderStyle: obj.borderStyle
		};
		if (defined(obj.hidden))
			style.display = 'none';

		var contStyle = {
			left: obj.x + 'px',
			top: obj.y + 'px',
			zIndex: obj.depth,
		}

		if (inpType === 'input')
		{
			var cont = $('<div>').attr({id: id, 'class':obj.type}).css(contStyle).appendTo(obj.container);

			var mode = (obj.password === true ? 'password' : 'text');
			$('<input type="' + mode + '">').css(style).appendTo(cont);
			return cont;
		}
		else
		{
			style.height = obj.h + 'px';
			style.resize = 'none';

			return $('<textarea>').css(contStyle).css(style).appendTo(obj.container);
		}

	};

	//=======================================================
	// Get or set the value of the input box
	//=======================================================
	framework.prototype.inputVal = function(el, val, type)
	{
		if (fw.verifyObject(el, 'Setting value for'))
		{
			var target = (type === 'multiLine' ? el : el.children().eq(0));
			if (defined(val))
				return target.val(val);
			else
				return target.val();
		}
	}

	//=======================================================
	// Get or set the value of the input box
	//=======================================================
	framework.prototype.inputFocus = function(el, type)
	{
		if (fw.verifyObject(el, 'Focusing'))
		{
			var target = (type === 'multiLine' ? el : el.children().eq(0));
			target.focus();
		}
	}

	//=======================================================
	// Check to see if an input box has focus
	//=======================================================
	framework.prototype.checkInpFocus = function(el, type)
	{
		if (fw.verifyObject(el, 'Checking focus of'))
		{
			var target = (type === 'multiLine' ? el : el.children().eq(0));
			return target.is(":focus")
		}
	}

	//=======================================================
	// Get or set the value of the input box
	//=======================================================
	framework.prototype.inputBgColor = function(el, color, type)
	{
		if (fw.verifyObject(el, 'Setting background color for'))
		{
			var target = (type === 'multiLine' ? el : el.children().eq(0));
			target.css({backgroundColor: color});
		}
	}

	//=======================================================
	// Get or set the value of the input box
	//=======================================================
	framework.prototype.inputReadOnly = function(el, type)
	{
		if (fw.verifyObject(el, 'Setting readonly for'))
		{
			var target = (type === 'multiLine' ? el : el.children().eq(0));
//			target.attr('readonly', 'readonly');
			target.attr('disabled', 'disabled');
		}
	}

	//=======================================================
	// Get or set the value of the input box
	//=======================================================
	framework.prototype.inputReadWrite = function(el, type)
	{
		if (fw.verifyObject(el, 'Setting readonly for'))
		{
			var target = (type === 'multiLine' ? el : el.children().eq(0));
//			target.removeAttr('readonly');
			target.removeAttr('disabled');
		}
	}


})();
