//======================================================
// Arguments:
//  buttons: array of arrays, one per row [[{asset: , frame: , tip:}],[]]
//  tipPos: dockString -- dockString can be: "T", "B", "L", "R", "TL", "TR", "BL", "BR" -- Default is TR
//  tipOfs: [x,y] -- Default is [4,4]
//  tipDelay: time in ms, defaults to 0
//======================================================
framework.widget.buttonGrid = function()
{
	var that = this;
	var style = app.style.buttonGrid;

	var defaultOfs = [4,4];

	//=======================================================
	// Draws the grid
	//=======================================================
	function drawButtons()
	{
		for (var rowIdx = 0; rowIdx < that.buttons.length; rowIdx++)
		{
			var row = that.buttons[rowIdx];

			for (var colIdx = 0; colIdx < row.length; colIdx++)
			{
				var button = row[colIdx];

				// Dock to the right of the previous button, or the left edge of the widget itself
				var leftDock = (colIdx === 0) ?
					(that.id + ' left') :
					(row[colIdx-1].wid.id + ' right ' + style.hPadding);

				// Dock to the bottom of the previous button, or the top edge of the widget itself
				var topDock = (rowIdx === 0) ?
					(that.id + ' top') :
					(that.buttons[rowIdx-1][0].wid.id + ' bottom ' + style.vPadding);

				// Create the button
				button.wid = that.add('button', {
					image: button.asset,
					frame: button.frame,
					keypadButton: true,
					text: button.text,
					font: that.font,		// Only used if button.text is set
					color: that.color,		// Only used if button.text is set
					name: button.name,		// Used as an ID
					click: that.click,
					tip: {
						text: button.tip,
						pos: that.tipPos || 'TR',
						ofs: that.tipOfs || defaultOfs,
						delay: that.tipDelay || 0
					},
					depth: that.depth,
					hidden: that.hidden
				}, {
					top: topDock,
					left: leftDock
				});
			}
		}

		// At this point, 'button' contains the bottom right button
		// It's possible that one of the others extended further right, but we'll ignore that
		// possibility for now.
		that.w = button.wid.x + button.wid.width() - that.x;
		that.h = button.wid.y + button.wid.height() - that.y;
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		drawButtons();
//		console.log(that.x, that.y, that.w, that.h);
	}
};
