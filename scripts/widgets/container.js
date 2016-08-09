//=============================================================================
// Simple container -- Provides masking and relative coordinates
//
// @FIXME/dg: This has most of the same features as a primitive!  It should be
// moved into the primitive module to prevent duplication of all the primitive
// widget handlers.
// Additionally, many of the primitive functions aren't supported here. They would
// be automatically if this were in primitives.
//
//  id
//  x, y, w, h
//  color: [Optional]
//  alpha: [Optional]
//  depth: [Optional]
//  borderColor: [Optional]
//  borderWidth: [Optional]
//
//=============================================================================
framework.widget.container = function()
{
	var that = this;

	var borderSize = that.borderWidth || 0;

    //=======================================================
	// View -- Child area that masks content
    //=======================================================
    var bv = Backbone.View.extend();
    var view = app.createView(that.container, bv, that.id);
	app.viewSize(view, that.x, that.y, that.w - borderSize*2, that.h - borderSize*2);

	this.container = view.el;
	this.el = view.$el;
	fw.registerObject(that.id);

	if (defined(that.color))
		fw.bgColor(that.el, that.color);

	if (defined(that.alpha))
		fw.alpha(that.el, that.alpha);

	if (defined(that.depth))
		fw.setDepth(that.el, that.depth);

	if (defined(that.borderColor))
		fw.borderColor(that.el, that.borderColor);

	if (defined(that.borderWidth))
		fw.borderSize(that.el, that.borderWidth);

	//=======================================================
	//=======================================================
	this.bindSelf = function(event, callback, action) {
		var that = this;
		fw.eventBind(event, that.el, function() { callback.call(action, that) });
	}

	//=======================================================
	//=======================================================
	this.width = function(w)
	{
		if (defined(w))
		{
			that.w = w;
			app.viewSize(view, that.x, that.y, that.w - borderSize*2, that.h - borderSize*2);
		}
		else
			return fw.getWidth(that.el);	// Slower, but we can't use the cached value if an animation occurs
	}

	//=======================================================
	//=======================================================
	this.height = function(h)
	{
		if (defined(h))
		{
			that.h = h;
			app.viewSize(view, that.x, that.y, that.w - borderSize*2, that.h - borderSize*2);
		}
		else
			return fw.getHeight(that.el);	// Slower, but we can't use the cached value if an animation occurs
	}

	//=======================================================
	//=======================================================
	this.fadeInSelf = function(rate, fadeTo, action, immediate)
	{
		fw.fadeIn(this.el, rate, fadeTo, action, immediate);
	}

	//=======================================================
	//=======================================================
	this.fadeOutSelf = function(rate, fadeTo, action, immediate)
	{
		fw.fadeOut(this.el, rate, fadeTo, action, immediate);
	}

	//=======================================================
	//=======================================================
	this.terminateSelf = function()
	{
		fw.stopFade(that.el);	// This really shouldn't be here.  If an animation is occurring, it must be stopped before termination

		fw.unregisterObject(that.id);
		view.remove();
		view.unbind();
	}
}
