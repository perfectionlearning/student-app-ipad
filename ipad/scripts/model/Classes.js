//=======================================================
// Class model / Class List collection
//=======================================================
(function() {

	//=======================================================
	// Model
	//=======================================================
	var aClass = Backbone.Model.extend({

		//---------------------------------
		// Retrieve the current class
		//---------------------------------
		getClass: function() {
			delete this.urlRoot;
			this.url = app.classSelectPath;

			return this.fetch();
		},

		//---------------------------------
		// Set the current class
		//---------------------------------
		setClass: function(id) {
			delete this.url;
			this.urlRoot = app.classSelectPath;

			return this.save({id:id});
		}
	});

	//=======================================================
	// Collection
	//=======================================================
	var classList = Backbone.Collection.extend({
		model: aClass,
		url: app.classListPath
	});

	//=======================================================
	// Create the collection instance
	//=======================================================
	app.classList = new classList;

	//=======================================================
	// Create a model instance for selecting classes
	//=======================================================
	app.currentClass = new aClass;

})();
