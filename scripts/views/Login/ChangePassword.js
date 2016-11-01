//===============================================================================
// Login page
//===============================================================================
;(function() {

	var vw = app.Views.ChangePassword = {};

	var errorCodes = {
		0: "Unable to connect to the server.",
		400: "That password doesn't meet our security requirements.",
		403: "Incorrect username or password."
	};

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container) {
		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true}), drawList));
		app.router.navigate('changepw');
		fw.setLayout('LoginCreate');
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
		app.loginResults.changePassword();

		app.loginResults.set({
			email: fields[0],
			pw: fields[1],
			new_pw: fields[3],
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
	// Verify that both passwords match
	//=======================================================
	function pwMatch(pw2, fields)
	{
		if (fields[2] !== fields[3])
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
	//
	//=======================================================
	function confirm()
	{
		fw.createWidget('form', {
			w: 400,			// @FIXME/dg

			title: 'Success!',
			infoText: "Your password has been changed.",
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
				text: 'Change Password',
				font: 'bold 27px Arial',	// @FIXME/dg: Move to style
				color: '#0051C1'
			}
		],

		login: [
			'login', 'form', {
				w: 400,			// @FIXME/dg

				title: 'Use this form to change your password.',
				fields: [
					{label: 'Email or username'},
					{label: 'Old Password', type: 'pw'},
					{label: 'New Password', type: 'pw'},
					{label: 'Confirm Password', type: 'pw', validate: pwMatch}
				],
				buttons: [
					{image: 'LoginBtn', frame: 'Change', type: 'OK', click: doLogin}
				],

				buttonVMargin: 46	// Vertical space between the inputs and buttons
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
