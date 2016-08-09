//===============================================================================
// Mouse Out Manager
// Simple action that mostly just passes on event info.
//
// Params:
//   wid
//   notify: Function to call on any mouse move
//===============================================================================
;(function() {

	//=======================================================
	// Constructor
	//=======================================================
	var act = framework.action.mouseLeave = function(options)
	{
		this.opts = options;			// Copy options
		this.owner = options.wid;

		options.wid.addDelegate('mouseout', this.leave, this);
	}

	//=======================================================
	// We have received a mouseenter (IN) event
	//=======================================================
	act.prototype.leave = function(wid, event)
	{
		this.opts.notify && this.opts.notify(wid, event);
	}

})();
