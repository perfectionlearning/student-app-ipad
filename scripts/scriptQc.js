//============================================================
// Scoring controller
//
// Acts as an intelligent middle-man to the problem state model, which
// is just a dumb data repository.
//
// Rather than duplicating a lot of fields from the problem in the state,
// the state will have access to the problem model.  That is hardly ideal,
// creating an overly tight coupling between the two.  Given that so much
// information is required, and that the score may need to be changed,
// it seems expedient to just do it this way for now.
//
// Controls scoring (points, stars), next/similar question behavior, and text responses
//============================================================
;(function()
{
	// Actions API:
	// TEXT: Display a message.  Parameters: text, color
	// STEPTEXT: Display a message under the last step.  Parameters: text, color
	// GLOBALTEXT: Display a message at the top level, not inside step-by-step (if it's active).  Parameters: text, color
	// NOCHECK: Disable Check (student can't submit another answer until it gets reenabled externally)
	// SOLUTION: Show solution.  Parameter: Solution shown by request (vs. shown for a correct or incorrect answer)
	// NEXT: Next question
	// SIMILAR: Similar question
	// CHOICE: Next or similar question (user choice)
	// NEXTSTEP: Advance to the next step in step-by-step mode
	// LASTSTEP: The last step was completed.
	// REMOVE: Remove this base question from the list, i.e. the user can't work on it anymore
	// FAIL: Increase the failure count
	// FAILOUT: Remove this base question from the list, and mark it as Failed/No Credit
	// SET_STATUS: Set the status indicator.  Parameter: status (New, Correct, Wrong, Locked)
	// STREAK_INC: Streak increased.  Client event (doesn't change the state, which happens elsewhere).
	// STREAK_RESET: Streak reset
	// REWARD: Client event
	// WRONG: Client event
	// LOCK: Immediately fail out of a problem
	// DISABLE_INPUT: deal with last submission of wrong answer.
	// SHOWGRAPH: Display the solution only for graph questions
	// RESTOREINPUT: Reenable input buttons
	// SUBMIT: Use up a submission

	var happyColor = app.style.happyColor;
	var sadColor = app.style.sadColor;
	var defaultColor = app.style.defaultColor;

	var helper = app.scoring.helpers;

	var feedbackText;		// Temp global variable

	var scriptList = {

	//----------------------------------------
	// Generated by submitting a correct answer
	//----------------------------------------

		// Correct, previously unanswered or wrong
		// Also: Correct, final step in step-by-step mode
		correct: [
			"TEXT", happyColor, "Great work! You get 5 out of 5 for this problem.",
			"REWARD",
			"SET_STATUS", "Correct",
			"SHOWGRAPH",
			"SIMILAR"
		],

		// Correct, but already successfully completed
		correctAgain: [
			"TEXT", happyColor,  "Great work! You've correctly solved this problem before, so you keep your perfect score.",
			"REWARD",
			"SET_STATUS", "Correct",
			"SHOWGRAPH",
			"SIMILAR"
		],

		// Correct, but previously failed (no longer possible in QCs)
		correctFailed: [
			"TEXT", happyColor, "Great work! You've completed this problem before, so your score won't change. You previously received 0 out of 5 for this problem.",
			"REWARD",
			"SET_STATUS", "Locked",
			"SHOWGRAPH",
			"SIMILAR"
		],

		// Correct, non-final step
		correctStep: [
			"STEPTEXT", happyColor, "That is correct!",
			"REWARD",
//			"SET_STATUS", "Correct",
			"RESTOREINPUT",		// This needs to occur before NEXTSTEP, or the buttons are gone
			"NEXTSTEP"
		],

	//----------------------------------------
	// Generated by viewing a solution
	//----------------------------------------

		// User viewed the solution
		viewSolution: [
//			"LOCK",
			"GLOBALTEXT", sadColor, "Study the solution. You get no points for this problem, but you can try again for full credit.",
//			"SET_STATUS", "Locked",
			"SET_STATUS", "Wrong",
			"SOLUTION", true,
			"SIMILAR"
		],

		// Viewed solution, question previously answered correctly.
		viewSolutionCredit: [
			"GLOBALTEXT", sadColor, "You've completed this problem before, so your score will not change.",
			"SET_STATUS", "Correct",
			"SOLUTION", true,
			"SIMILAR"
		],

	//----------------------------------------
	// Incorrect with helpful feedback
	//----------------------------------------
		feedback: [
			"TEXT", sadColor, function() {
				return feedbackText;
			},
			"RESTOREINPUT"
		],

		feedbackStep: [
			"STEPTEXT", sadColor, function() {
				return feedbackText;
			},
			"RESTOREINPUT"
		],

	//----------------------------------------
	// Generated by submitting a wrong answer
	//----------------------------------------

		// First or second time the user submits a wrong answer
		wrong: [
			"RESTOREINPUT",		// This needs to occur before WRONG or focus can't properly be set
			"WRONG",
			"TEXT", sadColor, "Try again. Check your work or click a help option. Enter a new answer whenever you're ready.",
			"SET_STATUS", "Wrong",
		],

		// Wrong, but previously received full credit
		wrongCredit: [
			"WRONG",
			"TEXT", sadColor, "Try again. Check your work or click a help option. Enter a new answer whenever you're ready.",
			"SET_STATUS", "Correct",
		],

		// Wrong.  Previously failed out of a question (no longer possible in QCs)
		wrongAgain: [
			"WRONG",
			"TEXT", sadColor, "Try again. Check your work or click a help option. Enter a new answer whenever you're ready.",
			"SET_STATUS", "Locked",
		],

		// Third time the user submits a wrong answer.  Require Help.
		wrongNeedHelp: [
			"RESTOREINPUT",		// This needs to occur before WRONG or focus can't properly be set
			"WRONG",
			"TEXT", sadColor, "It looks like you need to review this material. Click one of the help options for additional assistance.",
			"NOCHECK",
//			"SET_STATUS", "Wrong",
		],

		// First or second the user submits a wrong answer
		wrongStep: [
			"RESTOREINPUT",		// This needs to occur before WRONG or focus can't properly be set
			"WRONG",
			"STEPTEXT", sadColor, "Try again. Click one of the help options for more clues on how to solve the problem.",
//			"SET_STATUS", "Wrong",
		],

		// Third time the user submits a wrong answer.  Require Help.
		wrongNeedHelpStep: [
			"RESTOREINPUT",		// This needs to occur before WRONG or focus can't properly be set
			"WRONG",
			"STEPTEXT", sadColor, "It looks like you need to review this material. Click one of the help options for additional assistance.",
			"NOCHECK",
//			"SET_STATUS", "Wrong",
		],


	//----------------------------------------
	// Generated by a pending state for problems
	// that require teacher grading.
	//----------------------------------------
		pending: [
			"SUBMIT",		// Is this right?
			"TEXT", defaultColor, "Your answer has been submitted. You will receive a grade as soon as your teacher reviews it.",
			"SET_STATUS", "Pending",
			"NEXT"
		],

	//----------------------------------------
	// All of the multiple choice options below
	// have been removed.
	//----------------------------------------
/*
		// Got a check mark multiple choice problem wrong 3 times, previously unanswered or wrong
		wrongCheck: [
			"WRONG",
			"GLOBALTEXT", sadColor, "You tried three times, which is a good effort, but you don't get any credit for this problem.",
//			"SET_STATUS", "Locked",
			"SET_STATUS", "Wrong",
			"SOLUTION", false,
			"SIMILAR"
		],

		// Only one attempt is allowed for radio inputs
		wrongRadio: [
			"WRONG",
			"GLOBALTEXT", sadColor, "The solution to this problem is shown.  You don't get any credit for this problem.",
//			"SET_STATUS", "Locked",
			"SET_STATUS", "Wrong",
			"SOLUTION", false,
			"SIMILAR"
		],

		// Only one attempt is allowed for radio inputs.  Already answered it correctly.
		wrongMCFailCredit: [
			"WRONG",
			"GLOBALTEXT", sadColor, "The solution to this problem is shown. You've completed this problem before, so your score will not change.",
			"SET_STATUS", "Correct",
			"SOLUTION", false,
			"SIMILAR"
		],

		// Only one attempt is allowed for radio inputs.  Previously failed. (No longer used)
		wrongMCFailAgain: [
			"WRONG",
			"GLOBALTEXT", sadColor, "The solution to this problem is shown. You've completed this problem before, so your score will not change.",
			"SET_STATUS", "Locked",
			"SOLUTION", false,
			"SIMILAR"
		]
*/
	};

//==========================================================================
// Action/Response Model
//==========================================================================

	//=======================================================
	//=======================================================
	app.scoring.Quickcheck = {
		correct: correctAction,
		correctStep: correctStepAction,
		correctLastStep: correctAction,

		wrong: wrongAction,
		wrongStep: wrongStepAction,
		wrongLastStep: wrongAction,

		pending: pendingAction,
		pendingStep: pendingAction,
		pendingLastStep: pendingAction,

		feedback: feedbackAction,
		feedbackStep: feedbackStepAction,
		feedbackLastStep: feedbackStepAction,

		solution: solutionAction,
	};

	//=======================================================
	// Determines the appropriate action given a correct answer
	//=======================================================
	function correctAction()
	{
		var status = helper.get('status');

		if (status === 'Correct')
			return scriptList.correctAgain;
		else if (status === 'Locked')
			return scriptList.correctFailed;
		else
			return scriptList.correct;
	}

	//=======================================================
	// Determines the appropriate action given a correct answer (step-by-step mode)
	//=======================================================
	function correctStepAction()
	{
		if (helper.get('curStep') >= (helper.pget('solve').length - 1))
			return correctAction();	// All steps complete -- Use main answer actions
		else
			return scriptList.correctStep;
	}

	//=======================================================
	// Determines the appropriate action given a wrong answer
	//=======================================================
	function wrongAction()
	{
		var status = helper.get('status');

		// All answers are now treated the same.  Radio and multiple choice aren't special-cased.
/*
		// Only one attempt is allowed for radio inputs
		if (helper.answerType(false) === 'radio')
		{
			if (status === 'Locked')
				return scriptList.wrongMCFailAgain;
			else if (status === 'Correct')
				return scriptList.wrongMCFailCredit;
			else
				return scriptList.wrongRadio;
		}

		// Check mark: No more tries.  4 different choices based on credit and failed out states
		if ((helper.wrongCnt(false) >= 3) && (helper.answerType(false) === 'check'))
		{
			if (status === 'Locked')
				return scriptList.wrongMCFailAgain;
			else if (status === 'Correct')
				return scriptList.wrongMCFailCredit;
			else
				return scriptList.wrongCheck;
		}
*/

		// Wrong the 3rd time
		// DG: Removed, possibly temporarily
//		if (helper.wrongCnt(false) % 3 === 0)
//			return scriptList.wrongNeedHelp;

		// Default
		if (status === 'Locked')
			return scriptList.wrongAgain;
		else if (status === 'Correct')
			return scriptList.wrongCredit;
		else
			return scriptList.wrong;
	}

	//=======================================================
	// A step was answered incorrectly
	//=======================================================
	function wrongStepAction()
	{
		// Wrong the 3rd time -- This counter is shared with the top-level answer, which may
		// or may not be desirable.
		// DG: Removed, possibly temporarily
//		if (helper.wrongCnt(true) % 3 === 0)
//			return scriptList.wrongNeedHelpStep;

		// Default
		return scriptList.wrongStep;
	}

	//=======================================================
	// Determines the appropriate action given a pending state
	// for a submission.
	//=======================================================
	function pendingAction()
	{
		return scriptList.pending;
	}

	//=======================================================
	// Determine the appropriate action when the solution is viewed
	//=======================================================
	function solutionAction()
	{
		var status = helper.get('status');

		if (status === 'Correct')
			return scriptList.viewSolutionCredit;
		else
			return scriptList.viewSolution;
	}

	//=======================================================
	// The answer was incorrect, but we don't count it as
	// wrong. Instead we supply helpful feedback.
	//=======================================================
	function feedbackAction(msg)
	{
		feedbackText = msg;		// Slightly dangerous, but we're not reentrant
		return scriptList.feedback;
	}

	//=======================================================
	// The answer was incorrect, but we don't count it as
	// wrong. Instead we supply helpful feedback.
	//=======================================================
	function feedbackStepAction(msg)
	{
		feedbackText = msg;		// Slightly dangerous, but we're not reentrant
		return scriptList.feedbackStep;
	}

})();
