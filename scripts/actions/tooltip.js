//===============================================================================
// Tooltip Action
//
// This is a superset of the hover action.  It ties specific behavior to the
// generic hover action.
// It works by applying the hover action, ultimately attaching two actions to a
// single widget.  However, only one delegate is active so it should still be
// relatively efficient.
//
// @FIXME/dg: This would work better if it inherited hover instead of just calling it.
// Applying the hover prototype would inherit everything except the constructor.
//
// Params:
//   wid
//	 text
//   dock: {wid: widref, ofs: [x,y], pos: dockString } dockString can be: "T", "B", "L", "R", "TL", "TR", "BL", "BR"
//===============================================================================
;(function() {

	//=======================================================
	//=======================================================
	var act = framework.action.tooltip = function(options)
	{
		var w = options.wid;	// Extract the widget from the options

		// We're piggy-backing onto another action.  That action will have its own instance variables.
		// Anything stored here won't be available directly inside the event handlers.
		this.tip = null;
		this.text = options.text;
		this.dock = options.dock;
		this.active = true;

		w.applyAction('hover', {
			wid: w,
			inDelay: options.delay,
			inAction: this.showTip,
			outDelay: 1,			// If this is 0, hover won't work for compound widgets
			outAction: this.clearTip,
			tip: this
		});
	}

	//=======================================================
	// Clear the tip if it's active.
	// There's no need to notify the hover action.  The widget
	// will take care of that.
	//=======================================================
	act.prototype.terminate = function()
	{
		this.tip && this.tip.terminate();
	}

	//=======================================================
	// Note that "this" will be the hover action, NOT the tooltip action!
	//=======================================================
	act.prototype.showTip = function(wid, hover)
	{
		var thisAct = hover.opts.tip;		// This assumes too much familiarity with hover!

		if (!thisAct.active)
			return;

		thisAct.tip = fw.createWidget('tooltip', {
			text: thisAct.text,
			dock: thisAct.dock
		});
	}

	//=======================================================
	// Note that "this" will be the hover action, NOT the tooltip action!
	//=======================================================
	act.prototype.clearTip = function(wid, hover)
	{
		var thisAct = hover.opts.tip;		// This assumes too much familiarity with hover!

		thisAct.tip && thisAct.tip.terminate();
		thisAct.tip = null;
	}

	//=======================================================
	//=======================================================
	act.prototype.disable = function()
	{
		this.active = false;

		this.tip && this.tip.terminate();
		this.tip = null;
	}

	//=======================================================
	//=======================================================
	act.prototype.enable = function()
	{
		this.active = true;
	}

})();
