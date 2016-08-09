//===========================================================================================
// Graphic Module
// This operates as a mediator layer between the framework and the underlying graphic system.
// It currently works on the DOM through jQuery, but could just as easily work with canvas elements.
//===========================================================================================
(function() {

	fw.registerModule("graphics", {reset: reset});

	var random = 000;

	// Element list
	var elements = {};	// List of elements, indexed by ID

	// Depth definitions
	framework.prototype.ZENITH = 200;		// We needed more fine-grained control
	framework.prototype.TOP = 100;
	framework.prototype.FORE = 50;
	framework.prototype.MIDPLUS = 25;
	framework.prototype.MIDDLE = 0;
	framework.prototype.MIDMINUS = -25;
	framework.prototype.BACK = -50;
	framework.prototype.BOTTOM = -100;

	//===========================================================================================
	// Private functions
	//===========================================================================================

	//=======================================================
	// Reset the module
	//=======================================================
	function reset()
	{
		// Delete all elements from the DOM
		$.each(elements, function(key, val) {
			$("#" + key).remove();
		});

		elements = {};
	}

	//===========================================================================================
	// API
	//===========================================================================================

	//=======================================================
	// This is a bookkeeping function.
	// Add an element to the list of registered objects
	// so it won't throw an error.
	//=======================================================
	framework.prototype.registerObject = function(id)
	{
		/*
		if (!defined(elements[id]))
			elements[id] = true;
		else
			fw.warning("Attempting to register an object that already exists: " + id);
		*/
	}

	//=======================================================
	// This is a bookkeeping function.
	// Add an element to the list of registered objects
	// so it won't throw an error.
	//=======================================================
	framework.prototype.unregisterObject = function(id)
	{
		/*
		if (defined(elements[id]))
			delete elements[id];
		else
			fw.warning("Attempting to unregister an object that doesn't exist: " + id);
		*/
	}

	//=======================================================
	//=======================================================
	framework.prototype.verifyObject = function(el, verb)
	{
		/*
		// We're dealing with elements instead of strings now. This check is mostly obsolete.
		// A newer check might be to ensure the element is in the DOM. That's slow and should
		// just be used during development.
		if (typeof(id) !== 'string')
			return true;

		if (!defined(elements[id]))
		{
			fw.warning(verb + " non-existent element: " + id);
			return false;
		}
		*/

		if (typeof(el) === 'undefined')
			return false;

		return true;
	}

	//=======================================================
	// Delete a graphical element
	//=======================================================
	framework.prototype.remove = function(el)
	{
		if (fw.verifyObject(el, 'Deleting'))
		{
			// Delete from the DOM
			el.remove();
		}
	}

	//=======================================================
	// Delete a graphical element
	//=======================================================
	/*
	framework.prototype.removeType = function(type)
	{
		// It would be so much easier to do a delete by class.
		// However, we also need to clear entries from elements[].
		// elements[] isn't vital, but it does allow useful error checking.
		$.each(elements, function(key, val) {
			if (!defined(val.type))
				return true;

			var all = val.type.split(' ', 10);

			if ($.inArray(type, all) != -1)
			{
				// Delete from the DOM
				$("#" + key).remove();

				// Remove from the element list
				delete elements[key];
			}
		});
	}
	*/

	//=======================================================
	// Cleans up parameters
	//=======================================================
	framework.prototype.normalize = function(obj)
	{
		if (defined(obj.x))
			obj.x = Math.floor(obj.x);
		if (defined(obj.y))
			obj.y = Math.floor(obj.y);
		if (defined(obj.w))
			obj.w = Math.floor(obj.w);
		if (defined(obj.h))
			obj.h = Math.floor(obj.h);
	}

	//=======================================================
	//=======================================================
	framework.prototype.randomID = function()
	{
		return "abcxyz" + random++;
	}

	//===========================================================================================
	// Generic Graphics API
	//===========================================================================================

	//=======================================================
	//=======================================================
	framework.prototype.element = function(id)
	{
		if (fw.verifyObject(id, 'Looking up'))
			return $("#" + id);
	}

	//=======================================================
	// Basic bounding box collision handler
	//=======================================================
	framework.prototype.show = function(el)
	{
		if (fw.verifyObject(el, 'Showing'))
			el.show();
	};

	//=======================================================
	// Basic bounding box collision handler
	//=======================================================
	framework.prototype.hide = function(el)
	{
		if (fw.verifyObject(el, 'Hiding'))
			el.hide();
	}

	//=======================================================
	//
	//=======================================================
	framework.prototype.setX = function(el, x)
	{
		x = Math.floor(x);

		if (fw.verifyObject(el, 'Moving'))
			el.css('left', x + "px");
	}

	//=======================================================
	//
	//=======================================================
	framework.prototype.setY = function(el, y)
	{
		y = Math.floor(y);

		if (fw.verifyObject(el, 'Moving'))
			el.css('top', y + "px");
	}

	//=======================================================
	//
	//=======================================================
	framework.prototype.setPos = function(el, x, y)
	{
		if (fw.verifyObject(el, 'Moving'))
		{
			if (typeof(el) === 'string')
				el = $("#" + el);

			fw.setX(el, x);
			fw.setY(el, y);
		}
	}

	//=======================================================
	//
	//=======================================================
	framework.prototype.getPos = function(el)
	{
		var x = -1;	// Define defaults in case we can't determine actual values
		var y = -1;

		if (fw.verifyObject(el, 'Getting position of'))
		{
			if (el.length)
			{
				var obj = el.prop('style');

				if (defined(obj.left))
					x = parseInt(obj.left, 10);	// Values returned include "px" at the end.  Use parseInt to clear it.
				if (defined(obj.top))
					y = parseInt(obj.top, 10);
			}
		}

		return [x, y];
	};

	//=======================================================
	//=======================================================
	framework.prototype.adjustPos = function(el, dx, dy)
	{
		if (fw.verifyObject(el, 'Moving'))
		{
			dx = Math.floor(dx);
			dy = Math.floor(dy);

			var coords = fw.getPos(el);
			var newX = coords[0] + dx;
			var newY = coords[1] + dy;
			fw.setX(el, newX);
			fw.setY(el, newY);

			return [newX, newY];
		}
	};

	//=======================================================
	// Returns the height of an element
	//=======================================================
	framework.prototype.getHeight = function(el)
	{
		if (fw.verifyObject(el, 'Getting the height of'))
			return parseInt(el.outerHeight(), 10);
	};

	//=======================================================
	// Returns the width of an element
	//=======================================================
	framework.prototype.getWidth = function(el)
	{
		if (fw.verifyObject(el, 'Getting the width of'))
			return parseInt(el.outerWidth(), 10);
	};

	//=======================================================
	// Sets the height of an element
	//=======================================================
	framework.prototype.setHeight = function(el, size)
	{
		if (fw.verifyObject(el, 'Setting height of'))
			el.outerHeight(size);
	};

	//=======================================================
	// Sets the width of an element
	//=======================================================
	framework.prototype.setWidth = function(el, size)
	{
		if (fw.verifyObject(el, 'Setting width of'))
			el.outerWidth(size);
	};

	//=======================================================
	// Clears the width and height of an element (size: auto)
	//=======================================================
	framework.prototype.clearSize = function(el)
	{
		if (fw.verifyObject(el, 'Clearing size of'))
			el.css({width:'', height:''});
	};

	//=======================================================
	// Sets the height of an element
	//=======================================================
	framework.prototype.setScale = function(el, size)
	{
		if (fw.verifyObject(el, 'Setting scale of'))
			el.css('transform', 'scale(' + size + ')');
	};

	//=======================================================
	// Returns the x and y coordinates of a container (sub-view)
	//=======================================================
	framework.prototype.getContainerCoords = function(container)
	{
		var coords = $(container).offset();
		return {x: coords.left, y: coords.top};
	};

	//=======================================================
	//
	//=======================================================
	framework.prototype.collide = function(x, y, box)
	{
		return ((x >= box.x) && (x < box.x+box.w) && (y >= box.y) && (y < box.y+box.h))
	};

	//=======================================================
	// Sets the focus on an element.
	// This doesn't seem like a natural match for the graphics
	// module, but this is the interface between the underlying
	// graphics technology and the rest of the system.
	//=======================================================
	framework.prototype.focus = function(el)
	{
		if (fw.verifyObject(el, 'Focusing'))
			el.focus();
	};

	//=======================================================
	// Remove focus from an element
	//=======================================================
	framework.prototype.blur = function(el)
	{
		if (fw.verifyObject(el, 'Blurring'))
			el.blur();
	}

	//=======================================================
	// Permit or deny the ability to set the focus on an arbitrary
	// element.  This won't prevent an input from gaining focus (use readOnly for that)
	//=======================================================
	framework.prototype.allowFocus = function(el, enable)
	{
		if (fw.verifyObject(el, 'Enabling focusing on'))
		{
			if (enable)
				el.attr('tabindex', 0);
			else
				el.removeAttr('tabindex');
		}
	};

	//=======================================================
	// Set the cursor for an item
	//
	// Any css value can be passed in, but we also support
	// more sensible naming, allowing for a small amount of isolation.
	// Values supported: normal, action
	//=======================================================
	framework.prototype.cursor = function(el, type)
	{
		// Translate to something sensible.  Don't assume direct css styles.
		if (type === 'normal')
			type = 'default';		// Default is better than auto.  Default is always an arrow (varies by platform).  Auto changes.
		else if (type === 'action')
			type = 'pointer';

		if (fw.verifyObject(el, 'Setting cursor for'))
			el.css('cursor', type);
	};

	//=======================================================
	// Set alpha
	//=======================================================
	framework.prototype.alpha = function(el, alpha)
	{
		if (fw.verifyObject(el, 'Changing opacity for'))
			el.css('opacity', alpha);
	};

	//=======================================================
	// Fade Out (equal but opposite to fade in)
	//=======================================================
	framework.prototype.setScroll = function(el, value)
	{
		if (fw.verifyObject(el, 'Setting scroll offset for'))
			el.scrollTop(value);
	};

	//=======================================================
	// Fade Out (equal but opposite to fade in)
	//=======================================================
	framework.prototype.setDepth = function(el, value)
	{
		if (fw.verifyObject(el, 'Setting depth for'))
			el.css('zIndex', value);
	};

	//=======================================================
	// Add a "type" (class in HTML) for an element
	//=======================================================
	framework.prototype.setType = function(el, value)
	{
		if (fw.verifyObject(el, 'Setting type for'))
			el.addClass(value);
	};

	//=======================================================
	// Remove a "type" (class in HTML) for an element
	//=======================================================
	framework.prototype.clearType = function(el, value)
	{
		if (fw.verifyObject(el, 'Clearing type for'))
			el.removeClass(value);
	};

//===========================================================================================
// Element event binding -- Binds various action events to screen elements
//===========================================================================================

	//=======================================================
	//=======================================================
	framework.prototype.eventBind = function(event, el, callback)
	{
		if (fw.verifyObject(el, 'Binding to'))
			el.on(event, function(ev) {		// We're trying very hard to limit allocation, but this one is difficult to avoid.
				ev.stopPropagation();
				callback(ev);
			});
	}

	//=======================================================
	//=======================================================
	framework.prototype.eventUnbind = function(event, el)
	{
		if (fw.verifyObject(el, 'Unbinding from'))
			el.off(event);
	}

})();
