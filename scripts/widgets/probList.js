//======================================================
// Problem List Widget
//
// Arguments:
//  id
//  collection: documented below (actually it's not)
//  mode: 'percent' or 'point'
//  style: object: -- Or is this part of the collection?
//  page: Optional: Starting page (default: 0)
//
// Style: (problemList)
//  barAsset: Divider bar image asset (1 pixel wide)
//  barNormColor: color when not highlighted
//  barSelectColor: color when highlighted
//  barLeftMargin, barRightMargin: left and right margin for bar
//  numberFont: Font for question #
//  numberColor: Color for question #
//  selectMargin: Space above and below each question that the highlight bar extends (must be <= margin)
//  minHeight: Minimum height for a question
//  qFont: Font for the question -- MathML won't honor this
//  qColor: Question color
//  pointRightMargin: Space between points and the right edge
//  pointFont: Font for the points
//  pointColor: For now, controls the color of the entire point amount
//======================================================
framework.widget.probList = function()
{
	var that = this;
	var style = app.style.problemList;

	var isPercent = this.isPercent || false;

	var container;
	var lines = [];
	var lineWid;

	//=======================================================
	// Called on widget creation
	//=======================================================
	function drawContainer()
	{
		// Construct the container
		container = that.add('pagedCollection', {
			bgColor: style.sectionBGColor,
			buttonAsset: 'TOCArrows',
			buttonFrames: ['Down', 'Up'],
			buttonOffset: [style.pageButtonOffsetX, style.pageButtonOffsetY],
			buttonGap: style.pageButtonGap,
			gap: style.unitGap,
			topMargin: style.sectionTopGap,
			bottomMargin: style.sectionBottomGap
		}, fw.dockTo(that));
	}

	//=======================================================
	// Called when data is loaded, which may be after widget creation
	//=======================================================
	this.setData = function(data)
	{
		that.collection = data;
		drawData();
	}

	//=======================================================
	// Set flag to indicate whether to show multiple choices.
	//=======================================================
	this.setShowChoices = function(tf)
	{
		that.showChoices = tf;
	}

	//=======================================================
	// Add all of the entries to the container
	//=======================================================
	function drawData()
	{
		that.collection.each(drawLine);
		lines.length && _.last(lines).addBottomBar();
	}

	//=======================================================
	//
	//=======================================================
	function redraw()
	{
		container.reset();
		lines = [];
		drawData();
	}

	//=======================================================
	//
	//=======================================================
	function drawLine(record, idx)
	{
		var prefix = record.get('q_prefix');
		var q = record.get('q');
		var line = prefix ? (prefix + '<br/>' + q) : q;	// @FIXME/dg: Hackzilla!

		var prob = container.add('probListLine', {
			w: that.width() - style.lineRightMargin,
			number: idx+1,
			text: line,
			choices: record.get('choices'),
			showScore: !that.showChoices, 	// Quizboards should not show scores
			status: record.get('status'),
			score: record.get('score'),
			maxScore: record.get('maxScore'),
			type: record.get('ansType'),
			partCount: record.get('solve').length,
			isPercent: isPercent,
			showChoices: that.showChoices,
			click: problemClicked
		});

		container.addItem(prob);

		lines.push(prob);
	}

	//=======================================================
	// One of the problems was clicked on
	//=======================================================
	function problemClicked(probNum)
	{
		// Convert from 1-based numbering to a collection index
//		var prob = that.collection.at(probNum-1);

		// Notify the parent that a problem was selected.
		// Send the model back, because we will eventually add sorting.  The problem
		// index should always remain the same, so that could have been used as well.
		that.select && that.select(probNum-1);
	}

	//=======================================================
	//=======================================================
	this.setScoreMode = function(pcent)
	{
		isPercent = pcent;

		$.each(lines, function(idx, val) {
			val.setScoreMode(pcent);
		});

//		redraw();
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		drawContainer();
	}

};
