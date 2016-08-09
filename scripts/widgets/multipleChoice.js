//======================================================
// Creates a bank of Kinetic Input boxes
//
// Arguments:
//	id
//	x, y, w
//
//	choices: array of choices {id: , answer: }
//	selected: Optional.  Currently selected option.  Defaults to no entry.
//	asset: Button icon asset
//	allowMulti: False: Single selection only (radio), True: Multiple selections allowed (check box)
//
// Style: (multipleChoice)
//	font: Text font
//	color: Text color
//  bgColor: Background color
//	borderColor: Border color
//	borderWidth: Width of border
//	hMargin: Space between border and options
//  vMargin: Space between border and options
//  selectColor: Color of text when hovered over
//	assetGap: Space between the multiple choice asset and the text
//	yAdjust: Amount to move the text vertically to align properly with the icons
//	hGap: Space between choices (if horizontal layout is used)
//	vGap: Space between choices (if vertical layout is used)
//
// @FIXME/dg: The backbone view and events were removed, but it still needs to be converted to a docked layout.
//            That should make the positioning logic much shorter and cleaner.
//======================================================
framework.widget.multipleChoice = function()
{
	var that = this;
	var style = app.style.multipleChoice;

	var widgets = [];
	var selections = initSelections();
	var canEdit = true;

	var widHeight, tallest;
	var box;
	var assetWidth = fw.assetWidth(that.asset);
	
	var hoverText = {
		inDelay: 0,
		outDelay: 0,
		inAction: hlText,
		outAction: normalText
	}

	var hoverIcon = {
		inDelay: 0,
		outDelay: 0,
		inAction: hlIcon,
		outAction: normalIcon
	}

	var idLen = (that.id + 'mci').length;

	//=======================================================
	// Hovering over text: highlight it
	//=======================================================
	function hlText(wid)
	{
		if (!canEdit)
			return;

		wid.color(style.selectColor);
	}

	//=======================================================
	// No longer hover over the text
	//=======================================================
	function normalText(wid)
	{
		wid.color(style.color);
	}

	//=======================================================
	// Hovering over the icon: highlight it
	//=======================================================
	function hlIcon(wid)
	{
		if (!canEdit)
			return;

		var frame = wid.frame();
		wid.frame(frame | 1);
	}

	//=======================================================
	// No longer hover over the icon
	//=======================================================
	function normalIcon(wid)
	{
		var frame = wid.frame();
		if (frame & 1)
			wid.frame(frame & (frame-1));
	}

	//=======================================================
	//
	//=======================================================
	function click(wid)
	{
		if (!canEdit)
			return;

		var id = wid.id.substring(idLen);
		buttonClick(id);
	}

	//=======================================================
	//
	//=======================================================
	function initSelections()
	{
		var selected = [];
		for (var i = 0; i < that.choices.length; i++)
			selected[i] = 0;

		if (that.allowMulti)	// Multiple selections
		{
			that.selected = that.selected || [];
			if (!_.isArray(that.selected))
				selected[that.selected] = 1;
			else
			{
				for (var i = 0; i < that.selected.length;  i++)
					selected[that.selected[i]] = 1;
			}
		}
		else	// Single selection only
		{
			that.selected = that.selected || -1;	// We need a default in this mode
			if (!_.isArray(that.selected))
				selected[that.selected] = 1;
			else
				selected[0] = 1;		// Give up on the array and just default to the first item
		}

		return selected;
	}

	//=======================================================
	// Main draw routine -- Always vertical now
	//=======================================================
	function drawChoices()
	{
		// Create all of the widgets
		createAll();
		createBox();
	}

	//=======================================================
	// Create a box around the input area
	//=======================================================
	function createBox()
	{
		var last = widgets.length - 1;

		box = that.add('rect', {
			borderColor: style.borderColor,
			borderWidth: style.borderWidth,
			depth: 1,
			color: style.bgColor,
			hidden: that.hidden
		}, {
			top: that.id + ' top',
			left: that.id + ' left',
			right: that.id + ' right',
			bottom: widgets[last].id + ' bottom ' + (style.vMargin + style.borderWidth)
		});
	}

	//=======================================================
	// Draw a single multiple choice entry
	//=======================================================
	function drawSingle(idx, textPos)
	{
		// Create the entry
		var txt = that.add('text', {
			id: that.id + 'mct' + idx,
			font: style.font,
			color: style.color,
			text: that.choices[idx].answer,
			//nowrap: true,
			type: 'multText',
			cursor: 'pointer',
			notify: true,
			depth: 2,
			hidden: that.hidden
		}, {
			top: idx === 0 ? (that.id + ' top ' + (style.borderWidth + style.vMargin)) : (widgets[2*(idx-1)+1].id + ' bottom ' + style.vGap),
			left: that.id + ' left ' + textPos

//			ofs: style.assetGap + ' ' + style.yAdjust
		});

		// Create the multiple choice icon
		var icon = that.add('image', {
			id: that.id + 'mci' + idx,
			image: that.asset,
			frame: selections[idx] === 1 ? 'On' : 'Off',
			type: 'mult',
			cursor: 'pointer',
			depth: 2,
			hidden: that.hidden
		}, {
			centery: txt.id + ' center',
			left: that.id + ' left ' + (style.borderWidth + style.hMargin)
		});

		icon.applyAction('hover', hoverIcon);
		icon.applyAction('click', {click:click});

		widgets.push(icon);
		widgets.push(txt);

		txt.applyAction('hover', hoverText);
		txt.applyAction('click', {click:click});
	}

	//=======================================================
	// Create all page widgets (hidden, for later placement)
	//=======================================================
	function createAll()
	{
		var textPos = style.borderWidth + style.hMargin + assetWidth + style.assetGap;

		// Draw all of the choices.
		for (var i = 0; i < that.choices.length; i++)
			drawSingle(i, textPos);
	}

	//=======================================================
	//=======================================================
	function setSelection(num)
	{
		if (that.allowMulti)
			selections[num] ^= 1;
		else
		{
			for (var i = 0; i < that.choices.length; i++)
				selections[i] = (i == num ? 1 : 0);
		}
	}

	//=======================================================
	// An option was clicked on
	//=======================================================
	function buttonClick(num)
	{
		setSelection(num);
		refreshIcons();
	}

	//=======================================================
	//=======================================================
	function refreshIcons()
	{
		var frame;
		for (var i = 0; i < that.choices.length; i++)
		{
			frame = selections[i] === 1 ? 'On' : 'Off';
			widgets[i*2].frame(frame);
		}
	}

	//=======================================================
	// Construct a master promise to conclude when all items
	// are finished drawing
	//=======================================================
	function setPromise()
	{
		var promiseList = [];

		$.each(widgets, function(idx, val) {
			if (val.promise)
				promiseList.push(val.promise);
		});

		if (promiseList.length)
			that.promise = $.when.apply($, promiseList);
		else
			that.promise = null;		// Technically not needed, but quicker than creating a new null Deferred
	}

	//=======================================================
	//=======================================================
	this.value = function()
	{
		return selections;
	}

	//=======================================================
	//
	//=======================================================
	this.showAnswer = function(answer)
	{
		for (var i = 0; i < selections.length; i++)
//			selections[i] = (answer.indexOf(i) !== -1) ? 1 : 0;
			// Determine correct choice by primary key, not by array position.
			// With server-side validation, choices are retrieved more than once: first for display, subsequently, for checking or displaying answer.  Since choices are returned in random order, an array index from a subsequent query may not match the one used for the original display.
			selections[i] = answer.indexOf(that.choices[i].id) !== -1 ? 1 : 0;

		refreshIcons();

		this.readOnly();
	}

	//=======================================================
	//
	//=======================================================
	this.showSolution = function(answer)
	{
		this.showAnswer(answer);
	}

	//=======================================================
	//
	//=======================================================
	this.readOnly = function()
	{
		canEdit = false;

		box.color(app.style.readOnlyColor).cursor('normal');
		$.each(widgets, function(idx, val) {
			val.cursor('normal');
		});
	}

	//=======================================================
	//
	//=======================================================
	this.allowInput = function()
	{
		canEdit = true;

		box.color(style.bgColor).cursor('action');
		$.each(widgets, function(idx, val) {
			val.cursor('action');
		});
	}

	//=======================================================
	// Reset for a new question
	//=======================================================
	this.clear = function()
	{
	}

	//=======================================================
	// Go into a compact read-only state
	//=======================================================
	this.cleanup = function()
	{
		// Don't do anything.  We're as compact as we'll ever be.
	}

	//=======================================================
	// We need a real-time height calculation
	//=======================================================
	this.height = function(h)
	{
		if (defined(h))
		{
			that.h = h;
			that.redock();
		}
		else
		{
			// This gets called before anything exists
			if (widgets.length == 0)
				return 0;

			that.h = box.height();

			return that.h;
		}
	}

	//=======================================================
	// We need a real-time width calculation
	// Only allows reading the width. It can't be set.
	//=======================================================
	this.width = function(newWidth)
	{
		// Setter
		if (typeof(newWidth) !== 'undefined') {
			for (var i = 1; i < widgets.length; i+=2) {
				var textPos = 2*style.borderWidth + 2*style.hMargin + assetWidth + style.assetGap;
				var _choiceWidth = newWidth - textPos;
				widgets[i].width(_choiceWidth);
			}

			that.w = newWidth;
		}
		// Getter
		else {

			if (!widgets.length)
				return 0;

			var max = 0;
			var maxIdx = 0;

			for (var i = 1; i < widgets.length; i+=2)
			{
				var w = widgets[i].width();
				if (w > max)
				{
					max = w;
					maxIdx = i;
				}
			}

			that.w = (widgets[maxIdx].x - that.x) + max + style.borderWidth + style.hMargin;

			return that.w;
		}
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		drawChoices();
		setPromise();
	}
}
