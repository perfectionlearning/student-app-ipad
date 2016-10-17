//===============================================================================
// Creates a graph display
//
// Arguments:
//	id
//	x, y, w
//	size: Size of the graph
//	eq: Array of equations
//	axis: Information for both axes
//
// Style: (graphInput)
//===============================================================================
framework.widget.graphOutput = function()
{
	var that = this;
	var style = app.style.graphInput;

	var graph;

	drawGraph();

	//=======================================================
	//
	//=======================================================
	function drawGraph()
	{
		// Add the graph widget
		graph = that.add('graph', {
			x: that.x,
			y: that.y,
			w: that.size,
			h: that.size,

			inputCount: 0,
			eq: that.eq,
			xRange: that.axis.x,
			yRange: that.axis.y,
			labelSkip: that.axis.skip,
			usePiLabels: that.axis.usePiLabels
		});
	}

	//=======================================================
	// Graph a new set of data
	//=======================================================
	this.reset = function()
	{
		// It would be faster (but more complex) to delete everything from the graph
		// and add the new equations.
		graph.terminate();
		drawGraph();
	}

	//=======================================================
	// Return the height of the widget
	//=======================================================
	this.height = function()
	{
		return that.size;
	}

	//=======================================================
	//=======================================================
	this.width = function()
	{
		return that.size;
	}

}