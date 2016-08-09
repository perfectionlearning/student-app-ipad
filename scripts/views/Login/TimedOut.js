//===============================================================================
// Login page
//===============================================================================
;(function() {

	var vw = app.Views.TimedOut = {};

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container)
	{
		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true, noSearch: true, noNavHandle:true}), drawList));
		fw.setLayout('ErrorScreen');
	}

	//=======================================================
	//=======================================================
	vw.ready = function() {
		app.globalUIInit();
	}

	//=======================================================
	// Perform login
	//=======================================================
	function toLogin()
	{
//		app.linkToObject('login');
		app.logout();
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
/*
		title: [
			'title', 'text', {
				text: 'Connection Error',
				font: 'bold 27px Arial',	// @FIXME/dg: Move to style
				color: '#0051C1'
			}
		],
*/
		msg: [
			'message', 'form', {
				w: 400,			// @FIXME/dg

				title: 'Unknown User',
				infoText: "You aren't currently logged into the book. You may have timed out due to inactivity.",
				buttons: [
					{image: 'LoginBtn', frame: "OK", type: 'OK', click: toLogin}
				],

				buttonVMargin: 46	// Vertical space between the inputs and buttons
			}
		],

	};

})();
