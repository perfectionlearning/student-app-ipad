//===============================================================================
// Keypress Action
// Allows a single keypress behavior to be tied to a collection of widgets
//
// @TODO: Allow the action to be temporarily disabled
//
// Params:
//   wid
//	 press: Callback to perform on a keypress
//===============================================================================
;(function() {

	// Define some global key names
	app.Keys = {};
	app.Keys.Enter = 13;
	app.Keys.Escape = 27;
	app.Keys.Backspace = 8;
	app.Keys.Tab = 9;
	app.Keys.Delete = 16;
	app.Keys.Up = 1;
	app.Keys.Down = 2;
	app.Keys.Left = 3;
	app.Keys.Right = 4;

	// Map special keys to ASCII codes.  Some things reported as special keys by
	// Firefox really aren't all that special.  Map them to themselves.
	var keyMap = {
		8: 8,					// Backspace
		9: 9,					// Tab
		13: 13,					// Enter
		27: 27,					// Escape
		37: app.Keys.Left,		// Left -- No ASCII equivalent
		38: app.Keys.Up,		// Up -- No ASCII equivalent
		39: app.Keys.Right,		// Right -- No ASCII equivalent
		40: app.Keys.Down,		// Down -- No ASCII equivalent
		46: app.Keys.Delete		// Delete -- No ASCII equivalent.  Use DLE
	}

	//=======================================================
	// Constructor
	//=======================================================
	var act = framework.action.keypress = function(options)
	{
		this.press = options.press;
		this.owner = options.wid;

		var w = options.wid;	// Extract the widget from the options
		w.addDelegate('keypress', this.pressed, this);
	}

	//=======================================================
	// Return the owner (not the widget where the press occurred)
	//=======================================================
	act.prototype.pressed = function(key)
	{
		// Ignore alt and ctrl versions of keys
		if (key.altKey || key.ctrlKey)
			return;

		var res = key.charCode;			// Check for a base key
		if (res === 0)
			res = keyMap[key.keyCode];	// Remap special keys.  Some of them should have been normal keys.

		if (defined(res))
			this.press && this.press(res, this.owner);
	}

})();
