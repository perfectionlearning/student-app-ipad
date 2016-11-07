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
	if (!defined(app.scoring))
		app.scoring = {};

	var state;
	var curScript;
	var scriptCB;
	var activeModel;

	// Size of data associated with each opcode.  The default is zero, so only include opcodes that
	// have associated data.
	var opcodeSizes = {
		TEXT: 2,
		STEPTEXT: 2,
		GLOBALTEXT: 2,
		SET_STATUS: 1,
		STEP_STATUS: 1,
		SOLUTION: 1
	};

	// These actions are handled internally (and also passed on to the client).
	// Anything not in this list is handled purely by the client.
	var actionHandlers = {
		REMOVE: removeProblem,		// REMOVE: Remove this base question from the list, i.e. the user can't work on it anymore
		FAIL: fail,					// FAIL: Increase the failure count
		FAILOUT: failOut,			// FAILOUT: Remove this base question from the list, and mark it as Failed/No Credit
		NEXTSTEP: nextStep,
		SET_STATUS: setStatus,
		STEP_STATUS: stepStatus,
		SUBMIT: doSubmit,
		SUBMITSTEP: doSubmitStep
	};


//==========================================================================
// Script Management
//==========================================================================
	fw.scriptSetSizes(opcodeSizes);

	//=======================================================
	// Script filter -- Allows internal processing of certain
	// opcodes
	//=======================================================
	function scriptFilter(action, args)
	{
		// Process the opcode internally if it's in the actionHandlers list
		actionHandlers[action] && actionHandlers[action].apply(this, args);

		// Allow the opcode to be processed externally
		scriptCB(action, args);
	}

	//=======================================================
	// Starts a script, using the script engine
	//=======================================================
	app.scoring.runScript = function(callback)
	{
		scriptCB = callback;
		fw.scriptRun(curScript, scriptFilter);
	}

//==========================================================================
// Helpers
//==========================================================================

	//=======================================================
	//=======================================================
	function get(key)
	{
		return state.get(key);
	}

	//=======================================================
	//=======================================================
	function pget(key)
	{
		// Do something different for step-by-step mode!
		return state.get('problem').get(key);
	}

	//=======================================================
	//=======================================================
	function pset(key, val)
	{
		// Do something different for step-by-step mode!
		var obj = {};
		obj[key] = val;
		return state.get('problem').set(obj);
	}

	//=======================================================
	// Looks up the problem's answer type
	//=======================================================
	function answerType(isStep)
	{
		if (!isStep)
			return pget('ansType');
		else
		{
			var curStep = get('curStep');
			var solution = pget('solve');
			return solution && solution[curStep] && solution[curStep].ansType;
		}
	}

	//=======================================================
	// Looks up the problem's wrong answer count
	//=======================================================
	function wrongCnt(isStep)
	{
//		if (!isStep)
			return get('wrongCnt');
//		else
//			return get('stepWrongCnt');
	}

	//=======================================================
	//=======================================================
	app.scoring.helpers = {
		get: get,
		pget: pget,
		answerType: answerType,
		wrongCnt: wrongCnt
	}

//==========================================================================
// State management
//==========================================================================

	// Map from model identifier strings to registered scoring models
	var modelMap = {
		OHWSingle: 'Homework',
		OHWMulti: 'MultiPartHW',

		TestSingle: 'Quickcheck',
		TestMulti: 'MultiPartHW',	// Let's not make another model unless we really have to

		defaultModel: 'Homework'
	};

	//=======================================================
	// Init routine -- Tell this module what state it's operating on
	//=======================================================
	app.scoring.setState = function(st, modelName)
	{
		state = st;

		if (modelMap[modelName])
			activeModel = app.scoring[modelMap[modelName]];
		else
		{
			fw.debug('Attempting to set an unknown scoring model: ' + modelName);
			activeModel = app.scoring[modelMap.defaultModel];	// Use a default
		}
	}

	//=======================================================
	// Mark a problem as skipped
	//=======================================================
	function removeProblem()
	{
		state.set({skip: true});
	}

	//=======================================================
	//=======================================================
	function fail()
	{
		var f = get('failures');
		state.set({
			failures: f+1,
			wrongCnt: 0,		// Reset the wrong counts
			wrongInARow: 0,
			stepWrongCnt: 0
		});
	}

	//=======================================================
	// Mark a problem as failed out
	//=======================================================
	function failOut()
	{
		state.set({failedOut: true, skip: true});	// Also set skip
	}

	//=======================================================
	//
	//=======================================================
	function stepStatus(status)
	{
		var curStep = get('curStep');
		var step = pget('solve')[curStep];

		step.status = status;
	}

	//=======================================================
	//=======================================================
	function setStatus(status)
	{
		state.set({status: status});
	}

	//=======================================================
	//=======================================================
	function doSubmit()
	{
		var subs = pget('submissions') * 1;
		pset('submissions', subs + 1);
	}

	//=======================================================
	//=======================================================
	function doSubmitStep()
	{
		var curStep = get('curStep');
		var step = pget('solve')[curStep];

		// Direct access is bad, but unavoidable (other than getting all steps, modifying, writing all steps which is nearly as bad)
		step.submissions = (step.submissions * 1) + 1;
	}

	//=======================================================
	// When entering step mode, reset the top-level wrong count
	//=======================================================
	app.scoring.enableSteps = function()
	{
		state.set({wrongCnt: 0});
	}
	//=======================================================
	// If step hint is requested, reset tally of wrong attempts.
	//=======================================================
	app.scoring.resetWrongCnt = function()
	{
		state.set({wrongCnt: 0});
	}

	//=======================================================
	//=======================================================
	function nextStep()
	{
		var step = get('curStep');
		state.set({
			curStep: step+1,
//			stepWrongCnt: 0
			wrongCnt: 0
		});
	}

	//=======================================================
	// Reset a problem so it can be worked on again
	//=======================================================
	app.scoring.reset = function(st)
	{
		st.set({failedOut: false, skip: false, failures: 0});	// Also set skip
	}

	//=======================================================
	//=======================================================
	app.scoring.resetStep = function()
	{
		state.set({curStep: 0});
	}

	//=======================================================
	// The question was answered correctly.
	//=======================================================
	function correct()
	{
		// Increase correct count
		var streak = get('correctCnt');
		state.set({correctCnt: streak+1});

		// Increase correct in a row count
		streak = get('correctInARow');
		state.set({correctInARow: streak+1});

		// Reset Wrong in a Row counter
		state.set({wrongInARow: 0});
	}

	//=======================================================
	// The question was answered incorrectly.
	//=======================================================
	function wrong()
	{
		// Increase wrong count
		var streak = get('wrongCnt');
		state.set({wrongCnt: streak+1});

		// Increate wrong in a row count
		streak = get('wrongInARow');
		state.set({wrongInARow: streak+1});

		// Reset Correct in a Row counter
		state.set({correctInARow: 0});
	}

	//=======================================================
	// A step was answered incorrectly.
	//=======================================================
	function stepWrong()
	{
		// Increase wrong count
//		var streak = get('stepWrongCnt');
//		state.set({stepWrongCnt: streak+1});
		var streak = get('wrongCnt');
		state.set({wrongCnt: streak+1});
	}

	//=======================================================
	// The solution was viewed
	//=======================================================
	function sawSolution()
	{
		// Update the state
		var cnt = get('sawSolutionCnt');
		state.set({
			sawSolution: true,		// Set Saw Solution state
			sawSolutionCnt: cnt+1,	// Increase Saw Solution count
			correctInARow: 0		// Reset Correct in a Row counter
		});
	}

//==========================================================================
// Scoring Model
//==========================================================================
/*
	//=======================================================
	// Score calculation
	//=======================================================
	app.getScore = function(maxStreak, streakLen, totalPts)
	{
		return Math.floor(maxStreak / streakLen * totalPts);
	}

	//=======================================================
	// Score calculations: Points
	//=======================================================
	function calcScore()
	{
		var maxStreak = get('maxStreak') || 1;
		var streakLen = pget('repetitions');
		var totalPts = pget('maxScore');

		// Normal scoring
		return app.getScore(maxStreak, streakLen, totalPts);
	}
*/

//======================================================================================
// Requests for scripts based on external actions
//======================================================================================

	//=======================================================
	//=======================================================
	var submitMap = {
		correct: {modelAction: 'correct', stateAction: correct},
		incorrect: {modelAction: 'wrong', stateAction: wrong},
		pending: {modelAction: 'pending'},
		feedback: {modelAction: 'feedback'},

		correctStep: {modelAction: 'correctStep'},
		incorrectStep: {modelAction: 'wrongStep', stateAction: stepWrong},
		pendingStep: {modelAction: 'pendingStep'},
		feedbackStep: {modelAction: 'feedbackStep'},

		correctLastStep: {modelAction: 'correctLastStep'},
		incorrectLastStep: {modelAction: 'wrongLastStep'},
		pendingLastStep: {modelAction: 'pendingLastStep'},
		feedbackLastStep: {modelAction: 'feedbackLastStep'},
	};

	//=======================================================
	// An answer has been submitted.  Update the state and score
	// according to the current state.
	//
	// mode = '' || 'Step' || 'LastStep'
	//=======================================================
	app.scoring.submit = function(state, msg, mode)
	{
		mode = mode || '';
		var entry = submitMap[state + mode];
		if (!entry)
			return fw.debug('Unknown submission state: ' + state + ', ' + mode);

		entry.stateAction && entry.stateAction();

		curScript = activeModel[entry.modelAction](msg);
	}

	//=======================================================
	// An answer has been submitted.  Update the state and score
	// according to the current state.
	//
	// mode = '' || 'Step' || 'LastStep'
	//=======================================================
	app.scoring.getMsgObj = function(state, mode)
	{
		mode = mode || '';
		var msgObj = {};

		var entry = submitMap[state + mode];
		if (!entry)
			return fw.debug('Unknown submission state: ' + state + ', ' + mode);

		entry.stateAction && entry.stateAction();

		curScript = activeModel[entry.modelAction](mode);
		var textElem = curScript.indexOf('TEXT');
		msgObj.text = typeof curScript[textElem+2] === 'function' ? curScript[textElem+2]() : curScript[textElem+2];
		msgObj.color = curScript[textElem+1];

		return msgObj;	
	}

	//=======================================================
	// User viewed the solution.  Update the state and choose an action.
	//=======================================================
	app.scoring.sawSolution = function()
	{
		sawSolution();
		curScript = activeModel.solution();
	}

})();
