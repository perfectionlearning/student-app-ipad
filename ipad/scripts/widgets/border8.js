//=============================================================================
// 8 piece resizable border
//
//  id
//  images: {t:, b:, l: r:, tl: ,tr:, bl:, br:}
//  target: A widget to dock to
//
// Style: (border8)
//=============================================================================
framework.widget.border8 = function()
{
	var that = this;

	var tlBorder, trBorder, blBorder, brBorder, l, r, b, t;

	createCorners();
	createEdges();

	//=======================================================
	//=======================================================
    function createCorners()
	{
		var wid = that.target;

		// Add the top left shadow
		tlBorder = that.add('image', {image: that.images.tl},
        {
            wid: wid,
            my: 'bottom right',
            at: 'top left'
        });

		// Add the top right shadow
		trBorder = that.add('image', {image: that.images.tr},
        {
            wid: wid,
            my: 'bottom left',
            at: 'top right',
        });

		// Add the bottom left shadow
		blBorder = that.add('image', {image: that.images.bl},
        {
            wid: wid,
            my: 'top right',
            at: 'bottom left',
        });

		// Add the bottom right shadow
		brBorder = that.add('image', {image: that.images.br},
        {
            wid: wid,
            my: 'top left',
            at: 'bottom right',
        });
	}

	//=======================================================
	//=======================================================
    function createEdges()
	{
		//----------------------
		// Add the top shadow
		t = that.add('image', {
            repeat: 'x',
            image: that.images.t,
		},
        {
			top: tlBorder.id + ' top',
			left: tlBorder.id + ' right',
			right: trBorder.id + ' left'
        });

		//----------------------
		// Add the bottom shadow
		b = that.add('image', {
            repeat: 'x',
            image: that.images.b,
		},
        {
			bottom: blBorder.id + ' bottom',
			left: blBorder.id + ' right',
			right: brBorder.id + ' left'
        });

		//----------------------
		// Add the left shadow
		l = that.add('image', {
            repeat: 'y',
            image: that.images.l,
		},
        {
			top: tlBorder.id + ' bottom',
			left: tlBorder.id + ' left',
			bottom: blBorder.id + ' top'
        });

		//----------------------
		// Add the right shadow
		r = that.add('image', {
            repeat: 'y',
            image: that.images.r,
		},
        {
			top: trBorder.id + ' bottom',
			right: trBorder.id + ' right',
			bottom: brBorder.id + ' top'
        });
    }


};
