//===============================================================================
// Simple view that shows preferences
//===============================================================================
;(function() {

	var vw = app.Views.PrefsPage = {};

	var prefSections = [
		{
			label: 'Password',
			action: changePassword,
			button: 'PrefsPassword',
			text: "Change your password."
		},

		{
			label: 'Email',
			action: changeEmail,
			button: 'PrefsEmail',
			text: "Change your email address."
		}

	];

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container)
	{
		app.router.navigate('prefs');

		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true}), drawList));
		fw.setLayout('PrefsPage');
	};

	//=======================================================
	// READY function
	//=======================================================
	vw.ready = function()
	{
		app.globalUIInit();
	}

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {
		Logo: [
			'Logo', 'image', {
				image: 'Logo'
			}
		],

		prefSectionText: [
			'prefs', 'prefsList', {
				text: 'PrefSection',
				sections: prefSections,
			}
		]

	};

	//=======================================================
	// link to check for update functionality.
	//=======================================================
	function checkForUpdate()
	{
		document.kbCheckForUpdates && document.kbCheckForUpdates();
	};

	//=======================================================
	// link to change password.
	//=======================================================
	function changePassword()
	{
		app.linkToObject('loginChangePassword');
	};

	//=======================================================
	// link to change email.
	//=======================================================
	function changeEmail()
	{
		app.linkToObject('loginChangeEmail');
	};

	//=======================================================
	// link to proxy functionality
	//=======================================================
	function proxy()
	{
		document.kbOpenConnectionSettings && document.kbOpenConnectionSettings();
	}


})();
