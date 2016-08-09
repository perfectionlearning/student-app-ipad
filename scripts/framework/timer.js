//===========================================================================================
// Timing Module
//===========================================================================================
(function() {
//	fw.registerModule("timer", {reset: reset, handler: updateTick});
	fw.registerModule("timer", {reset: reset});

	// Timer object -- contains count up tick timer plus an arbitrary number of timers used for gating and other purposes
	var gTimer = {
		tick: 0		// Global timer
	};
	var countDowns = {};

	//===========================================================================================
	// Private functions
	//===========================================================================================

	//=======================================================
	// Reset the module
	//=======================================================
	function reset()
	{
		countDowns = {};
	}

	//=======================================================
	// Central timing handler.
	// Maintains the system timer and processes countdowns.
	//=======================================================
	/*
	function updateTick(incAmt)
	{
		gTimer.tick += incAmt;

		// Update countdown timers
		$.each (countDowns, function(key, val) {
			if (val.time > 0)
			{
				if ((--countDowns[key].time <= 0) && defined(val.callback))
					val.callback();
			}
		});
	};
	*/

	//===========================================================================================
	// API
	//===========================================================================================

	//=======================================================
	// Reinit the module
	//=======================================================
	framework.prototype.initTimers = function()
	{
		countDowns = {};
	}

	//=======================================================
	// Generic time gate function
	//=======================================================
/*
	framework.prototype.gate = function(id, time)
	{
		if (!defined(gTimer[id]))
			gTimer[id] = gTimer.tick;

		if ((gTimer.tick - gTimer[id]) >= time)
		{
			gTimer[id] = gTimer.tick;	// Reset timer
			return true;
		}

		return false;
	};
*/

	//=======================================================
	// Initialize a timer
	//=======================================================
/*
	framework.prototype.initTimer = function(id)
	{
		gTimer[id] = gTimer.tick;
	};
*/
	//=======================================================
	// Start a countdown timer
	//=======================================================
	framework.prototype.setCountdown = function(id, value, callback)
	{
		countDowns[id] = setTimeout(callback, value);
/*		
		if (!defined(countDowns[id]))
			countDowns[id] = {};

		countDowns[id].time = Math.floor(value);

		if (defined(callback))
			countDowns[id].callback = callback;
*/
	};

	//=======================================================
	// Check a countdown timer -- currently countdowns are polled.
	//=======================================================
/*	
	framework.prototype.checkCountdown = function(id)
	{
		if (!defined(countDowns[id]))
			return 0;

		return countDowns[id].time;
	};
*/
	//=======================================================
	// Remove a countdown timer
	//=======================================================
	framework.prototype.deleteCountdown = function(id)
	{
		if (!defined(countDowns[id]))
			return;

		clearTimeout(countDowns[id]);
		
		delete countDowns[id];
	};

})();