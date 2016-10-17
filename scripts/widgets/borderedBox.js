//=============================================================================
// A box with a border around it, constructed from 8 separate images
//
//  id
//  x, y
//  w, h
//  bgColor: Background color
//  alpha: Opacity for the background (but not the border)
//  images: {t:, b:, l: r:, tl: ,tr:, bl:, br:}
//  bgExtendH, bgExtendV: (Optional) Amount to extend the background to cover up for small edges
//  useContainer: [Optional] Place the background rectangle (not the border) in a container
//  borderOutside: [Optional] If set, the borders extend outside the size of the widget, which is bad practice in general
//
//  TODO: Allow dynamic resizing
//=============================================================================
framework.widget.borderedBox = function()
{
	var that = this;

	var bg, tlBorder, trBorder, blBorder, brBorder, l, r, b, t;

	var bgExtendH = that.bgExtendH || 0;
	var bgExtendV = that.bgExtendV || 0;
	var widthL = fw.assetWidth(that.images.tl);
	var widthR = fw.assetWidth(that.images.tr);
	var heightT = fw.assetHeight(that.images.tl);
	var heightB = fw.assetHeight(that.images.bl);

	var depth = that.depth || 0;
	var borderDepth = that.borderDepth || depth;	// Was depth + 2

	//=======================================================
	//=======================================================
    function createBG()
    {
		// Choose the background widget type
		var type = that.useContainer ? 'container' : 'rect';

		var marginTop = 0;//-bgExtendV;
		var marginBottom = 0;//bgExtendV;
		var marginLeft = 0;//-bgExtendH;
		var marginRight = 0;//bgExtendH;
		//
		// if (!that.borderOutside)
		// {
		// 	marginTop += heightT;
		// 	marginBottom -= heightB;
		// 	marginLeft += widthL;
		// 	marginRight -= widthR;
		// }

		// Parameters are the same for rects and containers
		bg = that.add(type, {
			color: that.bgColor,
			alpha: that.alpha,
			depth: depth
		}, {
			top: that.id + ' top ' + marginTop,
			bottom: that.id + ' bottom ' + marginBottom,
			left: that.id + ' left ' + marginLeft,
			right: that.id + ' right ' + marginRight
		});
	}

	//=======================================================
	// @FIXME/dg: Convert to border8!
	//=======================================================
    function createCorners()
	{
		var wid = bg;

		// Add the top left shadow
		tlBorder = that.add('image', {image: that.images.tl, depth: borderDepth},
        {
            wid: wid,
            my: 'bottom right',
            at: 'top left',
			ofs: bgExtendH + ' ' + bgExtendV
        });

		// Add the top right shadow
		trBorder = that.add('image', {image: that.images.tr, depth: borderDepth},
        {
            wid: wid,
            my: 'bottom left',
            at: 'top right',
			ofs: -bgExtendH + ' ' + bgExtendV
        });

		// Add the bottom left shadow
		blBorder = that.add('image', {image: that.images.bl, depth: borderDepth},
        {
            wid: wid,
            my: 'top right',
            at: 'bottom left',
			ofs: bgExtendH + ' ' + -bgExtendV
        });

		// Add the bottom right shadow
		brBorder = that.add('image', {image: that.images.br, depth: borderDepth},
        {
            wid: wid,
            my: 'top left',
            at: 'bottom right',
			ofs: -bgExtendH + ' ' + -bgExtendV
        });
	}

	//=======================================================
	// @FIXME/dg: Convert to border8!
	//=======================================================
    function createEdges()
	{
		//----------------------
		// Add the top shadow
		t = that.add('image', {
			w: that.w - widthL - widthR,
            repeat: 'x',
            image: that.images.t,
			depth: borderDepth
		},
        {
			top: tlBorder.id + ' top',
			left: tlBorder.id + ' right',
			right: trBorder.id + ' left'
        });

		//----------------------
		// Add the bottom shadow
		b = that.add('image', {
			w: that.w - widthL - widthR,
            repeat: 'x',
            image: that.images.b,
			depth: borderDepth
		},
        {
			bottom: blBorder.id + ' bottom',
			left: blBorder.id + ' right',
			right: brBorder.id + ' left'
        });

		//----------------------
		// Add the left shadow
		l = that.add('image', {
			h: that.h - heightT - heightB,
            repeat: 'y',
            image: that.images.l,
			depth: borderDepth
		},
        {
			top: tlBorder.id + ' bottom',
			left: tlBorder.id + ' left',
			bottom: blBorder.id + ' top'
        });

		//----------------------
		// Add the right shadow
		r = that.add('image', {
			h: that.h - heightT - heightB,
            repeat: 'y',
            image: that.images.r,
			depth: borderDepth
		},
        {
			top: trBorder.id + ' bottom',
			right: trBorder.id + ' right',
			bottom: brBorder.id + ' top'
        });
    }

	//=======================================================
	// Resize the widget.  Call whenever the width or height changes.
	//
	// @FIXME/dg: This is test code right now!
	//=======================================================
	this.resize = function(h, rate)
	{
		if (!that.useContainer)
			return;

		that.h = h;

		fw.transform(bg.el, {
			// Effect
			height: h,

			// Params
			rate: rate,
			easing: 'smallBounce',
			action: updateBorders
		});
	}

	//=======================================================
	// @FIXME/dg: temp
	//=======================================================
	function updateBorders(anim, progress, remaining)
	{
		// Affected pieces can just redock themselves
		blBorder.redock();
		brBorder.redock();
		l.redock();
		r.redock();
		b.redock();

		// This would be a bit more generic if we redocked all 8 pieces.
		// Less efficient, but more generic.
	}

	//=======================================================
	//=======================================================
	this.getContainer = function()
	{
		if (that.useContainer)
			return bg;
		else
			return null;
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		createBG();
		//createCorners();
		//createEdges();
	}
};
