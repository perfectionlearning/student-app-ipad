//=============================================================================
// A block of text, consisting of a title and several (optionally) indented
// lines of text.
//
// This knows too much about navigation internal data structures!
//
//  id
//  x, y
//  hidden (optional)
//  depth (optional)
//
// chapter, unit, scheme
// data: Unit definition
//
//  titleClick: callback for click
//
//  textClick: callback for click
//
// Style (unitToc)
//  unitFont:
//  unitTextColor:
//  unitTextGap: Space between unit title and text
//  sectionFont:
//  sectionTextGap: Space between section entries
//  sectionBGColor:
//  sectionTextColor:
//  sectionIndent: Horizontal space (indent) between unit name and section names
//
//=============================================================================
framework.widget.unitToc = function()
{
	var that = this;
	var style = app.style.unitToc;

	var titleWidget;
	var textWidgets = [];

	createTitle();
	createText();

	//=======================================================
	// Draw the title text
	//=======================================================
	function createTitle()
	{
		var prefix = (that.unit+1) + '. ';

		// Determine whether the title should be clickable
		if (canClickTitle())
		{
			titleWidget = that.add('textButton', {
				data: 0,					// Weird! Masks multiple assumptions.
				text: prefix + that.data.n,
				font: style.unitFont,
				color: style.unitTextColor,
				hoverColor: style.hoverColor,
				cursor: 'pointer',
				click: clickHandler,
				hidden: that.hidden,
				depth: that.depth
			}, {
				top: that.id + ' top',
				left: that.id + ' left',
				right: that.id + ' right'
			});
		}
		else		// Non-clickable version
		{
			titleWidget = that.add('text', {
				text: prefix + that.data.n,
				font: style.unitFont,
				color: style.unitTextColor,
				hidden: that.hidden,
				depth: that.depth
			}, {
				top: that.id + ' top',
				left: that.id + ' left',
				right: that.id + ' right'
			});
		}
	}

	//=======================================================
	//
	//=======================================================
	function createText()
	{
		var lastWid = titleWidget;
		var vGap = style.unitTextGap;
		var tWid;

		// Starting topic number
		var baseNum = app.getLinearTopic(that.chapter, that.unit, 0, that.scheme);
		baseNum = app.getTranslatedTopic(that.scheme, that.chapter, baseNum);

		var visibleIdx = 1;		// Human readable, not machine readable
		$.each(that.data.ch, function(idx, val) {

			// Skip intros
			if (val.t === 'unitIntro')
				return true;

			var prefix = (baseNum + visibleIdx) + ': ';
			visibleIdx++;

			// Draw a single entry
			tWid = that.add('textButton', {
				data: idx,
				text: prefix + val.n,
				font: style.sectionFont,
				cursor: 'pointer',
				color: style.sectionTextColor,
				hoverColor: style.hoverColor,
				click: clickHandler,
				hidden: that.hidden,
				depth: that.depth
			}, {
				top: lastWid.id + ' bottom ' + vGap,
				left: that.id + ' left ' + style.sectionIndent
				// Set right to allow word wrapping (but make the whole line selectable)
			});

			// Update the widget's overall width if it has just been expanded
			var w = tWid.width + vGap;
			if (w > that.w)
				that.w = w;

			lastWid = tWid;
			vGap = style.sectionTextGap;

			textWidgets.push(tWid);
		});

		// Update the widget's height since we conveniently have all the info right now
		that.h = tWid.y - that.y + tWid.height();
	}

	//=======================================================
	//
	//=======================================================
	function canClickTitle()
	{
		for (var i = 0; i < that.data.ch.length; i++)
		{
			if (that.data.ch[i].t === 'unitIntro')
				return true;
		}

		return false;
	}

	//=======================================================
	// Pass on the unit number and index of the topic within
	// the unit
	//=======================================================
	function clickHandler(wid)
	{
		that.click && that.click(that.unit, wid.data);
	}

};