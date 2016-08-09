//======================================================
// Simple (for now) text input box with multiple lines
//
// Arguments:
//  id
//  x
//  y
//
// Style: (textInput)
//  boxBorderWidth
//  boxBorderColor
//  boxColor
//  (global)readOnlyColor
//======================================================
framework.widget.essayInput = function()
{
	var that = this;
	var style = app.style.textInput;

	var inp;
	var isReadOnly = false;

	that.h = style.height;	// Unconventional!
	that.w = that.w || style.width;

	//=======================================================
	// Create the equation input
	//=======================================================
	function createInput()
	{
		var wid = that.add('inputPrimitive', {
			text:'',
			color: style.color,
			borderWidth: style.boxBorderWidth,
			borderColor: style.boxBorderColor,
			inpType: 'multiLine',
			funcTest: 'qc_input',
			depth: 1
		}, fw.dockTo(that));

		return wid;
	}

	//=======================================================
	// Enter key pressed in input box
	//=======================================================
	function enterInputBox(data)
	{
		if (inp.id === data.id)
		{
			if (!that.isStep)
				fw.eventPublish('doSubmit:input');
			else
				fw.eventPublish('stepSubmit:input');
		}
	}

	//======================================================
	// Set the focus on the equation
	//======================================================
	this.focus = function()
	{
		// Don't do anything if the input is read-only
		if (isReadOnly)
			return;

		inp.focus();

		// This is only needed the first time
		fw.eventPublish('focus:input', {
			owner: inp,
			wid: that
		});
	}

	//======================================================
	// Required Interface: Returns the equation in the box
	//======================================================
	this.value = function(isInternal)
	{
		return inp.value();
	}

	//=======================================================
	// Pass the request on to the specific input widget
	//=======================================================
	this.showAnswer = function(answer)
	{
		inp.value(answer);
		inp.bgColor(app.style.readOnlyColor);
	}

	//=======================================================
	// Enable solution mode
	//=======================================================
	this.showSolution = function(answer)
	{
		this.showAnswer(answer);
	}

	//=======================================================
	// Pass the request on to the specific input widget
	//=======================================================
	this.readOnly = function()
	{
		isReadOnly = true;

		inp.bgColor(app.style.readOnlyColor);
		inp.readOnly();
	}

	//=======================================================
	// Go into a compact read-only state
	//=======================================================
	this.cleanup = function()
	{
		// Don't do anything.  Later we can consider shrinking, but
		// determining the smaller size is non-trivial.
		// Essay inputs aren't allowed in steps, anyway.
	}

	//=======================================================
	// Pass the request on to the specific input widget
	//=======================================================
	this.allowInput = function()
	{
		isReadOnly = false;

		inp.bgColor(style.boxColor);
		inp.allowInput();
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		inp = createInput();

		that.promise = null;
	}

};
