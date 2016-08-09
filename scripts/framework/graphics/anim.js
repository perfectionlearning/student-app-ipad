//===========================================================================================
// Low-level animation support
//
//===========================================================================================
(function() {

	//=======================================================
	// Fade In
	//=======================================================
	framework.prototype.fadeIn = function(el, rate, fadeTo, action, immediate)
	{
		if (!fw.verifyObject(el, 'Fading'))
			return;

		if (action === "delete")
			action = function() {fw.remove(el);}	// @CHECKME/dg: Can this leak?

		// This is an ugly mess.  jQuery is funny.  An element must be hidden or faded before it
		// can be faded in.  Using fadeIn after manually setting alpha will NOT work.
		// This means we have to adopt the messy, arbitrary split that jQuery uses.
		// Fading between alpha 0 and 1 using fadeIn and fadeOut.
		// If we want to use any other value, we use fadeTo.
		// We can't use fadeTo all the time because it doesn't set display:none afterwards.
		// Hidden items using fadeTo will block clicks on underlying items.
		if (!defined(fadeTo) || fadeTo == 1)
			el.fadeIn({
				duration: rate,
				complete: action,
				queue: !immediate
			});
		else
			el.fadeTo(rate, fadeTo, 'swing', action);
	};

	//=======================================================
	// Fade Out (equal but opposite to fade in)
	//=======================================================
	framework.prototype.fadeOut = function(el, rate, fadeTo, action, immediate)
	{
		if (!fadeTo)
		{
			if (action === "delete")
				action = function() {fw.remove(el);}	// @CHECKME/dg: Can this leak?

			if (fw.verifyObject(el, 'Fading'))
				el.fadeOut({
					duration: rate,
					complete: action,
					queue: !immediate
				});
		}
		else
			fw.fadeIn(el, rate, fadeTo, action, immediate);
	};

	//=======================================================
	// Stop fading
	//=======================================================
	framework.prototype.stopFade = function(el, dontFinish)
	{
		if (fw.verifyObject(el, 'Disabling fade for'))
		{
			if (dontFinish)
				el.stop(true);
			else
				el.stop(true, true);
		}
	};

	//=======================================================
	// Start an animated transformation
	// @FIXME/dg: This is ill-advised.  Tie into the animation system!
	//=======================================================
	framework.prototype.transform = function(el, obj)
	{
		var easing = obj.easing || 'swing';

		if (fw.verifyObject(el, 'Transforming'))
			el.animate(obj, {
				duration: obj.rate,
				easing: easing,
				done: obj.done,
				fail: obj.done,		// This is an attempt to deal with failed animations, a rare problem occuring
				progress: obj.action,
				param: obj.params,
				queue: obj.queue
			});
	}

	//=======================================================
	// We need to break scaling out of "transform" for DOM reasons.
	//=======================================================
	framework.prototype.scaleTo = function(el, size, options)
	{
		if (fw.verifyObject(el, 'Scaling'))
		{
			if (!defined(size))
				size = 1;

			var matrix = el.css('transform');
			var match = matrix && matrix.match(/matrix\(([\d\.]+),/);
			var curScale = (match && match[1]) || 1;

			fw.transform(el, $.extend({
				action: doScale,
				param: {start: curScale*1, end: size}
			}, options));
		}
	}

	//=======================================================
	// Special scaling routine, using easing
	//=======================================================
	function doScale(anim, progress, remaining)
	{
		var ease = anim.opts.easing;
		var curEase = $.easing[ease](progress, progress, 0, 1, anim.duration);

		var start =  anim.props.param.start;
		var end = anim.props.param.end;
		var scale = (end - start) * curEase + start;

		var str = "scale(" + scale + ")";
		$(this).css({transform: str});
	}

	//=======================================================
	// Start a frame-based animation
	// @FIXME/dg: This is a bit of a hack, but it works.
	// At the very least we could use fw.frame() instead of duplicating the code,
	// but that would be slower since we've cached the element.
	//
	// @FIXME/dg: The frame is stored globally in a closure?  I don't
	// think more than one animation can work at a time.
	//
	// @FIXME/dg: Also, consider changing to built-in browser support for animations.
	//
	// obj: {frames, rate, callback, w}
	// Rate is in frames/second
	//=======================================================
	framework.prototype.anim = function(el, obj)
	{
		if (fw.verifyObject(el, 'Animating'))
		{
			var curFrame = 0;
			var duration = 1000 / obj.rate;	// fr * sec/fr = sec

			var iv = setInterval(function() {
				var backgroundX = obj.atlasData ? -(curFrame*obj.w+obj.atlasData.x) : -(curFrame*obj.w);
				var backgroundY = obj.atlasData ? -(obj.atlasData.y) : 0;
				el.css('backgroundPosition', backgroundX + 'px ' + backgroundY + 'px');
				if (++curFrame == obj.frames)
				{
					if (!obj.loop)
					{
						clearInterval(iv);
						obj.callback && obj.callback();
					}
					else
						curFrame = 0;
				}
			}, duration);

			return iv;
		}
	}

	//=======================================================
	// Stop a frame-based animation
	//=======================================================
	framework.prototype.stopAnim = function(id)
	{
		clearInterval(id);
	}

})();
