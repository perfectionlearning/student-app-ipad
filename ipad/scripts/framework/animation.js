//===========================================================================================
// Asset Management Module
//===========================================================================================
(function() {
	fw.registerModule("animate", {reset:reset, handler:handler});

	var animList = {};	// List of animations, indexed by ID -- IDs are shared with the graphics module

	var FRAME_CONTROLLER = 0;
	var MOTION_CONTROLLER = 1;
	var LOGIC_CONTROLLER = 2;

	var LOOP = 0;
	var HOLD = 1;
	var ONE_SHOT = 2;

	var handleID = 0;

	//===========================================================================================
	// Private functions
	//===========================================================================================

	//=======================================================
	// Reset the module
	//=======================================================
	function reset()
	{
		animList = {};
	}

	//=======================================================
	// Update Routine -- Do this before the graphics update routine (controlled by JS file include order, until we MAKE into a single file)
	//=======================================================
	function handler()
	{
		var deleteList = [];

		$.each(animList, function(id, obj) {

			// Process each controller
			$.each(obj.controllers, function(cID, cont) {

				if (cont.active === false)
					return true;	// continue $.each

				// Check for time to update
				if (++cont.timer < cont.rate)
					return true;	// continue $.each

				cont.timer = 0;		// Reset timer

				// Perform desired behavior
				switch (cont.type)
				{
					case FRAME_CONTROLLER:		// Automatic frame controller (usually inc and stop, inc and loop, or inc and reverse)
						frameController(id, cID, obj);
						break;

					case MOTION_CONTROLLER:		// Automatic motion controller (usually move to at constant velocity)
						motionController(id, cID, obj);
						break;

					case LOGIC_CONTROLLER:		// Custom logic to modify position and frame
						cont.func(id, obj, cont.data);
						break;

				default:
					fw.warning("Illegal controller type.  Object: " + id + ", controller: " + cID + ", type: " + cont.type);
				}
			});

			if (defined(obj.deleteMe))
				deleteList.push(id);
		});

		// Delete anything that was flagged for deletion earlier
		$.each(deleteList, function(idx, id) { delete animList[id] });
	}

	//=======================================================
	// Motion Controller
	//=======================================================
	function motionController(id, cID, obj)
	{
		var cont = obj.controllers[cID];

		// Update x and y
		fw.adjustPos(id, cont.dx, cont.dy);

		// Decrement count, check for completion
		if (--cont.count <= 0)
		{
			if (defined(cont.callback))
				cont.callback(obj);

			fw.deleteController(id, cont.handle);
		}
	}

	//=======================================================
	// Animate a sprite
	//=======================================================
	function frameController(id, cID, obj)
	{
		var cont = obj.controllers[cID];
		var seq = obj.seqList[cont.seq];		// This comes from the asset manager -- array: frame rate, first frame, last frame

		// Increment relative frame number, check for completion
		if (++cont.frame > (seq[2] - seq[1]))
		{
			// Sequence is complete.  Do appropriate behavior
			switch (cont.behavior)
			{
				case LOOP:
					cont.frame = 0;
					break;

				case HOLD:
					frameContHold(cont, obj);
					return;		// Don't update the image frame number

				case ONE_SHOT:
					frameContOneShot(cont, obj);
					return;		// Don't update the image frame number

				default:
					fw.warning("Illegal sequence behavior in frame controller.  Object: " + id + ", controller: " + cID + ", value: " + cont.behavior);
					return;		// Don't update the image frame number
			}
		}

		// Update the image frame number.  Do this only if we didn't reach the end, or if we looped
		fw.frame(id, seq[1] + cont.frame);
	}

	//=======================================================
	// Frame controller behavior: Hold on last frame
	//=======================================================
	function frameContHold(cont, obj)
	{
		cont.active = false;	// Disable controller

		if (defined(cont.callback))
			cont.callback(obj);
	}

	//=======================================================
	// Frame controller behavior: Delete self on completion
	//=======================================================
	function frameContOneShot(cont, obj)
	{
		// Perform the callback if there is one
		if (defined(cont.callback))
			cont.callback(obj);

		// Flag self for deletion
		obj.deleteMe = true;
	}

	//=======================================================
	// Return a unique handle for each controller
	//=======================================================
	function getHandle()
	{
		return "h" + handleID++;
	}

	//=======================================================
	// Creates an animation entry
	//=======================================================
	function createAnim(id)
	{
		animList[id] = {};
		animList[id].controllers = [];
	}

	//===========================================================================================
	// API
	//===========================================================================================

	//=======================================================
	// Creates the underlying image, and the animation structure
	//
	// Clean this up and make it more useful
	//=======================================================
	framework.prototype.createAnim = function(id, imgID, x, y, frame, eventObj)
	{
		fw.draw({
			id: id,
			image: imgID,
			x: x,
			y: y,
			frame: frame,
			eventObj: eventObj
		});

		animList[id] = {};
		animList[id].controllers = [];
		animList[id].seqList = fw.getSequence(imgID);
	}

	//=======================================================
	//=======================================================
	framework.prototype.addLogicAnim = function(id, rate, callback, data)
	{
		var handle = getHandle();

		var cont = {
			type: LOGIC_CONTROLLER,
			active: true,
			rate: rate,
			timer: 0,
			handle:handle,

			func: callback,
			data: data
		}

		// Create the animation if it doesn't exist
		if (!defined(animList[id]))
			createAnim(id);

		animList[id].controllers.push(cont);

		return handle;
	};

	//=======================================================
	//=======================================================
	framework.prototype.addFrameAnim = function(id, behavior, sequence, frame, callback)
	{
		// We can't create the animation if it doesn't exist.  Frame animations require the image ID to determine the sequence
		if (!defined(animList[id]))
		{
			fw.error("Referencing non-existant animation: " + id);
			return null;
		}

		behavior = behavior.toUpperCase();
		if (behavior == "LOOP")
			var behave = LOOP;
		else if (behavior == "ONESHOT")
			var behave = ONE_SHOT;
		else if (behavior == "HOLD")
			var behave = HOLD;
		else
			fw.warning("Illegal behavior type.  ID: " + id + ", behavior: ", behavior);	// Should probably not proceed, but continue anyway

		var handle = getHandle();

		var cont = {
			type: FRAME_CONTROLLER,
			active: true,
			rate: animList[id].seqList[sequence][0],
			timer: 0,
			handle:handle,

			seq: sequence,
			frame: frame || 0,
			behavior: behave,
			callback: callback
		}

		animList[id].controllers.push(cont);

		return handle;
	};

	//=======================================================
	//=======================================================
	framework.prototype.addMotionAnim = function(id, rate, count, dx, dy, callback)
	{
		var handle = getHandle();

		var cont = {
			type: MOTION_CONTROLLER,
			active: true,
			rate: rate,
			timer: 0,
			handle:handle,

			count: count,
			dx: dx,
			dy: dy,
			callback: callback
		}

		// Create the animation if it doesn't exist
		if (!defined(animList[id]))
			createAnim(id);

		animList[id].controllers.push(cont);

		return handle;
	};

	//=======================================================
	//=======================================================
	framework.prototype.deleteAnim = function(id)
	{
		delete animList[id];
	}

	//=======================================================
	// Deletes a controller, given a handle
	//=======================================================
	framework.prototype.deleteController = function(id, handle)
	{
		var len = animList[id].controllers.length;

		for (var i = 0; i < len; i++)
		{
			if (animList[id].controllers[i].handle == handle)
			{
				animList[id].controllers.splice(i, 1);
				return;
			}
		}
	}

	//=======================================================
	// Deletes all controllers for a given animation
	//=======================================================
	framework.prototype.clearControllers = function(id)
	{
		animList[id].controllers = [];
	}
})();
