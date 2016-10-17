//======================================================
// Arguments:
//	id
//	x
//	y
//	w
//	h
//	collection: documented below (okay, it isn't yet.  The collection format was made as generic as possible, but this widget still needs to know more about the collection than it should.)
//	style: object: -- Or is this part of the collection?
//	columns: Number of data columns (does NOT include the header column)
//	headerWidth: Multiplier.  Width of the header column in relation to the data columns
//	page: Optional: Starting page (default: 0)
//
//  barAsset
//	minLinesPerGroup
//
// Style: (assignmentGrid)
//	font
//  headerFont
//  headerTextColor
//  barMargin: space between left and right edges and bar
//	vSpacing: space between cells
//	hSpacing: space between cells
//	lineHeight: height of each cell
//	textLeftMargin: left margin for text within cells
//	textTopMargin: left margin for text within cells
//======================================================
framework.widget.grid = function()
{
	var that = this;	// So functions can access 'this' without having to be 'call'ed
    var style = app.style.assignmentGrid;

    var page = that.page || 0;	// Later, validate page number
    var barHeight = fw.assetHeight(that.barAsset);

    // Calculate the layout based on the stage size and passed parameters
    var layout = getLayout();

    createCells();

	that.cmd('grid'+page, 'show');

	var oldData = that.collection.toJSON();

	// For sliding animation
	var motion;
	var animInterval;
	var tip = null;

	//=======================================================
	// Returns data about the cell clicked on
	//=======================================================
	function cellInfo(id)
	{
		var regex = /cell([0-9]+)-([0-9]+)/i;
		var match = id.match(regex);
		var ch = parseInt(match[1], 10) + 1;	// Should be group, index NOT chapter, assignment.
		var as = parseInt(match[2], 10) + 1;	// They are the same, but this module shouldn't know that.

		return [ch, as];
	}

    //=======================================================
	// Grid View -- For capturing events
    //=======================================================
    var gridView = Backbone.View.extend({
	    el: that.container,

	    events: {
        "touchstart .cell": 'click',
        "click .cell" : 'click',
			  "mouseenter .cell" : 'hover',
			  "mouseleave .cell" : 'stopHover'
	    },

	    click: function(ev) {
        ev.preventDefault();
				var info = cellInfo(ev.target.id);
				app.container.trigger('choose', info);
//		  alert("chapter " + info[0] + ", assignment " + info[1]);
	    },

	    hover: function(ev) {
				// This is a bit hacky, but if we are hovering over text instead of a rectangle, we'll
				// get the "B" version of the ID.  Strip off the "B" in that case.
				var id = ev.target.id;
				if (id.charAt(id.length-1) == 'B')
					id = id.substr(0, id.length-1);

				// Set a border as a hover highlight
				that.cmd('grid'+page + '/' + id, "borderWidth", 1);

				// Tooltip
				var info = cellInfo(ev.target.id);
				var text = that.ttText(info[0], info[1]);
				that.tooltip.text = text;
				that.tooltip.x = that.getWidget('grid'+page+'/'+id).x;
				that.tooltip.y = that.getWidget('grid'+page+'/'+id).y;
				that.tooltip.parentHeight = style.lineHeight;
				tip = that.add('tooltip', that.tooltip);
	    },

	    stopHover: function(ev) {
			// This is a bit hacky, but if we are hovering over text instead of a rectangle, we'll
			// get the "B" version of the ID.  Strip off the "B" in that case.
			var id = ev.target.id;
			if (id.charAt(id.length-1) == 'B')
				id = id.substr(0, id.length-1);

			// Clear the hover highlight
			that.cmd('grid'+page + '/' + id, "borderWidth", 0);

			if (tip)
			{
				tip.terminate();
				tip = null;
			}
	    }
    });

    var view = new gridView();

    //=======================================================
    // Draws a bar between groups
    //=======================================================
    function drawBar(pg, y)
    {
	    // Top bar
	    /*
			fw.drawRect({
			x: that.x + style.barMargin,
			y: y,
			w: that.w - (style.barMargin * 2),
			h: barHeight,
			color: style.barColor,
	    });

	    return barHeight;
	    */

	    that.cmd('grid'+pg, 'add', 'image', {
			image: that.barAsset,
			x: that.x + style.barMargin,
			y: y,
			w: that.w - (style.barMargin * 2),
			repeat: 'x',
			hidden: true
	    });

		return barHeight;
    }

    //=======================================================
    // Draw the group header box
    //=======================================================
    function drawHeaderBox(pg, idx, boxX, boxY)
    {
		return layout.groupHeights[idx] - barHeight;	// Move calc. to layout?
    }

    //=======================================================
    // Draws the header text, vertically centered
    //
    // @FIXME/dg: Get all the magic numbers out of here!
    //=======================================================
    function drawHeadText(pg, idx, x, y, grpHt)
    {
		var item = that.collection.at(idx);
		var name = (idx+1) + ": " + item.get('name');
		var id = 'hTxt' + pg + '-' + idx;

		// Chapter Number
		// Draw hidden to begin with, so it can be centered later
	    var num = that.cmd('grid'+pg, 'add', 'text', {
			id: id,
			x: x+6,
			y: y,
			text: idx+1,
			font: style.headerFont,
			color: style.headerTextColor || 'black',
			align: 'left',	// Should load from the style
			hidden: true
		});

		// Vertically center by fetching the height and modifying the y position
		var ht = num.height();
		num.adjustPos(0, (grpHt - ht) / 2);

		// Title
	    var title = that.cmd('grid'+pg, 'add', 'text', {
			id: id + "B",
			x: x + 28,
			y: y,
			text: item.get('name'),
			font: style.headerFont,
			color: style.headerTextColor || 'black',
			align: 'left',	// Should load from the style
			w: layout.headerWidth - 30,	// Subtract an arbitrary amount to prevent crowding
			hidden: true
		});

		// Vertically center by fetching the height and modifying the y position
		ht = title.height();
		title.adjustPos(0, (grpHt - ht) / 2);
	}

	//=======================================================
	// Draw a single cell
	//=======================================================
	function drawOneCell(pg, group, idx, x, y, data)
	{
		var cellStyle = data[idx].status;
		var text = data[idx].name;

		// Header rectangle
		var color = that.colors[cellStyle][0];
	    that.cmd('grid'+pg, 'add', 'rect', {
			id: 'cell' + group + '-' + idx,
			type: 'cell',
			x: x,
			y: y,
			w: layout.boxWidth,
			h: style.lineHeight,
			color: color,
			cursor: 'pointer',
			hidden: true
		});

		// Text
		color = that.colors[cellStyle][1];
	    that.cmd('grid'+pg, 'add', 'text', {
			id: 'cell' + group + '-' + idx + 'B',
			type: 'cell',
			x: x + style.textLeftMargin,
			y: y + style.textTopMargin,
			text: text,
			font: style.font,
			color: color,
			w: layout.boxWidth - style.textLeftMargin,	// To prevent overflow
			nowrap: true,
			cursor: 'pointer',
			hidden: true
		});
    }

    //=======================================================
    // Draw all of the data cells for a group
    //=======================================================
    function drawCells(pg, group, x, y)
    {
		x += layout.headerWidth;
		y += style.vSpacing;

		var data = that.collection.at(group).get('data');
		var xCur = x;
		var col = 0;

		for (var i = 0; i < data.length; i++)
		{
			drawOneCell(pg, group, i, xCur, y, data);

			// Update vars
			if (++col >= that.columns)
			{
				xCur = x;
				y += style.lineHeight + style.vSpacing;
				col = 0;
			}
			else
				xCur += layout.colWidth;
		}
    }

    //=======================================================
    // Draw a group
    //=======================================================
    function drawGroup(pg, idx, x, y)
    {
		// Header box
		var grpHt = drawHeaderBox(pg, idx, x, y);

		// Header text
		drawHeadText(pg, idx, x, y, grpHt);

		// Data cells
		drawCells(pg, idx, x, y);

		return grpHt;
    }

    //=======================================================
    // Find the starting group for a given page
    //=======================================================
    function getPageIdx(pg)
    {
		var idx = 0;

		for (var i = 0; i < pg; i++)
			idx += layout.groupCnt[i];

		return idx;
    }

    //======================================================
    // Construct all the cells
    //======================================================
    function createCells()
    {
		for (var pg = 0; pg < layout.groupCnt.length; pg++)
		{
			var x = that.x;
			var y = that.y;

			// Create containers for the cells and everything else.
			// IDs are hard-coded.  This prevents multiple grids on a page.
			that.add('group', {id: 'grid'+pg, x: x, y: y});

			var startIdx = getPageIdx(pg);

			for (var i = 0; i < layout.groupCnt[pg]; i++)
			{
				y += drawBar(pg, y);
				y += drawGroup(pg, i + startIdx, x, y);
			}

			// Trailing bar
			drawBar(pg, y);
		}
    }

    //======================================================
    // Number of lines in each grouping
    //======================================================
    function getGroupLineCounts(lay)
    {
		lay.groupLines = [];
		that.collection.each(function(item) {
			var cnt = Math.ceil(item.get('data').length / that.columns) || 1;	// If there are no data items, still take up 1 line
			if (cnt < that.minLinesPerGroup)
				cnt = that.minLinesPerGroup;

			lay.groupLines.push(cnt);
		});
    }

    //======================================================
    // Height of each grouping
    //======================================================
    function getGroupHeights(lay)
    {
		lay.groupHeights = [];
		for (var i = 0; i < that.collection.size(); i++)
		{
			// Top bar + all lines
			var ht = barHeight + style.lineHeight * lay.groupLines[i];
			// Add in spacing between lines (also exists above and below top and bottom lines)
			ht += (lay.groupLines[i]+1) * style.vSpacing;
			lay.groupHeights.push(ht);
		}
    }

    //=======================================================
    // Number of groups on each page (varies because the size varies)
    //=======================================================
    function getGroupsOnEachPage(lay)
    {
		var htUsed = 0 + barHeight;	// There is one more bar per page than there are groups
		var groupCnt = 0;
		var pg = 0;

		lay.groupCnt = [];
		for (var i = 0; i < that.collection.size(); i++)
		{
			htUsed += lay.groupHeights[i];

			if (htUsed > that.h)
			{
				lay.groupCnt[pg++] = groupCnt;
				groupCnt = 0;
				htUsed = barHeight + lay.groupHeights[i];
			}

			groupCnt++;
		}

		// Save the last page
		lay.groupCnt[pg] = groupCnt;
    }

    //======================================================
    // Calculate the layout based on the stage size and passed parameters
    //======================================================
    function getLayout()
    {
		var lay = {};

		var cols = that.columns + that.headerWidth;	// Total number of columns, from a width standpoint
		lay.colWidth = Math.floor(that.w / cols);
		lay.boxWidth = lay.colWidth - style.hSpacing;	// Width of each box
		lay.headerWidth = Math.floor(lay.colWidth * that.headerWidth);

		getGroupLineCounts(lay);	// Number of lines in each grouping
		getGroupHeights(lay);		// Height of each grouping
		getGroupsOnEachPage(lay);

		return lay;
    }

    //======================================================
    //======================================================
	function redraw()
	{
		that.cmd('grid'+page, 'show');
	}

    //======================================================
    //======================================================
	this.prevPage = function()
	{
		if (page > 0)
		{
			that.cmd('grid'+page, 'hide');

			page--;
			redraw();
		}
	}

    //======================================================
    //======================================================
	this.nextPage = function()
	{
		if (layout.groupCnt[page+1] > 0)
		{
			that.cmd('grid'+page, 'hide');

			page++;
			redraw();
		}
	}

    //======================================================
    //======================================================
	this.canPageBackward = function()
	{
		return (page > 0);
	}

    //======================================================
    //======================================================
	this.canPageForward = function()
	{
		return (layout.groupCnt[page+1] > 0);
	}

    //======================================================
	// The collection was updated externally, but the reference
	// should still be valid.
    //======================================================
	this.update = function()
	{
		// Only update if the data has changed.  Updating is SLOW!
		var newData = that.collection.toJSON();
		if (_.isEqual(newData, oldData))
			return;
		oldData = newData;

		// Delete all widgets
		for (var pg = 0; pg < layout.groupCnt.length; pg++)
			that.getWidget('grid'+pg).terminate();

		// Remove any left-over tooltips
		if (tip)
		{
			tip.terminate();
			tip = null;
		}

		// Recreate widgets
		layout = getLayout();
		createCells();
		that.cmd('grid'+page, 'show');
	}

	//=======================================================
	//=======================================================
	this.terminateSelf = function()
	{
		view.undelegateEvents();
		delete(view);
	}
};
