//===========================================================================================
// Manages docking, or relative positioning of widgets
//
// There are two different docking "modes":
//	Simple mode positions a widget relative to one other widget.  The height and width aren't
//	modified, so they either need to be supplied by the layout or automatically set by the widget.
//
//	Complex mode allows each edge of a widget to dock to a different width, modifying the
//  width and height.  Each axis can dock to either one or two widgets.  If docking to only one
//  widget, the size of that axis won't be modified.
//
// A simple dock object looks like this:
// {
//	wid: The target widget.  Can be a reference, a path string, or "stage" to dock to the entire stage.
//	my: Source widget dock location: string -- Any combination of "top", "bottom", "center", "left",
//		"right", separated by a space.  If any axis is omitted, "center" is assumed.
//	at: Target widget dock location.  Same format as "my".
//	ofs: String containing the pixel offset between widgets, with the format:
//		"x y" or "both", i.e. if only a single number is specified it is used for both x and y.
// }
//
// A complex dock object looks like this:
// {
//	top: "wid edge offset",
//	bottom: "wid edge offset",
//	left: "wid edge offset",
//	right: "wid edge offset"
// }
//
// At least one horizontal and one vertical edge must be defined.  If both are defined, the width
// or height of the widget will be modified.
//
// @TODO/dg: We're missing a way to center an axis in complex mode.  Centering requires having
// a height or width, which get calculated after complex mode.  However, it should be possible
// to use complex mode for one axis, and simple mode for another, e.g. use complex mode to
// dock the top and bottom, determining the height on the fly, but using a fixed width and
// centering based on that.
//===========================================================================================
(function() {
	fw.registerModule("docking", {});

	//===========================================================================================
	// Private functions
	//===========================================================================================

	//=======================================================
	// Extract the horizontal edge name from a list
	// Note that this doesn't do any error checking.  Either it
	// finds a valid entry, or uses 'center'.
	//=======================================================
	function getHorizontalName(list)
	{
		if (list.indexOf('left') != -1)
			return 'left';
		else if (list.indexOf('right') != -1)
			return 'right';
		else
			return 'centerx';
	}

	//=======================================================
	// Extract the horizontal edge name from a list
	// Note that this doesn't do any error checking.  Either it
	// finds a valid entry, or uses 'center'.
	//=======================================================
	function getVerticalName(list)
	{
		if (list.indexOf('top') != -1 || list.indexOf('scrolltop') != -1 )
			return 'top';
		else if (list.indexOf('bottom') != -1)
			return 'bottom';
		else
			return 'centery';
	}

	//=======================================================
	// Any combination of "top", "bottom", "center", "left",
	// "right", separated by a space.  If any axis is omitted, "center" is assumed.
	//=======================================================
	function parseEdges(str)
	{
		var list = str.split(' ', 2);	// Break into pieces

		// Clean up
		$.each(list, function(key) {
			list[key] = list[key].toLowerCase();
		});

		return [getHorizontalName(list), getVerticalName(list)];
	}

	//=======================================================
	// "x y" or "both", i.e. if only a single number is specified it is used for both x and y.
	//=======================================================
	function parseOffset(str)
	{
		if (typeof(str) !== 'string')
			fw.error("Docking offset isn't a string!");

		var ofs = str.split(' ', 2);	// Break into pieces

		// Clean up
		$.each(ofs, function(key) {
			ofs[key] = parseInt(ofs[key]);
			if (isNaN(ofs[key]))
				fw.error('Invalid offset in docking data: ' + str);
		});

		// If only one value was passed, copy it to both positions
		if (!defined(ofs[1]))
			ofs[1] = ofs[0];

		return ofs;
	}

	//=======================================================
	// Parses a complex-mode string, which is simpler than
	// simple-mode strings.  Go figure.
	// Format: 'widget edge offset'
	// Offset is optional, and defaults to 0.
	// Widget and edge are mandatory
	//=======================================================
	function parseComplex(str, axis)
	{
		var pieces = str.split(' ');

		var len = pieces.length;
		if (len < 2 || len > 4)
			fw.error('Error parsing complex mode dock data');

		// Convert offset from a string to a number
		var ofs = parseInt(pieces[2] || '0');
		if (isNaN(ofs))
			fw.error('Invalid offset in docking data: ' + str);

		return {
			wid: pieces[0],
			at: parseEdges(pieces[1])[axis],	// Complex method of converting 'center' to 'centerx' or 'centery'
			ofs: ofs
		};
	}

	//=======================================================
	// Widgets can be defined by reference, path (absolute or relative), or can be 'stage'
	// This converts any of them to a reference (except 'stage' since it doesn't exist)
	//=======================================================
	function getWidgetReference(wid, parent)
	{
		if (!wid)
			fw.error('Illegal widget identifier in docking module');

		if (typeof(wid) === 'string')
		{
			// It can either be a widget path, or "stage"
			if (wid.toLowerCase() === 'stage')
				return 'stage';

			// Attempt to use the parent, so we can handle both relative and absolute paths
			var ref = parent && parent.getWidget(wid, true);
			if (ref)
				return ref;

			// In some cases, the parent IS the target
			if (parent.id === wid)
				return parent;

			return null;
		}
		else
			return wid;		// We already had a reference.  No work is necessary.
	}

	//=======================================================
	// Returns the offset of an edge, relative to the top left corner
	//=======================================================
	function offset(edge, w, h)
	{
		switch(edge)
		{
			case 'top':
			case 'top2':
			case 'scrolltop':
				return 0;

			case 'bottom':
			case 'bottom2':
				return h;	// Theoretically should be '-1' but we'll treat bottom and right as one pixel beyond so things line up properly

			case 'left':
			case 'left2':
				return 0;

			case 'right':
			case 'right2':
				return w;	// Theoretically should be '-1' but we'll treat bottom and right as one pixel beyond so things line up properly

			case 'centerx':
				return w / 2;

			case 'centery':
				return h / 2;
		}

		fw.error('Attempting to dock to illegal edge: ' + edge);
	}

	//=======================================================
	// Returns a single coordinate for a widget
	//=======================================================
	function getCoord(wid, edge, parent)
	{
		var widRef = getWidgetReference(wid, parent);
		if (!widRef)
			fw.error('Unable to locate docking target widget.  Invalid path or reference.');

		if (widRef === 'stage')
		{
			var stageSize = fw.stageSize();
			return offset(edge, stageSize[0], stageSize[1]);
		}

		switch(edge)
		{
			case 'top':
			case 'top2':
				return widRef.y;
			case 'bottom':
			case 'bottom2':
				return widRef.y + widRef.height();	// Theoretically should be '-1' but we'll treat bottom and right as one pixel beyond so things line up properly

			case 'left':
			case 'left2':
				return widRef.x;

			case 'right':
			case 'right2':
				return widRef.x + widRef.width();	// Theoretically should be '-1' but we'll treat bottom and right as one pixel beyond so things line up properly

			case 'centerx':
				return widRef.x + (widRef.width() / 2);

			case 'centery':
				return widRef.y + (widRef.height() / 2);
		}

		fw.error('Attempting to dock to illegal edge: ' + edge);
	}

	//=======================================================
	// Positions a single axis based on a single edge
	//=======================================================
	function singleEdge(srcWid, destWid, my, at, ofs)
	{
		if (my && at)
		{
			var w = srcWid.width ? srcWid.width() : 0;
			var h = srcWid.height ? srcWid.height() : 0;
			var coord = getCoord(destWid, at, srcWid.parent);	// Get coordinate of widget we're docking to
			return coord + (ofs || 0) - offset(my, w, h);
		}
		else
			fw.error('Insufficient data to dock widget ' + srcWid.path());
	}

	//=======================================================
	// Positions and sizes a single axis using both edges
	//=======================================================
	function bothEdges(srcWid, destWid1, my1, at1, ofs1, destWid2, my2, at2, ofs2)
	{
		var coord1, coord2;

		// Handle left or top edge
		var coord1 = getCoord(destWid1, at1, srcWid.parent) + ofs1;	// Get coordinate of widget we're docking to

		// Handle right or bottom edge
		var coord2 = getCoord(destWid2, at2, srcWid.parent) + ofs2;	// Get coordinate of widget we're docking to

		if (coord2 <= coord1)
			fw.error('Attempting to set a negative size while docking: ' + srcWid.path() +
				' (' + coord1 + ', ' + coord2 + ')');

		return {
			0: coord1,					// coord (can be x or y)
			1: coord2 - coord1			// width or height
		};
	}

	//=======================================================
	// Modify x and y only.
	//=======================================================
	function simpleMode(wid, args)
	{
		// Parse "my" string
		var my = parseEdges(args.my || 'top left');

		// Parse "at" string
		var at = parseEdges(args.at || 'top left');

		// Parse "offset" string
		var ofs = parseOffset(args.ofs || '0');

		// Calculate x
		var x = singleEdge(wid, args.wid, my[0], at[0], ofs[0]);

		// Calculate y
		var y = singleEdge(wid, args.wid, my[1], at[1], ofs[1]);

		// Move the source widget
		wid.setPos(Math.floor(x), Math.floor(y));
	}

	//=======================================================
	// Calculates positions for each edge, modifying both
	// position and extents.
	//=======================================================
	function complexMode(wid, args)
	{
		// Gather data for horizontal docking
		var leftStr = getTarget(wid, args, 'left', 'left2', 0);		// Choose a definition
		var rightStr = getTarget(wid, args, 'right', 'right2', 0);
		var centerStr = getTarget(wid, args, 'centerx', 'centerx2', 0);
		var xw = complexAxis(wid, args, leftStr, rightStr, centerStr, 0);

		// Gather data for vertical docking
		var topStr = getTarget(wid, args, 'top', 'top2', 1);
		var bottomStr = getTarget(wid, args, 'bottom', 'bottom2', 1);
		var centerStr = getTarget(wid, args, 'centery', 'centery2', 1);



		var yh = complexAxis(wid, args, topStr, bottomStr, centerStr, 1);


		// Set the position based on top and left values
		wid.setPos(Math.floor(xw[0]), Math.floor(yh[0]));

		// Set the width
		xw[1] && wid.width(Math.floor(xw[1]));

		// Set the height
		yh[1] && wid.height(Math.floor(yh[1]));
	}



	//=======================================================
	// complexAxis
	//=======================================================
	function complexAxis(wid, args, edge1, edge2, center, axis)
	{
		var data1 = args[edge1] && parseComplex(args[edge1], axis);
		var data2 = args[edge2] && parseComplex(args[edge2], axis);
		var data3 = args[center] && parseComplex(args[center], axis);

		var scrollOffset = 0;
		if (args[edge1] ) {
			 if (args[edge1].indexOf('scrolltop') > -1 ) {
				 scrollOffset = $(window.parent).scrollTop();//$(window).scrollTop();//document.body.scrollTop;//
			}
		}

		if (data1 && data2)
			return bothEdges(wid, data1.wid, edge1, data1.at, data1.ofs, data2.wid, edge2, data2.at, data2.ofs);
		else if (data1)
			return [singleEdge(wid, data1.wid, edge1, data1.at, data1.ofs + scrollOffset)];
		else if (data2)
			return [singleEdge(wid, data2.wid, edge2, data2.at, data2.ofs)];
		else if (data3)
			return [singleEdge(wid, data3.wid, center, data3.at, data3.ofs)];
		else
			fw.error('Attempting to dock without edge data: ' + wid.path());
	}

	//=======================================================
	// Picks a target to dock with.  Sometimes the first choice
	// of a widget target doesn't exist, so allow for a second choice.
	//
	// @REFACTOR/dg: Note that redundant work is being done.
	// This could return the parseComplex() data object instead
	// of a string, allowing redundant work to be removed.
	//=======================================================
	function getTarget(srcWid, def, first, second, axis)
	{
		// Make sure there's a definition for this edge.  If not, pass back anything (stick with first choice).
		// If there wasn't a second choice defined, also just go with the first choice.
		if (!defined(def[first]) || !defined(def[second]))
			return first;

		var data = parseComplex(def[first], axis);
		if (getWidgetReference(data.wid, srcWid.parent))
			return first;
		else
			return second;
	}

	//===========================================================================================
	// API
	//===========================================================================================

	//=======================================================
	// Position a widget based on one or more other widgets
	//
	// wid is the source widget
	//=======================================================
	framework.prototype.dock = function(wid, args, dontNotify)
	{
		// Wid has to be a valid widget reference
		if (!(wid && wid.getWidget))
			fw.error('Attempting to dock an invalid widget');

		// Let the widget system know that this widget should go to the end of the
		// dependency list.
		wid.dependencyNotify();

		// Save docking information so we can do it again later
		wid.dockTarget = args;

		// Check for simple mode
		if (defined(args.wid))
			simpleMode(wid, args);
		else
			complexMode(wid, args);

		// Send a 'docked' event to the widget to notify it of updated position and extent values
		if (!dontNotify)
			wid.docked && wid.docked();
	}

	//=======================================================
	// Returns a dock object for docking to the extents of
	// an entire widget.
	//=======================================================
	framework.prototype.dockTo = function(wid)
	{
		return {
			top: wid.id + ' top',
			bottom: wid.id + ' bottom',
			left: wid.id + ' left',
			right: wid.id + ' right'
		}
	}

	//=======================================================
	// Returns a dock object for docking to the extents of
	// an entire widget.
	//=======================================================
	framework.prototype.moveDependents = function()
	{
		fw.resetLayout();
	}

})();
