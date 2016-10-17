//===============================================================================
// Arguments:
//  id
//  x, y, w, h
//	dataList: List of files to load
//  hidden: Optional -- not implemented, but should be
//  depth: Optional -- not implemented, but should be
//
// Style: (whiteboard)
//	cardOffsetH:
//	cardOffsetV:
//
//	titleHeight: box height
//	titleFont: font used for title text
//	titleColor: color of title text
//	titleHmargin: space between the left edge of the video and the title
//	titleVmargin: space between the title and the top of the title box
//	textBoxHeight: text box height
//	textFont: font used by slide text
//	textColor: slide text color
//	textHmargin: Space between the left edge of the text box and the headline
//	textVmargin: Space between the text and the top of the text box
//  textRmarginAdjust: 10
//===============================================================================
framework.widget.summary = function()
{
	var that = this;
	var style = app.style.summary;

	var bg, divider;
	var blankCards;
	var cardWidgets = [];
	var title = '';

	var assetSize = fw.imageData('SUMBlankCard');

	// Card docking data.  Added here so it is only allocated once.
	// Display vertically.
	var cardDock = [
		// Card 1
		{
			wid: that,
			my: 'top left',
			at: 'top left',
			ofs: (style.cardOffsetL) + ' ' + style.topCardOffsetV
		},

		// Card 3
		{
			wid: 'sumCard0',
			my: 'top left',
			at: 'bottom left',
			ofs: '0 ' + style.cardOffsetV
		},

		// Card 2
		{
			wid: that,
			my: 'top right',
			at: 'top right',
			ofs: (-style.cardOffsetR - 15) + ' ' + style.topCardOffsetV
		},

		// Card 4
		{
			wid: 'sumCard2',
			my: 'top left',
			at: 'bottom left',
			ofs: '0 ' + style.cardOffsetV
		}
	];

	//=======================================================
	// Construct the major widgets
	//=======================================================
	function createST()
	{
		createContainer();
		createBorder();
		createDivider();

		createCards();		// We need the data to be loaded for both whiteboards
		createText();
	}

	//=======================================================
	//=======================================================
    function createBorder()
    {
		that.add('borderedBox', app.style.backdrop, fw.dockTo(that));
    }

	//=======================================================
	//=======================================================
	function createContainer()
	{
		// Set blank card placeholders.
		blankCards = [];
		$.each(that.cards, function(idx, child) {

			blankCards.push(that.add(
				'image',
				{
					id: 'sumCard' + idx,
					image: 'SUMBlankCard',
					scale: style.cardScale
				},
				cardDock[idx]
			));
		});
	}

	//=======================================================
	//
	//=======================================================
	function createText()
	{
		// going to use the top left card for centering the title.
		var cardWid = cardWidgets[0];

		//-----------------
		// Add the title
		title = that.add('text', {
			text: that.title,
			color: style.titleColor,
			font: style.titleFont
		},
		{
			wid: cardWid,
			my: 'top center',
			at: 'top center',
			ofs: '0 -'+(.5*style.topCardOffsetV + 13)
		});
	}

	//=======================================================
	// @FIXME/dg: There must be a better way than passing in cards objects!
	// Consider moving the card logic outside of the widget.  That may or may not
	// be the correct thing to do.
	//=======================================================
	function createCards()
	{
		var path = that.cards[0] && app.getImagePath(that.cards[0]);
		var blankCard = blankCards[0];

		cardWidgets = [];

		$.each(that.cards, function(idx, card) {

			var url = app.getCardImage(card);

			// Placeholders have already been added; just overlay the actual cards on top of them.
			cardWidgets[idx] = that.add('button', {
				url: url,
				idx: idx,
				click: that.clickCard,
				w: assetSize[0],
				h: assetSize[1],
				scale: style.cardScale
			},{
				wid: blankCards[idx],
				my: 'top left',
				at: 'top left',
			});
		});
	}

	//=======================================================
	//
	//=======================================================
	function createDivider()
	{
		divider = that.add('vertDivider', {
			assets: {
				t: 'STVertLineT',
				m: 'STVertLineM',
				b: 'STVertLineB'
			}
		},{
			top: that.id + ' top ' + style.dividerOffsetV,
			bottom: that.id + ' bottom -' + style.dividerOffsetV,
			left: that.id + ' center ' + style.dividerOffsetH
		});
	}


//===============================================================================
// Standard widget API
//===============================================================================

	//=======================================================
	// Called after the widget has been docked
	//=======================================================
	this.docked = function()
	{
		createST();
	}

};
