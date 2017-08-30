//=============================================================================
// Displays a quesiton, along with a question number
//
//  id
//  x: Location of question number
//  y
//	w: width of question container.  The actual question will generally be narrower.
//	h:
//	difficulty
//	numberText
//	text: The question
//	instruct: Optional instructions
//
// Style: (question)
//	numberFont
//	numberColor
//  font
//	color
//	instructFont
//	instructColor
//	instructGap: Veritcal space between the instructions (if any) and the question
//	margin: Space between the number and the question
//  yAdjust: Amount to move the question and number vertically to align with the difficulty icon
//	diffAsset: Difficulty icon asset
//	diffPos: X adjustment for icon placement
//=============================================================================
framework.widget.question = function()
{
	var that = this;
	var style = app.style.question;

	var icon, qNum, qst, inst;
	
	this.w = 600;	// @FIXME/dg: Move to style

	//=======================================================
	// Draw the question
	//=======================================================
	function drawInstructions()
	{
		var y = that.y + style.yAdjust;

		if (that.instruct)
		{
			inst = that.add('text', {
				text: that.instruct,
				color: style.instructColor,
				font: style.instructFont,
				hidden: that.hidden
			},{
				top: that.id + ' top ' + style.yAdjust,
				left: that.id + ' left',
				right: that.id + ' right'
			});
		}
	}

	//=======================================================
	// Draw the question number
	//=======================================================
	function drawNumber()
	{
		if (!defined(that.numberText))
			return;

		qNum = that.add('text', {
			text: that.numberText + '.',
			color: style.numberColor,
			font: style.numberFont
		},{
			top: qst.id + ' top',
			right: qst.id + ' left -' + style.margin
		});
	}

	//=======================================================
	// Draw the question
	//=======================================================
	function drawQuestion()
	{
		// Determine the appropriate widget to dock to on the left
		var top = inst ? (inst.id + ' bottom ' + style.instructGap) :
			(that.id + ' top ' + style.yAdjust);

		qst = that.add('text', {
			text: that.text,
			color: style.color,
			font: style.font,
			hidden: that.hidden
		},{
			top: top,
			left: that.id + ' left',
			right: that.id + ' right'
		});
	}

	//=======================================================
	// Draw the entire widget
	//=======================================================
	function draw()
	{
		drawInstructions();
		drawQuestion();
		drawNumber();
	}

	//=======================================================
	// Change the question displayed
	//
	// Currently doesn't allow the difficulty icon to be changed
	//=======================================================
	this.modify = function(num, preQ, q)
	{
		if (defined(num))
			that.numberText = num;

		if (defined(preQ))
			that.instruct = preQ;

		that.text = q;

		qNum && qNum.terminate();
		inst && inst.terminate();
		qst && qst.terminate();
		icon && icon.terminate();
		draw();
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		draw();
	}

	//=======================================================
	// Return the height of the question
	//=======================================================
	this.height = function()
	{
		var ht = 0;

		if (that.instruct && inst)
			ht = inst.height() + (style.instructGap || 0);

		if (qst)
			ht += qst.height();

		return ht;
	}
	
};
