//=============================================================================
// @FIXME/dg: This is no different from a fakeLink or textButton!  There is no
// added functionality!  Removeme!
//
// A row of text, consisting of a row number and a clickable description of the
// search result.
//
//  id
//  x, y
//  hidden (optional)
//  depth (optional)
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
framework.widget.searchResult = function()
{
	var that = this;
	var style = app.style.search;

	var tWid;

	createText();

	//=======================================================
	//=======================================================
	function createText()
	{
		tWid = that.add('fakeLink', {
			type: that.id + '_text',
//			id: that.id + '_0',
//			w: that.w - style.sectionIndent,	// GOOD: This causes wrapping.  BAD: This makes the whole line selectable, not just the text
			text: that.resultText,
			font: style.resultsFont,
			color: style.resultsColor,
			hoverColor: style.hoverColor,
			hidden: that.hidden,
			click: clickHandler
		});

		// Update the widget's overall width if it has just been expanded
		that.w = tWid.width();
		that.h = tWid.height();
	}

	//=======================================================
	// Use this instead of an anonymous function to prevent
	// unneccesary allocation.
	//=======================================================
	function clickHandler()
	{
		that.click(that);
	}

};