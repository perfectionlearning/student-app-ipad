//======================================================
//
//
// Arguments:
//	id
//	lineHeight: Fixed height for each line
//	colWidths: array of widths, one per column
//	data: 2D array of objects (line[field][field_description]) -> [[{type:, width:, text:(text only), color:, align:(text only), percent:(bar only) }]]
//
//	font: (Optional, with default)
//  vPad: (Optional, with default)
//	hPad: (Optional, with default)
//======================================================
framework.widget.chart = function()
{
	var that = this;
	var style = app.style.chart;

	// Set styles using default or user overrides
	var vPad = that.vPad || style.vPad;
	var hPad = that.hPad || style.hPad;
	var font = that.font || style.font;
	var barHeight = that.barHeight || (that.lineHeight - vPad*2);

	calcExtents();

	var dataWids = [];
	var hLines = [];
	var vLines = [];

	drawOuterBox();
	drawGrid();
	drawData();

	//=======================================================
	//
	//=======================================================
	function calcExtents()
	{
		var w = 0;
		for (var i = 0; i < that.colWidths.length; i++)
			w += that.colWidths[i];
		that.w = w;

		that.h = that.lineHeight * that.data.length;
	}

	//=======================================================
	//=======================================================
	function drawGrid()
	{
		drawHorizGrid();
		drawVertGrid();
	}

	//=======================================================
	//=======================================================
	function drawHorizGrid()
	{
		// Horizontal
		var lineCnt = that.data.length - 1;
		for (var i = 0; i < lineCnt; i++)
		{
			var wid = that.add('image', {
				image: style.lineAsset,
				repeat: 'x'
			}, {
				left: that.id + ' left',
				right: that.id + ' right',
				top: that.id + ' top ' + (that.lineHeight * (i+1))
			});

			hLines.push(wid);
		}
	}

	//=======================================================
	//=======================================================
	function drawVertGrid()
	{
		// Vertical
		var colCnt = that.colWidths.length - 1;
		var left = 0;

		for (var i = 0; i < colCnt; i++)
		{
			left += that.colWidths[i];

			var wid = that.add('image', {
				image: style.lineAsset,
				repeat: 'y'
			}, {
				left: that.id + ' left ' + left,
				top: that.id + ' top',
				bottom: that.id + ' bottom'
			});

			vLines.push(wid);
		}
	}

	//=======================================================
	//
	//=======================================================
	function drawOuterBox()
	{
		// Create a garbage rectangle that is only used to attach a border to
		var box = that.add('rect', {
			color: 'white',
			borderColor: style.borderColor,
			borderWidth: style.borderWidth
		}, {
			top: that.id + ' top -' + style.borderWidth,
			bottom: that.id + ' bottom ' + style.borderWidth,
			left: that.id + ' left -' + style.borderWidth,
			right: that.id + ' right ' + style.borderWidth
		});

		// Add a shadow border
		that.add('border8', {
			target: box,
			images: {
				t: 'WBShadowT', b: 'WBShadowB', l: 'WBShadowL', r: 'WBShadowR',
				tl: 'WBShadowTL', bl: 'WBShadowBL', tr: 'WBShadowTR', br: 'WBShadowBR'
			}
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawData()
	{
		//---------------------------
		// Draw and dock
		//---------------------------
		// Step through lines
		$.each(that.data, function(lineIdx, line) {
			dataWids[lineIdx] = [];

			// Step through columns
			$.each(line, function(colIdx, column) {

				// Create each field
				var wid = addField(column, that.colWidths[colIdx] - hPad*2);
				dataWids[lineIdx][colIdx] = wid;

				// Dock it
				fw.dock(wid, getDock(lineIdx, colIdx));
			});
		});
	}

	//=======================================================
	//
	//=======================================================
	function getDock(line, col)
	{
		var ret = {};

		if (col == 0)
			ret.left = that.id + ' left ' + hPad;
		else
			ret.left = vLines[col-1].id + ' right ' + hPad;

		if (line == 0)
			ret.top = that.id + ' top ' + vPad;
		else
			ret.top = hLines[line-1].id + ' bottom ' + vPad;

		if (col == (that.colWidths.length - 1))
			ret.right = that.id + ' right ' + hPad;
		else
			ret.right = vLines[col].id + ' left -' + hPad;

		if (line == (that.data.length - 1))
			ret.bottom = that.id + ' bottom -' + vPad;
		else
			ret.bottom = hLines[line].id + ' top -' + vPad;

		return ret;
	}

	//=======================================================
	//
	//=======================================================
	function addField(def, width)
	{
		if (def.type === 'text')
			return addTextWid(def, width);

		if (def.type === 'bar')
			return addBarWid(def, width);
	}

	//=======================================================
	//
	//=======================================================
	function addTextWid(def, width)
	{
		return that.add('text', {
			text: def.text,
			color: def.color || style.textColor,
			font: def.font || font,
			align: def.align
		});
	}

	//=======================================================
	//
	//=======================================================
	function addBarWid(def, width)
	{
		var bar = that.add('rect', {
			w: 0,
			h: barHeight,
			color: def.color
		});

		bar.transform({width: Math.round(width * def.percent / 100), rate: 1000});

		return bar;
	}

};
