//=============================================================================
// Displays info about a class
//
//  id
//  x, y
//  hidden (optional)
//  depth (optional)
//  data: {id:, name:, teacher:, section:}
//  active: true if currently active
//
// Style (classDisplay)
//
//=============================================================================
framework.widget.classDisplay = function()
{
	var that = this;
	var style = app.style.classDisplay;

	var name, teacher, section, border;

	var depth = that.depth || 0;
	var cursor = that.active ? null : 'pointer';

	drawAll();
	attachEvents();

	//=======================================================
	//=======================================================
	function drawAll()
	{
		drawName();
		drawTeacher();
		drawSection();
		drawBorder();
	}

	//=======================================================
	//
	//=======================================================
	function drawName()
	{
		name = that.add('text', {
			text: that.data.name,
			font: style.nameFont,
			color: that.active ? style.activeNameColor : style.nameColor,
			cursor: cursor,
			depth: depth+1,
			hidden: that.hidden
		},{
			top: that.id + ' top ' + style.vMargin,
			left: that.id + ' left ' + style.hMargin,
			right: that.id + ' right -' + style.hMargin
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawTeacher()
	{
		teacher = that.add('text', {
			text: '<b>Teacher:</b> ' + that.data.teacher,
			font: style.teacherFont,
			color: that.active ? style.activeTeacherColor : style.teacherColor,
			cursor: cursor,
			depth: depth+1,
			hidden: that.hidden
		},{
			top: name.id + ' bottom ' + style.gap,
			left: that.id + ' left ' + style.hMargin,
			right: that.id + ' right -' + style.hMargin
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawSection()
	{
		section = that.add('text', {
			text: '<b>Section:</b> ' + (that.data.section || 'n/a'),
			font: style.sectionFont,
			color: that.active ? style.activeSectionColor : style.sectionColor,
			cursor: cursor,
			depth: depth+1,
			hidden: that.hidden
		},{
			top: teacher.id + ' bottom ' + style.gap,
			left: that.id + ' left ' + style.hMargin,
			right: that.id + ' right -' + style.hMargin
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawBorder()
	{
		border = that.add('rect', {
			borderWidth: style.borderWidth,
			borderColor: style.borderColor,
			borderRadius: style.borderRadius,
			color: that.active ? style.activeBgColor : style.bgColor,
			cursor: cursor,
			depth: depth,
			hidden: that.hidden
		}, {
			top: that.id + ' top',
			bottom: section.id + ' bottom ' + style.vMargin,
			left: that.id + ' left',
			right: that.id + ' right'
		});

		that.h = border.height();
	}

	//=======================================================
	//
	//=======================================================
	function attachEvents()
	{
		// Bind click behavior
		that.applyAction('click', {click: clickHandler});

		// Bind hover behavior
		that.applyAction('hover', {
			inAction: hover,
			outAction: stopHover
		});
	}

	//=======================================================
	//=======================================================
	function clickHandler()
	{
		if (that.active)
			return;

		that.callback(that.data.id);
	}

	//=======================================================
	//
	//=======================================================
	function hover()
	{
		if (that.active)
			return;

		border.color(style.hoverColor);
	}

	//=======================================================
	//
	//=======================================================
	function stopHover()
	{
		if (that.active)
			return;

		border.color(that.active ? style.activeBgColor : style.bgColor);
	}

	//=======================================================
	//=======================================================
	this.activate = function()
	{
		that.active = true;

		name.color(style.activeNameColor).cursor('normal');
		teacher.color(style.activeTeacherColor).cursor('normal');
		section.color(style.activeSectionColor).cursor('normal');
		border.color(style.activeBgColor).cursor('normal');
	}

	//=======================================================
	//=======================================================
	this.deactivate = function()
	{
		that.active = false;

		name.color(style.nameColor).cursor('action');
		teacher.color(style.teacherColor).cursor('action');
		section.color(style.sectionColor).cursor('action');
		border.color(style.bgColor).cursor('action');
	}

	//=======================================================
	// Get/set width
	//=======================================================
	this.width = function(w)
	{
		if (defined(w))
		{
			that.w = w;

			// Redock all children
			name.redock();
			teacher.redock();
			section.redock();
			border.redock();
		}

		return that.w;
	}

};