//=============================================================================
// Creates a box that scales and translates between two states
//
// @FIXME/dg: This desperately needs to be rewritten!
//
// Arguments:
//  id
//  x
//  y
//	box: Object with arguments for the box widget
//	menu: Object with arguments for the menu widget
//=============================================================================
framework.widget.explodingMenu = function()
{
	var that = this;
	var isQuitting = false;
	var isBoxClosed = false;
	var isMenuClosed = false;
	var isTerminated = false;

	var bgDepth = fw.TOP+9;
	var boxDepth = fw.TOP+10;
	var menuDepth = fw.TOP+12;	// Needs to be at least 2 greater than boxDepth

	// Copy layout data from the parent
	that.menu.isSlave = that.box.isSlave = true;
	that.menu.id = 'expMenu';		// An ID without any numbers is required

	that.menu.callback = {
		clicked: function() { that.close() },
		closed: menuClosed
	};

	that.box.callback = {
		ready: boxReady,
		closed: boxClosed
	};

	var bg, menu, box;
	drawMenu();		// Draw the menu BEFORE docking.  The position doesn't matter, but we need the size

	//=======================================================
	// Draw the darkened background plane
	//=======================================================
	function drawBG()
	{
		// Create the background rectangle
		var sSize = fw.stageSize();

		bg = that.add('rect', {
			id: that.id + 'bg',
			x: 0,
			y: 0,
			w: sSize[0],
			h: sSize[1],
			color: 'black',
			alpha: 0,			// Alpha is okay here
			depth: bgDepth,	// Hacky -- The exploding box uses fw.FORE, so go under it.  It should really be settable.
			type: 'backdrop',
			container: app.container
		});

		bg.applyAction('click', {
			click: that.close
		});

		bg.fadeIn(that.fadeInRate, 0.66);
	}

	//=======================================================
	// The box is done expanding
	//=======================================================
	function boxReady()
	{
		if (isQuitting)	// Prevent the menu from appearing if it hasn't already
			return;

		menu.appear();
	}

	//=======================================================
	// The box is closed
	//=======================================================
	function boxClosed()
	{
		isBoxClosed = true;
		if (isMenuClosed || !defined(menu))
			closed();
	}

	//=======================================================
	// The menu is closed
	//=======================================================
	function menuClosed()
	{
		isMenuClosed = true;
		if (isBoxClosed)
			closed();
	}

	//=======================================================
	// The box is done expanding
	//=======================================================
	function drawMenu()
	{
		// Create menu
		that.menu.depth = menuDepth;
		menu = that.add('menu', that.menu);
	}

	//=======================================================
	// Draw the exploding box
	//=======================================================
	function drawBox()
	{
		box = that.add('explodingBox', that.box);
		box.docked();
	}

	//=======================================================
	//=======================================================
	function closed()
	{
		if (!isTerminated)
			that.terminate();	// Delete self
	}

	//=======================================================
	//=======================================================
	this.close = function()
	{
		// Prevent reentrance
		if (!isQuitting && !isTerminated)
		{
			box.close();
			bg.fadeOut(that.menu.fadeOut);	// Should probably fade at a different rate since it's not fully opaque
			menu && menu.close();		// Make sure it has been created

			isQuitting = true;
		}
	}

	//=======================================================
	// Used for docking.  Returns the menu size, not the slightly larger box size
	//=======================================================
	this.height = function()
	{
		return menu.height();
	}

	//=======================================================
	// Used for docking.  Returns the menu size, not the slightly larger box size
	//=======================================================
	this.width = function()
	{
		return menu.width();
	}

	//=======================================================
	//=======================================================
	this.terminateSelf = function()
	{
		isTerminated = true;
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		drawBG();

		that.box.x = menu.x - that.box.borderWidth;
		that.box.y = that.y - that.box.borderWidth;
		that.box.w = menu.width();// + that.box.borderWidth * 2;
		that.box.h = menu.height();// + that.box.borderWidth * 2;

		that.box.depth = boxDepth;
		drawBox();
	}
};
