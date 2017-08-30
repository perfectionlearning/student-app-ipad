//=============================================================================
// External Application Container
//
//  id
//  x, y, w, h
//	files: Array of script elements that need to be loaded
//  name: Object name
//	path: Top path for files
//=============================================================================
framework.widget.external = function()
{
	var that = this;

	var scriptList = [];
	var ajaxHandles;
	var loadCount;
	var canvas, controls;

	// We have some asynchronous hell going on.  It's easy to delete necessary items before they
	// finish loading, causing crashes.
	var isLoaded = false;
	var isTerminating = false;
	var hasRun = false;

	var borderWidth = 2;

	//=======================================================
	// Create the element used by the external
	//=======================================================
	function createElement()
	{
		controls = that.add('rect', {
			id: 'act_controls',
			borderWidth: borderWidth,
			depth: 10
		}, {
			top: that.id + ' top -' + borderWidth,
			bottom: that.id + ' bottom ' + borderWidth,
			left: that.id + ' left -' + borderWidth,
			right: that.id + ' right ' + borderWidth,
		});

		canvas = that.add('canvas', {
			id: 'activity',		// I know.  I know.
			depth: 1,
			borderWidth: borderWidth,
			borderColor: 'black',
		},{
			top: controls.id + ' top',
			bottom: controls.id + ' bottom',
			left: controls.id + ' left',
			right: controls.id + ' right',
		});

		app.containerColor('activity', 'white');
	}

	//=======================================================
	// Load scripts one at a time, in order
	//=======================================================
	function loadScripts()
	{
		if (scriptList.length > 0)
		{
			var file = scriptList.shift();

			// Inject the script elements
			ajaxHandles.push(fw.injectScript(that.path + file, loadScripts, loadFailed));
		}
		else
			doneLoading();
	}

	//=======================================================
	// Runs after all scripts have finished loading
	//=======================================================
	function doneLoading()
	{
		// Asynchronous taming: Set semaphor flags.
		isLoaded = true;

		// Don't start the game if we're terminating
		if (isTerminating)
			return;

		if (typeof(game) !== 'undefined')
		{
			game.actPath = that.path + '/' + that.name + '/';
	//		game.sharedPath = that.path + 'Shared/';
			game.sharedPath = game.actPath + 'shared/';	// It's not really shared anymore.  There were too many conflicts.

			game.StartGame();
			hasRun = true;
		}
		else
			fw.log("You've got no game!");
	}

	//=======================================================
	// This will be called if a script is missing, load times out,
	// the user isn't logged in, or load is cancelled.
	//=======================================================
	function loadFailed(xhr)
	{
		isLoaded = true;		// Not successfully, but at least we can terminate this way

		// This is safety code.  Normally an activity calls game.Cleanup() on exit.
		// However, it's possible that CAAT gets loaded and not the activity.  In that case,
		// CAAT needs to be pried out of memory.
		// On an abort, this will also happen elsewhere. In that case (only) it's redundant but harmless.
		if (typeof(CAAT) !== "undefined")
			CAAT.clearEvents();

		if (isTerminating)
			return;

		// Show the appropriate error screens unless we're terminating
		var err = xhr.status;
		if (app.getError(err) === 'NotLoggedIn')
			app.needLogin();
		else
			app.loadFailed('activity');
	}

	//=======================================================
	// Intelligently unload injected scripts
	// They may still be loading.  Shut everything down aggressively.
	//=======================================================
	function unloadScripts()
	{
		// Prevent any more scripts from loading
		scriptList = [];

		// Prevent the CAAT scene from starting if it hasn't yet
		if (typeof(CAAT) !== "undefined")
			CAAT.abortLoad = true;

		// Abort pending ajax requests. Resource loads happen externally; this won't prevent those.
		for (var i = 0, len = ajaxHandles.length; i < len; i++)
			ajaxHandles[i].abort();

		// Unbind events and shut down the scene
		if (typeof(game) !== "undefined" && hasRun)
		{
			// Stop loading resources (this will likely crash if !hasRun)
			CAAT.Module.Initialization.Template.terminate();

			// There is a period between StartGame and game asset load that CAAT.currentDirector doesn't exist.
			// Perhaps we should skip Cleanup if assets haven't been loaded, but it's safer for now to just
			// ensure that CAAT.currentDirector has a value.
			// Don't do that until we're calling Cleanup, though! It is used internally as a flag and will break activities.
			cleanupHack();

			game.Cleanup && game.Cleanup();
		}
		else
			(typeof(CAAT) !== "undefined") && CAAT.clearEvents();		// The library probably ran and bound some events even if the game didn't run

		delete game;
		delete CAAT;
	}

	//=======================================================
	// There is a period between StartGame and game asset load that CAAT.currentDirector doesn't exist.
	// Perhaps we should skip Cleanup if assets haven't been loaded, but it's safer for now to just
	// ensure that CAAT.currentDirector has a value.
	// Don't do that until we're calling Cleanup, though! It is used internally as a flag and will break activities.
	//=======================================================
	function cleanupHack()
	{
		if (game.Cleanup && !CAAT.currentDirector)
			CAAT.currentDirector = {clean: function(){}}
	}

	//=======================================================
	// This is a bit of a namespace violation, but we need
	// to make a function available to activities to notify
	// of when they are done initializing.
	//=======================================================
	app.activityLoaded = function()
	{
		app.clearLoadingBox();
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		loadCount = 0;
		scriptList = that.files;
		ajaxHandles = [];

		// Create the canvas element -- we might need to move this to the game itself, or at
		// least have a type in the game data file.  It would be nice to support DOM as well as canvas.
		createElement();

		app.loadingBox();	// This shouldn't be in a widget, should it?
		loadScripts();
	}

	//=======================================================
	//=======================================================
	this.terminateSelf = function()
	{
		isTerminating = true;
		unloadScripts();
	}
}