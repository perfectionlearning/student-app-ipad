//===============================================================================
// Creates a graph display with optional input
//
// Arguments:
//	id
//	x, y, w
//	size: Size of the graph
//	axis: Arguments to pass on to the graph widget
//	eq: Arguments to pass on to the graph widget
//	inputCount: Number of points to input
//
// Style: (graphInput)
//	boxColor: Background color of surrounding box
//	borderWidth: Width of border of the surrounding box
//	borderColor
//	margin: Space between the surrounding box and the graph widget
//	titleMargin: Space between the top of the widget and the text title
//	tableMargin: Space between the right edge of the graph and the table text
//	tableGap: Space between table entries
//  firstEntryMargin: Space between the title and the first table entry
//	iconAsset: Asset to use for the Remove button
//	iconYAdjust: Pixels to move the icon to properly center it
//	iconGap: Pixels between the icon and the point number
//	pairMargin: Pixels between the number and the coordinate pair
//===============================================================================
framework.widget.graphPlotInput = function()
{
	var that = this;
	var style = app.style.graphPlotInput;

	var graph, box, title;

	var ofs = app.container.offset();
	var modX = style.margin + ofs.left;
	var modY = style.margin + ofs.top;	// We can't include that.y in here because the page layout is dynamic (the whole thing will move down shortly)
	var ht = that.size + style.margin*2;
	var sideX = style.margin + that.size;
	var readOnly = false;

	var table = [];
	initTable();

	//===============================================================================
	// Required API for Input Types
	//===============================================================================

	//=======================================================
	// Return the height of the widget
	//=======================================================
	this.height = function()
	{
		return ht;
	}

	//=======================================================
	// Return the current value of the input
	//=======================================================
	this.value = function() // This is currently tied to the Check button
	{
		// Array of arrays
//		return _.pluck(table, "entry");

		// Array of strings
		var out = [];
		$.each(table, function(idx, val) {
			if (val.entry)
				out.push(val.entry.join(','));
			else
				out.push('');
		});

		return out;
	}

	//=======================================================
	// Display the answer
	//=======================================================
	this.showAnswer = function(answer)
	{
		// Add the answer
		graph.addEq([{eq:answer, color: 'green'}]);		// This involves more format massaging than I would like!

		// Ideally, points that were correct would be in a different color
	}

	//=======================================================
	//=======================================================
	this.showSolution = function(answer)
	{
		this.showAnswer(answer);
	}

	//=======================================================
	// Prevent further input
	//=======================================================
	this.readOnly = function()
	{
		for (var i = 0; i < that.inputCount; i++)
			table[i].buttonW && table[i].buttonW.disable();		// Change to .hide()?

		graph.readOnly();
	}

	//=======================================================
	// Allow further input
	//=======================================================
	this.allowInput = function()
	{
		for (var i = 0; i < that.inputCount; i++)
			table[i].buttonW && table[i].buttonW.enable();

		graph.allowInput();
	}

	//=======================================================
	// Go into a compact read-only state.
	// This is only used by steps.
	//=======================================================
	this.cleanup = function()
	{
	}

	//===============================================================================
	// Widget-specific Code
	//===============================================================================

	//=======================================================
	// Create a box to help define the overall area
	//=======================================================
	function createBox()
	{
		return that.add('rect', {
			color: style.boxColor,
			borderWidth: style.borderWidth,
			borderColor: style.borderColor
		}, {
			top: that.id + ' top',
			bottom: that.id + ' top ' + ht,
			left: that.id + ' left',
			right: that.id + ' right'
		});
	}

	//=======================================================
	// Add the graph widget
	//=======================================================
	function createGraph()
	{
		return that.add('graph', {
			w: that.size,
			h: that.size,
			inputCount: that.inputCount,
			eq: [],	//that.eq,			// Don't send in any equations. Those are the answer.
			xRange: that.axis.x,
			yRange: that.axis.y,
			labelSkip: that.axis.skip,
			usePiLabels: that.axis.usePiLabels,
			parentAddPoint: addPair,
			parentRemovePoint: removeByCoords
		}, {
			top: that.id + ' top ' + style.margin,
			left: that.id + ' left ' + style.margin
		});
	}

	//=======================================================
	// Draws the title text
	//=======================================================
	function drawTitle()
	{
		// Add some text for the results (this is for input only!)
		title = that.add('text', {
			font: 'bold 18px Arial',
			color: 'black',
			text: 'POINTS',
			align: 'center',
			depth: 1
		}, {
			top: that.id + ' top ' + (style.margin + style.titleMargin),
			left: graph.id + ' right ' + style.margin,
			right: that.id + ' right -' + style.margin
		});
	}

	//=======================================================
	// Create the table of coordinate pairs
	//=======================================================
	function drawTable()
	{
		var iconMargin = fw.assetWidth(style.iconAsset) + style.iconGap;

		for (var i = 1; i <= that.inputCount; i++)
		{
			var num = that.add('text', {
				font: 'bold 18px Arial',
				color: style.tableTextColor,
				text: i + ':',
				depth: 1
			}, {
				top: (i === 1) ? (title.id + ' bottom ' + style.firstEntryMargin) : (num.id + ' bottom ' + style.tableGap),
				left: graph.id + ' right ' + (style.tableMargin + iconMargin)
			});

			var text = that.add('text', {
				font: '18px Arial',
				color: 'black',
				text: '&nbsp;',
				depth: 1
			}, {
				wid: num,
				my: 'top left',
				at: 'top right',
				ofs: style.pairMargin + ' 0'
			});

			table[i-1].numW = num;
			table[i-1].textW = text;
		}
	}

	//=======================================================
	// Construct the interface at the side of the graph
	//=======================================================
	function drawSide()
	{
		drawTitle();
		drawTable();
	}

	//=======================================================
	// Initialize the table entries
	//=======================================================
	function initTable()
	{
		for (var i = 0; i < that.inputCount; i++)
			table.push({numW: null, textW: null, buttonW: null, entry: null});
	}

	//=======================================================
	// Checks for a free table entry
	//=======================================================
	function freeEntry()
	{
		for (var i = 0; i < that.inputCount; i++)
		{
			if (table[i].entry === null)
				return i;
		}

		return -1;	// None found
	}

	//=======================================================
	// Determines whether a new coordinate pair can be added
	//=======================================================
	function canAddPair()
	{
		return freeEntry() !== -1;
	}

	//=======================================================
	// Add a coordinate pair to the table
	//=======================================================
	function addPair(x, y, xStr, yStr)
	{
		var entry = freeEntry();

		// Make sure there's a free entry (@TODO/dg: add a SFX for failure)
		if (entry === -1)
			return false;

		table[entry].textW.setText(' (' + xStr + ', ' + yStr + ')');
		table[entry].entry = [x, y];

		table[entry].buttonW = that.add('button', {
			id: 'rem' + entry,
//			x: sideX + style.tableMargin,
//			y: table[entry].textW.y + style.iconYAdjust,
			image: style.iconAsset,
			frame: 0,
			click: removePoint,
			tooltip: {
				text: 'Remove point',
				font: '12px Arial',
				align: 'CL',
				posHMargin: 4
			}
		}, {
			wid: table[entry].numW,
			my: 'top right',
			at: 'top left',
			ofs: -style.iconGap + ' ' + style.iconYAdjust
		});

		return true;
	}

	//=======================================================
	// Remove a point from the list
	//
	// RETURN: false on failure
	//=======================================================
	function removePoint(wid)
	{
		var idx = wid.id.substring(3);
		return doRemove(idx);
	}

	//=======================================================
	// Remove a point from the list
	//
	// RETURN: false on failure
	//=======================================================
	function doRemove(idx)
	{
		var row = table[idx];
		if (row.entry === null)	// trying to remove an empty entry?
			return false;

		var coords = row.entry;
		graph.removePoint(coords[0], coords[1]);

		row.textW.setText('&nbsp;');
		row.entry = null;

		if (row.buttonW)
		{
			row.buttonW.terminate();
			row.buttonW = null;
		}
	}

	//=======================================================
	// Remove a point from the list, given a coordinate pair
	//
	// RETURN: false on failure
	//=======================================================
	function removeByCoords(x, y)
	{
		// Search for the point in the list
		for (var i = 0; i < that.inputCount; i++)
		{
			var ent = table[i].entry;
			if (ent && (x === ent[0]) && (y === ent[1]))
			{
				doRemove(i);
				return true;
			}
		}

		return false;	// None found
	}

	//=======================================================
	//
	//=======================================================
	function attachEvents()
	{
		graph.applyAction('mouseMove', {notify:mouseMove});
		graph.applyAction('mouseLeave', {notify:mouseLeave});
		graph.applyAction('click', {click: click});
	}

	//=======================================================
	// The mouse has moved within the graph box
	//=======================================================
	function mouseMove(wid, ev)
	{
		graph.mouseMove(ev.pageX - modX - that.x, ev.pageY - modY - that.y);
	}

	//=======================================================
	// The mouse has left the graph box
	//=======================================================
	function mouseLeave()
	{
		graph.mouseOut();
	}

	//=======================================================
	// A click occurred on the graph
	//=======================================================
	function click(wid, ev)
	{
//		var parentPos = that.container.getBoundingClientRect();
//		graph.mouseClick(ev.pageX - parentPos.left - modX - that.x, ev.pageY - parentPos.top - that.container.scrollTop - modY - that.y);

		// This is ugly, but not as bad as above.
		// It knows too much about DOM elements, but doesn't know about parents and coordinate systems.
		var pos = graph.canvas.getBoundingClientRect();
                // offsets: adjust for vertical or horizontal scrolling, so graph coordinates are right when a point is clicked.
                var offsets = { x: window.pageXOffset, y: window.pageYOffset };

		graph.mouseClick(ev.pageX - offsets.x - pos.left, ev.pageY - offsets.y - pos.top);
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		box = createBox();
		graph = createGraph();
		drawSide();

		attachEvents();

		// No MathML in graph inputs
		that.promise = null;
	}

}
