//===========================================================================================
// Simple scripting system
//
// At present, only a single script can be running at once.  To allow more, state would
// have to be encapsulated and duplicated for each script.
//===========================================================================================
(function() {
	fw.registerModule("scripts", {});

	var runningScript, scriptIndex, isBlocked, scriptCallback;

	// These must be specified by the caller
	var opcodeSizes;

//==========================================================================
// Script processing
//==========================================================================

	//=======================================================
	//
	//=======================================================
	function processScript()
	{
		if (!runningScript)
			return;
		
		// Step through the script
		while ((scriptIndex < runningScript.length) && !isBlocked)
			doOpcode();
	}

	//=======================================================
	// Steps through a script, notifying a client about
	// each opcode.
	//=======================================================
	function doOpcode()
	{
		var opcode = runningScript[scriptIndex];

		// Direct support for the JUMP command (slightly messy)
		if (opcode === "JUMP")
		{
			runningScript = runningScript[scriptIndex+1];
			scriptIndex = 0;
			return;
		}

		// Extract parameters
		var argCnt = opcodeSizes[opcode] || 0;
		var args = [];

		for (var j = 0; j < argCnt; j++)
		{
			if ((scriptIndex + j + 1) >= runningScript.length)
				fw.error('Scoring script prematurely terminated');

			args.push(runningScript[scriptIndex + j + 1]);
		}

		// Notify the client
		scriptCallback(opcode, args);

		// Update the script pointer
		scriptIndex += 1 + argCnt;
	}

	//=======================================================
	//=======================================================
	framework.prototype.scriptSetSizes = function(opSizes)
	{
		opcodeSizes = opSizes;
	}

	//=======================================================
	// Steps through a script, notifying a client about
	// each opcode.
	//=======================================================
	framework.prototype.scriptRun = function(script, callback)
	{
		scriptCallback = callback;
		runningScript = script;
		scriptIndex = 0;
		isBlocked = false;

		processScript();
	}

	//=======================================================
	// Pause a script
	//=======================================================
	framework.prototype.scriptBlock = function()
	{
		isBlocked = true;
	}

	//=======================================================
	// Resume a script
	//=======================================================
	framework.prototype.scriptUnblock = function()
	{
		isBlocked = false;	// Clear blocked state
		processScript();	// Continue processing
	}

})();
