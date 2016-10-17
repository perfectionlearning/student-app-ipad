//===============================================================================
// Arguments:
//  id
//  x, y, w, h
//	dataList: List of files to load
//  hidden: Optional -- not implemented, but should be
//  depth: Optional -- not implemented, but should be
//
// Style: (whiteboard)
//	bgColor: Background color
//	borderWidth: width of the border around the video
//	borderHeight: height of the border around the video
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
//===============================================================================
framework.widget.sectionText = function()
{
	var that = this;
	var style = app.style.sectionText;

//	var sectionHead = "xx.xx Section Title that wraps ... ... because it's really, really long";

	var bg, divider;
	var card1, card2;
	var title, bodyText, stdWid, lastDef;
	var bulletChar = 8226;

	//=======================================================
	// Construct the major widgets
	//=======================================================
	function createST()
	{
//		createContainer();
		createBorder();
		createDivider();
		createText();
	}

	//=======================================================
	// Construct the widgets that require content to have been loaded.
	//=======================================================
	function createContent()
	{
		createCards();		// We need the data to be loaded for both whiteboards
		loadSectionTextData();
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
		// Add the top background
		bg = that.add('rect', {
			id: 'sectionBg',
			color: style.bgColor,
			x: that.x,
			y: that.y,
			w: that.w,
			h: that.h	// Includes the title box
		});
	}

	//=======================================================
	//
	//=======================================================
	function createText()
	{
		//-----------------
		// Add the title
		title = that.add('text', {
			text: that.title,
			color: style.titleColor,
			font: style.titleFont
		},
		{
			top: divider.id + ' top ' + style.titleVmargin,
			left: divider.id + ' right ' + style.titleHmargin,
			right: that.id + ' right -' + (style.textRmarginAdjust + style.borderRMargin)
		});

		//-----------------
		// Add the standards list, if defined
		if (that.standards)
		{
			stdWid = that.add('standards', {
				data: that.standards,
				click: that.clickStandard
			}, {
				top: title.id + ' bottom ' + style.textVmargin,
				left: title.id + ' left'
			});
		}

		//-----------------
		// The text should dock to: 1) the bottom definition, if any, 2) The standards, if any, 3) The title
		var dockTarget = getTextDock();
		bodyText = that.add('text', {
			text: '&nbsp;',
			color: style.textColor,
			font: style.textFont,
			funcTest: 'narration'
		},
		{
			top: dockTarget + ' bottom ' + style.textVmargin,
			left: title.id + ' left ',
			right: that.id + ' right -' + (style.textRmarginAdjust + style.borderRMargin)
		});
	}

	//=======================================================
	// The text should dock to:
	//    1) the bottom definition, if any,
	//    2) The standards, if any,
	//    3) The title
	//=======================================================
	function getTextDock()
	{
		if (lastDef)
			return lastDef.id;

		if (stdWid)
			return stdWid.id;

		return title.id;
	}

	//=======================================================
	// @FIXME/dg: There must be a better way than passing in children objects!
	// Consider moving the card logic outside of the widget.  That may or may not
	// be the correct thing to do.
	//=======================================================
	function createCards()
	{
		var path = that.cards[0] && app.getImagePath(that.cards[0]);

		if (that.cards[0])
			var card1Url = path + that.cards[0] + style.imageExtension;
		else
			var card1Url = "NO_CHILDREN_IN_THIS_SECTION.png";	// In case there are no cards.  This is a silly way to create an error notification.

		// Card 1
		card1 = that.add('wbCard', { url: card1Url, callback: function() { that.clickCard(0); } },
		{
			wid: that,
			my: 'top left',
			at: 'top left',
			ofs: style.cardOffsetH + ' ' + style.cardOffsetV
		});

		if (that.cards.length > 1 && that.cards[1].type != 'sum')
		{
			var type = app.getObjType(that.cards[1]);

			// Card 2
			var card2Url = path + that.cards[1] + style.imageExtension;
			card2 = that.add('wbCard', {url: card2Url, callback: function() { that.clickCard(1); } });
		}
	}

	//=======================================================
	//
	//=======================================================
	function createDivider()
	{
		// Make a placeholder against which to dock the divider.
		// This uses the blank card image, so that we can get the width of a card without having to actually
		// create a superfluous one.
		var placeCard = that.add('image', {
            image: 'STBlankCard',
			hidden:true
		},
		{
			wid: that,
			my: 'top left',
			at: 'top left',
			ofs: style.cardOffsetH + ' ' + style.cardOffsetV
		});

		// Create the top
		var top = that.add('image', {image: 'STVertLineT'},
        {
			top: that.id + ' top ' + style.borderTMargin,
			left: placeCard.id + ' right ' + style.dividerMargin
        });

		// Create the bottom
		var bottom = that.add('image', {image: 'STVertLineB'},
        {
			bottom: that.id + ' bottom -' + style.borderBMargin,
			left: placeCard.id + ' right '+ style.dividerMargin
        });

		// Create the middle
		var h = bottom.y - top.y - top.height();
		var dividerMiddle = that.add('image', {
			h: h,
            repeat: 'y',
            image: 'STVertLineM'
		},
        {
            wid: top,
            my: 'top left',
            at: 'bottom left'
        });

		divider = top;
	}

	//=======================================================
	// Collect all headline text
	//=======================================================
	function collectCardText(data)
	{
		var out = [];

		$.each(data, function(idx, val) {
			$.each(val, function(idx2, val2) {
				out.push(val2);
			});
		});

		return out.join('<br/>');
	}

	//=======================================================
	// Collect all navigation text
	//=======================================================
	function collectText(data)
	{
		var out = '';

		$.each(data, function(idx, val) {
			$.each(val, function(idx2, val2) {
				out += '<p>' + val2 + '</p>';
			});
		});

		return out;
	}


	//=======================================================
	// Load the section text data file
	// This file is loaded outside of the widget now
	//=======================================================
	function loadSectionTextData()
	{
		/*
        var model = app.sectionTextModel;
		if (!model) return;
		model.clear();	// Wipe everything out

		model.url = app.getDataPath(app.curObject) + app.curObject.dataFile;
		model.fetch({
			success: function(model) {successLoadSectionData(model);},
			error: function() { failureLoadSectionData(); }
		});
		*/

		// @FIXME/dg: Illegal use of globals!
		successLoadSectionData(app.sectionTextModel);
	}

	//=======================================================
	//=======================================================
    function successLoadSectionData(model)
    {
		var stData = getTextFromJSON(model);
		if (stData)
			applySectionText(stData);
	}

	//=======================================================
	//=======================================================
    function failureLoadSectionData()
	{
		console.log('failureLoadSectionData');
	}

	//=======================================================
	//=======================================================
    function getTextFromJSON(model)
	{
		var cards = model.get('cards');

		var cardTitles = [];
		var cardText = [[], []];
		if (cards) {
			$.each(cards, function(idx, obj) {
				var lines = obj.lines;
				for (var i = 0, j = lines.length; i < j; i++) {
					var type = lines[i] && lines[i].type || '';
					var text = lines[i] && lines[i].text || '';
					if (type == 'title') cardTitles[idx] = text;
	                else {
						if (type == 'bullet') text = String.fromCharCode(bulletChar) + ' ' + text;
						cardText[idx].push(text);
					}
				}
			});

			var cardData = {titles: cardTitles, text: cardText};

			var narration = '<p>' + model.get('secText').join('</p><p>') + '</p>';

			// @FIXME/dg: Convert to static object to prevent allocation
			return {
				cardData: cardData,
				definitions: model.get('definitions'),
				narration: narration,
				objNames: model.get('objNames')
			};
		}
	}


	//=======================================================
	// Place the text retrieved from JSON on the cards and
	// in the narration section.
	//=======================================================
    function applySectionText(data)
	{
		var cardTitles = data.cardData.titles;
		var cardText = data.cardData.text;

		if (card1) {
			card1.setText(cardTitles[0], cardText[0]);
			card1.show();

			if (card2) {
				card2 && card2.setText(cardTitles[1], cardText[1]);

				fw.dock(card2, {
					wid: card1,
					my: 'top left',
					at: 'bottom left',
					ofs: '0 ' + style.interCardMargin
				});
				card2.show();
			}
		}

		addTerms(data.definitions);
		that.setText(data.narration);

		// dock body text to last definition
		fw.dock(bodyText, {
			wid: getTextDock(),
			my: 'top left',
			at: 'bottom left',
			ofs: '0 ' + style.textVmargin
		});
	}

	//=======================================================
	// Add card text
	//=======================================================
	function addCardText(cardData) {
		$.each(cardData, function(idx, line) {
			switch (line.type) {
				case 'headline':
					break;
				case 'subheadline':
					break;
				case 'bullet':
					break;
				default:

			}
		})
	}

	//=======================================================
	// Add any terms and definitions after the section title
	//=======================================================
	function addTerms(data)
	{
		$.each(data, function(idx, item) {
			var topAnchor = getTextDock();	// This chooses: the bottom definition, the standard, or the title, in that order
			var term = item.term;
			var def = '<b><i>' + term + ':</i></b> ' + item.def;	// @FIXME/dg: Wrap HTML isn't a good idea

			//-----------------
			// Add definitions
			lastDef = that.add('text', {
				text:def,
				color: style.defColor,
				funcTest: 'term',
				font: style.defFont
			},
			{
				top: topAnchor + ' bottom ' + style.defVmargin,
				left: title.id + ' left ',
				right: that.id + ' right -' + (style.textRmarginAdjust + style.borderRMargin)
			});
		});
	}


	//=======================================================
	//=======================================================
	this.setText = function(text)
	{
		bodyText.setText(text);
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


	//=======================================================
	// Called after section text data have been loaded
	//=======================================================
	this.afterDataLoaded = function()
	{
		createContent();
	}

};
