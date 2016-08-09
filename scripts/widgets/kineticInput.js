//======================================================
// Creates a bank of Kinetic Input boxes
//
// @FIXME/dg: Clean up this module!
//
// Arguments:
//  id
//  x
//  y
//  list: array of icons to display: [name]
//  lineWidth: Number of icons per line
//  target: Element that receives button input
//  depth: basically the zindex
//  altAsset: different button icon asset
//
//
// Style: (eqInput)
//======================================================
framework.widget.kineticInput = function()
{
	var that = this;
	var style = app.style.eqInput;

//	var btnList = [];
	var canEdit = true;

	var grid;

	var bigAsset = 'eqInputDouble';		// Move to style?
	var smallAsset = 'eqInputSingle';

	fw.eventSubscribe('focus:input', setTarget);

	//======================================================
	// Button Definitions
	// Name: tooltip, MathQuill text, positioning group, asset frame #
	//======================================================
	var buttons = {
		abs: {tip: 'Absolute value', txt: '|', f:'abs'},
		expo: {tip: "Exponent", txt: '^', f:'power'},
		lte: {tip: "Less than or equal to", txt: 'leq', f:'le'},
		gte: {tip: "Greater than or equal to", txt: 'geq', f:'ge'},
		notequal: {tip: "Not equal", txt: 'neq', f:'notEqual'},
		sqrt: {tip: "Square root", txt: 'sqrt', f:'sqrt'},
		nroot: {tip: "Nth root", txt: 'nthroot', f:'nthRoot'},
		pi: {tip: "Pi", txt: 'pi', f:'pi'},
		sigma: {tip: "Sigma", txt: 'sum', f:'sigma'},  // Could also use \Sigma, but that's a smaller character
		andOp: {tip: "Add a solution", txt: 'and', f:'and'},
		orOp: {tip: "Add another possible solution", txt: 'or', f:'or'},
		frac: {tip: "Fraction", txt: '/', f:'fraction'},
		infinity: {tip: "Infinity", txt: 'infty', f:'infinity'},
		minusplus: {tip: "Plus or minus", txt: 'pm', f:'plusMinus'},
		infiniteSol: {tip: "Problem has infinite solutions", txt: 'infinity', f:'infAnswers', big:true},
		noSol: {tip: "Problem has no solutions", txt: 'emptyset', f:'noAnswers', big: true},

		clear: {tip: "Erase your answer", txt: 'CLR', label: 'Erase', big: true, act: clearInputBox},

//		snmult: {tip: "scientific notation", txt: 'times', f:17},
		blank: {f: 'blank'},
		blankBig: {f: 'blank', big: true},
		more: {tip: 'Show functions', f: 'more', big: true, act: funcPad},
		less: {tip: 'Show basic buttons', f: 'more', big: true, act: normPad},

		log: {tip: "Logarithm", txt: 'log', big: true, label: 'log'},
		logBase: {tip: "Logarithm with base", txt: 'logBase', big: true, f: 'logBase'},
		natLog: {tip: "Natural logarithm", txt: 'ln', big: true, label: 'ln'},
		sin: {tip: "Sine", txt: 'sin', big: true, label: 'sin'},
		cos: {tip: 'Cosine', txt: 'cos', big: true, label: 'cos'},
		tan: {tip: "Tangent", txt: 'tan', big: true, label: 'tan'},
		sec: {tip: "Secant", txt: 'sec', big: true, label: 'sec'},
		csc: {tip: 'Cosecant', txt: 'csc', big: true, label: 'csc'},
		cot: {tip: 'Cotangent', txt: 'cot', big: true, label: 'cot'},
	};

	var pad = [['frac', 'expo', 'abs', 'sqrt', 'nroot', 'sigma'],
			   ['lte', 'gte', 'notequal', 'minusplus', 'infinity', 'pi'],
			   ['andOp', 'orOp', 'infiniteSol', 'noSol'],
			   ['clear', 'more']];

	var pad2 = [['sin', 'cos', 'tan'],
				['sec', 'csc', 'cot'],
				['log', 'logBase', 'natLog'],
				['clear', 'less']];

	// Command lists for content macros (any keys that can't be handled with a single insertion)
	var specialContent = {
		log: ['log', '('],
		logBase: ['log', '_', '!RIGHT', '(', '!LEFT', '!LEFT'],
		ln: ['ln', '('],

		sin: ['sin', '('],
		cos: ['cos', '('],
		tan: ['tan', '('],
		sec: ['sec', '('],
		csc: ['csc', '('],
		cot: ['cot', '('],
	};

	drawButtons(pad);

	//=======================================================
	// Draws the KI buttons
	//=======================================================
	function drawButtons(padDef)
	{
		var list = createButtonList(padDef);

		grid = that.add('buttonGrid', {
			buttons: list,
			click: buttonClick,
			depth: that.depth || 1,
			font: style.font,
			color: style.color,
			tipDelay: 200,		// time in ms, defaults to 0
			hidden: that.hidden

		}, fw.dockTo(that));
	}

	//=======================================================
	// This occurs everytime, and only needs to happen once!
	//=======================================================
	function createButtonList(padDef)
	{
		var buttonList = [];

		_.each(padDef, function(row) {
			var rowList = [];

			_.each(row, function(btnName) {
				var btn = buttons[btnName];

				rowList.push({
					asset: btn.big ? bigAsset : smallAsset,
					frame: btn.label ? 'blank' : btn.f,
					text: btn.label,
					tip: btn.tip,
					name: btnName
				});
			});

			buttonList.push(rowList);
		});

		return buttonList;
	}

	//=======================================================
	//
	//=======================================================
	function funcPad()
	{
		grid && grid.terminate();
		drawButtons(pad2);
		grid.show();
	}

	//=======================================================
	//
	//=======================================================
	function normPad()
	{
		grid && grid.terminate();
		drawButtons(pad);
		grid.show();
	}

	//=======================================================
	//=======================================================
	function buttonClick(clicked)
	{
		if (!that.target)
			return;

		var wid = that.target;
		var btn = clicked.name;

		var act = buttons[btn].act;
		if (act)
			act(btn);
		else
		{
			// Handle text insertion.  A few operators require special casing.
			var text = buttons[btn].txt;
			if (specialContent[text])
				writeCmds(wid, specialContent[text]);
			else
				wid.write(text);
		}

		wid.focus && wid.focus();	// Return/maintain focus on the input element (if applicable: multiple choice don't maintain focus)
	}

	//=======================================================
	//
	//=======================================================
	function clearInputBox()
	{
		that.target && that.target.clear();
	}

	//=======================================================
	// Write out a sequence of MathQuill latex commands
	//=======================================================
	function writeCmds(wid, list)
	{
		for (var i = 0, len = list.length; i < len; i++)
			wid.write(list[i]);
	}

	//=======================================================
	//=======================================================
	function setTarget(data)
	{
		if (data.owner.isEqInput)
			that.target = data.owner;
	}

	//=======================================================
	//=======================================================
	this.height = function()
	{
	  return grid.height;
	}

	//=======================================================
	//=======================================================
	this.width = function()
	{
		return grid.width();
	}

	//=======================================================
	//=======================================================
	this.readOnly = function()
	{
		canEdit = false;

		$.each(wids, function(idx, val) {
		  val.disable();
		});
	}

	//=======================================================
	//=======================================================
	this.allowInput = function()
	{
		canEdit = true;

		$.each(wids, function(idx, val) {
		  val.enable();
		});
	}

	//=======================================================
	//=======================================================
	this.terminateSelf = function()
	{
		fw.eventUnsubscribe('focus:input', setTarget);
	}

};
