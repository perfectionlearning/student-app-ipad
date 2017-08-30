//===========================================================================================
// Widget Module
//
// Currently, widgets add themself to the framework's widget collection (framework.widget)
// Consider requiring a registration process instead, which would better isolate the module's internals.
//
// The internal widget collection is framework.widget, and the widget communication interface is
// framework.prototype.widget.  That is unneccessarily confusing.  Adding a registration process
// would help clean that up.
//
// Closing a widget directly, rather than through the parent, should cause an error!  That will leave orphaned widgets.
//
// Widgets accept a single object.  Required elements for all widgets are:
//    id -- anonymous widgets are allowed, but this is potentially dangerous.  Currently, widgets without an id are given a fake id.
//    x
//    y
//
// Optional interface:
//    showSelf()
//    hideSelf()
//    terminateSelf()
//	  setPosSelf()
//	  adjustPosSelf()
//	  fadeInSelf()
//    fadeOutSelf()
//    stopFadeSelf()
//    setAlphaSelf()
//	  animToSelf()
//    ...
//
// NOTE: This module should be included BEFORE the graphic module (due to order of 'reset' operations)
//===========================================================================================
(function() {
	fw.registerModule("widget", {reset: reset});

	framework.widget = {};	// This object holds all the widgets registered with the system (there isn't an active registration system)

	var idCnt = 0;
	var freezeDeps = false;

	//=======================================================
	// Widget Interface
	//=======================================================
	var widget = function(){};

	//---------------------------------------------------
	// Add a child widget
	//---------------------------------------------------
	widget.prototype.add = function(type, args, dock)
	{
		if (!defined(args))
			fw.error('Attempting to create a widget without arguments!');

		var wList = this.widgetList || (this.widgetList = []);

		// Create an ID if one wasn't supplied
		if (!defined(args.id))
			args.id = anonID();
		if (this.hasChild(args.id) !== -1)
			fw.error('Creating a widget with a duplicate name: ' + args.id);

		// Fill in default x and y as well
		args.x = args.x || 0;
		args.y = args.y || 0;

		// Create a new object with our arguments and the widget interface
		var wid = new widget();
		wid = $.extend(wid, args);
		wid.widgetList = [];	// Create the group widgetList to save effort later


		// Add the widget to our list
		wid.parent = this;
		wList.push(wid);

		// If no container was specified, copy the container from the parent
		if (!defined(wid.container))
			wid.container = this.container;

		//  Now call the constructor
		framework.widget[type].call(wid, args);

		// Dock the widget if requested
		dock && fw.dock(wid, dock);

		// Attach any delegated events to the new widget
		attachDelegates(wid);

		// Return the widget
		return wid;
	}

	//---------------------------------------------------
	// Move a widget from one group to another
	//
	// NOTE: Destination paths are relative to the widget
	//       processing the move command.
	//---------------------------------------------------
	widget.prototype.move = function(newParent)
	{
		this.parent.deList(this.id);	// Remove from parent

		newParent.insert(this.id, this);
	}

	//---------------------------------------------------
	// Check to see if a widget contains a child with the
	// given ID.
	//
	// Returns an index into the widgetList for speed.
	// -1 means not found.
	//---------------------------------------------------
	widget.prototype.hasChild = function(name)
	{
		for (var i = 0; i < this.widgetList.length; i++)
		{
			if (this.widgetList[i].id === name)
				return i;
		}

		return -1;
	}

	//---------------------------------------------------
	// Helper routine: Adds a widget to the group's widget list
	//---------------------------------------------------
	widget.prototype.insert = function(name, wid)
	{
		var idx = this.hasChild(name);

		if (idx !== -1)
			fw.warning("Widget move: Overwriting existing widget: " + name);

		this.widgetList.push(wid);
		wid.parent = this;
	}

	//---------------------------------------------------
	// Deletes a widget from the widgetList
	// This shouldn't be called directly!
	// When a widget is done closing, it needs to call this routine.
	//---------------------------------------------------
	widget.prototype.deList = function(name)
	{
		var idx = this.hasChild(name);

		if (idx === -1)
			fw.error("Attempting to deList non-existent widget: " + name);

		this.widgetList.splice(idx, 1);
	}

	//---------------------------------------------------
	// Route a command to a widget
	//
	// This is a little-used short-cut for getWidget + a command
	//---------------------------------------------------
	widget.prototype.cmd = function(name, command)
	{
		var target = this.getWidget(name, true);

		if (target === null)
		{
			fw.warning('Sending command "' + command + '" to non-existent widget: ' + name);
			return;
		}

		if (!defined(target[command]))
			fw.error("Sending unknown command '" + command + "' to widget " + name);

		// Construct an array of arguments, using everything passed in after 'command'
		var argsArray = [].slice.apply(arguments, [2]);	// Converting arguments to an array

		// Call the target widget's command processor
		return target[command].apply(target, argsArray);	// apply is used because we need to convert an array into a parameter list
	}

	//---------------------------------------------------
	// Locates a widget, given a selector
	//
	// Selectors use a directory-like path system.
	// A leading / means to start from the primeWidget.  Otherwise
	// paths are relative to the current widget.
	// '..' refers to the parent of the current node
	// Anything else is a widget ID
	// Child nodes are separated with / characters
	//
	// Examples:
	// ../grid references a sibling named 'grid'
	// /list references a list widget that is a child of the primeWidget
	// page1/icons/icon0 references page1's child icons's child icon0
	//---------------------------------------------------
	widget.prototype.getWidget = function(selector, canFail)
	{
		// Deal with a leading '/' character
		if (selector[0] == '/')
		{
			var node = primeWidget;
			selector = selector.substr(1);
		}
		else
			var node = this;

		// Break selector into the next route (anything before '/') and the rest of the route
		var path = selector.split('/');
		while (path.length > 0)
		{
			// Special case for empty selectors
			if (path[0] === '')
				break;

			if (path[0] == '..')
				node = node.parent;
			else
			{
				// Current target is relative to node
				var idx = node.hasChild(path[0]);

				if (idx === -1)
				{
					if (!defined(canFail))
						fw.warning("Unable to find widget '" + path[0] + "' in " + this.id + ".  Full path: '" + selector + "'");
					return null;
				}

				node = node.widgetList[idx];
			}

			path.shift();
		}

		return node;
	}

	//---------------------------------------------------
	// Determine the absolute path for this widget
	//---------------------------------------------------
	widget.prototype.path = function()
	{
		var path = this.id;

		var wid = this;
		while(wid.parent)
		{
			if (wid.parent.id != 'prime')
				path = wid.parent.id + '/' + path;
			else
				path = '/' + path;

			wid = wid.parent;
		}

		return path;
	}

	//=======================================================
	// Default implementation to set or get a widget's height
	//=======================================================
	widget.prototype.height = function(h)
	{
		if (defined(h))
		{
			this.h = h;
			return this;	// For chaining
		}
		else
			return this.h;
	}

	//=======================================================
	// Default implementation to set or get a widget's width
	//=======================================================
	widget.prototype.width = function(w)
	{
		if (defined(w))
		{
			this.w = w;
			return this;
		}
		else
			return this.w;
	}

	//---------------------------------------------------
	// Debug routine to get the group's widget list
	//---------------------------------------------------
	widget.prototype.debugGetList = function()
	{
		return this.widgetList;
	}

	//---------------------------------------------------
	// Return the position of a widget
	//---------------------------------------------------
	widget.prototype.getPos = function()
	{
		return [this.x, this.y];
	}

	//---------------------------------------------------
	// Position the entire group
	// This doesn't make sense unless we maintain an internal set of relative coordinates
	//---------------------------------------------------
	widget.prototype.setPos = function(x, y)
	{
		var that = this;

		// First handle all child widgets
		$.each(this.widgetList, function(name, wid) {
			var dx = wid.x - that.x;
			var dy = wid.y - that.y;
			wid.setPos(x + dx, y + dy);
		});

		// Now update this widget
		this.x = x;
		this.y = y;

		this.setPosSelf && this.setPosSelf(x, y);

		return this;	// For chaining
	}

	//---------------------------------------------------
	//---------------------------------------------------
	widget.prototype.animTo = function(x, y, rate, action, easing)
	{
		var that = this;

		// First handle all child widgets
		$.each(this.widgetList, function(name, wid) {
			var dx = wid.x - that.x;
			var dy = wid.y - that.y;
			wid.animTo(x + dx, y + dy, rate, action, easing);
		});

		// Now update this widget
		this.x = x;
		this.y = y;

		this.animToSelf && this.animToSelf(x, y, rate, action, easing);

		return this;	// For chaining
	}

	//---------------------------------------------------
	// Move the entire group
	//---------------------------------------------------
	widget.prototype.adjustPos = function(x, y)
	{
		// First handle all child widgets
		$.each(this.widgetList, function(name, wid) {
			wid.adjustPos(x, y);
		});

		// Now update this widget
		this.x += x;
		this.y += y;

		this.adjustPosSelf && this.adjustPosSelf(x, y);

		return this;	// For chaining
	}

	//---------------------------------------------------
	// Fade the entire group
	//---------------------------------------------------
	widget.prototype.fadeIn = function(rate, fadeTo, action, immediate)
	{
		// First handle all child widgets
		$.each(this.widgetList, function(name, wid) {
			wid.fadeIn(rate, fadeTo, action, immediate);
		});

		// Now update this widget
		this.fadeInSelf && this.fadeInSelf(rate, fadeTo, action, immediate);

		/*
		this.fadeInSelf && this.fadeInSelf(rate, fadeTo, function() {
			action && action();		// Perform the requested action on completion
			this.showSelf && this.showSelf();	// Also call the widget's showSelf routine, if specified
			// @FIXME/dg: I don't think this is working!
		});
		*/

		return this;	// For chaining
	}

	//---------------------------------------------------
	// Fade the entire group
	//---------------------------------------------------
	widget.prototype.fadeOut = function(rate, fadeTo, action, immediate)
	{
		// First handle all child widgets
		$.each(this.widgetList, function(name, wid) {
			wid.fadeOut(rate, fadeTo, action, immediate);
		});

		// Now update this widget
		this.fadeOutSelf && this.fadeOutSelf(rate, fadeTo, action, immediate);

		/*
		this.fadeOutSelf && this.fadeOutSelf(rate, fadeTo, function() {
			action && action();		// Perform the requested action on completion
			this.hideSelf && this.hideSelf();	// Also call the widget's hideSelf routine, if specified
			// @FIXME/dg: I don't think this is working!
		});
		*/

		return this;	// For chaining
	}

	//---------------------------------------------------
	// Set the alpha for the entire group
	//---------------------------------------------------
	widget.prototype.setAlpha = function(value)
	{
		// First handle all child widgets
		$.each(this.widgetList, function(name, wid) {
			wid.setAlpha(value);
		});

		// Now update this widget
		this.setAlphaSelf && this.setAlphaSelf(value);

		return this;	// For chaining
	}

	//---------------------------------------------------
	// Stop fading.  Rapid changes from fading in to out look bad without stopping first!
	//---------------------------------------------------
	widget.prototype.stopFade = function(dontFinish)
	{
		// First handle all child widgets
		$.each(this.widgetList, function(name, wid) {
			wid.stopFade(dontFinish);
		});

		// Now update this widget
		this.stopFadeSelf && this.stopFadeSelf(dontFinish);

		return this;	// For chaining
	}

	//---------------------------------------------------
	// Show the entire group
	//---------------------------------------------------
	widget.prototype.show = function()
	{
		// Show all child widgets
		$.each(this.widgetList, function(name, wid) {
			wid.show();
		});

		// If a widget has its own routine, call it
		this.showSelf && this.showSelf();

		return this;	// For chaining
	}

	//---------------------------------------------------
	// Hide the entire group
	//---------------------------------------------------
	widget.prototype.hide = function()
	{
		// Hide all child widgets
		$.each(this.widgetList, function(name, wid) {
			wid.hide();
		});

		// If a widget has its own routine, call it
		this.hideSelf && this.hideSelf();

		return this;	// For chaining
	}

	//---------------------------------------------------
	// Check a widget to see if it has a given ancestor
	//---------------------------------------------------
	widget.prototype.hasAncestor = function(id)
	{
		var node = this;
		while (node)
		{
			if (node.id === id)
				return true;

			node = node.parent;
		}

		return false;
	}

	//---------------------------------------------------
	// Immediately shut down the entire group
	//---------------------------------------------------
	widget.prototype.terminate = function()
	{
		// First handle all child widgets
		// Iterate through backwards since we're deleting as we go.
		for (var i = this.widgetList.length - 1; i >= 0; i--)
			this.widgetList[i].terminate();

		// If a widget has any actions attached to it, notify them of termination
		var that = this;
		this.actionList && $.each(this.actionList, function(idx, val) {
			val.terminate && val.terminate();
		});

		// Completely redundant, probably useless.  This may (or may not) aid in deallocation.
		// It's an attempt to prevent circular dependencies that prevent garbage collection.
		this.actionList = [];

		// If a widget has its own routine, call it
		this.terminateSelf && this.terminateSelf();

		// And finally, remove the group from the global list
		if (this != primeWidget)
			this.parent.deList(this.id);
	}

	//---------------------------------------------------
	// Resize a widget and all of its children
	//---------------------------------------------------
	widget.prototype.redock = function()
	{
		var that = this;

		// Pre-redock notification (rare)
		this.preRedock && this.preRedock();

		// This has to operate in the opposite order from all other widget tree routines.
		// The main widget has to be resized before any of its children, since they are
		// generally dependent on the parent for docking.
		this.doDock();

		// Next handle all child widgets
		$.each(this.widgetList, function(name, wid) {
			wid.redock();
		});

		// Post-redock notification (rare)
		this.postRedock && this.postRedock();

		return this;	// For chaining
	}

	//---------------------------------------------------
	// If docking information is available, dock this widget
	//---------------------------------------------------
	widget.prototype.doDock = function()
	{
		if (this.dockTarget)
			fw.dock(this, this.dockTarget, true);
	}

	//---------------------------------------------------
	// Primitive method to maintain dependency graphs.
	// This assumes human sorting initially, meaning that
	// no widget was docked to another that didn't exist yet.
	//---------------------------------------------------
	widget.prototype.dependencyNotify = function()
	{
		// Sometimes, we don't want to update the "dependency graph"
		if (freezeDeps)
			return;

		var list = this.parent.widgetList;

		// Find this widget in the list, and move it to the end.
		// Stop before the last item in the list, since that would be redundant.
		for (var i = 0; i < (list.length-1); i++)
		{
			if (list[i] === this)
			{
				// Move it to the end
				list.splice(i, 1);
				list.push(this);
				break;
			}
		}
	}

	//---------------------------------------------------
	// Bind an event to a widget (including all children)
	// Params:
	//   event: The event to bind to, e.g. "click" or "mouseenter"
	//   callback: The routine to call when the event occurs
	//   owner: [Optional] The widget responsible for the bind.  Used by delegates.
	//---------------------------------------------------
	widget.prototype.bind = function(event, callback, action, noTree)
	{
		// Start with the top level and work down
		this.bindSelf && this.bindSelf(event, callback, action);

		// Process all child widgets
		if (!noTree)	// not defined, or set to false
		{
			$.each(this.widgetList, function(name, wid) {
				wid.bind(event, callback, action);
			});
		}

		return this;	// For chaining
	}

	//---------------------------------------------------
	// Bind an event to a widget and all of its current
	// and future children.
	//
	// Params:
	//   event: The event to bind to, e.g. "click" or "mouseenter"
	//   callback: The routine to call when the event occurs
	//   action: The action instance that created this delegate
	//---------------------------------------------------
	widget.prototype.addDelegate = function(event, callback, action)
	{
		// Save delegate info for future widgets
		if (!defined(this.delegates))
			this.delegates = [];
		this.delegates.push({event: event, cb: callback, action: action});

		// Bind to all current children
		this.bind(event, callback, action);

		return this;	// For chaining
	}

	//=======================================================
	// Apply an action to a widget
	//=======================================================
	widget.prototype.applyAction = function(type, options)
	{
		if (!framework.action[type])
			fw.error('Applying illegal action (' + type + ') to widget (' + this.id + ')');

		if (!this.actionList)
			this.actionList = [];

		options.wid = this;
		var act = new framework.action[type](options);
		this.actionList.push(act);

		return act;
	}

	//=======================================================
	// Search a widget's parents for delegates, attaching
	// any that found to the widget and all of its children
	//=======================================================
	function attachDelegates(wid)
	{
		var delegates = getDelegateList(wid.parent);

		for (var i = delegates.length-1; i >= 0; i--)
		{
			// Only bind to the current widget, not all of its children as well.
			// They will be caught individually as they are added to the tree.
			var del = delegates[i];
			wid.bind(del.ev, del.cb, del.act, true);
		}
	}

	//=======================================================
	// Climb the widget tree, searching for widgets with delegates
	//=======================================================
	function getDelegateList(wid, out)
	{
		if (!out) out = [];	// On entry, out won't be defined

		wid.delegates && $.each(wid.delegates, function(idx, val) {
			out.push({
				ev: val.event,
				cb: val.cb,
				act: val.action
			});
		});

		if (wid.parent)
			return getDelegateList(wid.parent, out);
		else
			return out;
	}


	//=======================================================
	// Interface to the framework
	//=======================================================
	// Create the top-level widget.  All widgets are children of this prime widget.
	var primeWidget = new widget();
	primeWidget.id = 'prime';
	primeWidget.x = 0;
	primeWidget.y = 0;
	primeWidget.widgetList = [];

	//=======================================================
	// Create a top-level widget (use this with care!)
	//=======================================================
	framework.prototype.createWidget = function(type, args, dock)
	{
		return primeWidget.add(type, args, dock);
	}

	//=======================================================
	// Locate a widget by selector
	//=======================================================
	framework.prototype.getWidget = function(name, canFail)
	{
		return primeWidget.getWidget(name, canFail);
	}

	//=======================================================
	// Create a unique widget ID
	//=======================================================
	function anonID()
	{
		return 'w' + idCnt++;
	}

	//=======================================================
	// Debug routine -- returns the widget list
	//=======================================================
	framework.prototype.debugGetPrimeWidget = function()
	{
		return primeWidget;
	}

	//=======================================================
	// Sets the local context (DOM element in this version)
	//=======================================================
	framework.prototype.setContainer = function(cont)
	{
		primeWidget.container = cont;
	}

	//=======================================================
	// This debounced version improves responsiveness drastically.
	// However, under rare conditions is causes graphic glitches.
	// Revisit when you have time to perfect it.
	//
	// Sets the local context (DOM element in this version)
	//=======================================================
	function redockHandler()
	{
		freezeDeps = true;		// Prevent sorting by dependencies during the redock
		primeWidget.redock();
		freezeDeps = false;		// Restore dependency sorting
	}
	framework.prototype.resetLayout = _.debounce(redockHandler, 50);


	//=======================================================
	// Reset the module -- delete all widgets
	//=======================================================
	function reset()
	{
		primeWidget.terminate();	// The primeWidget doesn't get recreated, but it works anyway.  This just terminates all of its children.
	}

})();
