//===============================================================================
// Global UI drawlists and associated logic
//===============================================================================
;(function() {

	var curOpts;

	//-------------------------------------------------------
	//-------------------------------------------------------
	var menu = [
		{ t:'Assignments', icon: 'Homework', act: app.homework },
//		{ t:'Grades', icon: 'Grades', act: app.grades },
//		{ t:'Graphs', icon: 'Graph', act: app.graphs },

		//%?USER_LEVEL=none%		// Only teachers can use admin
		{ t:'Grades', icon: 'Graph', act: app.grades },

		//%?USER_LEVEL=student%		// Only students have access to Settings right now
		{ t:'Classes', icon: 'LPTOC', act: app.classes },
		//?%

		//%?USER_LEVEL=none%		// Only teachers can use admin
		{ t:'Admin', icon: 'Admin', act: app.admin },
		//?%

		//%?USER_LEVEL=student%		// Only students have access to Settings right now
		{ t:'Settings', icon: 'Settings', act: app.Settings },
		//?%

		//%?USER_LEVEL=none%		// Only teachers can use admin
		{ t:'Support', icon: 'Help', act: app.supportPage },
		//?%

		//%?USER_LEVEL=student%		// Only students can log out. It causes issues in AMSCO A1.
		{ t:'Logout', icon: 'Logout', act: app.logout }
		//?%
	]

	//-------------------------------------------------------
	// Menu slideout
	//-------------------------------------------------------
	var globalNav = {
		menuButton: [
			'menuButton', 'button', {
				image: 'NavIcons',
				frame: 'Menu',
				click: app.navMenu,
				depth: fw.MIDPLUS
			}
		],

		navSlider: [
			'navSlider', 'navMenu', {
				items: menu,
				depth: fw.MIDPLUS+1
			}
		]
	}

	//-------------------------------------------------------
	//-------------------------------------------------------
	var navArrows = {

		nextButton: [
			'nextButton', 'button', {
				image: 'STIcons',
				frame: 'Next',
				depth: fw.MIDPLUS,
				click: app.nextSection
			}
		],

		backButton: [
			'backButton', 'button', {
				image: 'STIcons',
				frame: 'Back',
				depth: fw.MIDPLUS,
				click: app.prevSection
			}
		]
	}

	//-------------------------------------------------------
	//-------------------------------------------------------
	var statusLine = {
		statusLine: [
			'statusLine', 'statusLine', {depth: 1}
		]
	}

	//=======================================================
	// Drawlist that gets added to every view.  It contains
	// global navigation widgets.
	//
	// OPTIONS: noNav, noArrows, noTopNav, noStatus, noNavHandle
	//=======================================================
	app.globalDrawList = function(opts)
	{
		opts = opts || {};

		if (app.isHiddenChapter())
			opts.noNav = true;

		// noNav has been turned into a compound option (noArrows + noTopNav)
		if (opts.noNav)
		{
			opts.noArrows = true;
			opts.noTopNav = true;
		}

		curOpts = opts;

		var out = [globalNav];

//		if (!opts.noArrows)
//			out.push(navArrows);

		// Add the status line
		if (!opts.noStatus)
			out.push(statusLine)

		return out;
	}

	//=======================================================
	//=======================================================
	app.globalUIInit = function()
	{
		if (!curOpts) return;

		// @FIXME/dg: This should be moved to the drawlist creation routine.  We don't hide
		// unused widgets; we don't draw them instead.  The "disable" calls above are to disable
		// individual items within a single widget.
		if (curOpts.noNavHandle)
		{
			var wid = fw.getWidget('menuButton');
			wid.disable(2);
		}

		app.setNavButtonState();
	}

	//=======================================================
	//=======================================================
	app.globalReadyForFunctionalTest = function(data)
	{
		// This is to trigger the Functional Test outer frame that the page has loaded.
//		console.log('app.globalReadyForFunctionalTest');

		if (!data) data = {};
		data.app = app;
		parent && parent.ft && parent.ft.uitest && parent.ft.uitest(data);
	}

	//=======================================================
	//=======================================================
	function checkSectionNavigation()
	{
		// Check for previous section; if not found, disable Back button.
		if (app.hasPrevSection() === false)
		{
			var bck = fw.getWidget('backButton');
			bck.disable(2);
		}

		// Check for next section; if not found, disable Next button.
		if (app.hasNextSection() === false)
		{
			var fwd = fw.getWidget('nextButton');
			fwd.disable(2);
		}
	}

	//=======================================================
	// Enable or disable the back/forward buttons
	//=======================================================
	app.setNavButtonState = function()
	{
		var wid = fw.getWidget('goBack', true);
		if (document.canGoBack && (document.canGoBack() === false))
			wid && wid.disable(2);
		else
			wid && wid.enable();

		wid = fw.getWidget('goForward', true);
		if (document.canGoForward && (document.canGoForward() === false))
			wid.disable(2);
		else
			wid && wid.enable();
	}

})();