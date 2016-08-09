//===============================================================================
// Work View Event Manager
//
// This is a work view general event router, based on configurations.
//
// This module accepts a variety of events, and decides what to do with
// them based on the current configuration.
//
// Only events that need to be handled differently based on the current configuration
// need to be added to this module.
//
// So far, the only possible action for listed events is to redirect to one or
// more other events. It basically converts high-level, very specific action events
// into low-level generic events. They are currently all related to inputs.
//===============================================================================
;(function() {

	var view = app.Views.WorkView;

	var handlerList = createHandlerList();	// Variable hoisting actually makes this work. I thought it would have to be split into two lines.

	//=======================================================
	// DG: I'd prefer to have the lists at the top context
	// rather than buried inside a function!
	// However, that would require creating handlers for
	// every configuration since the definitions include
	// a factory-generated function.
	//
	// This is a convoluted solution to preventing allocation
	// each time this module is initialized. By using factories
	// that only run once, we can avoid allocation except
	// during app initialization, which is equivalent to (or better than)
	// having the lists included in the top context.
	//=======================================================
	function createHandlerList()
	{
		var config = chooseConfig();

		// @FIXME/dg: If we get a third configuration, change to something more efficient than if/else
		if (config === 'desktop')
		{
			return {
				'toggleTo:input': handlerFactory('setFocus:input'),	// Toggling from step mode to input just finished
				'toggleTo:step': handlerFactory('setFocus:input'),	// Toggling from input to step mode just finished
				'focus:postHint': handlerFactory('setFocus:step'),		// A hint has just been displayed in step-by-step mode
				'focus:postWrong': handlerFactory('setFocus:input'),	// A wrong answer was submitted and the user is now encouraged to try again
				'submit:cleanup': handlerFactory('remove:inputEntry')	// This removes the keypad
		//		'step:scroll': null						// Scrolling occurred within the step-by-step widget
			};
		}
		else if (config === 'tablet')
		{
			return {
		//		'toggleTo:input': null,	// Do nothing.  Focusing the input causes an input helper (keypad) to appear, which obscures the text message
		//		'toggleTo:step': null,	// Do nothing.  Focusing the input causes an input helper (keypad) to appear, which obscures the text message
		//		'focus:postHint': null,	// Do nothing.  Focusing the step causes an input helper (keypad) to appear, which obscures the hint
				'focus:postWrong': handlerFactory('loseFocus:input'),	// Specifically cause the inputs to blur
				'submit:cleanup': handlerFactory(['remove:inputEntry', 'loseFocus:input']),	// Remove the keypad and ensure the input is blurred
				'step:scroll': handlerFactory(['remove:inputEntry', 'loseFocus:input'])	// Remove the keypad and ensure the input is blurred
			};
		}

		fw.warning('Event router: unknown configuration');
		return {};
	}

	//=======================================================
	// Choose a configuration
	//
	// @FIXME/dg: This check should be elsewhere, handled by the configuration manager
	//=======================================================
	function chooseConfig()
	{
		if (app.MOBILE)
			return 'tablet';
		else
			return 'desktop';
	}

	//=======================================================
	// Returns a function that emits the requested events
	//
	// DG: We try hard to avoid allocation, particularly factories
	// and anonymous functions. Since we can't remove them in
	// this case, we instead ensure it only occurs once, during init.
	//=======================================================
	function handlerFactory(actions)
	{
		if (!actions)
			return null;

		// Check for a string, which indicates a single event to emit.
		if (typeof(actions) === 'string')
			return function() {fw.eventPublish(actions)};

		// We must have an array of events to emit.
		return function() {
			for (var i = 0; i < actions.length; i++)
				fw.eventPublish(actions[i]);
		}
	}

	//=======================================================
	//=======================================================
	view.initFocusManager = function()
	{
		// Subscribe to all of the events we're interested in
		$.each(handlerList, function(event, handler) {
			if (handler)
				fw.eventSubscribe(event, handler);
		});
	}

	//=======================================================
	// This is nearly identical to initFocusManager.  Combine them!
	//=======================================================
	view.closeFocusManager = function()
	{
		// Subscribe to all of the events we're interested in.
		// Do it safely, using the exact callback.  Other modules may be bound to the same events.
		$.each(handlerList, function(event, handler) {
			if (handler)
				fw.eventUnsubscribe(event, handler);
		});
	}

})();
