//======================================================
// Problem List Widget
//
// This module is messy!  It was created before the widget system was complete.  It should be
// constructed out of a set of smaller widgets.  Each page should be a widget, and each line should
// as well.  There is too much drawing logic in here!
//
// Arguments:
//  id
//	number: Question number
//	text: Question text
//  score: Current score
//	maxScore: Maximum possible score
//	isPercent: If true, display score in percentage format.  Otherwise use cur/max format.
//
// Style: (problemList)
//======================================================
framework.widget.probListLine = function()
{
	var that = this;
	var style = app.style.problemList;

	var bar, num, question, score, highlight, status, typeIcon;

	var depth = that.depth || 0;
	var isPercent = that.isPercent || false;

	that.h = style.minHeight;		// Assume a default. Tall questions will override this.

	drawLine();

	addClickHandlers();
	addHoverHandlers();

	//=======================================================
	// As a first pass, draw anywhere.  We need to see the heights
	// before we can set the positions.
	//=======================================================
	function drawLine()
	{
		drawBar();

		// Draw hover bar
		drawHighlight();

		// Draw question
		drawQuestion();

		// Draw score or percent
		if (that.showScore)
			drawScore();

//		drawTypeIcons();

		// Draw number
		drawNumber();

		// Draw status
		drawStatus();
	}

	//=======================================================
	//
	//=======================================================
	function drawBar()
	{
		bar = that.add('image', {
			image: style.barAsset,
			repeat: 'x'
		}, {
			top: that.id + ' top',
			left: that.id + ' left ' + style.barLeftMargin,
			right: that.id + ' right -' + style.barRightMargin
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawHighlight()
	{
		highlight = that.add('rect', {
			color: style.barNormColor,
			depth: depth,
			cursor: 'pointer'
		},{
			top: that.id + ' top ' + style.selectMargin,
			bottom: that.id + ' bottom -' + style.selectMargin,
			left: bar.id + ' left',
			right: bar.id + ' right'
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawNumber()
	{
		num = that.add('text', {
			text: that.number,
			color: style.numberColor,
			font: style.numberFont,
			depth: depth+1,
			cursor: 'pointer'
		},{
			right: question.id + ' left -' + style.numMargin,
			centery: highlight.id + ' center'
		});
	}

	//=======================================================
	//=======================================================
	function drawStatus()
	{
		status = that.add('probStatus', {
			depth: depth+1,
			state: that.status,
			depth: depth+1,
			cursor: 'pointer'
		},{
			left: bar.id + ' left ' + style.statusMargin,
			centery: highlight.id + ' center'
		});

		if (that.type === 'multiPart')
		{
			that.add('text', {
				text: 'A-' + app.getNthLetter(that.partCount-1, true),
				color: style.partColor,
				font: style.partFont
			}, {
				wid: status,
				my: 'top center',
				at: 'bottom center',
				ofs: '0 3'
			});
		}
	}

	//=======================================================
	//
	//=======================================================
	function drawQuestion()
	{
		// We need to know the width going in, because it will affect wrapping.
		// Wrapping affects the overall height of the base widget, and centering
		// of the text.

		// This version just chooses a fixed right margin, chosen based on a worst case

		var questionText = getQuestionText();

		question = that.add('text', {
			w: that.w - style.qLeftMargin - style.qRightMargin,	// Pre-calc width instead of docking so we can correctly determine the height
			text: questionText,
			color: style.qColor,
			font: style.qFont,
			depth: depth+1,
			cursor: 'pointer',
			notify: true,
			preMove: fixLayout
		});

		if (!question.promise)
		{
			var pth = probTextHeight();
			if (pth > that.h)
			{
				that.h = pth;
				highlight.redock();
			}

			fw.dock(question, {
				left: that.id + ' left ' + style.qLeftMargin,
				centery: highlight.id + ' center'
			});
		}
		else
		{
			fw.dock(question, {
				left: that.id + ' left ' + style.qLeftMargin,
				centery: highlight.id + ' center'
			});
		}
	}

	//=======================================================
	//
	//=======================================================
	function getQuestionText()
	{
		// Start with the base question
		var questionText = that.text;

		// Add multiple choice, if requested
		if (that.showChoices && that.choices)
			questionText += "<br/><br/>" + formatChoices(that.choices);

/*
		// Add part count
		if (that.type === 'multiPart')
			questionText += "<br/><br/>" + formatPartCount(that.partCount);
*/
		return questionText;
	}

	//=======================================================
	// Occurs just before fw.resetLayout. Updates the height
	// so resetLayout can fix this and its dependents.
	//=======================================================
	function fixLayout()
	{
		var pth = probTextHeight();
		if (pth > that.h)
			that.h = pth;
	}

	//=======================================================
	//
	//=======================================================
	function formatChoices(data)
	{
		var out = [];

		$.each(data, function(idx, choiceObj) {
			var choice = choiceObj.answer;
			var header = app.getNthLetter(idx) + ') ';

			out.push(header + choice);
		});

		var choices = out.join('&nbsp;&nbsp;');
		return choices;
	}

	//=======================================================
	//
	//=======================================================
	function formatPartCount(cnt)
	{
//		var res = "<b>(Parts A-" + app.getNthLetter(cnt-1, true) + ")</b>";
//		var res = "Parts A-" + app.getNthLetter(cnt-1, true) + "";
		var res = "Contains " + cnt + " parts.";

		return res;
	}

	//=======================================================
	//
	//=======================================================
	function scoreText()
	{
		if (isPercent)
			return Math.round(that.score / that.maxScore * 100) + '%';
		else
			return Math.round(that.score) + '/' + Math.round(that.maxScore);
	}

	//=======================================================
	//
	//=======================================================
	function drawScore()
	{
		var text = scoreText();

		score = that.add('text', {
			text: text,
			color: style.pointColor,
			font: style.pointFont,
			depth: depth+1,
			cursor: 'pointer'
		},{
			wid: highlight,
			my: 'center right',
			at: 'center right',
			ofs: -style.pointRightMargin + ' 0'
		});

	}

	//=======================================================
	//
	//=======================================================
	function drawTypeIcons()
	{
		var map = {
			graphPlot: 'graph',
			graphConst: 'graph',
			equation: 'equation',
			multi: 'freeInput',
			check: 'multChoice',
			radio: 'multChoice',
			multiPart: 'multiPart',
			paper: 'paper',
			essay: 'paper',

			'default': 'freeInput'
		};

		typeIcon = that.add('image', {
			image: 'aTypeIcons',
			frame: map[that.type] || map['default'],
			depth: depth + 1,
			cursor: 'pointer'
		}, {
			wid: score,
			my: 'center right',
			at: 'center left',
			ofs: '-28 0'
		});
	}

	//=======================================================
	//
	//=======================================================
	function probTextHeight()
	{
		return question.height() + style.vMargin * 2;
	}

	//=======================================================
	// Hover over any portion of this widget
	//=======================================================
	function hover()
	{
		highlight.color(style.barSelectColor);
	}

	//=======================================================
	// Stop hovering over the widget
	//=======================================================
	function stopHover()
	{
		highlight.color(style.barNormColor);
	}

	//=======================================================
	// Add click behaviors to individual elements
	//
	// It would be easier if we could bind to the root widget,
	// but we don't want hover actions to occur when hovering
	// over the bars.
	//=======================================================
	function addHoverHandlers()
	{
		var handler = {
			inAction: hover,
			outAction: stopHover
		};

		// Bind hover behavior
		highlight.applyAction('hover', handler);
		num.applyAction('hover', handler);
		status.applyAction('hover', handler);
		question.applyAction('hover', handler);
		typeIcon && typeIcon.applyAction('hover', handler);
		if (that.showScore)
			score.applyAction('hover', handler);
	}

	//=======================================================
	// Add click behaviors to individual elements
	//=======================================================
	function addClickHandlers()
	{
		var handler = {click: clickHandler};

		highlight.applyAction('click', handler);
		num.applyAction('click', handler);
		status.applyAction('click', handler);
		question.applyAction('click', handler);
		typeIcon && typeIcon.applyAction('click', handler);
		if (that.showScore)
			score.applyAction('click', handler);
	}

	//=======================================================
	//
	//=======================================================
	function clickHandler()
	{
		app.loadingBox();

		window.setTimeout(deliverClick(that),0);
	}


	function deliverClick(thatobj)
	{
		thatobj.click && thatobj.click(thatobj.number);
	}

	//=======================================================
	//=======================================================
	this.setScoreMode = function(pcent)
	{
		isPercent = pcent;
		score.setText(scoreText());
		score.redock();				// Reposition based on the new width
	}

	//=======================================================
	//=======================================================
	this.addBottomBar = function()
	{
		that.add('image', {
			image: style.barAsset,
			repeat: 'x',
			depth: depth+1
		}, {
			top: that.id + ' bottom',
			left: that.id + ' left ' + style.barLeftMargin,
			right: that.id + ' right -' + style.barRightMargin
		});
	}

	//=======================================================
	// Read-only. Height can't be set.
	//=======================================================
	/*
	this.height = function()
	{
		if (!num)
			return 0;

		// Set the height based on the tallest of the components.  Also enforce a minimum height.
		that.h = Math.max(probTextHeight(),
			style.minHeight);

		return that.h;
	}
*/
};
