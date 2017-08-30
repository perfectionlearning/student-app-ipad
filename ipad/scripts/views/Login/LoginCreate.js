//===============================================================================
// Login page
//===============================================================================
;(function() {

	var vw = app.Views.LoginCreate = {};

	var errorCodes = {
		0: "Unable to connect to the server.",
		401: "That isn't a valid registration code.",
		402: "Your account has been created, but that registration code isn't for this product.",
		403: "That password doesn't meet our security requirements.",
//		405: "There was a problem creating your account.  Please contact customer support.",
		409: "An account already exists for this email or username.",
		410: "No remaining seats are available for that code.  Please contact customer support.",
		412: "I'm unable to create an account with this registration code."
	};

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container) {
		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true, noSearch: true, noNavHandle:true}), drawList));
		app.router.navigate('login/create');
		fw.setLayout('LoginCreate');
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
		app.loginResults.createAccount();

		app.loginResults.set({
			first: fields[0],
			last: fields[1],
			email: fields[2],
			pw: fields[3],
			token: fields[5]
		});

		app.loginResults.save().done(success).fail(error);
	}

	//=======================================================
	// Verify that both passwords match
	//=======================================================
	function pwMatch(pw2, fields)
	{
		if (fields[3] !== fields[4])
			return {
				isValid: false,
				error: "The two password fields don't match."
			}

		return {
			isValid: true,
			error: ''
		}
	}

	//=======================================================
	// Successfully logged in; go to TOC
	//=======================================================
	function success()
	{
		app.clearLoadingBox();

		var wid = fw.getWidget('login');
		wid && wid.terminate();

		var wid = fw.getWidget('instruct');
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
			w: 400,			// @FIXME/dg

			title: 'Welcome to First Person Physics!',
			infoText: "Your account has been created. Click the button below to get started.",
			buttons: [
				{image: 'LoginBtn', frame: 'OK', type: 'OK', click: moveOn}
			],

			buttonVMargin: 10	// Vertical space between the inputs and buttons
		}, {
			top: 'title bottom 30',
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
				text: 'Create an Account',
				font: 'bold 27px Arial',	// @FIXME/dg: Move to style
				color: '#0051C1'
			}
		],

		login: [
			'login', 'form', {
				w: 400,			// @FIXME/dg

				title: 'Fill in the form below to create an account.',
				fields: [
					{label: 'First Name'},
					{label: 'Last Name'},
					{label: 'Email or username'},
					{label: 'Password', type: 'pw'},
					{label: 'Confirm Password', type: 'pw', validate: pwMatch},
					{label: 'Registration Code'}
				],
				buttons: [
					{image: 'LoginBtn', frame: 'Create', type: 'OK', click: doLogin}
				],

				buttonVMargin: 66	// Vertical space between the inputs and buttons
			}
		],

		instruct: [
			'instruct', 'text', {
				text: "<b>Note:</b> Passwords must be at least 6 characters long.  They must include a lowercase letter, an uppercase letter, and a number.",
				font: '16px Arial',
				color: 'black'
			}
		]

	};

})();
