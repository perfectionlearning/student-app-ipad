//=======================================================
// Whiteboard Data File
//=======================================================
(function() {

	//=======================================================
	// Model
	//=======================================================
	app.WhiteboardModel = Backbone.Model.extend({

		parse: function(data) {

			fixTitleMML(data);
			fixSlideMML(data);

			return data;
		}
	});

	//=======================================================
	//=======================================================
	function fixTitleMML(data)
	{
		data.Title = app.cleanMML(data.Title);
	}

	//=======================================================
	//=======================================================
	function fixSlideMML(data)
	{
		$.each(data.Slides, function(idx, val) {

			for (var i = 0, len = val.headlines.length; i < len; i++)
				val.headlines[i] = app.cleanMML(val.headlines[i]);

			for (var i = 0, len = val.bullets.length; i < len; i++)
				val.bullets[i] = app.cleanMML(val.bullets[i]);
		});
	}

	//=======================================================
	// Instance
	//=======================================================

    // Multiple models: store in array.
	// @FIXME/dg: This method is doomed.  We don't know how many are in a section.
    app.wbModelArr = [
	    new app.WhiteboardModel,
	    new app.WhiteboardModel,
	    new app.WhiteboardModel,
	    new app.WhiteboardModel,
	    new app.WhiteboardModel,
	    new app.WhiteboardModel,
	    new app.WhiteboardModel,
	    new app.WhiteboardModel,
	    new app.WhiteboardModel,
	    new app.WhiteboardModel
    ];

	app.wbModelSet = {};

})();
