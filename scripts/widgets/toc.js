//=============================================================================
// High-level Table of Contents widget
//
//  id
//  x, y
//	data: Book definition object
//	curChapter: Currently selected chapter.  Defaults to 0.
//  scheme: The currently active scheme
//
// Style: (toc)
//  font
//	textColor
//	textGap: Space between each text item in a column
//
// @FIXME/dg: This module is full of magic numbers!
//=============================================================================
framework.widget.toc = function()
{
	var that = this;
	var style = app.style.toc;

	// Chapters and sections should probably be a collection.  However, we have a separate data file
	// with chapters and sections so it might not make sense.  They won't be fetched via REST.

	var boxMarginV = 20, boxMarginH = 20;	// Add an extra margin to cover shrinkage in the border edges.  Also used for text placement?

	var curChapter = -1;	// This gets initialized later
	var mappedChapter;
	var chapterBox, sectionBox, chapterList, sectionList;
	var titleText, unitCountWidget, titleDivider;

	var specialTopicType = 'unitIntro';


//=============================================================================
// Data Access
//=============================================================================

	//=======================================================
	//=======================================================
	function getUnitCnt(chapter)
	{
		return that.data[chapter].ch.length;
	}

//=============================================================================
// Widget construction
//=============================================================================

	//=======================================================
	// Construct a border around the chapter text
	//=======================================================
    function createChapterBorder()
    {
		chapterBox = that.add('borderedBox', {
			w: 390,		// Fixed width
			bgColor: style.chapterBGColor,
			bgExtendV: boxMarginV,
			bgExtendH: boxMarginH,
			borderDepth: 2,
			images: app.style.backdrop.images
		},
		{
			top: that.id + ' top',
			bottom: that.id + ' bottom',
			left: that.id + ' left',
		});
    }

	//=======================================================
	//
	//=======================================================
	function createSectionBox()
	{
		sectionBox = that.add('borderedBox', {
			bgColor: style.sectionBGColor,
			bgExtendV: boxMarginV,
			bgExtendH: boxMarginH,		// 10 is semi-arbitrary, but it works.
			borderDepth: 2,
			images: app.style.backdrop.images
		},
		{
			top: chapterBox.id + ' top',
			bottom: chapterBox.id + ' bottom',		// It should be possible to use chapterBox here, but that doesn't include border and this does.  We'd have to compensate by at least 3 factors.  It's better to convert the left side to a pagedCollection with 1 page.
			left: chapterBox.id + ' right 25',		// @FIXME/dg: Magic number
			right: that.id + ' right'
		});
	}

	//=======================================================
	// Create fade out images at the top and bottom of the box
	//=======================================================
	function createSectionFaders()
	{
		// Bottom fader removed -- It's now built into the border

		// Top fader
		that.add('image', {
			image: 'TOCFadeDown',
			repeat: 'x',
			depth: 1
		},{
			top: titleDivider.id + ' bottom',
			left: sectionBox.id + ' left ' + style.sectionSideMargin,
			right: sectionBox.id + ' right -' + style.sectionSideMargin
		});
	}

	//=======================================================
	//=======================================================
    function createSectionBorder()
    {
		// Create the box itself
		createSectionBox();
    }

	//=======================================================
	//=======================================================
	function createChapterList()
	{
		// Create "Table of Contents" string
		var tocText = that.add('text', {
			font: style.TOCStringFont,
			color: style.TOCStringColor,
			text: that.title	//"Table of Contents"
		},
		{
			wid: chapterBox,
			my: 'top left',
			at: 'top left',
			ofs: style.TOCStringHMargin + ' ' + style.TOCStringVMargin
		});

		// Create actual chapter text
		var chapters = app.getChapterList('Ch ', true, that.scheme);
		chapterList = that.add('textColumn', {
			text: chapters,
			font: style.chapterFont,
			textColor: style.chapterTextColor,
			hoverColor: style.chapterHoverColor,
			highlightColor: style.chapterHighlightColor,
			margin: style.chapterTextGap,
			click: changeChapter,
			depth: 3
		},
		{
			wid: tocText,
			my: 'top left',
			at: 'bottom left',
			ofs: '0 ' + style.TOCStringGap
		});
	}

	//=======================================================
	// Create the chapter title at the top of the section box
	//=======================================================
    function createChapterTitle()
    {
		// Create the title
		titleText = that.add('text', {
			font: style.titleFont,
			color: style.titleColor,
			text: '&nbsp;'
		},
		{
			wid: sectionBox,
			my: 'top left',
			at: 'top left',
			ofs: style.titleHMargin + ' ' + style.titleVMargin
		});
	}

	//=======================================================
	//=======================================================
	function setUnitCount()
	{
		var unitText = '(Units 1-' + getUnitCnt(mappedChapter) + ')';
		unitCountWidget.setText(unitText);
	}

	//=======================================================
	// Create text showing the number of units in a chapter,
	// which is located right beneath the chapter text
	//=======================================================
	function createUnitCount()
	{
		// Create the unit count
		unitCountWidget = that.add('text', {
			font: style.unitCountFont,
			color: style.unitCountColor,
			text: '&nbsp;'
		},
		{
			wid: titleText,
			my: 'top left',
			at: 'bottom left',
			ofs: '0 ' + style.titleGap
		});
	}

	//=======================================================
	// Create a divider within the section box, separating
	// the header (chapter title + unit count) from the
	// scrolling list of units and sections
	//=======================================================
	function createSectionDivider()
	{
		titleDivider = that.add('rect', {
			color: style.dividerColor,
			h: style.dividerHeight,
			w: sectionBox.width() - style.titleHMargin * 2
		},
		{
//			wid: unitCountWidget,
			wid: titleText,
			my: 'top left',
			at: 'bottom left',
			ofs: '0 ' + style.unitCountGap
		});
	}

	//=======================================================
	//=======================================================
    function createSectionHeader()
    {
		createChapterTitle();
//		createUnitCount();
		createSectionDivider();
		createSectionFaders();
    }

	//=======================================================
	//=======================================================
    function createSectionList()
    {
		sectionList = that.add('pagedCollection', {
			bgColor: style.sectionBGColor,
			buttonAsset: 'TOCArrows',
			buttonFrames: ['Down', 'Up'],
			buttonOffset: [style.pageButtonOffsetX, style.pageButtonOffsetY],
			buttonGap: style.pageButtonGap,
			gap: style.unitGap,
			topMargin: style.sectionTopGap,
			bottomMargin: style.sectionBottomGap
		},
		{
			top: titleDivider.id + ' bottom',
			bottom: sectionBox.id + ' bottom -' + style.sectionBottomMargin,
			left: sectionBox.id + ' left ' + style.sectionSideMargin,
			right: sectionBox.id + ' right -' + style.sectionSideMargin
		});
    }

	//=======================================================
	//
	//=======================================================
	function changeChapter(chapter)
	{
		// If the chapter hasn't changed, don't do anything
		if (curChapter == chapter)
			return;

		curChapter = chapter;
		mappedChapter = chapter;	//app.getMappedChapter(chapter);

		// Update the chapter list
		chapterList.setSelection(chapter);

		// Update the chapter title
		chapterTitleBounce(that.data[mappedChapter].n);

//		setUnitCount();

		if (that.data[mappedChapter].t === "addendum")
			populateSectionList(extraClicked);	// Update the right side of the TOC, but not with standard chapter sections.
		else
			populateSectionList(secClicked);	// Update the section list

		// Notify the outside world about the change, if they want to know
		if (that.chapterNotify)
			that.chapterNotify(mappedChapter);
	}

	//=======================================================
	// Chapter Title Effect Handler
	//=======================================================
	function chapterTitleBounce(text)
	{
		var x = titleText.x;
		var y = titleText.y;

		titleText.hide().setPos(x+30,y).setText(text).show();	// @FIXME/dg: Magic number
		titleText.animTo(x, y, 700, null, "easeOutBounce");	// @FIXME/dg: Magic number
	}

	//=======================================================
	// Fill in the topic list for a given chapter
	//=======================================================
	function populateSectionList(clickHandler)
	{
		sectionList.reset();

		// Step though each unit in the current chapter
		for (var idx = 0, len = getUnitCnt(mappedChapter); idx < len; idx++)
		{
			// Create a unit block
			var wid = sectionList.add('unitToc', {
				w: sectionList.width() - 10,	// @FIXME/dg: Weird and arbitrary
				chapter: mappedChapter,
				unit: idx,
				scheme: that.scheme,
				data: app.getUnit(mappedChapter, idx, that.scheme),

				click: clickHandler
			});

			// Place the unit block inside the "pagedCollection" sectionList
			sectionList.addItem(wid);
		};
	}

	//=======================================================
	// A section was clicked
	//=======================================================
	function secClicked(unit, idx)
	{
		that.itemSelected && that.itemSelected(mappedChapter, unit, idx*1);
	}

	//=======================================================
	// A line was clicked
	//
	// This knows way too much about internal structures
	//=======================================================
	function extraClicked(un, top)
	{
		var ch = mappedChapter;

		if (that.data[ch] &&
			that.data[ch].ch[un] &&
			that.data[ch].ch[un].ch[top]) {
			top = that.data[ch].ch[un].ch[top];
		}
		else {
			top = null;
		}

		if (top.link)
			app.externalJump(top.link);
	}

//=============================================================================
// Widget API
//=============================================================================

	//=======================================================
	// Size dynamically.  Don't construct self until sizes are known.
	//=======================================================
	this.docked = function()
	{
		// Create the chapter box
		createChapterBorder();

		// Create the section box
		createSectionBorder();

		// Create the chapter list
		createChapterList();

		// Create the chapter/unit title
		createSectionHeader();

		// Create the section list
		createSectionList();

		//-------------------
		changeChapter(that.curChapter || 0);
	}

};