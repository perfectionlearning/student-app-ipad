//=======================================================
// Problem model / Problem Set collection
//=======================================================
(function() {

	//=======================================================
	// Model
	//=======================================================
	var ResultModel = Backbone.Model.extend({
		defaults: {
			studentResponse: '',
//			metrics: {}
		},

		urlRoot: '/',

		//-----------------------------------------------------
		//-----------------------------------------------------
		setProblem: function(assign, problem)
		{
			// Clear the server response from the model, otherwise it gets sent back to the server on the next request
			this.clear({silent:true});

			this.url = app.submitUrl + assign + '/' + problem;
			this.id = problem;	// If there's an id, .save uses PUT.  If not, it uses POST.
		},

		//-----------------------------------------------------
		//	setStep:  set up url for REST call to check step answer.
		//		lastStep: indicates whether or not this is the last step.  If so,
		//		the arbitrarily chosen string 'ls' is appended to the call.
		//		This is important, because the server must set a flag for this
		//		problem, so the values used for it can be refreshed.
		//
		// @FIXME/dg: This is functionally identical to setProblem above. Use a combined routine!
		// Also, last step functionality should be moved to the server! The client isn't secure.
		//-----------------------------------------------------
		setStep: function(assign, problem, stepNdx) {
			// Clear the server response from the model, otherwise it gets sent back to the server on the next request
			this.clear({silent:true});

			this.id = assign;	// @FIXME/dg: I don't think this is used. It should match the routine above.

			this.url = app.submitUrl + assign + '/' + problem + '/' + stepNdx;
		}
	});

	//=======================================================
	// Not used anymore -- lock a problem when the user requests a solution.
	// This was insecure and thus moved to the server.
	//=======================================================
	app.LockModel = Backbone.Model.extend({

		setProblem: function(assign, problem)
		{
			this.url = app.submitUrl + assign + '/' + problem + '/lock';
			this.id = problem;	// If there's an id, .save uses PUT.  If not, it uses POST.
		}
	});

	//=======================================================
	// Instance(s)
	//=======================================================
	app.result = new ResultModel;

	app.lockProblem = new app.LockModel;

})();
