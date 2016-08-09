//===============================================================================
// Login page
//===============================================================================
;(function() {

	var vw = app.Views.Login = {};

	var errorCodes = {
		0: "Unable to connect to the server.",
		402: "Your username and password are correct, but you don't have access to this product.",
		403: "Incorrect username or password.",
		412: "You can only login from a Kinetic Books product."
	};


	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container)
	{
		app.router.navigate('login');

		// A bit of a hack. If the forceReload global flag (bad!) is set, reload the page.
		// This is a cheap way of wiping out all internal variables, especially models and collections.
		// If someone logs out and another user logs in, we don't want any trace of the previous user.
		if (app.forceReload)
		{
			vw.drawList = null;			// Mark this view as invalid
			return app.reloadPage();
		}

		var options = app.isTeacher ? teacher : student;

		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true, noSearch: true, noNavHandle:true}), drawList, options));
		fw.setLayout('Login');
	}

	//=======================================================
	//=======================================================
	vw.ready = function() {
		app.globalUIInit();
	}

	//=======================================================
	//
	//=======================================================
	vw.close = function()
	{
		fw.abortAsync();
	}

	//=======================================================
	// Perform login
	//=======================================================
	function doLogin(fields)
	{
		app.loadingBox();

		app.loginResults.clear();
		app.loginResults.login();

		app.loginResults.set({
			email: fields[0],
			pw: fields[1],
			book_id: app.book_id
		});

		app.loginResults.save().done(success).fail(error);
	}

	//=======================================================
	// Successfully logged in; go to TOC
	//=======================================================
	function success()
	{
		// @FIXME/dg: Ugly hack to allow teachers to use the student product
		var t = app.loginResults.get('type');
		if (t && t !== 'student')
			app.tDemo = true;

		app.clearLoadingBox();
		app.linkToObject('TOC');
	}

	//=======================================================
	//=======================================================
	function error(response)
	{
		app.login.error(response, errorCodes);
	}

	//=======================================================
	// Shared by all the login pags
	//=======================================================
	app.login = {};
	app.login.error = function(response, map)
	{
		app.clearLoadingBox();

		var msg = map[response.status] || 'An unknown error has occurred.  Please contact customer support for help. (' + response.status + ')';

		var wid = fw.getWidget('login');
		wid && wid.showMessage(msg);
	}

	//=======================================================
	//
	//=======================================================
	function register()
	{
		app.linkToObject('loginRegister');
	}

	//=======================================================
	//
	//=======================================================
	function createAccount()
	{
		app.linkToObject('loginCreate')
	}

	//=======================================================
	//
	//=======================================================
	function passwordReset()
	{
		app.linkToObject('loginReset');
	}

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {
		backdrop: [
			'backdrop', 'borderedBox', app.style.backdrop
		],

		Logo: [
			'Logo', 'image', {
				image: 'Logo'
			}
		],

		title: [
			'title', 'text', {
				text: 'Login Page',
				font: 'bold 27px Arial',	// @FIXME/dg: Move to style
				color: '#0051C1'
			}
		],

		login: [
			'login', 'form', {
				w: 400,			// @FIXME/dg

				title: 'Welcome! Please sign in below.',
//				title: 'Welcome! Please sign in, or choose one of the options below.',
				fields: [
					{label: 'Email or username'},
					{label: 'Password', type: 'pw'}
				],
				buttons: [
					{image: 'LoginBtn', type: 'OK', click: doLogin}
				],

				buttonVMargin: 46	// Vertical space between the inputs and buttons
			}
		]
	};

	//--------------------------
	// Student-specific
	//--------------------------
	var student = {
		options: [
			'options', 'optionList', {
				options: [
					{
						label: 'I need to <b>create an account</b>',
						click: createAccount
					},
					{
						label: 'I have an account, but I need to <b>register for a course</b>',
						click: register
					},
					{
						label: 'I have an account, but I <b>forgot my password</b>',
						click: passwordReset
					}
				]
			}
		]
	};

	//--------------------------
	// Teacher specific
	//--------------------------
	var teacher = {
		options: [
			'options', 'optionList', {
				options: [
					{
						label: 'I need to <b>create an account</b>',
						click: createAccount
					},
					{
						label: 'I need to <b>register this product</b>',
						click: register
					},
					{
						label: 'I have an account, but I <b>forgot my password</b>',
						click: passwordReset
					}
				]
			}
		]

	};
})();
