//======================================================
// Maintains a bank of icons with hover states and destinations
//
// Arguments:
//	id
//	x, y
//  image: Card image
//  callback: function to call when the card is clicked or touched
//
// Style: (wbCard)
//  bottomImage: Resource ID for the bottom image
//	titleColor: color of card title text
//	titleFont: font used for card title text
//	textColor: card text color
//	textFont: font used by card text
//  textWidth: width in pixels for title; to cause wrapping
//	titleVmargin: Space between the card text and the top of the text box
//	titleHmargin: Space between the card text and the top of the text box
//	textVmargin: Space between the card title and text
//	textVmargin: Space between the card title and text
//  textWidth: width in pixels of text; to cause wrapping
//  cardHeight: The height of the cards that get loaded dynamically
//======================================================
framework.widget.wbCard = function()
{
	var that = this;
	var style = app.style.wbCard;

	var top, bottom, title, body, headlineText, headlineRows = [];

	createBox();
	createText();

	// Add a click handler to the entire widget
	that.applyAction('click', {click: that.callback});

	//=======================================================
	// create background for card.
	// added url and w properties to allow the specification
	// of a dynamic image.
	//=======================================================
	function createBox()
	{
		// Temporary card
		that.add('image', {
			x: that.x,
			y: that.y,
			image: 'STBlankCard',
			depth: 1,
			cursor: 'pointer'
		});

		// Card 1
		top = that.add('image', {
			x: that.x,
			y: that.y,
			url: that.url,
			w: fw.assetWidth(style.bottomImage),
			h: style.cardHeight,
			type: that.id + 'grp',
			funcTest: 'card_top',
			depth: 1,
			hidden: true,
			cursor: 'pointer'
		});

		bottom = that.add('image', {
			image: style.bottomImage,
			type: that.id + 'grp',
			hidden: true,
			funcTest: 'card_bottom',
			cursor: 'pointer'},
        {
            wid: top,
            my: 'top left',
            at: 'bottom left',
            ofs: '0 0'
        });
	}

	//=======================================================
	//
	//=======================================================
	function createText()
	{
        title = that.add('text', {
            text: '&nbsp;',
            font:  style.titleFont,
            color:  style.titleColor,
			type: that.id + 'grp',
			cursor: 'pointer',
			hidden: true,
			w: bottom.width() - style.textRmarginAdjust
        },
        {
            wid: top,
            my: 'top left',
            at: 'bottom left',
            ofs: style.titleHmargin + ' ' + style.titleVmargin
        });
	}

	//=======================================================
	//=======================================================
	this.setText = function(titleText, headlines)
	{
		title.setText(titleText);
//		adjustBodyPosition();
//		body.setText(headlines);
		// Separates headlines into individual text widgets.
		addHeadlines(headlines);

		adjustCardBackdrop();
	}

	//=======================================================
	//=======================================================
	function addHeadlines(data) {
		$.each(data, function(idx, headline) {
			var topAnchor = idx == 0 ? title : headlineText;
			var hSpace = headline.charCodeAt(0) == 8226 ? style.textVmargin : style.textVmargin*2;

			//-----------------
			// Add headlines
			headlineText = that.add('text', {
				text:headline,
				color: style.textColor,
				type: that.id + 'grp',
				cursor: 'pointer',
				font: style.textFont
			},
			{
				top: topAnchor.id + ' bottom ' + hSpace,
				left: title.id + ' left ',
				right: bottom.id + ' right -' + style.textRmarginAdjust
			});
			headlineRows.push(headlineText);
		});

	};

	//=======================================================
	// Added so that if title text wraps, body will be moved down.
	//=======================================================
    function adjustBodyPosition()
    {
		fw.dock(body, {
			left: title.id + ' left',
			top: title.id + ' bottom ' + style.textHmargin
		});
    }

	//=======================================================
	//=======================================================
    function adjustCardBackdrop()
    {
		if (headlineRows && headlineRows.length)
			var lastLine = headlineRows[headlineRows.length - 1];
		else
			lastLine = title;

		fw.dock(bottom, {
			left: top.id + ' left',
			bottom: lastLine.id + ' bottom ' + style.bottomMargin
		});

    }

	//=======================================================
	// Assumes the text has already been set
	//=======================================================
	this.height = function()
	{
		var btm = bottom.y + bottom.height();
		return btm - this.y;
	}

	//=======================================================
	//=======================================================
	this.width = function()
	{
		return fw.assetWidth(style.bottomImage);
	}

}