//===============================================================================
// Displays a graph and prompts for constants
//
// Arguments:
//	id
//	w
//	size: Size of the graph
//	axis: Arguments to pass on to the graph widget
//	eq: Arguments to pass on to the graph widget
//  params: Array of labels for input fields
//
// Style: (graphInput)
//	boxColor: Background color of surrounding box
//	borderWidth: Width of border of the surrounding box
//	borderColor
//	margin: Space between the surrounding box and the graph widget
//===============================================================================
framework.widget.graphConstInput = function()
{
	var that = this;
	var style = app.style.graphConstInput;

	that.depth = that.depth || 0;
	that.h = that.size + 2*style.margin;

	var box, graph, inputs, labels;

	var isReadOnly = false;

	// Subscribe to events from the underlying input boxes
	fw.eventSubscribe('keypress:Enter', enterInputBox); // Enter key pressed in input box.

	//===============================================================================
	// Required API for Input Types
	//===============================================================================

	//=======================================================
	// Return the current value of the input
	//=======================================================
	this.value = function() // This is currently tied to the Check button
	{
		var out = [];
		$.each(inputs, function(idx, val) {
			out.push(val.value());
		});

		return out;
	}

	//=======================================================
	// Display the answer
	//=======================================================
	this.showAnswer = function(answer)
	{
		var ansObj = app.graphStrToObj(answer);

		ansObj && ansObj.params && $.each(inputs, function(idx, wid) {
			wid.value(ansObj.params[idx]);
		});
	}

	//=======================================================
	// Prevent further input
	//=======================================================
	this.readOnly = function()
	{
		isReadOnly = true;

		$.each(inputs, function(idx, val) {
			val.readOnly(true);
		});
	}

	//=======================================================
	// Allow further input
	//=======================================================
	this.allowInput = function()
	{
		isReadOnly = false;

		$.each(inputs, function(idx, val) {
			val.readOnly(false);
		});
	}

	//=======================================================
	// Go into a compact read-only state.
	// This is only used by steps.
	//=======================================================
	this.cleanup = function()
	{
	}

	//======================================================
	//======================================================
	this.focus = function()
	{
		// Don't do anything if the inputs are read-only
		if (isReadOnly)
			return;

		// This should be impossible, but it's happening.  The following
		// step had no inputs, so everything was getting confused.
		var curInp = findEmpty();
		if (curInp >= 0)
			inputs[curInp].focus();
	}

	//======================================================
	//======================================================
	this.wrongAnswer = function(list)
	{
		list && $.each(list, function(idx, val) {
			inputs[val].wrongAnswer();
		});
	}

	//=======================================================
	//=======================================================
	this.clearWrongs = function()
	{
		$.each(inputs, function(idx, val) {
			val.clearWrongs();
		});
	}

	//===============================================================================
	// Widget-specific Code
	//===============================================================================

	//=======================================================
	// @FIXME/dg: Copied from freeInput. You know better!
	//
	// Find the first empty input box.
	// @FIXME/dg: Use the last wrong answer
	//
	// If none are empty, use the last full box.
	//=======================================================
	function findEmpty()
	{
		var firstEmpty = -1, lastFull = -1;

		$.each(inputs, function(idx, val) {
			if (val.value() == '')
			{
				if (firstEmpty === -1)
					firstEmpty = idx;
			}
			else
				lastFull = idx;
		});

		return (firstEmpty !== -1 ? firstEmpty : lastFull);
	}

	//=======================================================
	// @FIXME/dg: Copied from freeInput. You know better!
	// I tried hard to use shared code, but scoping made it
	// impossible. This would have to move out of widgets
	// and into a shared library for it to always be in scope.
	//
	// Enter key pressed in input box
	// Cycle through inputs, based on pattern in gotFocus.
	//
	// If the event field isn't the last one in the set,
	// simply advance to the next one.
	//
	// If the event field is the last one, we need to submit
	// the answer.  However, before we can do that, we need
	// to determine whether this is from the answerInput or a
	// stepByStep widget, since they have different handlers.
	//=======================================================
	function enterInputBox(data)
	{
		$.each(inputs, function(idx, val) {
			if (val.id === data.id)
			{
				if (idx+1 == inputs.length)
				{
					if (!that.isStep)
						fw.eventPublish('doSubmit:input');
					else
						fw.eventPublish('stepSubmit:input');
				}
				else
					inputs[idx+1].focus();

				return false;	// break
			}
		});
	}

	//=======================================================
	// Create a box to help define the overall area
	//=======================================================
	function createBox()
	{
		box = that.add('rect', {
			color: style.boxColor,
			borderWidth: style.borderWidth,
			borderColor: style.borderColor,
			depth: that.depth
		}, fw.dockTo(that));
	}

	//=======================================================
	// Add the graph widget
	//=======================================================
	function createGraph()
	{
		graph = that.add('graph', {
			w: that.size,
			h: that.size,
			inputCount: that.inputCount,
			eq: [{eq:that.eq.eq, color: style.eqColor}],
			xRange: that.axis.x,
			yRange: that.axis.y,
			labelSkip: that.axis.skip,
			usePiLabels: that.axis.usePiLabels
		}, {
			top: that.id + ' top ' + style.margin,
			left: that.id + ' left ' + style.margin
		});
	}

	//=======================================================
	//
	//=======================================================
	function createInputs()
	{
		var widest = createLabels();
		createInputBoxes(widest);
	}

	//=======================================================
	//
	//=======================================================
	function createLabels()
	{
		labels = [];
		var widestWidth = 0;
		var widestWidget;

		for (var idx = 0; idx < that.params.length; idx++)
		{
			var field = that.params[idx];

			// Figure out what to dock to
			var topDock = (idx === 0) ?
				(graph.id + ' top ' + style.firstFieldY) :
				(label.id + ' bottom ' + style.fieldMargin);

			// Create the label
			var label = that.add('text', {
				text: field + ':',
				font: style.font,
				color: style.textColor,
				depth: that.depth + 1,
				hidden: that.hidden
			}, {
				left: graph.id + ' right ' + style.graphMargin,
				top: topDock
			});

			labels.push(label);

			var w = label.width();
			if (w > widestWidth)
			{
				widestWidth = w;
				widestWidget = idx;
			}
		}

		return widestWidget;
	}

	//=======================================================
	//
	//=======================================================
	function createInputBoxes(widest)
	{
		inputs = [];

		for (var idx = 0; idx < that.params.length; idx++)
		{
			var label = labels[idx].id;

			// Create the input
			var inp = that.add('inputBox', {
				w: style.inputWidth,
				depth: that.depth + 1
			},{
				top: label + ' top -3',			// The offset should move to the style.
				bottom: label + ' bottom 3',	// The offset should move to the style.
				left: labels[widest].id + ' right ' + style.inputGap
			});

			inputs.push(inp);
		}
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		createGraph();
		createInputs();
		createBox();

		// No MathML in graph inputs
		that.promise = null;
	}

	//=======================================================
	//=======================================================
	this.terminateSelf = function()
	{
		fw.eventUnsubscribe('keypress:Enter', enterInputBox); // Enter key pressed in input box.
	}

}
