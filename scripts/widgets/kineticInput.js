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
		fw.eventSubscribe('focus:inputbox', setTarget);

	//======================================================
	// Button Definitions
	// Name: tooltip, MathQuill text, positioning group, asset frame #
	//======================================================
	var buttons = {
		abs: {tip: 'Absolute value', txt: '|', f:'abs', label:'|<i>a</i>|'},
		expo: {tip: "Exponent", txt: '^', f:'power', label:'<i>a</i><sup><i>b</i></sup>'},
		lte: {tip: "Less than or equal to", txt: 'leq', f:'le', label:'&le;'},
		gte: {tip: "Greater than or equal to", txt: 'geq', f:'ge', label:'&ge;'},
		greaterthan: {tip: "Greater than", txt: '>', f:'greaterthan', label:'>'},
		lessthan: {tip: "Less than", txt: '<', f:'lessthan', label:'<'},
		notequal: {tip: "Not equal", txt: 'neq', f:'notEqual', label:'&#8800;'},
		equals: {tip: "Equals", txt: '=', label:'='},
		sqrt: {tip: "Square root", txt: 'sqrt', f:'sqrt', label:'&radic;'},
		nroot: {tip: "Nth root", txt: 'nthroot', f:'nthRoot', label:'<sup><i>n</i></sup>&radic;'},
		pi: {tip: "Pi", txt: 'pi', f:'pi'},
		sigma: {tip: "Sigma", txt: 'sum', f:'sigma'},  // Could also use \Sigma, but that's a smaller character
		andOp: {tip: "Add a solution", txt: 'and', f:'and', label:'and'},
		orOp: {tip: "Add another possible solution", txt: 'or', f:'or', label:'or'},
		frac: {tip: "Fraction", txt: '/', f:'fraction'},
		infinity: {tip: "Infinity", txt: 'infty', f:'infinity'},
		minusplus: {tip: "Plus or minus", txt: 'pm', f:'plusMinus'},
		infiniteSol: {tip: "Problem has infinite solutions", txt: 'infinity', f:'infAnswers', big:true, label:'inf solutions'},
		noSol: {tip: "Problem has no solutions", txt: 'emptyset', f:'noAnswers', big: true, label:'no solutions'},

		clear: {tip: "Erase your answer", txt: 'CLR', label: 'Erase', big: true, act: clearInputBox},

		blank: {f: 'blank'},
		empty: {f: 'empty', act:empty},
		blankBig: {f: 'blank', big: true},
		functions: {tip: 'Show functions', f: 'functions', big: true, act: funcPad, label:'Function'},
		less: {tip: 'Show basic buttons', f: 'more', big: true, act: normPad},
		letters: {tip: 'Show letters', f: 'letters', big: true, act: lettersPad},
		numbers: {tip: 'Show numbers', f: 'numbers', big: true, act: numbersPad},
		equations: {tip: 'Show equations', f: 'equations', big: true, act: normPad, label:'Equation'},
		numbers_dn: {tip: 'Show numbers', f: 'numbers_dn', big: true, act: numbersPad},
		equations_dn: {tip: 'Show equations', f: 'equations_dn', big: true, act: normPad},
		functions_dn: {tip: 'Show functions', f: 'functions_dn', big: true, act: funcPad},

		log: {tip: "Logarithm", txt: 'log', label: 'log'},
		logBase: {tip: "Logarithm with base", txt: 'logBase', big: true, f: 'logBase', label: 'log<sub><i>a</i></sub>'},
		natLog: {tip: "Natural logarithm", txt: 'ln', label: 'ln'},
		sin: {tip: "Sine", txt: 'sin', label: 'sin'},
		cos: {tip: 'Cosine', txt: 'cos', label: 'cos'},
		tan: {tip: "Tangent", txt: 'tan', label: 'tan'},
		sec: {tip: "Secant", txt: 'sec', label: 'sec'},
		csc: {tip: 'Cosecant', txt: 'csc', label: 'csc'},
		cot: {tip: 'Cotangent', txt: 'cot', label: 'cot'},

				zero: {tip: 'Zero', txt: '0', label:'0'},
				one: {tip: 'One', txt: '1', label:'1'},
				two: {tip: 'Two', txt: '2', label:'2'},
				three: {tip: 'Three', txt: '3', label:'3'},
				four: {tip: 'Four', txt: '4', label:'4'},
				five: {tip: 'Five', txt: '5', label:'5'},
				six: {tip: 'Six', txt: '6', label:'6'},
				seven: {tip: 'Seven', txt: '7', label:'7'},
				eight: {tip: 'Eight', txt: '8', label:'8'},
				nine: {tip: 'Nine', txt: '9', label:'9'},


				left: {tip: 'Nine', f:'left', act:keyLeft },
				right: {tip: 'Nine', f:'right', act:keyRight },
				backspace: {tip: 'Nine', f:'backspace', act: backSpace },

				paren: {tip: 'Parentheses', txt: '(', label:'( )'},
				minus: {tip: 'Minus', txt: '-', label:'-'},
				plus: {tip: 'Plus', txt: '+', label:'+'},
				multiply: {tip: 'Multiply', txt: '*', f:'multiply'},
				divide: {tip: 'Divide', txt: '/', f:'divide'},
				period: {tip: 'Period', txt: '.', label:'.'},
				comma: {tip: 'Comma', txt: ',', label:','},

				avar: {tip: 'a', txt: 'a', label:'<i>&nbsp;a&nbsp;</i>'},
				bvar: {tip: 'b', txt: 'b', label:'<i>&nbsp;b&nbsp;</i>'},
				cvar: {tip: 'c', txt: 'c', label:'<i>&nbsp;c&nbsp;</i>'},
				dvar: {tip: 'd', txt: 'd', label:'<i>&nbsp;d&nbsp;</i>'},
				fvar: {tip: 'f', txt: 'f', label:'<i>&nbsp;f&nbsp;</i>'},
				gvar: {tip: 'g', txt: 'g', label:'<i>&nbsp;g&nbsp;</i>'},
				hvar: {tip: 'h', txt: 'h', label:'<i>&nbsp;h&nbsp;</i>'},
				lvar: {tip: 'l', txt: 'l', label:'<i>&nbsp;l&nbsp;</i>'},
				mvar: {tip: 'm', txt: 'm', label:'<i>&nbsp;m&nbsp;</i>'},
				nvar: {tip: 'n', txt: 'n', label:'<i>&nbsp;n&nbsp;</i>'},
				rvar: {tip: 'r', txt: 'r', label:'<i>&nbsp;r&nbsp;</i>'},
				tvar: {tip: 't', txt: 't', label:'<i>&nbsp;t&nbsp;</i>'},
				wvar: {tip: 'w', txt: 'w', label:'<i>&nbsp;w&nbsp;</i>'},
				xvar: {tip: 'x', txt: 'x', label:'<i>&nbsp;x&nbsp;</i>'},
				yvar: {tip: 'Y', txt: 'y', label:'<i>&nbsp;y&nbsp;</i>'},
				zvar: {tip: 'X', txt: 'z', label:'<i>&nbsp;z&nbsp;</i>'},

				ivar: {tip: 'i', txt: 'i', label:'<i>i</i>'},

	};

	var numbersPad = [['equations', 'numbers_dn', 'functions'],
				[ 'seven', 'eight','nine', 'plus', 'backspace'],
			  [ 'four','five', 'six', 'minus', 'left'],
			  [ 'one', 'two', 'three', 'multiply', 'right'],
 				[ 'comma', 'zero', 'period', 'divide'],
				];

 	var lettersPad = [['equations', 'numbers', 'functions'],
				['xvar', 'yvar', 'zvar', 'hvar'],
 			  ['bvar', 'mvar'],
 				['clear'],
				];

	var pad = [
				['frac', 'expo', 'sqrt', 'nroot', 'empty','avar', 'bvar', 'cvar', 'dvar', 'empty','seven', 'eight','nine', 'plus', 'backspace', 'equations'], //'sigma'
			  ['lessthan', 'greaterthan', 'notequal', 'equals', 'empty', 'fvar', 'gvar', 'hvar', 'lvar', 'empty', 'four','five', 'six', 'minus',  'left', 'functions'], //'minusplus'
			  ['lte', 'gte', 'paren', 'ivar', 'empty', 'mvar', 'nvar', 'rvar','tvar', 'empty','one', 'two', 'three','multiply', 'right'],  //,'infinity'
			  ['andOp', 'orOp', 'abs', 'pi', 'empty', 'wvar', 'xvar', 'yvar', 'zvar', 'empty', 'comma','zero', 'period','divide'],
				];

	var pad2 = [
				['sin', 'cos', 'tan','log', 'empty','avar', 'bvar', 'cvar', 'dvar', 'empty','seven', 'eight','nine', 'plus', 'backspace', 'equations'], //'sigma'
			  ['sec', 'csc', 'cot', 'natLog', 'empty', 'fvar', 'gvar', 'hvar', 'lvar', 'empty', 'four','five', 'six', 'minus',  'left', 'functions'], //'minusplus'
			  ['infiniteSol', 'noSol', 'empty', 'mvar', 'nvar', 'rvar','tvar', 'empty','one', 'two', 'three','multiply', 'right'],  //,'infinity'
			  ['logBase', 'empty', 'empty', 'empty', 'wvar', 'xvar', 'yvar', 'zvar', 'empty', 'comma','zero', 'period','divide'],
				];

	// var pad2 = [['equations', 'numbers', 'functions_dn'],
	// 			['sin', 'cos', 'tan','log', 'backspace'],
	// 			['sec', 'csc', 'cot', 'natLog', 'left'],
 // 				['infiniteSol', 'noSol', 'right'],
	// 			['logBase'],
	// 			];

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
		cot: ['cot', '(']
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

	function lettersPad()
	{
		grid && grid.terminate();
		drawButtons(lettersPad);
		grid.show();
	}

	function numbersPad()
	{
		grid && grid.terminate();
		drawButtons(numbersPad);
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


		if (wid.parent.parent.type === "multi") { //numeric entry
			var text = buttons[btn].txt;

			if (act) {
				act(btn);
			} else if (text.match(/^[0-9.-]+$/) !== null) {
				wid.write(text);
			}

		} else { // equation entry
			if (act)
				act(btn);
			else
			{
				// Handle text insertion.  A few operators require special casing.
				var text = buttons[btn].txt;
				if (specialContent[text]) {
					writeCmds(wid, specialContent[text]);
				} else {
					wid.write(text);
				}
			}
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
	function empty()
		{

		}

		function backSpace()
		{
			var tgt = that.target;
			if(tgt.isEqInput)	 {
				tgt.write('!BACKSPACE');
			} else {
				tgt.backspace();
			}
		}

		function keyLeft()
		{
			var tgt = that.target;
			if(tgt.isEqInput)	 {
				tgt.write('!LEFT');
			} else {
				tgt.keyLeft();
			}
		}

		function keyRight()
		{
			var tgt = that.target;
			if(tgt.isEqInput)	 {
				tgt.write('!RIGHT');
			} else {
				tgt.keyRight();
			}
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
		if (data.owner) {
			if (data.owner.isEqInput) {
				that.target = data.owner;
			} else {
				that.target = data.owner;
			}
		}
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
		fw.eventUnsubscribe('focus:inputbox', setTarget);
	}

};
