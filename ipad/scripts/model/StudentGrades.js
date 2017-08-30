//=======================================================
// Grades model
//=======================================================
(function() {

	//=======================================================
	// Model
	//=======================================================
	var studentGrades = Backbone.Model.extend({
		id: 1, // Force PUT instead of POST

		//---------------------------------
		// Retrieve grade data
		//---------------------------------
		getGradeData: function(course_id) {
			delete this.urlRoot;
			this.url = app.studentGradesPath + 'retrieve';

			return this.save();
		}

	});

	//=======================================================
	// Create the collection instance
	//=======================================================
	app.studentGradesModel = new studentGrades;

})();
