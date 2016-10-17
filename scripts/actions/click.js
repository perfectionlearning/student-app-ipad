//===============================================================================
// Click Action
// Allows a single click behavior to be tied to a collection of widgets
//
// @TODO: Allow the action to be temporarily disabled
//
// Params:
//   wid
//	 click: Callback to perform on a click
//===============================================================================
;(function() {

	//=======================================================
	// Constructor
	//=======================================================
	var act = framework.action.click = function(options)
	{
		this.click = options.click;
		this.owner = options.wid;

		var w = options.wid;	// Extract the widget from the options
		//@jd this was causing doubleclick on iPad w.addDelegate('touchstart', this.clicked, this);
		w.addDelegate('click', this.clicked, this);
	}

	//=======================================================
	// Return the owner (not the widget that was clicked on)
	//=======================================================
	act.prototype.clicked = function(wid, data)
	{
		this.click && this.click(this.owner, data);
	}

})();
