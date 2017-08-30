//===============================================================================
// Login page
//===============================================================================
;(function() {

	var vw = app.Views.LoginRegister = {};

	var errorCodes = {
		0: "Unable to connect to the server.",
		401: "That isn't a valid registration code.",
		402: "That registration code isn't for this product.",
		403: "Incorrect username or password.",
		410: "No remaining seats are available for that code.  Please contact customer support.",
		412: "That is a student course registration code.  It can't be used by teachers."
	};

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container) {
		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true, noSearch: true, noNavHandle:true}), drawList));
		app.router.navigate('login/register');
		fw.setLayout('Login');
	}

	//=======================================================
	//=======================================================
	vw.ready = function()
	{
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
		app.loginResults.register();

		app.loginResults.set({
			book_id: app.book_id,
			email: fields[0],
			pw: fields[1],
			token: fields[2]
		});

		app.loginResults.save().done(success).fail(error);
	}

	//=======================================================
	// Successfully logged in; go to TOC
	//=======================================================
	function success()
	{
		app.clearLoadingBox();

		var wid = fw.getWidget('login');
		wid && wid.terminate();

		confirm();
	}

	//=======================================================
	//=======================================================
	function error(response)
	{
		app.login.error(response, errorCodes);
	}

	//=======================================================
	//
	//=======================================================
	function confirm()
	{
		fw.createWidget('form', {
			w: 360,			// @FIXME/dg

			title: 'Registration complete!',
			infoText: "Click the button below to get started.",
			buttons: [
				{image: 'LoginBtn', frame: 'OK', type: 'OK', click: moveOn}
			],

			buttonVMargin: 15	// Vertical space between the inputs and buttons
		}, {
			top: 'title bottom 50',
			centerx: 'backdrop center'
		});
	}

	//=======================================================
	//
	//=======================================================
	function moveOn()
	{
		app.linkToObject('TOC')
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
				text: app.isTeacher ? 'Product Registration' : 'Course Registration',	// This should be defined elsewhere.  Inline is messy!
				font: 'bold 27px Arial',	// @FIXME/dg: Move to style
				color: '#0051C1'
			}
		],

		login: [
			'login', 'form', {
				w: 400,			// @FIXME/dg

				// These should be defined elsewhere.  Inline is messy!
				title: (app.isTeacher ? 'Fill in the form below to register the product.' :
										'Fill in the form below to register for a course.'),

				fields: [
					{label: 'Email or username'},
					{label: 'Password', type: 'pw'},
					{label: 'Registration Code'}
				],

				buttons: [
					{image: 'LoginBtn', frame: 'Register', type: 'OK', click: doLogin}
				],

				buttonVMargin: 46	// Vertical space between the inputs and buttons
			}
		]

	};

})();
