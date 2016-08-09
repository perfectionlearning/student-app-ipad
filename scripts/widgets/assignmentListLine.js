//=============================================================================
// @FIXME/dg: This is extremely slow!
// @FIXME/dg: Optimized through the use of magic numbers and crazy assumptions.
// It's faster, but the code is much worse.
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
//=============================================================================
framework.widget.assignmentListLine = function()
{
	var that = this;
	var style = app.style.assignmentList;

	var isPercent = that.isPercent || false;
	var colorOn = that.idx % 2 ? style.barRowEvenHigh : style.barRowOddHigh;
	var colorOff = that.idx % 2 ? style.barRowEven : style.barRowOdd;

	var bar;

	// widBundle: hash of widgets to be included in row events such as hover and click
	var widBundle = {};

	var clickDef = { click: clickHandler };
	var hoverDef = { inAction: hoverOn, outAction: hoverOff };

	var iconMargin = 10;
	var iconSize = fw.imageData('AssignInfo');
	var iconWidth = iconSize[0];
	that.h = iconSize[1] + iconMargin;	// Carefully chosen so that the table height is a multiple of this value

	buildRow();

	addHoverHandlers();
	addClickHandlers();

	//=======================================================
	//=======================================================
	function buildRow()
	{
		drawBar();
		drawBackground();

		drawAssignmentName();
		drawDateAssigned();
		drawDateDue();
		drawAssignmentType();
		drawGrade();
		drawDescriptionIcon();
	}

	//=======================================================
	//
	//=======================================================
	function drawBar()
	{
		bar = that.add('image', {
			w: that.w,
			h: that.h,
			image: style.barAsset,
			repeat: 'x'
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawBackground()
	{
		widBundle.rowBg = that.add('rect', {
			y: 1,
			h: that.h,
			w: that.w,
			cursor:'pointer',
			color: colorOff,
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawDescriptionIcon()
	{
		if (that.desc)
		{
			widBundle.icon = that.add('button', {
				x: that.w - iconWidth - 12,
				y: iconMargin/2,
				image: 'AssignInfo',
				click: assignmentDescPopup,
				depth: 1,
			});
		}
	}

	//=======================================================
	//
	//=======================================================
	function drawAssignmentName() {

		widBundle.name = that.add('text', {
			cursor:'pointer',
			text: that.name,
			font: style.qFont,
			w: style.assignmentNameWidth,
			color: style.qColor,
			hidden: that.hidden
		}, {
			wid: bar,
			my: 'left center',
			at: 'left center',
			ofs: style.leftMargin + ' 0'
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawDateAssigned()
	{
		var date = fw.tools.parseDate(that.assigned);
		var dateString = date ? date.month + '/' + date.day + '/' + date.year.substr(2) : 'Unknown';

		widBundle.dateAssigned = that.add('text', {
			cursor:'pointer',
			text: dateString,
			align: 'center',
			font: style.qFont,
			w: style.dateAssignedWidth,
			color: style.qColor,
			hidden: that.hidden
		}, {
			left: widBundle.name.id + ' right',
			centery: widBundle.rowBg.id + ' center',
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawDateDue()
	{
		var date = fw.tools.parseDate(that.due);
		var dateString = date ? date.month + '/' + date.day + '/' + date.year.substr(2) + '<br/>' + date.hour + ':' + date.minute : 'Unknown';

		widBundle.dateDue = that.add('text', {
			cursor:'pointer',
			text: dateString,
			align: 'center',
			w: style.dateDueWidth,
			font: style.qFont,
			color: that.pastDue ? style.pastDueColor : style.qColor,
			hidden: that.hidden
		},{
			left: widBundle.dateAssigned.id + ' right',
			centery: widBundle.rowBg.id + ' center',
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawAssignmentType() {
		widBundle.type = that.add('text', {
			cursor:'pointer',
			text: that.type,
			align: 'center',
			font: style.qFont,
			color: style.qColor,
			w: style.assignmentTypeWidth
		},{
			left: widBundle.dateDue.id + ' right',
			centery: widBundle.rowBg.id + ' center',
		});
	}

	//=======================================================
	//
	//=======================================================
	function scoreText()
	{
		var score = that.score,
			maxscore = that.maxscore;

		if (isPercent)
			return Math.floor(score / maxscore * 100) + '%';
		else
			return Math.round(score) + '/' + Math.round(maxscore);
	}

	//=======================================================
	//=======================================================
	function drawGrade()
	{
		var grade = scoreText();
		widBundle.score = that.add('text', {
			cursor:'pointer',
			text: grade,
			align: 'center',
			font: style.qFont,
			color: style.qColor,
			w: style.gradeWidth,
			hidden: that.hidden
		},{
			left: widBundle.type.id + ' right',
			centery: widBundle.rowBg.id + ' center',
		});
	}

	//=======================================================
	// Display a description popup
	//=======================================================
	function assignmentDescPopup()
	{
		var stageSize = fw.stageSize();

		var wid = fw.createWidget('textBox', {
			xStart: stageSize[0]/2,
			yStart: stageSize[1]/2,
			wStart: 1,
			hStart: 1,

			text: that.desc,
			title: 'Description',
			depth: fw.ZENITH
		}, {
			wid: 'stage',
			my: 'center',
			at: 'center'
		});
	}

	//=======================================================
	//
	//=======================================================
	function clickHandler()
	{
		that.click(that.asId);
	}

	//=======================================================
	//=======================================================
	function hoverOn() {
		widBundle.rowBg.color(colorOn);
	}

	//=======================================================
	//=======================================================
	function hoverOff() {
		widBundle.rowBg.color(colorOff);
	}

	//=======================================================
	//
	//=======================================================
	function addHoverHandlers() {
		// Bind hover behavior
		$.each(widBundle, function(key, wid) {
			if (key !== 'icon')
				wid.applyAction('hover', hoverDef);
		});
	}

	//=======================================================
	//
	//=======================================================
	function addClickHandlers() {

		// Bind hover behavior
		$.each(widBundle, function(key, wid) {
			if (key !== 'icon')
				wid.applyAction('click', clickDef);
		});
	}

	//=======================================================
	// Lifted verbatim from probListLine.js
	//=======================================================
	this.setScoreMode = function(pcent)
	{
		isPercent = pcent;
		widBundle.score.setText(scoreText());
	}

	//=======================================================
	// Lifted from probListLine.js
	//=======================================================
	this.addBottomBar = function()
	{
		that.add('image', {
			image: style.barAsset,
			repeat: 'x'
		}, {
			top: that.id + ' bottom',
			left: that.id + ' left ',
			right: that.id + ' right '
		});
	}

};
