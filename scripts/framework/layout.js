//===========================================================================================
// Layout Manager
//
// The purpose of this module is to allow the easy creation of multiple views.
// It operates within a widget-based framework.
// This isn't a real View class.  Events aren't supported at this level.  A higher level View
// class can use this as a widget layout engine instead of using an html templating system.
//
// Scaling is beyond the scope of this module: Widgets are responsible for supporting
// multiple sizes if appropriate.
// Layouts contain optional width and height attributes.
// Art assets can be scaled based on those height and width settings.
// Other widgets can use the width and height attributes as they choose.
// Consider a method of automatically choosing between various sizes of art assets in the future.
//
// There are two components to a layout: Coordinate lists, and draw lists
// Coordinate lists are just a list of coordinates.  They don't have to be actively associated
// with a widget; it can be the potential location of a widget.
// Coordinates can be: absolute (top or left aligned), centered, or right/bottom aligned
//
// Draw lists are lists of widgets that are created when a view is constructed.
// They include a 'layout id' (method of locating the coordinate info for placement), a widget type,
// and information specific to the widget they are creating.
// That information is stored in an array[3]: layoutID, widgetType, {widget-specific data}
// The widget-specific data is also populated with coordinate data from the coordinate lists: x, y, width, height
//
// There are two coordinate lists active at any one time: a global list, and a list specific to
// the current context.
// The current context is checked first, allowing it to override global positioning data.
//===========================================================================================
(function() {
	fw.registerModule("layout", {});

	var Layouts;

	var stageWH;	// 'stage' and 'screen' are used interchangeably.  Try to formalize on 'stage'.

	var curLayout;	// Current active layout
	var selector;	// Layout selector -- used to choose between various layouts for a single view

	// drawList indices
	var dlLID = 0;		// Layout ID (ID used to look up layout positioning)
	var dlType = 1;		// Widget type
	var dlObj = 2;		// Widget arguments

	//===========================================================================================
	// Private functions
	//===========================================================================================

	//=======================================================
	// Locate a layout definition for a given LID
	//=======================================================
	function getDef(lid)
	{
		// Prefer local layout, but use global if not found locally
		if (curLayout[selector] && curLayout[selector][lid])
			return curLayout[selector][lid];
		else if (Layouts.Global[selector] && Layouts.Global[selector][lid])
			return Layouts.Global[selector][lid];
		else
		{
			fw.error('No layout definition for selector "' + selector + '", LID "' + lid + '"');
			return null;
		}
	}

	//===========================================================================================
	// API
	//===========================================================================================

	//=======================================================
	// Gets or sets the size of the stage: [width, height]
	//=======================================================
	framework.prototype.stageSize = function(wh)
	{
	    if (defined(wh) && defined(wh[0]) && defined(wh[1]))
			stageWH = wh;

	    return stageWH;
	}

	//=======================================================
	// Sets the currently active local layout
	//=======================================================
	framework.prototype.setLayout = function(name)
	{
	    curLayout = Layouts[name];
	}

	//=======================================================
	// Sets the currently active local layout
	//=======================================================
	framework.prototype.setSelector = function(name)
	{
	    selector = name;
	}

	//=======================================================
	// Gets the currently active local layout -- should combine set and get
	//=======================================================
	framework.prototype.getSelector = function()
	{
	    return selector;
	}

	//=======================================================
	// Construct a screen using a drawList
	//=======================================================
	framework.prototype.createScreen = function(list)
	{
	    if (!defined(list))
	    {
			fw.error("Attemped to Layout without a list of elements!");
			return;
	    }

	    // Step through the list of elements
	    $.each(list, function(elName, elData) {
			fw.addToLayout(elName, elData);
	    });
	};

	//=======================================================
	// Adds a single element to the stage
	//=======================================================
	framework.prototype.addToLayout = function(name, element)
	{
		// This is a bit odd.  addToLayout normally adds a single item.
		// However, we also want to be able to add a list, which is the exact
		// functionality of the parent routine, createScreen.
		// For logical naming reasons, we still want to use addToLayout, so
		// redirect to createScreen.
		if (arguments.length === 1 && typeof(arguments[0] === 'object'))
			return fw.createScreen(arguments[0]);

		// The drawList might have some helper functions
		if (typeof(element) === 'function')
			return;

	    var widArg = $.extend({}, element[dlObj]);	// Close the element since widArg gets modified
	    var def = getDef(element[dlLID]);

	    // Add standard positioning data and ID to widget
		widArg.id = name;		// And finally, all widgets need a semi-unique name (in a DOM model, that becomes the element id)

		// Pass through all custom keys as well
		var keywords = ['dock', 'at', 'my', 'ofs'];	// Standard items -- don't copy these
		$.each(def, function(key, val) {
			if ($.inArray(key, keywords) == -1)
			widArg[key] = val;
		});

		// Finally, call the widget with our constructed argument
		if (typeof(def.dock) === 'object')
			var dock = def.dock;		// Pass the object on verbatim
		else
			var dock = {
				wid: def.dock,
				my: def.my,
				at: def.at,
				ofs: def.ofs || '0'
			};
		var wid = fw.createWidget(element[dlType], widArg);
		fw.dock(wid, dock);		// Do it after creation, since height and width may not be valid yet.  Unless we start hidden, this could create flicker!
	}

	//=======================================================
	// DrawList methods
	//=======================================================
	function setParam(widget, param, val)
	{
		this[widget][2][param] = val;
	}

	//=======================================================
	// Accept either a single object, or an array of objects
	//=======================================================
	framework.prototype.drawList = function(list) {
		if (!_.isArray(list))
			list = [list];

		list.splice(0, 0, {});		// Insert an empty object
		list.push({setParam: setParam});
		return $.extend.apply(this, list);
	}

	//=======================================================
	// Set the global layout list
	//=======================================================
	framework.prototype.LayoutList = function(list) {
		Layouts = list;
	}
})();
