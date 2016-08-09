//===============================================================================
// Login page
//===============================================================================
;(function() {

	var vw = app.Views.ChangeEmail = {};

	var errorCodes = {
		0: "Unable to connect to the server.",
		401: "That doesn't appear to be a valid email address.",
		403: "Incorrect username or password.",
		409: "An account already exists for that email address."
	};

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container) {
		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true}), drawList));
		app.router.navigate('changeemail');
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
		app.loginResults.changeEmail();

		app.loginResults.set({
			email: fields[0],
			pw: fields[1],
			new_email: fields[2]
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
	// Verify that both passwords match
	//=======================================================
	function emailMatch(email2, fields)
	{
		if (fields[2] !== fields[3])
			return {
				isValid: false,
				error: "The two email fields don't match."
			}

		return {
			isValid: true,
			error: ''
		}
	}

	//=======================================================
	//
	//=======================================================
	function confirm()
	{
		fw.createWidget('form', {
			w: 445,			// @FIXME/dg

			title: 'Success!',
			infoText: "Your email address has been changed. Click below to return to the book.",
			buttons: [
				{image: 'LoginBtn', frame: 'OK', type: 'OK', click: moveOn}
			],

			buttonVMargin: 10	// Vertical space between the inputs and buttons
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
		app.linkToObject('prefsPage')
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
				text: 'Change Email',
				font: 'bold 27px Arial',	// @FIXME/dg: Move to style
				color: '#0051C1'
			}
		],

		login: [
			'login', 'form', {
				w: 445,			// @FIXME/dg

				title: 'Use this form to change your email address.',
				fields: [
					{label: 'Old Email or Username'},
					{label: 'Password', type: 'pw'},
					{label: 'New Email Address'},
					{label: 'Confirm Email', validate: emailMatch},
				],
				buttons: [
					{image: 'LoginBtn', frame: 'Change', type: 'OK', click: doLogin}
				],

				buttonVMargin: 46	// Vertical space between the inputs and buttons
			}
		]
/*
		instruct: [
			'instruct', 'text', {
				text: "<b>Note:</b> You can't use this page to change your username.<br/>You can use it to change from a username to an email address.",
				font: '16px Arial',
				color: 'black'
			}
		]
*/
	};

})();
