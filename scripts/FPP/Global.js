//===============================================================================
// Global UI drawlists and associated logic
//===============================================================================
;(function() {

	var curOpts;

	//-------------------------------------------------------
	//-------------------------------------------------------
	var menu = [
		{ t:'Book', icon: 'TOC', act: app.mainTOC },
		{ t:'Lesson Plans', icon: 'LPTOC', act: app.lessonPlan, enable: !!app.isTeacher },	// @FIXME/dg: Security breach! (minor)
		{ t:'Homework', icon: 'Homework', act: app.homework },
		{ t:'Grades', icon: 'Grades', act: app.grades },
		{ t:'Admin', icon: 'Admin', act: app.admin, enable: !!app.isTeacher },	// @FIXME/dg: These options are fixed.  There's no reason to change them at run-time based on user level!
		{ t:'Factbook', icon: 'Factbook', act: app.factBook },
		{ t:'Settings', icon: 'Settings', act: app.Settings },
		{ t:'Support', icon: 'Help', act: app.helpLink },
		{ t:'Logout', icon: 'Logout', act: app.logout }
	]

	//-------------------------------------------------------
	// Widget definition for the pulldown navigation bar.
	// This gets modified whenever the bar is drawn.
	//-------------------------------------------------------
	app.navBarDef = {
		chapter: {
			title: "CHAPTER",
			tabAsset: "PDChapter"
		},

		topic: {
			title: "TOPIC",
			tabAsset: "PDTopic"
		},

		section: {
			title: "SECTION",
			tabAsset: "PDSection"
		},

		depth: fw.TOP
	};

	//-------------------------------------------------------
	// Truly global -- These are always present (for now)
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

		searchBtn: [
			'searchBtn', 'button', {
				image: 'NavIcons',
				frame: 'Search',
				click: app.searchPage,
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
	var topNav = {

		topNav: [
			'topNav', 'topNav', app.navBarDef
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

	//-------------------------------------------------------
	//-------------------------------------------------------
	var helpIcon = {
		helpIcon: [
			'helpIcon', 'button', {
				image: 'SupportIcon',
				click: app.supportPage
			}
		]
	}

	//=======================================================
	// Drawlist that gets added to every view.  It contains
	// global navigation widgets.
	//
	// OPTIONS: noNav, noArrows, noTopNav, noStatus, noSearch, noNavHandle
	//=======================================================
	app.globalDrawList = function(opts)
	{
		opts = opts || {};

		if (app.isHiddenChapter())
			opts.noNav = true;

		if (app.isHelpChapter())
		{
			opts.noTopNav = true;
			opts.helpIcon = true;
		}

		// noNav has been turned into a compound option (noArrows + noTopNav)
		if (opts.noNav)
		{
			opts.noArrows = true;
			opts.noTopNav = true;
		}

		curOpts = opts;

		var out = [globalNav];

		// Add the pulldowns and arrows
		if (!opts.noTopNav)
			out.push(topNav);

		if (!opts.noArrows)
			out.push(navArrows);

		if (opts.helpIcon)
			out.push(helpIcon);

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

		// Disable the next/back buttons if at the beginning/end of a chapter
		if (!curOpts.noNav)
			checkSectionNavigation();

		// Disable the search button
		if (curOpts.noSearch)
		{
			var wid = fw.getWidget('searchBtn');
			wid.disable(2);
		}

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