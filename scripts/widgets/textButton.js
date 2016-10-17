//======================================================
// Clickable text, with an optional icon, tooltip, and hover states
//
// Arguments:
//  id
//  x, y
//
//  text, font, color, hoverColor
//  click: callback function when clicked
//  tip: Optional {text:, pos: dockString, ofs:[x,y], delay:ms} -- dockString can be: "T", "B", "L", "R", "TL", "TR", "BL", "BR"
//  hidden: Optional
//  owner: Optional.  Context(this) for click functions.
//  depth: Optional
//  alpha: Optional -- If defined, buttons are faded out unless hovered over
//  fadeInRate: Optional -- Required if alpha is defined -- Fade speed
//  fadeOutRate: Optional -- Required if alpha is defined -- Fade speed
//======================================================
framework.widget.textButton = function()
{
	var that = this;
	var curFrame = fw.frameNumber(that.image, that.frame || 0);
	var enabled = true;
	var hidden = that.hidden || false;
	var fadeMode = defined(that.alpha);

	var btn, tip;
	createButton();
	attachEvents();

	//=======================================================
	//
	//=======================================================
	function createButton()
	{
		btn = that.add('text', {
			text: that.text,
			font: that.font,
			color: that.color,
			cursor: 'pointer',
			hidden: that.hidden,
			alpha: that.alpha || 1,
			depth: that.depth
		}, fw.dockTo(that));
	}

	//=======================================================
	//
	//=======================================================
	function attachEvents()
	{
		// Bind click behavior
		btn.applyAction('click', {click: clicked});

		// Bind hover behavior
		btn.applyAction('hover', {
			inAction: hover,
			outAction: stopHover
		});

		// Attach the tooltip behavior if one was requested
		if (defined(that.tip) && that.tip.text)
		{
			tip = btn.applyAction('tooltip', {
				text: that.tip.text,
				delay: that.tip.delay || 0,
				dock: {
					wid: btn,
					pos: that.tip.pos,
					ofs: that.tip.ofs
				}
			});
		}
	}

	//=======================================================
	// This is a bit of a hack.  There is code that assumes the
	// context ('this') in the click routine will be the button widget.
	// Also pass the button widget on to the click routine.  That is
	// cleaner than using 'this'.
	//=======================================================
	function clicked()
	{
		if (enabled)
			that.click.call(that, that);
	}

	//=======================================================
	//=======================================================
	function hover()
	{
		if (enabled)
		{
			var clr = that.hoverColor || 'blue';
			btn.color(clr);

			if (fadeMode && !hidden)
				btn.stopFade(true).fadeIn(that.fadeInRate, 0.99);	// A bit hacky -- We can't use 1 for the fade-to rate
		}
	}

	//=======================================================
	//=======================================================
	function stopHover()
	{
		if (enabled)		// This could get us into trouble if the button is disabled while in a hover state without a disabled frame
			btn.color(that.color);

		if (fadeMode && !hidden)
			btn.stopFade(true).fadeOut(that.fadeOutRate, that.alpha);
	}

	//=======================================================
	//=======================================================
	this.disable = function(frame)
	{
		enabled = false;
		btn.cursor('normal');

		tip && tip.disable();
	}

	//=======================================================
	//=======================================================
	this.enable = function()
	{
		enabled = true;
		btn.cursor('action');

		tip && tip.enable();
	}

	//=======================================================
	//=======================================================
	this.hideSelf = function()
	{
		hidden = true;
	}

	//=======================================================
	//=======================================================
	this.showSelf = function()
	{
		hidden = false;
		if (fadeMode)
			btn.stopFade(true).setAlpha(that.alpha);
	}

	//=======================================================
	// Only fade to the desired opacity
	//=======================================================
	this.fadeInSelf = function(rate, fadeTo, action)
	{
		hidden = false;

		if (fadeMode)
			btn.stopFade(true).fadeIn(rate, that.alpha, action);
	}

	//=======================================================
	//=======================================================
	this.width = function()
	{
		return btn.width();		// This is cached in the assetSize, but that doesn't account for scaling
	}

	//=======================================================
	//=======================================================
	this.height = function()
	{
		return btn.height();	// This is cached in the assetSize, but that doesn't account for scaling
	}
};
