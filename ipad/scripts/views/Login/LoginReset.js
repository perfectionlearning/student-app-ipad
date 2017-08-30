//===============================================================================
// Login page
//===============================================================================
;(function() {

	var vw = app.Views.LoginReset = {};

	var errorCodes = {
		0: "Unable to connect to the server.",
		403: "That doesn't appear to be a valid email address.",
		412: "Unable to reset the password for that address. Please contact customer support for help."
	};

	var successMsg = "Your password reset request was successfully submitted. Check your email for a link to reset your password.";

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container) {
		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true, noSearch: true, noNavHandle:true}), drawList));
		app.router.navigate('login/reset');
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
	function doReset(fields)
	{
		app.loadingBox();

		app.loginResults.clear();
		app.loginResults.resetPassword();

		app.loginResults.set({
			email: fields[0],
		});

		app.loginResults.save().done(success).fail(error);
	}

	//=======================================================
	//=======================================================
	function error(response)
	{
		app.login.error(response, errorCodes);
	}

	//=======================================================
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
	//
	//=======================================================
	function confirm()
	{
		fw.createWidget('form', {
			w: 455,			// @FIXME/dg

			title: 'Success!',
			infoText: successMsg,
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
		app.linkToObject('login')
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
				text: 'Password Reset',
				font: 'bold 27px Arial',	// @FIXME/dg: Move to style
				color: '#0051C1'
			}
		],

		login: [
			'login', 'form', {
				w: 455,			// @FIXME/dg

				title: 'Enter your email address to reset your password.',
				fields: [
					{label: 'Email address'},
				],
				buttons: [
					{image: 'LoginBtn', frame: 'Reset', type: 'OK', click: doReset}
				],

				buttonVMargin: 66,	// Vertical space between the inputs and buttons
			}
		],

		instruct: [
			'instruct', 'text', {
				text: "<b>Note:</b> You must have an email address associated with your account to reset your password.  If you don't, please see your teacher for assistance.",
				font: '16px Arial',
				color: 'black'
			}
		]

	};

})();
