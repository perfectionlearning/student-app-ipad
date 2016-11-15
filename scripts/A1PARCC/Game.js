//=======================================================
// Define top-level namespace object and its major interfaces
//=======================================================
if (typeof app === "undefined")
	app = {};

app.Resources = {};
app.Layouts = {};
app.Views = {};
app.objectList = {};

//=======================================================
// Init global variables
//=======================================================
app.MOBILE = navigator.userAgent.match(/mobile/i);

app.ONE_SECOND = 30;
app.curProblem = 0;
app.curProbIndex = 0;
app.curObjName = "";
app.curNav = {};
app.upNav = {};
app.PLPage = 0;		// Problem list page
app.errInfo = "";

//==========================================================================
//==========================================================================

//=======================================================
// High level app manager
//=======================================================
$(function() {

	// All of these must become true before the application can start
	var startRequirements = {
		assetsLoaded: false,		// Poor error checking (message, no way to recover)
		loggedIn: false				// Good error checking
	};

	//=======================================================
	// If this is the first-time entry, load the project assets.
	// This ends up linking to the correct object.
	// If not a first-time entry, just jump to the requested object.
	//=======================================================
	app.initAndJump = function(name)
	{
		// First choice
		if (!app.curObject)
		{
			app.curObjName = name;
			assetsInit(loadError);
		}
		else
			app.linkToObject(name);		// Do this instead of a navJump since it could be a child object
	}

	//=======================================================
	// Right now, assets are global.
	// @FIXME/dg: Allow different modules to manage their own assets (that makes pre-loading difficult)
	// Add a game module init which returns a list of assets of each type?
	//=======================================================
	function assetsInit(error)
	{
		fw.initAtlas(app.Resources.manifest);
		fw.queueImages(app.Resources.images);  // load atlas and tiling background images.
		fw.queueAudio(app.Resources.audio);
		fw.downloadAll(assetsDone, error);
	}

	//=======================================================
	//=======================================================
	function assetsDone()
	{
		startApp('assetsLoaded');
	}

	//=======================================================
	// Start the application when everything is ready
	//=======================================================
	function startApp(flag)
	{
		startRequirements[flag] = true;

		var done = true;
		$.each(startRequirements, function(idx, val) {
			if (!val) done = false;
		});

		if (done)
		{
			// Figure out which content to start in
			var name = app.curObjName;
			if (name && app.objectList[name])
				app.linkToObject(name);
			else if (name && app.route.isBuiltIn(name))
				app.linkToObject(name);
			else
				app.linkToObject(app.defaultView);	// Default context
		}
	}

	//=======================================================
	// Set a new game context (view)
	//=======================================================
	function setContext(view)
	{
		// Call the Close function for the old context, if there is one
		gameContext && gameContext.close && gameContext.close();

		// Reset the framework.  Do this before the container is removed.  Some termination routines require it.
		fw.reset();

		// Delete the old container
		if (defined(app.container))
			app.container.remove();

		// Create the new context
		initContext(view);
	}

	//=======================================================
	// Called when all game assets have been loaded
	// Initializes a view.
	//=======================================================
	function initContext(view)
	{
		// Create a container for the new context
		app.container = app.createContainer(topContainer, 'Stage');
		fw.setContainer(app.container);	// Pass the container into the graphics module

		// Set the new context
		gameContext = view;

		// If there's any pre-initialization that needs to occur, do it.
		// Sometimes blocking events need to occur before a view's init function.
		// This most commonly occurs when waiting for AJAX events.
		if (defined(gameContext.preInit))
			gameContext.preInit(drawView);
		else
			drawView();
	}

	//=======================================================
	//=======================================================
	function drawView()
	{
		// Initialize the view
		gameContext.init(app.container);

		// Set the background color
		app.setSchemeBg();

		// Create the view
		if (!gameContext.drawList)
			return;

		fw.createScreen(gameContext.drawList);

		// Call the Ready function if there is one
		gameContext.ready && gameContext.ready();

		// Start the main loop
//		interval = setInterval(gameLoop, desiredRate);	// Was running faster than the desired rate, but that makes the interval quite low
	}

	//==============================
	//==============================
	function gameLoop()
	{
		var now = new Date().getTime();
		var frameTicks = now - lastFrameTime;	// Ticks since last call
		lastFrameTime = now;
		frameCounter += frameTicks;		// Frame counter holds the time in ticks since the program started

		// Call the context gameLoop until we catch up to where we should be (usually once)
		// This smooths out minor slow down (but not major gaps)
		while (frameCounter > desiredRate)
		{
			frameCounter -= desiredRate;
			gameContext.gameLoop();
		}
	}

	//===========================================================================================
	// Application-Wide Helper Functions
	//===========================================================================================

	//=======================================================
	// Set scheme background color
	//=======================================================
	app.setSchemeBg = function() {
		// Built-in objects use the color of the main scheme.  The TOC is the exception!
		if (app.curObject.builtIn && app.curObjName !== 'TOC')
			sch = app.schemeList[0];
		else
			var sch = app.curNav.scheme;

		app.containerColor('Stage', app.schemeBg[sch]);
	}

	//=======================================================
	// Change to a new view/context
	//=======================================================
	app.changeContext = function(view)
	{
		setContext(view);
	}

	//===========================================================================================
	// Move this somewhere, when you figure out a good place for it.
	//===========================================================================================
	//=======================================================
	// Create a new View in its own DOM element
	// If we don't, we end up with zombie views.  Yuck!
	//
	// These don't set a size, so they are effectively modal.
	// The stylesheet sets them to the size of the entire stage.
	//
	// We use absolute positioning for everything, so we can't
	// have container divs without sizes.  If we set to maximum
	// size, anything under the container can't be clicked.
	// Therefore, this is only useful for creating modal submenus.
	// If we passed in a size this could work, but it would
	// still be difficult to maintain if anything moves around.
	// Lesson: Absolute positioning and containers don't mix.
	//=======================================================
	app.createView = function(parent, viewType, name)
	{
		var cont = app.createContainer(parent, name, 'view');
		viewType.prototype.el = cont;
	    var view = new viewType();

		return view;
	}

	//=======================================================
	// Sets the size of a view element, allowing for div containers
	//
	// @FIXME/dg: Illegal code.  Move this, along with other
	// container creation and manipulation code, to a low-level
	// framework module!
	//=======================================================
	app.viewSize = function(view, x, y, w, h)
	{
		view.$el.css({
			left: x,
			top: y,
			width: w,
			height: h
		});
	}

	//=======================================================
	// Convert a base string to a full URL
	//=======================================================
	app.getImageName = function(name)
	{
		return name;
	}

	//=======================================================
	//=======================================================
	function loadError(err)
	{
		app.error('<b>Error loading required files.</b><br/><br/>' +
			'Failed to load file:<br/>' +
			'<span style="color:#a52a2a;">' + err + '</span><br/><br/>' +
			'Check your network connection and reload the page.'
		);
	}

	//=======================================================
	//=======================================================
	function startupError()
	{
		app.error('<b>Error loading required files.</b><br/><br/>' +
			'Check your network connection and reload the page.'
		);
	}

	//=======================================================
	// Product-specific setup
	//=======================================================
	function setupProductSpecific()
	{
		// Add built-in types to the objectList
		app.route.addBuiltIns();

		// Create a problem for use with quick check sections
		app.workProblem = new app.Question;		// @FIXME/dg: Remove!  Only used by paper problems now

		// Use app.curProblem as a marker to indicate that we're not in a problem set
		app.curProblem = -1;
	}

	//=======================================================
	// This actually occurs on every page load
	// The event passed in can tell us whether this is an
	// initial load, or a cached reload due to back/forward.
	//
	// If it was cached, we need to do some additional cleanup.
	//=======================================================
	function reloadHandler(event)
	{
		if (event.originalEvent.persisted)
		{
			// We only get here if a cached version was restored by back/forward

			// The pull-out menu should already be closed, but make sure
			var wid = fw.getWidget('navSlider');
			wid && wid.close();

			// Update the forward/back button state
			app.setNavButtonState();
		}
	}

	//=======================================================
	//
	//=======================================================
	function bookDefLoaded()
	{
		// Add built-in types to the objectList
		app.route.addBuiltIns();

		// Notify the load manager that the book definition has been loaded
		startApp('bookDefLoaded');
	}

	//=======================================================
	// Use the URL to determine which object to jump to
	//=======================================================
    function externalObjAccess()
    {
		var url = window.location.hash;
		// Search for a series of non-newline characters followed by either end of string or
		// ",#".  Don't recall the significance of ",#".
		var objExtract = url.match(/obj=(.+?)($|&|,#)(.+)?/);

		if (objExtract) {
			app.curObjName = objExtract[1];
			app.curObjExtra = objExtract[3];
		}
	}

	//=======================================================
	// Use the URL to determine whether in test mode
	//=======================================================
    function isFunctionalTestMode()
    {
		var search = window.location.search;
		var ft = search.indexOf('ft=1') != -1;
		return ft;
	}

	//=======================================================
	//=======================================================
	function manifestLoaded(data)
	{
		app.activityList = data;
		startApp('activityManifest');
	}

	//=======================================================
	// The standards file has successfully loaded. Clear the
	// gate.
	//=======================================================
	function standardsLoaded(data)
	{
		app.standardsList = data;
		startApp('standardsList');
	}

	//=======================================================
	// check login
	//=======================================================
	function checkLogin()
	{
		app.loginResults.checkLogin();
		app.loginResults.fetch().done(gotStatus).fail(notConnected);
	}

	//=======================================================
	//
	//=======================================================
	function gotStatus()
	{
		var t = app.loginResults.get('type');
		if (t && t !== 'student')
			app.tDemo = true;
		var course_id = app.loginResults.get('course_id');
		var user_id = app.loginResults.get('user_id');
		// Get grade data not to happen more than once, when user status retrieved.
		app.studentGradesModel.getGradeData(course_id)
			.then(function(data) {
				app.studentGradeData = data;
				startApp('loggedIn');		// Do this after setting curObjName
			});
	}

	//=======================================================
	// We're either not connected, or the server is down (then how did we load the page?!)
	// So what do we do about it?
	//=======================================================
	function notConnected()
	{
		// If we're already at the timeout screen, there's no need to do anything (but we can't check earlier)
		if (app.curObjName !== 'timedOut')
			app.curObjName = 'login';		// @FIXME/dg: We need to jump to an external login page

		startApp('loggedIn');		// Do this after setting curObjName
	}

	//=======================================================
	// Detect orientation from landscape to portrait.
	//=======================================================
	function orientationChangeDetect() {
		window.addEventListener('orientationchange', function() {
			app.orientationNotice();
		});
	}

	//=======================================================
	// MAIN ENTRY POINT
	//=======================================================
	document.kbHideChromebar && document.kbHideChromebar();
	app.FunctionalTestMode = isFunctionalTestMode();

	// Semi-temporary.  Log whether the appcache is being used.
	fw.log('Cache: ' + window.applicationCache.status);

	// Load the XML library
	app.xmlLib = require('xml');

	// Stage init
	var topContainer = $("#Worksheet");		// Ideally this is the only external dependency
	fw.stageSize([topContainer.width(), topContainer.height()]);
	fw.setSelector('standard');

	// Install global exception handler
	window.onerror = app.exception;
	$(window).bind("pageshow", reloadHandler);

	// Allow CORS
	$.ajaxSetup({
		xhrFields: {withCredentials: true},
		cache: true
	});

	// If we're doing unit tests, don't run the main app
	if (typeof(jasmine) !== "undefined")
		return;

	// Set a default position, but allow routing to override
	app.setNav(0, 0, 0, 0, app.schemeList[0]);

	// Product-specific setup
	setupProductSpecific();
	checkLogin();

	fw.LayoutList(app.Layouts);		// Pass application layout list into framework
	var gameContext = {};
	var curContext;

	app.route.init();

	app.container = app.createContainer(topContainer, 'Stage');
	fw.setContainer(app.container);		// Pass the container into the graphics module
	orientationChangeDetect(); // to detect shift from landscape to portrait on tablet device.

	app.loadingBox();

});		// End of onload()



//=====================================================================================
// @FIXME/dg: MOVE THESE ELSEWHERE!
//=====================================================================================

//=======================================================
// Create a notice for use if portrait mode is detected.
//=======================================================
app.orientationNotice = function()
{
	// Detect existing instance of the loading popup
	var wid = fw.getWidget('orientation', true);

	if (!wid) {
		var wid = fw.createWidget('orientation', {
			id: 'orientation',
			borderColor: 'black',
			borderWidth: 2,
			boxHPad: 0,
			boxVPad: 0

		},{
			wid: 'stage',
			my: 'top left',
			at: 'top left'
		});
	}
	if (window.orientation === 90) {
		wid.close();
	}
}

//=======================================================
// Create a 'loading' box during problem set loads
//=======================================================
app.loadingBox = function(text, bgColor, minTime)
{
	text = text || "Loading";
	bgColor = bgColor || '#0076ab';

	// Detect existing instance of the loading popup
	var wid = fw.getWidget('loading', true);
	if (wid) return;

	var wd = 200;	// @FIXME/dg: ?!
	var ht = 47;

	var wid = fw.createWidget('loading', {
		id: 'loading',

		text: text,
		font: 'bold 20px/25px Arial',	// @FIXME/dg: Move all of this to Styles!
		color: 'white',

		bgColor: bgColor,
		borderColor: 'black',
		borderWidth: 2,
		boxHPad: 80,	// 20 for the old tight fit
		boxVPad: 35,	// 10 for the old tight fit

		anim: "loading",
		animRate: 20,
		animMargin: 10,

		minTime: minTime
	},{
		wid: 'stage',
		my: 'center',
		at: 'center'
	});
}

//=======================================================
// Remove the loading box
//=======================================================
app.clearLoadingBox = function()
{
	var wid = fw.getWidget('loading', true);
	wid && wid.close();
}

//=======================================================
//=======================================================
app.resetView = function()
{
	app.linkToObject(app.curObjName);
}

//=======================================================
// Display a pop-up with only an OK option
//=======================================================
app.infoPopup = function(title, text, options)
{
	var stageSize = fw.stageSize();
	var wd = 260;
	var ht = 156;	// @FIXME/dg: Make this dynamic already!

	var action = (options && options.action ? options.action : clearBox);

	fw.createWidget('iconPopup', {
		id: 'info',
		x: stageSize[0]/2 - wd/2,
		y: stageSize[1]/2 - ht/2,
		w: wd,
		h: ht,

		box: {
			x1: stageSize[0]/2,
			y1: stageSize[1]/2,
			w1: 1,
			h1: 1,
			color: '#0076ab',
			borderColor: 'black',
			borderWidth: 2,
			rate: 250,
			fadeRate: 300
		},

		noBG: options && options.noBG,

		topMargin: 15,
		title: title,
		titleFont: 'bold 22px Arial',
		titleColor: 'white',
		leftMargin: 15,
		textMargin: 15,
		textAlign: 'center',
		textFont: 'bold 15px Arial',
		text: text,
		fadeInRate: 200,
		fadeOutRate: 200,

		iconPos: 'right',
		iconMargin: 8,
		iconGap: 7,
		iconAsset: 'LoginBtn',
		iconList: [
			{ frame: 'OK', callback: action }
		]

	}).docked();		// iconPopup doesn't work without docking (lame!)
}

//=======================================================
//
//=======================================================
function clearBox()
{
	var wid = fw.getWidget('info', true);
	wid && wid.close();
}

//=======================================================
// Display a connection error dialog
//=======================================================
app.loadFailed = function(type, action)
{
	action = action || app.resetView;

	app.clearLoadingBox();

	// Detect existing instance of the error popup
	var wid = fw.getWidget('error', true);
	if (wid) return;

	if (app.FunctionalTestMode) {
		console.log('trying to abort the error popup.');
		app.globalReadyForFunctionalTest();
	}

	type = type || "data";

	var stageSize = fw.stageSize();
	var wd = 260;
	var ht = 190;

	fw.createWidget('iconPopup', {
		id: 'error',
		x: stageSize[0]/2 - wd/2,
		y: stageSize[1]/2 - ht/2,
		w: wd,
		h: ht,

		box: {
			x1: stageSize[0]/2,
			y1: stageSize[1]/2,
			w1: 1,
			h1: 1,
			color: '#0076ab',
			borderColor: 'black',
			borderWidth: 2,
			rate: 250,
			fadeRate: 300
		},

		noBG: true,
		topMargin: 15,
		title: 'Error loading ' + type,
		titleFont: 'bold 22px Arial',
		titleColor: 'white',
		leftMargin: 15,
		textMargin: 15,
		textAlign: 'center',
		textFont: 'bold 15px Arial',
		text: "I can't load an important file from the Internet.  Please verify your connection and try again.",
		fadeInRate: 200,
		fadeOutRate: 200,

		iconPos: 'center',
		iconMargin: 18,
		iconGap: 7,
		iconAsset: 'TryAgain',
		iconList: [
			{ frame: 0, callback: action }
		]

	}).docked();		// iconPopup doesn't work without docking (lame!)
}

//=======================================================
// General failure handler
// This is a factory method that returns an error handling
// function.
//
// @FIXME/dg: This needs to know about external failure conditions, which is bad!
// The handler itself should be passed in, or else the list should be keyed by
// the handler, not by the cause.
//
// Can receive action (function) as a second parameter.
// If then uses type to try to determine a generic action (see @FIXME above!)
// Failing that, the default action in app.loadFailed is app.resetView.
//	 @FIXME/dg: This is too complex. And why is the default stored externally?
//=======================================================
app.failHandler = function(type, action) {
	var handlers = {
		solution: app.refreshSolution,
		step: app.resetStep,
		result: app.resetSubmit,
	}

	var actionHandler = action || handlers[type];	// Often undefined

	return function(err) {
		if (app.getError(err) === 'NotLoggedIn')
			app.needLogin();
		else
			app.loadFailed(type, actionHandler);
	}
}

//=======================================================
// Update navigation-related UI
//
// This occurs whenever a view is changed
//=======================================================
app.updateNavUI = function()
{
}

//=======================================================
//
//=======================================================
function getTocType()
{
	if (app.curNav.scheme === 'lessonPlan')
		return 'LPTOC';

	return 'BookTOC';
}

//=======================================================
// Set the up button icon
//=======================================================
app.getUpFrame = function()
{
	var map = {
		sectext: 'Section',
		assignList: 'AssignList',
		probList: 'ProbList'
	}

	// Look up target type based on current object type or metatype
	var targetType = app.route.getUpNav(app.curObject.t, app.curObject.mt);

	// If there's no up behavior, set the "blank" frame
	if (!targetType)
		return 'Blank';
	else
	{
		if (targetType === 'TOC')		// Special case.  Ugly!  If there are more special cases, we can generalize.
			return getTocType();
		else
			return map[targetType];
	}
}

//=======================================================
// @REMOVEME/dg: Remove this eventually.  It uses the chrome
// to launch the Unity application
//=======================================================
app.launchUnity = function(name)
{
	if (typeof (document.kbLaunchActivity) !== "undefined")
		document.kbLaunchActivity(null, name);
}

//=======================================================
// Display the book TOC
//=======================================================
app.TOC = function()
{
	// We link based on curNav and not a passed-in parameter because
	// this is sometimes called from a click action.  That passes in
	// a widget rather than the index we need.
	app.tocChapter = app.curNav && app.curNav.chapter;
	app.linkToObject('TOC');
}

//=======================================================
//=======================================================
app.navMenu = function()
{
/*
	var wid = fw.createWidget('navMenu', {
		x: 100,
		y: 100
	});

	wid.docked();
*/
	var wid = fw.getWidget('navSlider');
	wid && wid.open();
}

//=======================================================
// Create a container to hold a view
// This is necessary so we have something to delete when
// removing a view.  Otherwise, events stay bound to old
// views even if they are no longer referenced elsewhere.
//
// @FIXME/dg: This doesn't belong here.  It really doesn't
// belong anywhere!  Only the low-level graphic engine
// should manage containers!
//=======================================================
app.createContainer = function(parent, name, classType)
{
	if (!defined(classType))
		classType = '';

	return $('<div>').attr({id:name, 'class':classType}).appendTo(parent);
}

//=======================================================
// @FIXME/dg: This is horrible!  It violates our architecture
// in many important ways!
//=======================================================
app.containerColor = function(name, color)
{
	$('#' + name).css('backgroundColor', color);
}

//=======================================================
// Back to Correlation.
//=======================================================
app.Correlation = function()
{
	var pagesBack = -1 - app.pagesSinceTEKS; // probably not necessary anymore, since TEKS button goes away after first navigation on return from TEKS.
	app.pagesSinceTEKS = 0;
	window.history.go(pagesBack);
}

//=======================================================
// We're in a bad place.  Reset to somewhere sane.
//=======================================================
app.resetNav = function()
{
	app.setNav(0, 0, 0, 0, app.schemeList[0]);
}

//=======================================================
//=======================================================
app.tocToggle = function()
{
	if (app.curNav.scheme === app.schemeList[0])
		app.lessonPlan();
	else
		app.mainTOC();
}

//=======================================================
// Notification routine for navigation changes (actually view changes,
// since not all view changes update the navigation)
//=======================================================
app.navigationChange = function(obj, name)
{
	// For book objects, set a route so each view doesn't have to do it manually
	if (obj && !obj.builtIn)
		app.router.navigate('obj/' + name);
}

//=======================================================
//=======================================================
app.getMaxSubmissions = function()
{
	if (app.assignments && app.assignments.length && app.curAssign)
	{
		var assign = app.assignments.get(app.curAssign);

		return (assign && assign.get('maxsubmissions')) || 3;
	}

	return 3;
}

//=======================================================
// Filter for maximum allowed submissions. Since max
// submissions is a single value for a full assignment
// instead of being attached to each problem, we may
// have to adjust it in here.
//=======================================================
app.adjustedMaxSubmissions = function(max, type)
{
	// Certain input types only get 1 attempt
	if (['radio', 'essay'].indexOf(type) !== -1)
		return 1;

	// Default: Use the assignment setting
	return max;
}


//=======================================================
// Returns the index within an assignment of a given
// problem, referenced by ID
//=======================================================
app.findProblem = function()
{
	if (app.problemList)
	{
		for (var i = 0; i < app.problemList.length; i++)
		{
			if (app.problemList.at(i).get('problem_id') === app.curProblem)
				return i;
		}

		return null;
	}

	return null;
}

//=======================================================
//=======================================================
app.getVersionString = function()
{
	if (document.kbGetAppVersion)
	{
		var instVer = document.kbGetAppVersion();
		var lastDot = instVer.lastIndexOf('.');
		if (lastDot !== -1)
			instVer = instVer.substring(lastDot+1);
	}
	else
		instVer = 'xx';

	var out = 'Build ' + app.minorVersion;

	if (app.server !== 'livedb')
		out += ', ' + app.server;

	return out;
}

//=======================================================
//=======================================================
app.resizeStageHeight = function(h)
{
	var w = 1024;
	//var h = 2000;

	$('#Stage').width(w);
	$('#Worksheet').width(w);
	$('#Stage').height(h);
	$('#Worksheet').height(h);
	fw.stageSize([w,h]);
	fw.resetLayout();
}

//=======================================================
//=======================================================
app.externalJump = function(url)
{
	var wid = fw.getWidget('navSlider');
	wid && wid.close();

	location.href = url;
}

//=======================================================
//=======================================================
app.reloadPage = function()
{
	location.reload(true);
}
