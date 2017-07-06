//=======================================================
// Global configuration items that may vary between
// deployment targets or products.
//=======================================================
;(function() {

	app.route = {};

//===========================================================================================
// Data
//===========================================================================================

	//-----------------------------------
	// List of objects (book and built-in) with
	// associated views and other data.
	//
	// Among other things, this tells the app
	// which view to display for each type of
	// object linked to.
	//-----------------------------------
	var objectMap = {
		// Book objects (one per type or metatype)
		qc: {v: "WorkView", up: "TOC"},

		// Built-in objects
		prefsPage: {bi: 1, v: "PrefsPage"},
		assignList: {bi: 1, v: "AssignmentList"},
		studentGrades: {bi: 1, v: "StudentGrades", up: "assignList"},
		probList: {bi: 1, v: "ProblemList", up: "assignList"},
		prob: {bi: 1, v: "WorkView", up: "probList"},
		probid: {bi: 1, v: "WorkView"},
		loginChangeEmail: {bi: 1, v: "ChangeEmail"},
		loginChangePassword: {bi: 1, v: "ChangePassword"},
		loginChangeConfirm: {bi: 1, v: "ChangeConfirm"},
		timedOut: {bi: 1, v: "TimedOut"},
		help: {bi: 1, v: "Help"},
		classes: {bi: 1, v: "Classes"},
		drillResults: {bi: 1, v: "DrillResults", up: "assignList"},
	};
	//%?USER_LEVEL=teacher%
	objectMap.drillResults.up = "teacherAssignList";
	//?%

	//-----------------------------------
	// All up action targets need to be listed here.
	//-----------------------------------
	var upActions = {
		probList: {act: objLink},
		assignList: {act: objLink},
		teacherAssignList: {act: teacherAssignLink}
	};

	//-----------------------------------
	//-----------------------------------
	var Router = Backbone.Router.extend({
		routes: {
			'prob/:pspid': 'ohwProblem',
			'assignprob/:id/:pspid': 'assignProb',
			'probid/:id': 'probId',
			'prefs': 'prefs',
			'assignments': 'assignments',
			'studentGrades': 'studentGrades',

		//%?USER_LEVEL=teacher%		// DG: Temporarily removed for students until we add metadata to problem lists
			'assign/:id': 'assign',
		//?%

			'changeemail' : 'loginChangeEmail',
			'changepw' : 'loginChangePassword',
			'timeout': 'timeout',
			'help': 'help',
			'classes': 'classes',
			'*path': 'defaultRoute'
		},

		//-----------------------
		//-----------------------
		prefs: function() {
			app.initAndJump('prefsPage');
		},

		//-----------------------
		//-----------------------
		assignProb: function(id, probId) {
			app.curAssign = id;
			app.directProblem = probId;
			app.initAndJump('probList');
		},

		//-----------------------
		//-----------------------
		assign: function(id) {
			app.curAssign = id;
			app.initAndJump('probList');
		},

		//-----------------------
		//-----------------------
		loginChangeEmail: function() {
			app.initAndJump('loginChangeEmail');
		},

		//-----------------------
		//-----------------------
		loginChangePassword: function() {
			app.initAndJump('loginChangePassword');
		},

		//-----------------------
		//-----------------------
		assignments: function() {
			app.initAndJump('assignList');
		},

		//-----------------------
		//-----------------------
		studentGrades: function() {
			app.initAndJump('studentGrades');
		},

		//-----------------------
		// Online homework problems
		//-----------------------
		ohwProblem: function(id) {
			// If there's no assignment set, we can't display a single problem (via this route anyway)
			if (!app.curAssign)
				this.assignments();
			else
			{
				app.curProblem = id;
				app.initAndJump('prob');
			}
		},

		//-----------------------
		// Online homework problems
		//-----------------------
		probId: function(id) {
			app.curProblem = id;
			app.initAndJump('probid');
		},

		//-----------------------
		//-----------------------
		timeout: function() {
			app.initAndJump('timedOut');
		},

		//-----------------------
		//-----------------------
		help: function() {
			app.initAndJump('help');
		},

		//-----------------------
		//-----------------------
		classes: function() {
			app.initAndJump('classes');
		},

		//-----------------------
		//-----------------------
		defaultRoute: function() {
			app.initAndJump(app.defaultView);
		}
	});

//===========================================================================================
// Functions
//===========================================================================================

	//=======================================================
	//=======================================================
	app.route.init = function()
	{
		app.router = new Router();
		Backbone.history.start();
	}

	//=======================================================
	// Given an object reference, determine the correct
	// context.
	//=======================================================
	app.route.getViewFromObj = function(obj)
	{
		// Normally we favor metatype over type.  In this case, we want to start with the greatest
		// level of detail and work backwards.
		// Check by type.  If type isn't in the objectMap, fall back to metatype.
		// If metatype isn't in the objectMap, give up and go to the TOC
		if (objectMap[obj.t])
			var view = objectMap[obj.t].v;
		else if (objectMap[obj.mt])
			view = objectMap[obj.mt].v;
		else
		{
			fw.debug("I don't know how to deal with this type of object: " + obj.t);
			view = "AssignmentList";
		}

		return app.Views[view];
	}

	//=======================================================
	// Add our "built-in objects" to the object list.  The
	// object list contains everything that can be navigated to.
	// Book objects are already in that list, but we need to
	// add any other navigable pages to the list.
	//=======================================================
	app.route.addBuiltIns = function()
	{

		$.each(objectMap, function(key, val) {

			// If the object is marked as built-in, add it
			if (val.bi)
				app.addObject(key, key, val.mt, val.ch);
		});
	}

	//=======================================================
	//=======================================================
	app.route.isBuiltIn = function(type)
	{
		return objectMap[type] && objectMap[type].bi;
	}

	//=======================================================
	// Get linked object type for "up" navigation
	//
	// Allows two parameters.  The first is the type, which is the
	// highest priority type to search for.
	// If there's no match for the type, the supplied metatype
	// is used for the lookup.
	//=======================================================
	app.route.getUpNav = function(type, metatype)
	{
		// Look up type based on object type
		var out = objectMap[type] && objectMap[type].up;		// Returning null/undefined is okay

		// If no target type was specified for the current object type, try the
		// same lookup based on the current object metatype (assuming there is one)
		if (!out && metatype && objectMap[metatype])
			out = objectMap[metatype].up;

		return out;
	}

	//=======================================================
	// Fetch nav data that is specific to the target type.
	//=======================================================
	app.route.performUp = function(type)
	{
		if (upActions[type])
		{
			var act = upActions[type].act;
			act(type);
		}
	}

	//=======================================================
	// To handle "Up" function from drill results (teacher view)
	//=======================================================
	function teacherAssignLink()
	{
		app.homework();
	}

	//=======================================================
	// Link to an object of the specified type
	//=======================================================
	function objLink(type)
	{
		app.linkToObject(type);
	}

	//=======================================================
	// Navigate to the current location (effectively going up
	// from a child object).
	//=======================================================
	function navSelf()
	{
		app.navJump(app.curNav);
	}


//===========================================================================================
// Book Navigation
//===========================================================================================

	//=======================================================
	//=======================================================
	app.mainTOC = function()
	{
		app.setNav(0, 0, 0, 0, app.schemeList[0]);
		app.TOC();
	}

	//=======================================================
	//=======================================================
	app.lessonPlan = function()
	{
		app.setNav(0, 0, 0, 0, app.schemeList[1]);
		app.TOC();
	}

	//=======================================================
	//=======================================================
	app.book = function()
	{
		app.externalJump(app.paths.book);
	}

	//=======================================================
	//=======================================================
	app.homework = function()
	{
		if (app.isTeacher || app.tDemo)	// @FIXME/dg: Security issue! (minor)
		{
			app.loadingBox();
			app.externalJump(app.paths.homework);
		}
		else
			app.assignList();
	}

	//=======================================================
	//=======================================================
	app.grades = function()
	{
/*
		app.loadingBox();
		app.externalJump(app.paths.grades);
*/
		app.linkToObject('studentGrades');
	}

	//=======================================================
	//=======================================================
	app.graphs = function()
	{
		app.loadingBox();
		app.externalJump(app.paths.graphs);
	}

	//=======================================================
	//=======================================================
	app.admin = function()
	{
		app.loadingBox();
		app.externalJump(app.paths.admin);
	}

	//=======================================================
	//=======================================================
	app.Settings = function()
	{
		app.linkToObject('prefsPage');
	}

	//=======================================================
	// logout
	//=======================================================
	app.logout = function()
	{
		app.loginResults.logout();
		app.loginResults.save();
		// Set a flag to force a reload on the login page
//		app.forceReload = true;
//		app.linkToObject('login');

		app.loadingBox();
		app.externalJump(app.paths.logout);

	}

	//=======================================================
	// link to search page
	//=======================================================
	app.searchPage = function()
	{
		app.searchTerm = '';
		app.linkToObject('search');
	}

	//=======================================================
	//=======================================================
	app.gotoProbList = function()
	{
		app.linkToObject('probList');
	}

	//=======================================================
	//=======================================================
	app.assignList = function()
	{
		app.linkToObject('assignList');
	}

	//=======================================================
	//=======================================================
	app.needLogin = function()
	{
		app.linkToObject('timedOut');
	}

	//=======================================================
	// This is actually used for Help
	//=======================================================
	app.helpLink = function()
	{
		app.linkToObject('help');
	}

	//=======================================================
	//=======================================================
	app.classes = function()
	{
		app.linkToObject('classes');
	}

	//=======================================================
	//=======================================================
	app.supportPage = function()
	{
		var urlStr = '//www.perfectionlearning.com/kinetic-support?' +
			'pid=' + app.pid +
			'&ver=' + app.getVersionString();

		// Link version
		app.externalJump(urlStr);

		// Chrome version
//		document.kbGetExternalLink && document.kbGetExternalLink(encodeURI(urlStr));
	}

	//=======================================================
	//=======================================================
	app.browserBack = function()
	{
		window.history.go(-1);
	}

	//=======================================================
	//=======================================================
	app.browserFwd = function()
	{
		window.history.go(1);
	}

})();
