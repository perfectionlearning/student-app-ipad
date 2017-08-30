//=============================================================================
// A single column of text, with highlight and selection capabilities
//
//  id
//  x
//  y
//	text: []
//  font
//	textColor
//  hoverColor: color of text when the mouse is over it
//  highlightColor: color of text after it has been clicked
//  hoverBarColor: [optional] Color of the bar that appears when an item is hovered over
//	margin: Vertical margin between entries
//  click: callback for entry click
//  fadeTime: [Optional] Time it takes for text to fade in.  0 to disable.
//
// Style: (textColumn)
//=============================================================================
framework.widget.textColumn = function()
{
	var that = this;
//	var style = app.style.textColumn;

	var widgets = [];
	var activeItem = -1;
	var bar, dockLeft, dockRight;		// Hover bar widget, if one is requested

	var fadeTime = defined(that.fadeTime) ? that.fadeTime : 800;	// Default time, if none is specified

	var hasHeaders = _.some(that.text, isHeader);

	drawColumn();
	createBar();

	//=======================================================
	//
	//=======================================================
	function isHeader(val)
	{
		return val[0] === '!';
	}

	//=======================================================
	//
	//=======================================================
	function isHidden(val)
	{
		return val[0] === '?';
	}

	//=======================================================
	// Draw the lines of text
	//=======================================================
	function drawColumn()
	{
		var y = that.y;
		var width = 0;

		// Determine whether there are any headers
		var normalX = hasHeaders ? (that.x + that.headerMargin) : that.x;
		var normalW = hasHeaders ? (that.w - that.headerMargin) : that.w;

		var normalCnt = 0;
		$.each(that.text, function(idx, val) {

			if (isHeader(val))
			{
				var id = (that.activeHeaders ? normalCnt++ : undefined);
				var line = drawHeader(that.x, y, that.w, val.substring(1), id);
			}
			else if (!isHidden(val))
				line = drawNormal(normalX, y, normalW, val, normalCnt++);
			else
				return true;

			var h = line.height();
			y += h + that.margin;

			var lw = line.width();
			if (lw > width)
				width = lw;

			if (fadeTime > 0)
				line.fadeIn(fadeTime);
			else
				line.show();
		});

		if (!defined(that.h))
			that.h = y - that.y - that.margin;	// Keep track of the total height

		if (!defined(that.w))
			that.w = width;
	}

	//=======================================================
	// Draw a normal list entry (as opposed to a header)
	//=======================================================
	function drawNormal(x, y, w, text, id)
	{
		var line = that.add('text', {
			data: id,
			x: x,
			y: y,
			w: w,
			text: text,
			font: that.font,
			color: that.textColor,
			cursor: 'pointer',
			type: that.id + '_textCol',
			depth: that.depth,
			hidden: true
		});

		widgets.push(line);
		attachEvents(line);

		return line;
	}

	//=======================================================
	// Draw a header list entry, using different formatting
	//=======================================================
	function drawHeader(x, y, w, text, id)
	{
		var def = {
			data: id,
			x: x,
			y: y,
			w: w,
			text: text,
			font: that.headerFont,
			color: that.headerColor,
			depth: that.depth,
			hidden: true
		};

		if (that.activeHeaders)
			def.cursor = 'pointer';

		var line = that.add('text', def);

		if (that.activeHeaders)
		{
			widgets.push(line);
			attachEvents(line);
		}

		return line;
	}

	//=======================================================
	//
	//=======================================================
	function attachEvents(wid)
	{
		// Bind click behavior
		wid.applyAction('click', {click: clicked});

		// Bind hover behavior
		wid.applyAction('hover', {
			inAction: hover,
			outAction: stopHover
		});
	}

	//=======================================================
	// Hover event handler
	//=======================================================
	function hover(wid)
	{
		var idx = wid.data;

		// Switch to the hover color, unless this is the currently highlighted item
		if (idx !== activeItem && widgets[idx])
		{
			widgets[idx].color(that.hoverColor);

			if (bar)
			{
				var wid = widgets[idx].id;
				fw.dock(bar, {
					top: wid + ' top',
					bottom: wid + ' bottom',
					left: wid + dockLeft,
					right: wid + dockRight,
				});

				bar.show();
			}
		}
	}

	//=======================================================
	// Hover End event handler
	//=======================================================
	function stopHover(wid)
	{
		var idx = wid.data;

		// Reset to normal text color, unless it's the currently highlighted item
		if (idx !== activeItem && widgets[idx])
			widgets[idx].color(that.textColor);

		bar && bar.hide();
	}

	//=======================================================
	// Click event handler
	//=======================================================
	function clicked(wid)
	{
		var idx = wid.data;

		if (idx !== activeItem)
		{
			that.setSelection(idx);
			that.click && that.click(idx);
		}
	}

	//=======================================================
	//
	//=======================================================
	function createBar()
	{
		if (defined(that.hoverBarColor))
		{
			bar = that.add('rect', {
				x: 0,
				w: 0,
				color: that.hoverBarColor,
				depth: that.depth-1,
//				type: 'noevents'
//				hidden: true
			});
		}

		// Precalculate bar dock strings
		dockRight = ' right ' + that.hoverBarXMargin;

		// If we have headers, subitems are generally indented.  Adjust the bar docking to compensate.
		if (hasHeaders)
			dockLeft = ' left -' + (that.hoverBarXMargin + that.headerMargin);
		else
			dockLeft = ' left -' + that.hoverBarXMargin;
	}

	//=======================================================
	// Set the currently selected item (normally only set by clicking)
	//=======================================================
	this.setSelection = function(item)
	{
		if (activeItem > -1)
			widgets[activeItem].color(that.textColor);

		activeItem = item;
		widgets[item] && widgets[item].color(that.highlightColor);

		bar && bar.hide();
	}

	//=======================================================
	//=======================================================
	this.linePos = function(line)
	{
		return widgets[line].getPos();
	}

};