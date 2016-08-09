//============================================================
// The problem state model
//
// This is a backbone model that represents the state of a single base question.
// It will reside within the actual Problem model, but this module
// doesn't depend on that.
//============================================================
;(function()
{
	app.pState = Backbone.Model.extend({
		defaults: {
			// Populated externally
			problem: null,		// The problem associated with this state (the scoring model requires access to many Problem variables)

			status: 'New',		// QC only: score 0 equals New, non-zero = Correct

			// Reset for each base question
			skip: false,		// Prevent this question from coming up again (could be good or bad)
//			maxStreak: 0,
			failures: 0,		// Number of times the student has moved to the next question for a failure (multiple wrong answers, viewed solution)
			failedOut: false,	// If true, the student can't get credit for the problem even with a correct answer

//			enteredStepMode: false,
			curStep: 0,

			correctCnt: 0,
			correctInARow: 0,
			wrongCnt: 0,
			wrongInARow: 0,
			stepWrongCnt: 0,

			// For reporting only
			instance: 0,		// Number of unique questions the user has seen.
			sawSolution: false,	// Saw the solution to this instance
			sawSolutionCnt: 0	// Total times solutions have been viewed for this problem (all instances)
		}
	});

})();