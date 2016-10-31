//======================================================
// Primitive Widgets -- These wrap elements of the graphic module
// @FIXME/dg: Move these into the framework!
//======================================================
;(function() {

	//=======================================================
	// Routines for low-level graphic widgets
	// This is used to extend primitives that wrap the graphics class
	//
	// Cached version. Defines the functions only once to limit allocation.
	// There are also some speed gains, according to http://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/
	//=======================================================
	var graphicWidget = (function()
	{
		// self routines perform the operations listed.
		// The base version (setPos, show, etc.) are global widget commands that are called for all
		// children widgets, but don't actually do anything.
		function fadeInSelf(rate, fadeTo, action, immediate) { fw.fadeIn(this.el, rate, fadeTo, action, immediate); }
		function fadeOutSelf(rate, fadeTo, action, immediate) { fw.fadeOut(this.el, rate, fadeTo, action, immediate); }
		function stopFadeSelf(dontFinish) { fw.stopFade(this.el, dontFinish); }
		function showSelf() { fw.show(this.el) }
		function hideSelf() { fw.hide(this.el) }
		function setAlphaSelf(value) { fw.alpha(this.el, value); }
		function getPos() { return fw.getPos(this.el); }
		function setPosSelf(x, y) { 
			if (this.keypad) 
				fw.setKeypadPos(this.el);
			else if (this.keypadButton) 
				fw.setKeypadButtonPos(this.el, x, y);
			else 
				fw.setPos(this.el, x, y);
		}
		function adjustPosSelf(x, y) { return fw.adjustPos(this.el, x, y) }
		function terminateSelf() { fw.remove(this.el); }

		//------------------------------------
		//------------------------------------
		function bindSelf(event, callback, action)
		{
			var that = this;
			fw.eventBind(event, that.el, function(ev) { callback.call(action, that, ev) });
		}

		//------------------------------------
		//------------------------------------
		function animToSelf(x, y, rate, action, easing)
		{
			fw.transform(this.el, {
				left: x,
				top: y,
				rate: rate,
				done: action,
				easing: easing
			});
		}

		function transform(obj) { fw.transform(this.el, obj); return this; }
		function cursor(type) { fw.cursor(this.el, type); return this; }

		//------------------------------------
		// Gets or sets the height of a widget
		//------------------------------------
		function height(h)
		{
			if (defined(h))
			{
				fw.setHeight(this.el, h);
				return this;
			}
			else
				return fw.getHeight(this.el);
		}

		//------------------------------------
		// Gets or sets the width of a widget
		//------------------------------------
		function width(w)
		{
			if (defined(w))
			{
				fw.setWidth(this.el, w);
				return this;
			}
			else
				return fw.getWidth(this.el);
		}

		//------------------------------------
		//------------------------------------
		return function() {
			this.setPosSelf = setPosSelf;
			this.adjustPosSelf = adjustPosSelf;
			this.showSelf = showSelf;
			this.hideSelf = hideSelf;
			this.terminateSelf = terminateSelf;
			this.fadeInSelf = fadeInSelf;
			this.fadeOutSelf = fadeOutSelf;
			this.setAlphaSelf = setAlphaSelf;
			this.stopFadeSelf = stopFadeSelf;

			this.bindSelf = bindSelf;
			this.animToSelf = animToSelf;
			this.transform = transform;
			this.cursor = cursor;
			this.getPos = getPos;
			this.height = height;
			this.width = width;

			return this;
		}
	})();

	//=======================================================
	// Copy vars from obj to this.  A bit of a hack!
	// Widgets generally access everything via 'this' instead
	// of 'args'.  However, passing 'this' to another routine
	// is extremely slow
	//=======================================================
	var copyVars = function(src, dest)
	{
		dest.x = src.x;
		dest.y = src.y;
		dest.w = src.w;
		dest.h = src.h;
		dest.scale = src.scale;
		dest.container = src.container;
	}

	//=======================================================
	// Text
	//=======================================================

	//------------------------------------
	//------------------------------------
	framework.widget.text = function(obj)
	{
		graphicWidget.apply(this);	// Inherit graphic widget methods
		textFunctions.apply(this);	// Add member functions

		copyVars(this, obj);

		obj.text += "";	// Enforce string conversion

		var deferred = fw.drawText(obj);
		if (deferred && deferred.state() !== 'resolved')	// If it's already resolved, no work is necessary
		{
			// @DG: We occasionally need to do work BEFORE moveDependents. Add a pre-reset callback
			if (this.notify && this.preMove)
				deferred.done(this.preMove);

			deferred.done(fw.moveDependents);	// This can be too early. Docking hasn't occurred yet.

			if (this.notify)
				this.promise = deferred;
		}

		this.el = fw.element(this.id);	// This seems to work even if Jax conversion hasn't completed
	}

	//------------------------------------
	// Text primitive member functions
	//------------------------------------
	var textFunctions = (function() {

		//------------------------------------
		// Change the text of the widget
		//------------------------------------
		function setText(text)
		{
			text += "";
			var deferred = fw.setText(this.el, text);

			if (deferred)
			{
//				deferred.widget = this;
				deferred.done(fw.moveDependents);
			}

			return this;
		}

		//------------------------------------
		// Change the color of the text
		//------------------------------------
		function color(color)
		{
			fw.color(this.el, color);
			return this;
		}

		//------------------------------------
		// Change the font size of the text
		//
		// lineHeight is optional
		//------------------------------------
		function fontSize(size, lineHeight)
		{
			fw.fontSize(this.el, size, lineHeight);
			return this;
		}

		//------------------------------------
		// Enable or disable wrapping
		//------------------------------------
		function wrap(canWrap)
		{
			fw.setWrapping(this.el, canWrap);
			return this;
		}

		//------------------------------------
		//------------------------------------
		return function() {
			this.setText = setText;
			this.color = color;
			this.fontSize = fontSize;
			this.wrap = wrap;

			return this;
		}
	})();


	//=======================================================
	// Rectangle
	//=======================================================
	framework.widget.rect = function(obj)
	{
		graphicWidget.apply(this);	// Inherit widget methods
		rectFunctions.apply(this);	// Add member functions

		copyVars(this, obj);

		if (!defined(obj.w))
			obj.w = 0;
		if (!defined(obj.h))
			obj.h = 0;

		this.el = fw.drawRect(obj);
	}

	//------------------------------------
	// Rect primitive member functions
	//------------------------------------
	var rectFunctions = (function() {

		//------------------------------------
		//------------------------------------
		this.borderWidth = function(size)
		{
			fw.borderSize(this.el, size);
		}

		//------------------------------------
		//------------------------------------
		this.borderColor = function(color)
		{
			fw.borderColor(this.el, color);
		}

		//------------------------------------
		//------------------------------------
		this.color = function(color)
		{
			fw.bgColor(this.el, color);
			return this;
		}

		//------------------------------------
		// Unusual!  Why focus a rectangle?  We found a reason!
		//
		// In IE 11, this fails if we call this "focus" instead of "setFocus".
		// It works in all other browsers. Focus already exists, so perhaps it
		// can't override properly.
		//------------------------------------
		this.setFocus = function()
		{
			fw.focus(this.el);
		}

		//------------------------------------
		// Enable or disable the ability to obtain focus
		//------------------------------------
		this.allowFocus = function(enable)
		{
			fw.allowFocus(this.el, enable);
		}

		//------------------------------------
		//------------------------------------
		return function() {
			this.borderWidth = borderWidth;
			this.borderColor = borderColor;
			this.color = color;
//			this.alpha = alpha;
			this.focus = setFocus;
			this.allowFocus = allowFocus;

			return this;
		}
	})();

	//=======================================================
	// Image
	//=======================================================
	framework.widget.image = function(obj)
	{
		// OOPS! We have a member variable and a member function with the same name.
		// There are too many instances to fix it right now.
		// Immediately move the frame member variable to a safe spot.
		this.fr = this.frame;

		graphicWidget.apply(this);	// Inherit widget methods
		imageFunctions.apply(this);	// Add member functions

		// 'image' needs to contain the asset name
		if (!defined(this.image) && !defined(this.url))
			fw.error('Asset name not defined in image widget "' + this.id + '"');

		if (typeof(this.fr) === 'string')
			this.fr = obj.frame = fw.frameNumber(this.image, this.fr);

		copyVars(this, obj);

		// Add atlas data to image object.
		if (obj.image && fw.getAsset(obj.image))
			this.atlasData = obj.atlasData = fw.getAsset(obj.image);

		this.el = fw.draw(obj);
	}

	//------------------------------------
	// Image primitive member functions
	//------------------------------------
	var imageFunctions = (function() {

		//------------------------------------
		// Get or Set the frame for this widget
		// Always returns a number, not a name if one is defined
		//------------------------------------
		function frame(frame)
		{
			if (defined(frame))
			{
				if (typeof(frame) === 'string')
					frame = fw.frameNumber(this.image, frame);

				if ( (frame >= 0) && (frame < fw.frameCount(this.image)) )
				{
					this.fr = frame;
					fw.frame(this.el, frame, this.image); // this.image for Resource ID
				}
			}

			return this.fr;
		}

		//------------------------------------
		// @TODO: Add starting frame, ending frame, notification
		// @FIXME/dg: The params are stupid.  We only ever have a callback or looping.  Combine into a single parameter.
		//------------------------------------
		function playAnim(rate, callback, isLooped)
		{
			this.animHandle = fw.anim(this.el, {
				frames: fw.frameCount(this.image),
				rate: rate,
				callback: callback,
				w: fw.assetWidth(this.image),
				h: fw.assetHeight(this.image),
				atlasData: this.atlasData,
				loop: isLooped
			});
		}

		//------------------------------------
		//------------------------------------
		function stopAnim()
		{
			this.animHandle && fw.stopAnim(this.animHandle);
		}

		//------------------------------------
		// Override.  We need to take scaling into consideration.
		//------------------------------------
		function width(w)
		{
			var scale = this.scale || 1;

			if (defined(w))
			{
				fw.setWidth(this.el, Math.round(w / scale));
				return this;
			}
			else
				return Math.round(fw.getWidth(this.el) * scale);
		}

		//------------------------------------
		// Override.  We need to take scaling into consideration.
		//------------------------------------
		function height(h)
		{
			var scale = this.scale || 1;

			if (defined(h))
			{
				fw.setHeight(this.el, Math.round(h / scale));
				return this;
			}
			else
				return Math.round(fw.getHeight(this.el) * scale);
		}

		//------------------------------------
		//------------------------------------
		function setScale(scale)
		{
			this.scale = scale;
			fw.setScale(this.el, scale);
		}

		//------------------------------------
		//------------------------------------
		return function() {
			this.frame = frame;
			this.playAnim = playAnim;
			this.stopAnim = stopAnim;
			this.width = width;
			this.height = height;
			this.setScale = setScale;

			return this;
		}
	})();

	//=======================================================
	// Image: This is a hack, but necessary until we have CSS3 support.
	// 'image' can have multiple frames, but can't scale.
	// 'dynamicImage' can scale, but can't have multiple frames.
	// Both can be dynamic or pre-loaded.
	// Used in delayedImage.js and widgetList.js (view.widgetLists.qImage)
	//
	// @REMOVEME/dg: We now assume CSS3.  This can be removed, but it's
	// still used in WorkView.  It's also used for delayedImage.
	//=======================================================
	framework.widget.dynamicImage = function(obj)
	{
		// 'image' needs to contain the asset name
		if (!defined(this.image) && !this.url)
		{
			fw.warning('Asset name not defined in image widget "' + this.id + '"');
			this.terminate();
			return;
		}

		graphicWidget.apply(this);	// Inherit widget methods
		copyVars(this, obj);
		this.el = fw.drawDynamicImage(obj);

		//------------------------------------
		// Modify the image url
		//------------------------------------
		this.url = function(url)
		{
			fw.setUrl(this.el, url);
		}
	}

	//=======================================================
	// Equation
	//=======================================================
	framework.widget.equation = function(obj)
	{
		graphicWidget.apply(this);	// Inherit widget methods
		eqFunctions.apply(this);	// Add member functions

		copyVars(this, obj);

		obj.owner = this;		// Add the owner (this widget!) to the parameters.  Hopefully this won't create a circular reference and memory leak.
		this.el = fw.drawEquation(obj);

		this.isReadOnly = false;
	}

	//------------------------------------
	// Equation primitive member functions
	//------------------------------------
	var eqFunctions = (function() {

		//------------------------------------
		// Set the focus on an editable equation box
		//------------------------------------
		function focus()
		{
			if (!this.isReadOnly)
				fw.eqFocus(this.el);

			return this;	// For chaining
		}

		//------------------------------------
		// Remove the focus from an editable equation box
		//------------------------------------
		function blur()
		{
			if (!this.isReadOnly)
				fw.eqBlur(this.el);

			return this;	// For chaining
		}

		//------------------------------------
		//------------------------------------
		function value()
		{
			return fw.eqRead(this.el);
		}

		//------------------------------------
		// Write data into the equation
		//------------------------------------
		function write(text)
		{
			if (this.bounds)
			{
			// Determine whether the new entry will fit

				// Save the current value, in case we need to go back
				var current = fw.eqRead(this.el);

				// Write in the new entry
				fw.eqWrite(this.el, text);

				// Remove the size settings (save them first)
				var w = fw.getWidth(this.el);
				var h = fw.getHeight(this.el);
				fw.clearSize(this.el);

				// Get the new sizes
				var wNew = fw.getWidth(this.el);
				var hNew = fw.getHeight(this.el);

				// Check against the desired bounds
				if (wNew > this.bounds.w || hNew > this.bounds.h)
					this.promise = fw.eqWriteHtml(this.el, current);	// Revert

				// In either case, reset the width and height
				fw.setWidth(w);
				fw.setHeight(h);
			}
			else
				fw.eqWrite(this.el, text);
		}

		//------------------------------------
		// Write data into the equation
		//------------------------------------
		function clear()
		{
			if (!this.isReadOnly)
				fw.eqClear(this.el);
		}

		//------------------------------------
		//------------------------------------
		function negate()
		{
			if (!this.isReadOnly)
				fw.eqNegate(this.el);
		}

		//------------------------------------
		//------------------------------------
		function backspace()
		{
			if (!this.isReadOnly)
				fw.eqBackspace(this.el);
		}

		//------------------------------------
		// Pass the request on to the specific input widget
		//------------------------------------
		function showAnswer(answer)
		{
			this.isReadOnly = true;
			this.promise = fw.eqWriteHtml(this.el, answer);

			if (this.promise)
				this.promise.done(fw.moveDependents);
		}

		//------------------------------------
		// Currently identical to showAnswer
		// This should instead show the base HTML without any container
		//------------------------------------
		function showSolution(answer)
		{
			this.isReadOnly = true;
			this.promise = fw.eqWriteHtml(this.el, answer);

			if (this.promise)
				this.promise.done(fw.moveDependents);
		}

		//------------------------------------
		// Pass the request on to the specific input widget
		//------------------------------------
		function readOnly()
		{
			// Prevent re-entrancy on read only status since it wipes out the box
			if (!this.isReadOnly)
			{
				this.isReadOnly = true;
				fw.eqReadOnly(this.el);
				fw.setType(this.el, 'eqReadOnly');	// This is an ugly hack, but we need to adjust the position to compensate for borders
			}
		}

		//------------------------------------
		// Pass the request on to the specific input widget
		//------------------------------------
		function allowInput()
		{
			this.isReadOnly = false;
			fw.eqAllowInput(this.el);
			fw.clearType(this.el, 'eqReadOnly');	// This is an ugly hack, but we need to adjust the position to compensate for borders
		}

		//------------------------------------
		// Set the text alignment within the box
		// Only really useful in read-only mode.
		//------------------------------------
		function align(align)
		{
			fw.eqAlignment(this.el, align);
		}

		//------------------------------------
		//------------------------------------
		function setBounds(w, h)
		{
			this.bounds = {
				w: w,
				h: h
			};
		}

		//------------------------------------
		//------------------------------------
		return function() {
			this.focus = focus;
			this.blur = blur;
			this.value = value;
			this.write = write;
			this.clear = clear;
			this.negate = negate;
			this.backspace = backspace;
			this.showAnswer = showAnswer;
			this.showSolution = showSolution;
			this.readOnly = readOnly;
			this.allowInput = allowInput;
			this.align = align;
			this.setBounds = setBounds;

			return this;
		}
	})();

	//=======================================================
	// Multiple Input Box Collection
	//=======================================================
	framework.widget.multiInput = function(obj)
	{
		this.w += this.widthAdjust;	// Kind of a hack
		obj.w = this.w

		graphicWidget.apply(this);	// Inherit widget methods
		multiFunctions.apply(this);	// Add member functions

		copyVars(this, obj);

		var deferred = fw.drawMultiInput(obj);
		if (deferred)
		{
//			deferred.widget = this;
			deferred.done(fw.moveDependents);

			if (this.notify)
				this.promise = deferred;	// Note: probable circular reference (only if setting deferred.widget)
		}
		else
			this.promise = null;

		this.el = fw.element(this.id);	// This seems to work even if Jax conversion hasn't completed
	}

	//------------------------------------
	// Multi input (free input) primitive member functions
	//------------------------------------
	var multiFunctions = (function() {

		//------------------------------------
		// Retrieve the results of all of the input boxes
		//------------------------------------
		function answers()
		{
			return fw.getMultiAnswers(this.el);
		}

		//------------------------------------
		// Display the answer
		//------------------------------------
		function showAnswer()
		{
			var deferred = fw.showMultiAnswer(this.el);
			if (deferred)
			{
//				deferred.widget = this;
				deferred.done(fw.moveDependents);
			}
		}

		//=======================================================
		// Replace answers stored in boxes with overriding values.
		//=======================================================
		function replaceAnswers(ans)
		{
			return fw.replaceMultiAnswers(this.el, ans);
		}

		//=======================================================
		// Retrieve coordinates for all of the boxes
		//=======================================================
		function getBoxes()
		{
			return fw.getMultiBoxes(this.el);
		}

		//=======================================================
		// Retrieve a count of the boxes
		//=======================================================
		function boxCount()
		{
			return fw.getMultiBoxCount(this.el);
		}

		//------------------------------------
		//------------------------------------
		return function() {
			this.answers = answers;
			this.showAnswer = showAnswer;
			this.replaceAnswers = replaceAnswers;
			this.getBoxes = getBoxes;
			this.boxCount = boxCount;

			return this;
		}
	})();

	//=======================================================
	// Canvas
	//=======================================================
	framework.widget.canvas = function(obj)
	{
		graphicWidget.apply(this);	// Inherit widget methods
		copyVars(this, obj);
		this.el = fw.drawCanvas(obj);

		//------------------------------------
		// Return the canvas context
		//------------------------------------
		this.context = function()
		{
			return fw.canvasCtx(this.el);
		}
	}

	//=======================================================
	// Video
	//=======================================================
	framework.widget.video = function(obj)
	{
		graphicWidget.apply(this);	// Inherit widget methods
		videoFunctions.apply(this);	// Add member functions

		copyVars(this, obj);
		this.el = fw.drawVideo(obj);
	}

	//------------------------------------
	// Video primitive member functions
	//------------------------------------
	var videoFunctions = (function() {

		//------------------------------------
		//------------------------------------
		function shutDown()
		{
			return fw.videoTerminate(this.el);
		}

		//------------------------------------
		//------------------------------------
		function pause()
		{
			return fw.videoPause(this.el);
		}

		//------------------------------------
		//------------------------------------
		function resume()
		{
			return fw.videoResume(this.el);
		}

		//------------------------------------
		//------------------------------------
		function replay()
		{
			return fw.videoReplay(this.el);
		}

		//------------------------------------
		//------------------------------------
		function stop()
		{
			return fw.videoStop(this.el);
		}

		//------------------------------------
		//------------------------------------
		function currentTime()
		{
            if (arguments.length == 1) {
                var timeline = arguments[0];
                if (isNaN(parseInt(timeline)))
                    fw.error('Invalid number of ms passed to currentTime');
                else
                    fw.videoCurrentTime(this.el, timeline);
            }
            else
    			return fw.videoCurrentTime(this.el);
		}

		//------------------------------------
		//------------------------------------
		function duration()
		{
			return fw.videoDuration(this.el);
		}

		//------------------------------------
		//------------------------------------
		function terminateSelf()
		{
			fw.videoTerminate(this.el);
			fw.remove(this.el);
		}

		//------------------------------------
		//------------------------------------
		return function() {
			this.shutDown = shutDown;
			this.pause = pause;
			this.resume = resume;
			this.replay = replay;
			this.stop = stop;
			this.currentTime = currentTime;
			this.duration = duration;
			this.terminateSelf = terminateSelf;

			return this;
		}
	})();


	//=======================================================
	// Low-level input box -- This is likely to change!
	//=======================================================
	framework.widget.inputPrimitive = function(obj)
	{
		graphicWidget.apply(this);	// Inherit widget methods
		inputFunctions.apply(this);	// Add member functions

		copyVars(this, obj);
		this.el = fw.drawInput(obj);
	}

	//------------------------------------
	// Video primitive member functions
	//------------------------------------
	var inputFunctions = (function() {

		//------------------------------------
		//------------------------------------
		function focus()
		{
			fw.inputFocus(this.el, this.inpType);
		}

		//------------------------------------
		//------------------------------------
		function blur()
		{
			fw.blur(this.el, this.inpType);
		}

		//------------------------------------
		//------------------------------------
		function hasFocus()
		{
			return fw.checkInpFocus(this.el, this.inpType);
		}

		//------------------------------------
		// Get or set the text inside the input box
		//------------------------------------
		function value(val)
		{
			return fw.inputVal(this.el, val, this.inpType);
		}

		//=======================================================
		//
		//=======================================================
		function bgColor(color)
		{
			return fw.inputBgColor(this.el, color, this.inpType);
		}

		//------------------------------------
		//------------------------------------
		function bindSelf(event, callback, action)
		{
			var that = this;
			fw.eventBind(event, that.el, function(key) { callback.call(action, key) });
		}

		//------------------------------------
		//------------------------------------
		function readOnly()
		{
			return fw.inputReadOnly(this.el,  this.inpType);
		}

		//------------------------------------
		//------------------------------------
		function allowInput()
		{
			return fw.inputReadWrite(this.el, this.inpType);
		}

		//------------------------------------
		//------------------------------------
		return function() {
			this.focus = focus;
			this.blur = blur;
			this.hasFocus = hasFocus;
			this.value = value;
			this.bgColor = bgColor;
			this.bindSelf = bindSelf;
			this.readOnly = readOnly;
			this.allowInput = allowInput;

			return this;
		}
	})();

	//=======================================================
	// Group
	//
	// This is a widget with no functionality except the default
	// It serves to group widgets together for logical reasons
	//
	// Eventually, it might be useful to create a new <div> for groups.
	// This might speed up DOM access by allowing position and show/hide
	// operations to work with a single DOM access.
	//=======================================================
	framework.widget.group = function()
	{
	}

})();
