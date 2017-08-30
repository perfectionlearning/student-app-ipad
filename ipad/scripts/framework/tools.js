//===========================================================================================
// Global utility functions
//===========================================================================================
(function() {

	framework.prototype.tools = {};

	//=======================================================
	// Count the digits in a number
	//=======================================================
	framework.prototype.tools.countDigits = function(num)
	{
		var digits = 0;

		if (num == 0)
			return 1;

		while (num > 0)
		{
			digits++;
			num = Math.floor(num / 10);
		}

		return digits;
	}

	//=======================================================
	// Validate a date string (YYYY-MM-DD hh:mm:ss)
	//=======================================================
	framework.prototype.tools.parseDate = function(str)
	{
		// RegEx to break into groups
		var val = /([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/;
		var parsed = val.exec(str);

		// Verify general format
		if (parsed == null || parsed.length != 7)
			return undefined;

		// Assume year is 20XX.
		if (parsed[1] < 2000 || parsed[1] > 2099)
			return undefined;

		// Verify month
		if (parsed[2] < 1 || parsed[2] > 12)
			return undefined;

		// Verify day
		if (parsed[3] < 1 || parsed[3] > 31)
			return undefined;

		// Verify hour
		if (parsed[4] < 0 || parsed[4] > 23)
			return undefined;

		// Verify minute
		if (parsed[5] < 0 || parsed[5] > 59)
			return undefined;

		// Verify second
		if (parsed[6] < 0 || parsed[6] > 59)
			return undefined;

		// @ALLOC/dg
		return {
			year: parsed[1],
			month: parsed[2],
			day: parsed[3],
			hour: parsed[4],
			minute: parsed[5],
			second: parsed[6]
		};
	}

	//=======================================================
	// Compares a coordinate pair
	//=======================================================
	framework.prototype.tools.compareCoords = function(array1, array2)
	{
		return ( (array1[0] === array2[0]) && (array1[1] === array2[1]) );
	}

	//=======================================================
	// Compares a coordinate pair
	//=======================================================
	framework.prototype.tools.random = function(min, max)
	{
		return Math.floor(Math.random() * (max - min)) + min;
	}
})();