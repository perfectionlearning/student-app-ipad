//===============================================================================
// Hover Manager
// Allows actions to be tied to mouseenter/mouseleave with an optional delay
// before the actions take place.
//
// Params:
//   wid
//   inDelay: [Optional]
//   outDelay: [Optional, sort of] If this isn't set, moving from one element to another will cause the outAction.
//   inAction: [Optional]
//   outAction: [Optional]
//===============================================================================
;(function() {

	//=======================================================
	// Constructor
	//=======================================================
	var act = framework.action.hover = function(options)
	{
		this.opts = options;			// Copy options
		this.owner = options.wid;
		this.state = 'out';
		this.count = 0;

		var w = options.wid;
		w.addDelegate('mouseenter', this.enter, this);
		w.addDelegate('mouseleave', this.leave, this);
	}

	//=======================================================
	//=======================================================
	act.prototype.terminate = function()
	{
		if (this.state === 'leaving' || this.state === 'entering')
			clearTimeout(this.timeout);
	}

	//=======================================================
	// We have received a mouseenter (IN) event
	//=======================================================
	act.prototype.enter = function(wid)
	{
		this.count++;

		// Don't do this if it's already in
		if (this.state === 'in')
			return;

		if (this.state === 'leaving')
		{
			clearTimeout(this.timeout);
			this.state = 'in';
		}
		else if (this.state === 'out')
			this.entering();
	}

	//=======================================================
	// We have received a mouseleave (OUT) event
	//=======================================================
	act.prototype.leave = function(wid)
	{
		this.count--;

		// If we're already out somehow, don't do anything
		if (this.state === 'out')
			return;

		if (this.state === 'entering')
		{
			clearTimeout(this.timeout);
			this.state = 'out';
		}
		else if (this.state === 'in')
			this.leaving();
	}

	//=======================================================
	// Transitioning from out to in
	//=======================================================
	act.prototype.entering = function()
	{
		// If no enter delay is set, perform the action immediately
		if (!this.opts.inDelay)
			this.doEnter();
		else
		{
			// A delay is requested.  Start the timeout.
			var that = this;
			this.timeout = setTimeout(function() {that.doEnter()}, that.opts.inDelay);
			this.state = 'entering';
		}
	}

	//=======================================================
	// Transitioning from in to out
	//=======================================================
	act.prototype.leaving = function()
	{
		// If no enter delay is set, perform the action immediately
		if (!this.opts.outDelay)
			this.doLeave();
		else
		{
			// A delay is requested.  Start the timeout.
			var that = this;
			this.timeout = setTimeout(function() {that.doLeave()}, that.opts.outDelay);
			this.state = 'leaving';
		}
	}

	//=======================================================
	//
	//=======================================================
	act.prototype.doEnter = function()
	{
		this.state = 'in';
		this.opts.inAction && this.opts.inAction(this.owner, this);
	}

	//=======================================================
	//
	//=======================================================
	act.prototype.doLeave = function()
	{
		// It's possible to be in multiple widgets at once.  It's not a "real" leave until
		// we've exited every widget.
		if (this.count <= 0)
		{
			this.state = 'out';
			this.opts.outAction && this.opts.outAction(this.owner, this);
		}
	}

})();
