//=======================================================
// Assignment model / Assignment List collection
//=======================================================
(function() {

	//=======================================================
	// Model
	//=======================================================
	app.SingleAssignment = Backbone.Model.extend({

		// For setting a future due date for teacher.
		setUserDueDateToFuture: function(user_id) {
			this.url = app.assignPath + 'dates/' + app.curAssign + '/' + app.loginResults.get('user_id');
		}

	});
	
	//=======================================================
	// Create single assignment instance - just for updating assignment date
	//=======================================================
	app.singleAssignment = new app.SingleAssignment;	

	//=======================================================
	// Model
	//=======================================================
	app.Assignment = Backbone.Model.extend({

		urlRoot: 'assign',

		//=======================================================
		//=======================================================
		parse: function(response) {
			if (!response.type)
				response.type = "Missing";

			// Defaults do NOT belong here! Both validation and defaults aren't working!
			if (!response.due)
				response.due = '2001-01-01 00:00:00';

			if (!response.assigned)
				response.assigned = '2001-01-01 00:00:00';

			return response;
		},

		//=======================================================
		// @FIXME/dg: Defaults aren't being used!
		//=======================================================
		defaults: {
			name: 'No name set',
			assigned: '2001-01-01 00:00:00',
			due: '2001-01-01 00:00:00',
			maxsubmissions: 1
		},

		//=======================================================
		// @FIXME/dg: Validation no longer occurs on collection fetch()!
		// This routine isn't being called, which is bad.
		// If we can't force validation, then perhaps we should switch
		// to an 'update' instead of a 'reset'.  That requires clearing
		// the collection first though.
		//=======================================================
		validate: function(mod)
		{
			try {
				if (typeof(mod) != 'object')
					throw "Assignment validation didn't receive an object";

				// Check for missing fields
				if (!defined(mod.id) || mod.id == '')
					throw 'missing chapter id';
				if (!defined(mod.name) || mod.name == '')
					throw 'missing name';
				if (!defined(mod.data))
					throw 'missing data';

				// Set a maximum number of assignments to prevent the grid widget from breaking
				if (mod.data.length > 80)	// Hurray for magic numbers!
					mod.data.length = 80;

				// Check each assignment (don't use .each, return only returns from .each)
				// Now that we're using throw instead of return, .each would work.
				// Note that bad data for a single assignment causes the entire chapter to be invalid
				for (var i = 0; i < mod.data.length; i++)
				{
					var val = mod.data[i];
					if (!defined(val.status))
						throw 'missing status';
					if (['prof', 'improve', 'missing', 'notStarted', 'working', 'adapt'].indexOf(val.status) == -1)
						throw 'invalid status';
					if (!defined(val.id) || val.id == '')
						throw 'missing assignment id';
					if (!defined(val.name) || val.name == '')
						throw 'missing name';
					if (!defined(val.due))
						throw 'missing due date';
					if (!defined(fw.tools.parseDate(val.due)))
						throw 'invalid due date';
					if (!defined(val.assigned))
						throw 'missing assign date';
					if (!defined(fw.tools.parseDate(val.assigned)))
						throw 'invalid assign date';
					if (!defined(val.mode))
						throw 'missing mode';
					if (val.mode != 'star' && val.mode != 'point')
						throw 'invalid mode';
				}
			}
			catch(e)
			{
				fw.warning('Assignment validation error: ' + e);
				return e;
			}

		}
	});

	//=======================================================
	// Collection
	//=======================================================
	app.AssignmentList = Backbone.Collection.extend({
		model: app.Assignment,
		url: app.assignListPath,

		// Strip off the keys for each record
		parse: function(response) {
			var out = [];

			response && $.each(response, function(key, val) {
				out.push(val);
			});

			return out;
		},

		// Set quickcheck chapter mode
		chapterMode: function(chapId) {
			this.url = app.assignListPath + '/type/quickcheck/chapter/' + chapId;
		},

		// This is an ugly hack for Marias. Remove for non-Marias servers!
		// We can clean this up during deploy, but then dev versions won't work.
		resetURL: function() {
			if (app.server === 'mariasdb')
				this.url = this.url.replace(/assigns\/book\/.+/, 'assigns/book/' + app.book_id );
		}
	});

	//=======================================================
	// Create the collection instance
	//
	// This needs to occur before the Views try to use it.
	// The bootstrap process fills this with data later.
	//=======================================================
	app.assignments = new app.AssignmentList;
	app.qcAssignments = new app.AssignmentList;

})();
