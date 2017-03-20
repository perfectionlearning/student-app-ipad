//===============================================================================
// Answer Submission and Scoring Model Interface Logic
//===============================================================================
;(function() {

	// Shortcuts
	var view = app.Views.WorkView;

	var promise;
	var problem;
	view.isStepMode = false;
	var reloaded = false;		// This is messy and shouldn't be needed.
//	var isSolved = false;

//	var shouldStay;

//===============================================================================
// API
//===============================================================================

	//=======================================================
	// Called once on view destruction
	//=======================================================
	view.submitModuleCleanup = function()
	{
		fw.eventUnsubscribe('doSubmit:input', view.doSubmit);
		fw.eventUnsubscribe('stepSubmit:input', view.stepSubmit);
		view.isFinalized = false;
//		isSolved = false;
	}

	//=======================================================
	// Called once on view creation
	//=======================================================
	view.initResultHandler = function(prob)
	{
		promise = null;		// Clear the active promise
		reloaded = false;	// The problem hasn't been reloaded

		// Allow answers to be submitted with the Enter key.
		fw.eventSubscribe('doSubmit:input', view.doSubmit);  // primary answer
		fw.eventSubscribe('stepSubmit:input', view.stepSubmit);  // step by step answer
		problem = prob;

		var state = problem.get('state');
		var steps = problem.get('solve') || [];
		state.set({ curStep: app.getCurStep(steps) });	// reset the step counter; specifically, to clear the steps in OHW.

		var modelName = app.modes.getScoringModel(problem);
		app.scoring.setState(state, modelName);
	}

	//=======================================================
	// Hand off submit action to the controller
	//=======================================================
	view.doSubmit = function()
	{
		fw.eventPublish('submit:cleanup');
		clearWrongs();

		var type = problem.get('ansType');
		var val = view.getSubmission();
		if (wasValueEntered(type, val))
			submit(val);
	}

	//=======================================================
	// Check for step answer duplication, to prevent "spamming."
	//=======================================================
	view.checkStepAnswerDup = function(stepNdx, type, val) {
		var result = false;
		if (view.lastStepAnswer) {
			var lastStepNdx = view.lastStepAnswer.stepNdx;
			var lastVal = JSON.stringify(view.lastStepAnswer.val);
			result = lastStepNdx === stepNdx && JSON.stringify(val) === lastVal;
		}
		view.lastStepAnswer = {
			stepNdx: stepNdx,
			type: type,
			val: val
		};

		return result;
	};

	//=======================================================
	// Hand off submit action to the controller
	//=======================================================
	view.stepSubmit = function()
	{
		fw.eventPublish('submit:cleanup');
		clearWrongs();

		var wid = fw.getWidget('stepByStep');
		var type = wid.curType();
		var val = view.getStepSubmission(type);
		var state = problem.get('state');
		var curStep = state.get('curStep');
		var isDuplicate = view.checkStepAnswerDup(curStep, type, val);

		if (!isDuplicate && wasValueEntered(type, val))
		{
			// The widget needs to scrollToEnd before displaying the result text!
			wid.scrollToEnd(function(){
				stepSubmit(val);
			});
		}
	}

	//=======================================================
	// The user has opted to improve their score
	//=======================================================
/*
	view.improveScore = function()
	{
		// Clear all 'skip' states -- only on failed questions, not correct questions
		var len = app.problemList.length;
		for (var i = 0; i < len; i++)
		{
			var state = app.problemList.at(i).get('state');
			app.scoring.reset(state);
		}

		// Go back to the problem list
		app.linkToObject('problemList');
	}
*/

	//=======================================================
	// Executes the current scoring model script
	//=======================================================
	view.executeScript = function()
	{
		app.scoring.runScript(processAction);
	}


//===============================================================================
// Internal
//===============================================================================

	//=======================================================
	// wasValueEntered:  check to see value was entered in field.
	//=======================================================
	function wasValueEntered(type, val)
	{
		// Routines to check for content in each answer type
		var typeHandlers = {
			equation: isNotEmptyMath,
			essay: isNotEmpty,
			multi: isAnySet,
			radio: isOneSet,
			check: true,
			graphPlot: isAnySet,
			graphConst: isAnySet,
			paper: true
		}

		var handler = typeHandlers[type] || true;

		if (typeof handler === 'boolean')	// Doesn't handle false -- any boolean must be true, right?
			return true;

		return handler(val);
	}

	//=======================================================
	// Check for entirely empty, or an empty math tag
	//=======================================================
	function isNotEmpty(val)
	{
		return val != '';
	}

	//=======================================================
	// Check for entirely empty, or an empty math tag
	//=======================================================
	function isNotEmptyMath(val)
	{
		return ['', '<math></math>', '<math><mrow></mrow></math>'].indexOf(val) === -1;
	}

	//=======================================================
	//=======================================================
	function isAnySet(list)
	{
		for (var i = 0, len = list.length; i < len; i++)
		{
			var val = list[i];

			if ( (val !== null) && (val !== undefined) && (val !== '') )
				return true;
		}

		return false;
	}

	//=======================================================
	//=======================================================
	function isOneSet(val)
	{
		if (val.length == 1)
			// For radio buttons in which array of 0s and 1s is replaced with ID of selected answer
			return isAnySet(val)
		else
			// Check for an instance of 1 in the array
			return (val.indexOf(1) !== -1);
	}

	//=======================================================
	// The "check" button was clicked: check the answer
	//=======================================================
	function submit(submission)
	{
		view.setCheck(false);
		view.setHelp(false);
		view.setStep(false);
		submitResult(submission);
	}

	//=======================================================
	// The "check" button was clicked: check the answer
	//=======================================================
	function stepSubmit(submission)
	{
		view.setCheck(false);
		view.setHelp(false);
		submitResultStep(submission);
	}

//===================================================================================
// REFACTOR!
//
// Combine step and non-step!
//===================================================================================

	//=======================================================
	// Report the result to the server
	//=======================================================
	function submitResult(submission)
	{
		var pSetPId = app.problemList.at(app.curProbIndex).id;
		app.result.setProblem(app.curAssign || -1, pSetPId);
		app.result.set({studentResponse: submission});
		doSubmitResult();
	}

	//=======================================================
	//
	//=======================================================
	function submitResultStep(submission)
	{
		var wid = fw.getWidget('stepByStep');
		var stepIdx = wid.curStep();
		var pSetPId = app.problemList.at(app.curProbIndex).id;

		app.result.setStep(app.curAssign || -1, pSetPId, stepIdx);
		app.result.set({studentResponse: submission});
		doSubmitResultStep();
	}

	//=======================================================
	// Pulled out of submitResult so it can be retried
	//=======================================================
	function doSubmitResult()
	{
		// Close the error box if it exists
		var wid = fw.getWidget('error', true);
		wid && wid.terminate();

		app.loadingBox();
		app.result.save().done(processResult).fail(loadFailure.submit);
	}

	//=======================================================
	// Pre-generate failure routines using a factory method
	//=======================================================
	var loadFailure = {
		submit: app.failHandler("result"),
		step: app.failHandler("step"),
		solution: app.failHandler("solution"),
		problem: app.failHandler("problem", resetMoveOn)
	}

	//=======================================================
	//=======================================================
	app.resetSubmit = function() {
		doSubmitResult();
	}

	//=======================================================
	// Pick up here when step is able to be loaded again.
	//=======================================================
	app.resetStep = function()
	{
		doSubmitResultStep();
	}

	//=======================================================
	// Pulled out of submitResult so it can be retried
	//=======================================================
	function doSubmitResultStep()
	{
		// Close the error box if it exists
		var wid = fw.getWidget('error', true);
		wid && wid.terminate();

		app.loadingBox();
		app.result.save().done(processResultStep).fail(loadFailure.step);
	}

//===================================================================================
//===================================================================================

	//=======================================================
	// Step-by-step mode: process answer
	//=======================================================
	function processResultStep(result)
	{
		app.clearLoadingBox();

		if (defined(result.wrong) && result.wrong.length)
			showWrongsStep(result.wrong);

		// Check for error messages
		if (result && defined(result.msg))
			return resultError(result.msg);

		// On a final step submission we sometimes get an unobfuscated answer back.
		// This only occurs in multi-part problems, but we don't care / can't know about that here.
		// All we know is that there's sometimes an 'a' field in the result, and if so we need to inject
		// it into the model.
		var wid = fw.getWidget('stepByStep');
		var curStep = wid.curStep();

		if (result.a)
			problem.get('solve')[curStep].a = result.a;

		// Notify the model and choose a script
		// The final step is treated exactly like a correct answer
		if (curStep >= (problem.get('solve').length - 1))
		{
			problem.set({score:result.score});
			problem.set({status:app.translateStatus(result.new_status)});
			app.scoring.submit(result.equiv, result.feedback, 'LastStep');		// Final step
		}
		else
			app.scoring.submit(result.equiv, result.feedback, 'Step');	// Any other step

		// Run the script
		app.scoring.runScript(processAction);
	}

	//=======================================================
	// Runs the result script
	//=======================================================
	function processResult(result)
	{
		app.clearLoadingBox();
//		view.setStep(true);

		if (defined(result.wrong) && result.wrong.length)
			showWrongs(result.wrong);

		// Check for error messages
		if (result && defined(result.msg))
			return resultError(result.msg);

		// Update the score
		if (result && defined(result.score))
			problem.set({score:result.score});

		// Update the status
		if (result && defined(result.new_status))
			problem.set({status:app.translateStatus(result.new_status)});

		// Let the scoring model determine which script to run
		if (!result || !defined(result.equiv))
		{
			fw.warning('Server error: invalid response to problem submission');
			app.scoring.submit("feedback", "An internal error has occurred.");
		}
		else if (result.equiv === 'error')
		{
			fw.warning('Server error: Equivalence system failure');
			app.scoring.submit("feedback", "Equivalence system failure.");
		}
		else
			app.scoring.submit(result.equiv, result.feedback);	// Set the appropriate response script

		// Finally, run the appropriate script
		app.scoring.runScript(processAction);
	}

	//=======================================================
	// A non-communication error message was returned on submit
	//=======================================================
	function resultError(err)
	{
		var handlers = {
			"Past Due Date": pastDue,
			"OUT_OF_TRYS": noMoreSubmits	// The student had no remaining tries (submissions)
//r			"Student Problem Not Found": submitFail,
//r			"Problem Not Found": submitFail
		}

		if (handlers[err])
			handlers[err]();
		else
			loadFailure.submit();
	}

	//=======================================================
	//
	//=======================================================
	function pastDue()
	{
		showText(app.style.sadColor, "This assignment is now past due.  Further submissions aren't allowed.");
		showSolution(false);

		// For when an assignment list is loaded before past due, but problems are attempted after past due.
		// _complete: false - force problem reload in showSolution();
		// _pastdue: true - flag problem as past due in view.isLockedOut(), even if assignment was not past due
		// @FIXME/dg: This doesn't belong here! Move it elsewhere. Also, this is unneccesary allocation.
		app.problemList.each(function(p) { p.set({_complete:false, _pastdue: true}); });
		$.when(promise).done(view.hideTries);
	}

	//=======================================================
	// The user performed a submission with no tries remaining.
	// This shouldn't occur in normal practice.
	//
	// @FIXME/dg: We probably need to do more work!
	//=======================================================
	function noMoreSubmits()
	{
		showText(app.style.sadColor, "There are no submissions remaining.");

		view.doLockout();
	}

	//=======================================================
	// Under certain circumstances, a problem is considered
	// locked out.  Don't allow input or most buttons.
	// Moved from WorkView2.js to submit.js, to provide access to
	// showSolution() without the need for a view.bridgeToShowSolution()
	//=======================================================
	view.doLockout = function()
	{
		view.disableInput();		// DG: This was commented out, which breaks lockout on initial display. It may have been needed elsewhere though.

		view.isFinalized = true;
		showSolution(true);
		view.hideTries();
	}


//===================================================================================
//===================================================================================

	//=======================================================
	// Show solution -- fetch it from the server and then
	// run the script.
	// Called when Show solution clicked.
	//=======================================================
	view.solution = function()
	{
		app.loadingBox();
		gotSolution();
	}

	//=======================================================
	// Part 2 of show solution -- occurs after the solution
	// has been successfully loaded
	//=======================================================
	function gotSolution()
	{
		app.clearLoadingBox();

		// Exit step-by-step mode if the user was in it
		// This occurs inside showSolution, so don't bother here.
//r		view.clearStepMode();

		// Update the data used by the step widget -- is this necessary?
		// It depends on whether the newly fetched model shares the same variable,
		// or is newly allocated.
		//
		// This can be done just before solution is displayed.
		//view.initSteps();

		// Tell the scoring model the solution was displayed
		app.scoring.sawSolution();

		// Executes the script -- the solution was already fetched above.
		view.setCheck(false);
		view.setHelp(false);
		view.setStep(false);

		app.scoring.runScript(processAction);
	}

	//=======================================================
	//
	//=======================================================
	function showWrongs(list)
	{
		var wid = fw.getWidget('answerInput', true);
		wid && wid.wrongAnswer(list);
	}

	//=======================================================
	//
	//=======================================================
	function showWrongsStep(list)
	{
		var wid = fw.getWidget('stepByStep', true);
		wid && wid.wrongAnswer(list);
	}

	//=======================================================
	//
	//=======================================================
	function clearWrongs()
	{
		var wid = fw.getWidget('answerInput', true);
		wid && wid.clearWrongs();

		wid = fw.getWidget('stepByStep', true);
		wid && wid.clearWrongs();
	}

//===============================================================================
// Scoring Model Action Handlers
//===============================================================================

	//=======================================================
	// Carry out the actions ordered by the scoring module
	//=======================================================
	function processAction(action, args)
	{
		// These actions are either scoring model or view events.  Scoring model events have
		// already been processed.  Pass these directly on to the view.
		var actionList = {
			TEXT: showText,				// TEXT: Display a message.  Parameters: text, color
			STEPTEXT: stepText,			// STEPTEXT: Display a message.  Parameters: text, color
			GLOBALTEXT: showText,		// GLOBALTEXT: Display a message at the top level, not inside step-by-step (if it's active)
			NOCHECK: disableCheck,		// NOCHECK: Disable Check (student can't submit another answer until it gets reenabled externally)
			SOLUTION: showSolution,		// SOLUTION: Show solution
			NEXT: nextQuestion,			// NEXT: Next question
			SIMILAR: similarQuestion,	// SIMILAR: Similar question
			REMOVE: removeProblem,		// REMOVE: Remove this base question from the list, i.e. the user can't work on it anymore
			FAIL: fail,					// FAIL: Increase the failure count
			FAILOUT: failOut,			// FAILOUT: Remove this base question from the list, and mark it as Failed/No Credit
			NEXTSTEP: nextStep,			// NEXTSTEP: Advance to the next step in step-by-step mode
			LASTSTEP: lastStep,			// LASTSTEP: The last step was completed.
			SET_STATUS: setStatus,		// SET_STATUS: Set the status indicator.  Parameter: status
			STREAK_INC: incStreak,		// STREAK_INC: Streak increased.  Client event (doesn't change the state, which happens elsewhere).
			STREAK_RESET: resetStreak,	// STREAK_RESET: Streak reset
			REWARD: reward,				// REWARD: Client event
			WRONG: wrong,				// WRONG: Client event
			LOCK: lockProblem,			// LOCK: Immediately fail out of a problem
			DISABLE_INPUT: doDisableInput, // DISABLE_INPUT: deal with last submission of wrong answer.
			COPYANSWER: doNothing,		// COPYANSWER: Copy the final step answer to the main answer input
			SHOWGRAPH: showGraphSolve,	// SHOWGRAPH: Display the solution only for graph questions
			RESTOREINPUT: restoreInput,	// RESTOREINPUT: Reenable input buttons
			SUBMIT: doNothing,			// SUBMIT: Use up a submission
			SUBMITSTEP: submitSteps,	// SUBMITSTEP: Use up a step submission (multi-part only)
			STEPSOLUTION: stepSolution,	// STEPSOLUTION: Show the solution to the current step
			STEP_STATUS: setStepStatus,	// SET_STATUS: Set the status indicator.  Parameter: status
			CLEANSTEP: cleanStep,		// CLEANSTEP: Switch to compact, read-only mode for the current step
		};

		// Make sure it's an action we know about
		if (!defined(actionList[action]))
			fw.error('Unknown action in scoring script: ' + action);

		// Call the proper routine with the proper args
		actionList[action].apply(this, args);
	}

	//=======================================================
	// TEXT: Display a message.  Parameters: color, text
	//=======================================================
	function showText(color, text)
	{
		// Clear the step text so there is no conflict
		var wid = fw.getWidget('stepByStep', true);
		wid && wid.clearText();

		if (typeof(text) !== 'function')
			view.showText(text, color);
		else
			view.showText(text(), color);
	}

	//=======================================================
	// STEPTEXT: Display a message after the last step.
	// Parameters: color, text
	//=======================================================
	function stepText(color, text)
	{
		// Clear the top-level text so there is no conflict
		view.clearResponse();

		var wid = fw.getWidget('stepByStep');
		if (typeof(text) !== 'function')
			wid && wid.showText(text, color);
		else
			wid && wid.showText(text(), color);
	}

	//=======================================================
	// NOCHECK: Disable Check (student can't submit another answer until it gets reenabled externally)
	//=======================================================
	function disableCheck()
	{
		view.setCheck(false);
	}

	//=======================================================
	//
	//=======================================================
	app.refreshSolution = function()
	{
		gotSolution();
	}

	//=======================================================
	// SOLUTION: Show solution
	// Comes from SOLUTION opcode
	//
	// wasRequested: True is the user picked "Show solution", i.e. the solution was specifically requested
	//=======================================================
	function showSolution(wasRequested)
	{
		if (!problem.get("_complete")) {
			if (wasRequested)
				promise = problem.getSolution(); // this is the only call to the model's getSolution.
			else
			{
				// The user didn't request a solution. It is being shown due to errors (no more submissions).
				// The server will fill in the numbers automatically, so we don't have to specifically request it.
				// Requesting it causes a difference sequence of events and possibly a different score.
				// I think our old solution was: Marias never obfuscates
				promise = view.reloadProblem();	// This is a bit iffy. In some cases, the problem will be reloaded afterwards as well. Get the pipeline under control!
				reloaded = true;	// Not technically reloaded until the promise is resolved, but this should be safe.
			}

			promise.done(function() { doShowSolution(wasRequested); }).fail(loadFailure.solution);
		}
		else {
			promise = {};
			doShowSolution(wasRequested);
		}
	}

	//=======================================================
	// SOLUTION: deferred Show solution
	//=======================================================
	function doShowSolution(wasRequested)
	{
		//promise = null;  // need to clear promise from Show solution click, so subsequent will not be obfuscated.
		view.isFinalized = true;
		view.initSteps();
		view.showSolution(wasRequested);
	}

	//=======================================================
	//
	//=======================================================
	function showGraphSolve()
	{
		var type = problem.get('ansType');

		if (type === 'graphPlot')		// Only show for graphPlot, not graphConst (or anything else)
			showSolution(false);
	}

	//=======================================================
	// Perform the actual problem fetch.  This has to occur
	// after our submit.
	//=======================================================
	function fetchProblem()
	{
		// @FIXME/dg: Temporarily disabled. Restore when no longer loading a new problem on every WorkView
//		var prob = app.problemList.at(app.curProbIndex);

//		if (prob.get('chID') == '')
//			prob.fetch({success: app.preloadImage});
	}

	//=======================================================
	// Move on, either to a similar or new question
	//=======================================================
	function moveOn()
	{
		// The input should always be read only when moving to the next question
		view.disableInput();

		// Close any existing error popups
		var wid = fw.getWidget('error', true);
		wid && wid.terminate();

		// Invalidate the problem in case the reload is aborted
		problem.set({invalid:true});

		// Fetch the next instance of the question now.  When complete, preload any associated images.
		// reloadProblem may already be in the promise .done chain. We need to detect that and avoid duplication.
		// If it IS in the queue, we need to call doMoveOn instead.
		if (!reloaded)
			$.when(promise).done(reloadFirst);
		else
			$.when(promise).done(doMoveOn);
	}

	//=======================================================
	//=======================================================
	function reloadFirst()
	{
		view.reloadProblem().fail(loadFailure.problem).done(doMoveOn);
	}

	//=======================================================
	//
	//=======================================================
	function resetMoveOn()
	{
		moveOn();
	}

	//=======================================================
	//=======================================================
	function doMoveOn()
	{
		// Clean up the top level

		// Clean up steps
//		if (view.isStepModeActive() && !isSolved)
//			view.showSolution();

		// Move to the next question
		view.setNextQMode();
		view.isFinalized = true;
	}


	//=======================================================
	// NEXT: Next question
	//=======================================================
	function nextQuestion()
	{
		// shouldStay isn't being propagated through anymore, but it should be
//		shouldStay = false;
		moveOn();
	}

	//=======================================================
	// SIMILAR: Similar question
	//=======================================================
	function similarQuestion()
	{
		// shouldStay isn't being propagated through anymore, but it should be
		// This is invalid now anyway. view.getMode no longer exists.
//		var mode = view.getMode();	//view.isQCMode() ? 'QC' : 'OHW';
//		shouldStay = (mode !== "QZ"); // True generally; exception for Quizboard mode.
		moveOn();
	}

	//=======================================================
	// REMOVE: Remove this base question from the list, i.e. the user can't work on it anymore
	//=======================================================
	function removeProblem()
	{
		// Do nothing.  Handled in scoring model.
	}

	//=======================================================
	// FAIL: Increase the failure count
	//=======================================================
	function fail()
	{
		// Do nothing.  Handled in scoring model.
	}

	//=======================================================
	// FAILOUT: Remove this base question from the list, and mark it as Failed/No Credit
	//=======================================================
	function failOut()
	{
		// Do nothing.  Handled in scoring model.
	}

	//=======================================================
	//
	//=======================================================
	function cleanStep()
	{
		var wid = fw.getWidget('stepByStep', true);
		wid && wid.cleanStep();
	}

	//=======================================================
	// NEXTSTEP: Advance to the next step in step-by-step mode
	//=======================================================
	function stepSolution()
	{
		var wid = fw.getWidget('stepByStep', true);
		wid && wid.stepSolution();
	}

	//=======================================================
	// NEXTSTEP: Advance to the next step in step-by-step mode
	//=======================================================
	function nextStep()
	{
		var wid = fw.getWidget('stepByStep', true);
		wid && wid.nextStep();
	}

	//=======================================================
	// LASTSTEP: The last step was completed.
	//=======================================================
	function lastStep()
	{
		// This probably shouldn't be here
		view.setCheck(false);

		var wid = fw.getWidget('stepByStep', true);
		wid && wid.lastStep();

		// Show the correct answer when all steps have been answered correctly.
		view.showAnswer();		// Just show the expected answer

//		isSolved = true;
	}

	//=======================================================
	// STREAK_INC: Streak increased.  Client event (doesn't change the state, which happens elsewhere).
	//=======================================================
	function incStreak()
	{
		var wid = fw.getWidget('streakAnim', true);
		wid && wid.advance();
	}

	//=======================================================
	// STREAK_RESET: Streak reset
	//=======================================================
	function resetStreak()
	{
		// Don't reset if we've maxed the streak
		if (problem.get('state').get('maxStreak') >= problem.get('repetitions'))
			return;

		var wid = fw.getWidget('streakAnim', true);
		wid && wid.reset();
	}

	//=======================================================
	// REWARD: Client event
	//=======================================================
	function reward()
	{
		view.reward();

		// This seems like a bad place to update, but what the heck
		view.correctActions();

		// DG: This seems bad! It hides the submission count ONLY if the last step was just answered.
		// Don't take away tries widget if displaying steps.
		if (view.isStepModeActive())
		{
			var wid = fw.getWidget('stepByStep');
			var stepIdx = wid.curStep();
			var isLastStep = (stepIdx >= (problem.get('solve').length - 1));
			if (isLastStep)
			{
				wid = fw.getWidget('submits', true);
				wid && wid.hide();
			}
		}
	}

	//=======================================================
	// WRONG: Client event
	//=======================================================
	function wrong()
	{
		fw.eventPublish('focus:postWrong');	// Should this be here, or in view.wrong?  I think it's better here.
		view.wrong();

		// This seems like a bad place to update, but what the heck
		view.incorrectActions();
	}

	//=======================================================
	// SET_STATUS: Set the status indicator.  Parameter: status
	//=======================================================
	var statusList = ["New", "Wrong", "Locked", "Correct", "Pending", "Partial"];
	function setStatus(status)
	{
		// Check for special codes: multiPart status gets translated to something else depending on state
		if (status === 'multiPart')
		{
			var states = _.pluck(problem.get('solve'), 'status');
			status = app.multiPartStatus(states);
		}

		if (statusList.indexOf(status) === -1)
			fw.warning('Setting problem to unknown status');

		var wid = fw.getWidget('status');
		wid && wid.setState(status);
	}

	//=======================================================
	// SET_STATUS: Set the status indicator.  Parameter: status
	//=======================================================
	function setStepStatus(status)
	{
		if (statusList.indexOf(status) === -1)
			fw.warning('Setting problem to unknown status');

		var wid = fw.getWidget('stepByStep');
		wid && wid.setState(status);
	}

	//=======================================================
	// LOCK: Immediately fail out of a problem
	//=======================================================
	function lockProblem()
	{
		// Handled before the script for now, which is dangerous
	}

	//=======================================================
	// It does nothing. Nothing at all.
	//=======================================================
	function doNothing()
	{
	}

	//=======================================================
	//
	//=======================================================
	function doDisableInput()
	{
		view.disableInput();
	}

	//=======================================================
	//
	//=======================================================
	function restoreInput()
	{
		view.setCheck(true);
		view.setHelp(true);
		view.setStep(true);
	}

	//=======================================================
	//
	//=======================================================
	function submitSteps()
	{
		view.updateStepSubmissions();
	}

})();
