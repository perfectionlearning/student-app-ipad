//======================================================
// Arguments:
//  id
//  x
//  y
//  image
//  click: callback function when clicked
//  frame: base frame #.  Hover frame is assumed to be one greater.
//  tip: Optional {text:, pos: dockString, ofs:[x,y], delay:ms} -- dockString can be: "T", "B", "L", "R", "TL", "TR", "BL", "BR"
//  hidden: Optional
//  owner: Optional.  Context(this) for click functions.
//  depth: Optional
//  alpha: Optional -- If defined, buttons are faded out unless hovered over
//  fadeInRate: Optional -- Required if alpha is defined -- Fade speed
//  fadeOutRate: Optional -- Required if alpha is defined -- Fade speed
//======================================================
framework.widget.button = function()
{
	var that = this;

	var curFrame = fw.frameNumber(that.image, that.frame || 0);
	var enabled = true;
	var hidden = that.hidden || false;
	var fadeMode = defined(that.alpha);

	// Get asset width and height, but allow for it to be a URL and the w and h to be specified.
	var assetSize = getAssetSize(that);

	var btn, tip, text;
	createButton();
	addText();
	attachEvents();

	//=======================================================
	//
	//=======================================================
	function createButton()
	{
		btn = that.add('image', {
			scale: that.scale,
			image: that.image,
			frame: curFrame,
			cursor: 'pointer',
			hidden: that.hidden,
			alpha: that.alpha || 1,
			funcTest: that.funcTest,
			depth: that.depth,
			// Allow the image to be specified as a URL, with explicit height and width.
			url: that.url,
			w: assetSize[0],
			h: assetSize[1]
		}, {
			wid: that,
			my: 'top left',
			at: 'top left'
		});
	}

	//=======================================================
	//
	//=======================================================
	function addText()
	{
		if (that.text)
		{
			text = that.add('text', {
				text: that.text,
				font: that.font,
				color: that.color,
				cursor: 'pointer',
				depth: that.depth,
				hidden: that.hidden
			}, {
				wid: btn,
				my: 'center',
				at: 'center'
			});
		}
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

		// Repeat both for the text widget
		if (text)
		{
			text.applyAction('click', {click: clicked});
			text.applyAction('hover', {
				inAction: hover,
				outAction: stopHover
			});
		}

		// Attach the tooltip behavior if one was requested
		// if (defined(that.tip) && that.tip.text)
		// {
		// 	tip = btn.applyAction('tooltip', {
		// 		text: that.tip.text,
		// 		delay: that.tip.delay || 0,
		// 		dock: {
		// 			wid: btn,
		// 			pos: that.tip.pos,
		// 			ofs: that.tip.ofs
		// 		}
		// 	});
		//
		// 	// Do the same for text
		// 	text && text.applyAction('tooltip', {
		// 		text: that.tip.text,
		// 		delay: that.tip.delay || 0,
		// 		dock: {
		// 			wid: btn,
		// 			pos: that.tip.pos,
		// 			ofs: that.tip.ofs
		// 		}
		// 	});
		//}
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
			that.click && that.click.call(that, that);
	}

	//=======================================================
	// Allow image to be specified as either image or url
	//
	// @FIXME/dg: Does this belong here? It doesn't feel quite right.
	//=======================================================
	function getAssetSize(obj)
	{
		if (obj.image)
			return fw.imageData(obj.image);
		else if (obj.url)
		{
			var w = obj.w;
			var h = obj.h;
			return [w, h, 0, 0];
		}

		return [0, 0, 0, 0];		// We need some default
	}

	//=======================================================
	//=======================================================
	function hover()
	{
		if (enabled)
		{
			btn.frame(curFrame + 1);

			if (fadeMode && !hidden)
				btn.stopFade(true).fadeIn(that.fadeInRate, 0.99);	// A bit hacky -- We can't use 1 for the fade-to rate
		}
	}

	//=======================================================
	//=======================================================
	function stopHover()
	{
		if (enabled)		// This could get us into trouble if the button is disabled while in a hover state without a disabled frame
			btn.frame(curFrame);

		if (fadeMode && !hidden)
			btn.stopFade(true).fadeOut(that.fadeOutRate, that.alpha);
	}

	//=======================================================
	//=======================================================
	this.setFrame = function(frame)
	{
		curFrame = fw.frameNumber(that.image, frame);
		btn.frame(curFrame);
	}

	//=======================================================
	//=======================================================
	this.disable = function(frame)
	{
		enabled = false;
		btn.cursor('normal');

		if (defined(frame))
			btn.frame(curFrame + frame);

		tip && tip.disable();
	}

	//=======================================================
	//=======================================================
	this.enable = function()
	{
		enabled = true;
		btn.cursor('action');

		btn.frame(curFrame);

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
		// Assumes the text (if any) is smaller than the button
		return btn.width();		// This is cached in the assetSize, but that doesn't account for scaling
	}

	//=======================================================
	//=======================================================
	this.height = function()
	{
		// Assumes the text (if any) is smaller than the button
		return btn.height();	// This is cached in the assetSize, but that doesn't account for scaling
	}
};
