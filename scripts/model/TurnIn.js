//=======================================================
// Problem model / Problem Set collection
//=======================================================
(function() {

	//=======================================================
	// Model
	//=======================================================
	var turnin = Backbone.Model.extend({
		urlRoot: app.turnInUrl
	});

	//=======================================================
	// Instance(s)
	//=======================================================
	app.turnIn = new turnin;

})();
