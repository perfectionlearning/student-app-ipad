;(function() {

	var vw = app.Views.Test = {};

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container)
	{
		// Set the container color (since it's not the default white)
		app.containerColor('Stage', '#F3E8CC');

		fw.setLayout('AtAGlance');		// Steal a layout
		vw.view = new TestView({el: container});	// Create the view
	};

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	vw.drawList = fw.drawList({
		barTop: [
			'barTop', 'image', {image: 'barTop'}
		],

		barTitle: [
			'barTitle', 'image', {image: 'barTitle'}
		],

		titleText: [
			'titleText', 'title', {text: 'Test Mode'}
		],
	});

	//=======================================================
	// View (and controllers)
	//=======================================================
	var TestView = Backbone.View.extend({
	});

	//=======================================================
	// CLOSE function
	//=======================================================
	vw.close = function()
	{
		vw.view.unbind();
		vw.view.remove();
	}

	//=======================================================
	// READY function
	//=======================================================
	vw.ready = function()
	{

		var ms1 = new Date().getTime();

		for (var i = 0; i < 1000; i++)
		{
			fw.createWidget('rect', {
				x: 100,
				y: 100,
				w: 100,
				h: 100,
				color: 'black'
			});
		}

		var ms2 = new Date().getTime();

		alert(ms2-ms1);
	}

})();
