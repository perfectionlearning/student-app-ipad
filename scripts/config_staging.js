//===============================================================================
// Global configuration items that may vary between
// deployment targets or products.
//===============================================================================

//===============================================================================
// DEPLOY NOTES:
//
// The string "//REMOVEME:" will always be removed.
//
// Variables defined in the deploy process will be inserted
// anywhere %%varname%% occurs.
//
// //%?varname=value% causes conditional deletion. If the deploy variable "varname" is set
// to "value", then the block will be maintained. Otherwise it will be deleted.
// The end of the block is defined by "//?%".
//
// Presently, the only variables used in deploy are:
//   BACKEND_SERVER -- "mariasdb", "testdb", or "livedb"
//   USER_LEVEL -- "student" or "teacher"
//===============================================================================
;(function() {
	if (typeof app === "undefined")
		app = {};

	// First Person Physics product ID (The teacher version has a PID of 91, set by the deploy process)
	app.pid = 999;
	app.book_id = 40; // for use with login (34=FPP, 40=PARCC A1)

	// Path to book content.  This can be absolute or relative.
	app.bookPath = '/books/A1PARCC/content/';		// Used for videos only in AMSCO Math
//	app.bookFile = 'BookDefinition.json';		// FPP only

	// Path to lesson plan object / Standards code correlation.  This can be absolute or relative.
//	app.objStandardsFile = 'standards/TEKS.json';	// FPP only

	// Paths to additional content, used by various modules.
	app.paths = {
		jsact: 'JSActivities/',
		mediaCreds: app.bookPath + 'mediacredits/index.html',
		correlations: app.bookPath + 'Correlations/correlations.html',
		search: '//search.kineticbooks.com/kbsearch/_search'
	};

	//app.defaultView = 'assignList';		// FPP: "TOC"
	app.defaultView = 'classes';		// A1PARCC: Default to 'classes' view

	//=======================================
	// Videos
	//=======================================
	app.qcHelpVideo = 'sum_qcs';

	// This setting enables or disables video controls in whiteboards.
//	app.showControls = true;	// FPP only

	//=======================================
	// User modes
	//=======================================
	app.schemeList = ['main'];
	app.schemeBg = {'main': '#145064'};

	//%?USER_LEVEL=teacher%
	app.isTeacher = true;		// This gets enabled for teachers. It changes navigation for the homework button.
	//?%

	//=======================================
	// Server environment
	//=======================================
	//REMOVEME: /*
	app.server = 'testdb';			// We need this. It's used in the version string.
	//REMOVEME: */
	//REMOVEME: app.server = '%%BACKEND_SERVER%%';	// Filled in by the deploy process

	// These are all in place during development, but the deploy process deletes all but the
	// applicable entry for security.
	var paths = {
		//%?BACKEND_SERVER=mariasdb%
		mariasdb: {
			h: '//denali.kineticbooks.com:8082/kb_rest_dev/rest.php/',	// Homework REST interface
			u: '//denali.kineticbooks.com:8082/kb_rest_dev/rest.php/',	// User-access REST interface
			hw: '',		// Homework link
			g: '',		// Grades link
			gr: '',		// Graphs link
			ad: '',		// Admin link
			lo: ''		// Logout link
		},
		//?%

		//%?BACKEND_SERVER=rickdb%
		rickdb: {
			h: '//rtoews-hw-bachelor.kbooks.local/ohw/rest/rest.php/',
			u: '//rtoews-hw-bachelor.kbooks.local/ohw/rest/rest.php/',
			hw: '//rtoews-hw-bachelor.kbooks.local/syllabus.php',
			g: '//rtoews-hw-bachelor.kbooks.local/gradebook.php',
			gr: '//rtoews-hw-bachelor.kbooks.local/class_report.php',
			ad: '//rtoews-hw-bachelor.kbooks.local/admin.php',
			lo: '//rtoews-hw-bachelor.kbooks.local/logout.php/'
		},
		//?%

		//%?BACKEND_SERVER=testdb%
		testdb: {
			h: '//test-ohw.kineticmath.com/rest/rest.php/',
//			h: '//alghwstaging.kineticmath.com/rest.php/',
			u: '//test-ohw.kineticmath.com/rest/rest.php/',
			hw: '//qa1.kineticmath.com/assignments/list',
			g: '//alghwstaging.kineticmath.com/gradebook.php',
			gr: '//alghwstaging.kineticmath.com/class_report.php',
			ad: '//alghwstaging.kineticmath.com/admin.php',
			lo: '//test-ohw.kineticmath.com/rest/rest.php/users/logout'
		},
		//?%

		//%?BACKEND_SERVER=livedb%
		livedb: {
			h: '//api.kineticmath.com/rest/rest.php/',
//			h: '//ohw.kineticmath.com/rest/rest.php/',
//			h: '//mathx.kineticmath.com/rest.php/',
//			u: '//ohw.kineticmath.com/rest/rest.php/',
			u: '//api.kineticmath.com/rest/rest.php/',
			hw: '//ohw.kineticmath.com/assignments/list',
			g: '//mathx.kineticmath.com/gradebook.php',
			gr: '//mathx.kineticmath.com/class_report.php',
			ad: '//mathx.kineticmath.com/admin.php',
			lo: '//api.kineticmath.com/rest/rest.php/users/logout'
		}
		//?%

	};

	var en = paths[app.server];
	var commRoot = en.h;
	var endpointRoot = en.h.replace(/rest\.php/, 'endpoint.php');

	app.loginPath = en.u + 'users/login';

	// @DEPLOY: It would be nice to set this conditionally, but it's not critical
	app.assignListPath = (app.server === 'mariasdb') ? (commRoot + 'assigns/book/' + app.book_id) : (commRoot + 'assigns');

	app.assignPath = endpointRoot + 'assign/';

	app.pSetPath = commRoot + 'pset/';
	app.qcServer = commRoot + "problems/";
	app.submitUrl = commRoot + 'submit/';
	app.turnInUrl = commRoot + 'turnin/';
	app.classListPath = commRoot + 'courses';
	app.classSelectPath = commRoot + 'courses/select';
	app.studentGradesPath = commRoot + 'grades/';

	app.paths.homework = en.hw;		// Homework link
	app.paths.grades = en.g;		// Gradebook link
	app.paths.graphs = en.gr;		// Graphs link
	app.paths.admin = en.ad;
	app.paths.logout = en.lo;
})();
