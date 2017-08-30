//===============================================================================
//	search widget
//===============================================================================
framework.widget.assignmentList = function()
{
	var that = this;
	var style = app.style.assignmentList;

	var FILTER_GRADED_DAYS = 5;		// Assignments that are past due less than this number of days ago will show up with the Recently Graded filter
	var FILTER_CURRENT_DAYS = 3;	// Assignments that will be past due in less than this number of days will show up with the Current Assignments filter

	var isPercent = false;
	var lines = [];
	var assignmentData, assignmentList;

	var headingBackground;

	var todayMs,
		currentCutoff,
		gradedCutoff;

	var typeMap = {
		quiz: 'Quiz',
		test: 'Test',
		homework: 'Homework',
		quickcheck: 'Quickcheck',
		quizboard: 'Quizboard',
		practice: 'i-Practice',
		ihomework: 'i-Practice'
	};

	var fields = [
		{ id: 'name', text: 'Assignment Name', w: style.assignmentNameWidth, ofs: style.leftMargin, headAlign: 'left' },
		{ id: 'dateAssigned', text: 'Assigned', w: style.dateAssignedWidth },
		{ id: 'dateDue', text: 'Due Date', w: style.dateDueWidth },
		{ id: 'type', text: 'Type', w: style.assignmentTypeWidth },
		{ id: 'score', text: 'Score', w: style.gradeWidth, color: style.scoreColor, pointer: 'pointer' },
		{ id: 'icon', text: 'Note', w: style.iconWidth }
	];

	//=======================================================
	//
	//=======================================================
	function daysMs(n) {
		return 1000*3600*24*n;
	}

	//=======================================================
	// Convert from internal type to display type
	//=======================================================
	function transformType(t)
	{
		if (typeMap[t])
			return typeMap[t];

		t = t[0].toUpperCase() + t.slice(1);
		return t;
	}

	//=======================================================
	// Add all of the entries to the container
	//=======================================================
	function drawData()
	{
		lines = [];
		assignmentList.reset();

		that.collection[0] && setRefDates(that.collection[0]);

		_.each(that.collection, drawLine);
		lines.length && _.last(lines).addBottomBar();
	}

	//=======================================================
	// @FIXME/dg: SLOW!
	//=======================================================
	function drawLine(record, idx)
	{
		var due = app.localTime(record.get('due'));

		// @FIXME/dg: This takes more time as it progresses!
		// I think it's just the DOM filling up.
		var prob = assignmentList.add('assignmentListLine', {
			idx: idx,
			w: that.w - style.rightMargin,
			minHeight: style.minHeight,

			assigned: app.localTime(record.get('assigned')),
			name: record.get('name'),
			desc: record.get('desc'),
			//type: transformType(record.get('type')),
			type: app.translateType(record.get('type')),
			due: due,
			pastDue: record.get('pastdue'),
			score: parseInt(record.get('score')),
			asId: record.get('id'),
			maxscore: parseInt(record.get('maxscore')),

			click: that.click
		});

		// Relatively quick (~1ms)
		assignmentList.addItem(prob);

		lines.push(prob);
	}

	//=======================================================
	// Set today, current cutoff, and recent cutoffs
	//
	// Note that this is using the server time from the last
	// transmission, which occurs when the page is drawn.
	//
	// @FIXME/dg: This may not work properly in all browsers.
	// Particularly, DST may not work properly in all cases.
	// Other date code was updated, but not this.
	//=======================================================
	function setRefDates(firstModel)
	{
		var re = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
			var servertime = firstModel.get('servertime') || new Date();
			var todayStr = servertime.toString();
		var match = todayStr.match(re);
		var today = new Date();
		var offsetMs = today.getTimezoneOffset() * 60 * 1000;
			if (match) {
		today.setFullYear(match[1]);
		today.setMonth(match[2]-1);
		today.setDate(match[3]);
		today.setHours(match[4]);
		today.setMinutes(match[5]);
		today.setSeconds(match[6]);
			}
			else {
					today.setFullYear(servertime.getFullYear());
					today.setMonth(servertime.getMonth());
					today.setDate(servertime.getDate());
					today.setHours(servertime.getHours());
					today.setMinutes(servertime.getMinutes());
					today.setSeconds(servertime.getSeconds());
			}

		todayMs = Date.parse(today.toString());	// Server time (GMT) in milliseconds (since 1980 or somesuch).
		todayMs -= offsetMs;					// DG: Convert to local time, since that is what we compare against.

		currentCutoff = todayMs + daysMs(FILTER_CURRENT_DAYS);
		gradedCutoff = todayMs - daysMs(FILTER_GRADED_DAYS);
	}

	//=======================================================
	// Actually filters out quickchecks, but shows all OHW
	//=======================================================
	function noFilter(record, idx)
	{
		return (record.get('type') !== 'quickcheck');
	}

	//=======================================================
	// Show only current assignments; i.e., those whose due
	// dates are within a specified interval of today.
	//=======================================================
	function currentFilter(record, idx) {
		var due = record.get('due') || '';
		var dueDate = app.getJSDate(due);
		var dueMs = Date.parse(dueDate.toString());

		if (dueMs >= todayMs && dueMs <= currentCutoff)
			return true;

		return false;
	}

	//=======================================================
	//
	//=======================================================
	function recentFilter(record, idx) {
		var due = record.get('due') || '';
		var dueDate = app.getJSDate(due);
		var dueMs = Date.parse(dueDate.toString());

		if (dueMs < todayMs && dueMs >= gradedCutoff)
			return true;

		return false;
	}

	//=======================================================
	//
	//=======================================================
	function drawHeadings() {
		headingBackground = that.add('rect', {
			w: that.width() - style.rightMargin,
			h: style.headerHeight,
			color: style.headerColor,
		}, {
			top: that.id + ' top ',
			left: that.id + ' left '
		});

		var wid = headingBackground;
		var widList = {};

		$.each(fields, function(idx, val) {

			var color = val.color || style.qHeadingColor;

			wid = that.add('text', {
				text: val.text,
				align: defined(val.headAlign) ? val.headAlign : 'center',
				font: style.qHeadingFont,
				w: val.w,
				color: color,
				cursor: val.pointer	// May be undefined, which is fine
			}, {
				wid: wid,
				my: 'center left',
				at: idx === 0 ? 'center left' : 'center right',
				ofs: defined(val.ofs) ? (val.ofs + style.borderWidth) + ' 0' : undefined
			});

			widList[val.id] = wid;
		});

		// Assign a toggler
		widList.score.applyAction('click', {
			click: setScoreMode
		});
	}

	//=======================================================
	//
	//=======================================================
	function createContainer()
	{
		// Create a garbage rectangle that is only used to attach a border to
		var backdrop = that.add('rect', {
			color: 'white',
			hidden: true
		}, {
			top: that.id + ' top',
			bottom: that.id + ' bottom',
			left: that.id + ' left',
			right: that.id + ' right -' + style.rightMargin
		});

		// Create the actual container
		assignmentList = that.add('pagedCollection', {
			bgColor: 'white',
			buttonAsset: 'TOCArrows',
			buttonFrames: ['Down', 'Up'],
			buttonOffset: [style.pageButtonOffsetX, style.pageButtonOffsetY],
			buttonGap: style.pageButtonGap,
			gap: style.unitGap,
			topMargin: style.sectionTopGap,
			bottomMargin: style.sectionBottomGap,
			borderWidth: style.borderWidth,
			borderColor: style.headerColor
		},
		{
			top: headingBackground.id + ' bottom ',
			bottom: that.id + ' bottom',
			left: that.id + ' left',
			right: that.id + ' right -' + style.rightMargin
		});

		

		// Add a shadow border
		// that.add('border8', {
		// 	target: backdrop,
		// 	images: {
		// 		t: 'WBShadowT', b: 'WBShadowB', l: 'WBShadowL', r: 'WBShadowR',
		// 		tl: 'WBShadowTL', bl: 'WBShadowBL', tr: 'WBShadowTR', br: 'WBShadowBR'
		// 	}
		// });
	}


	//=======================================================
	//=======================================================
	function setScoreMode()
	{
		isPercent = !isPercent;
		$.each(lines, function(idx, val) {
			val.setScoreMode(isPercent);
		});

	}

//===============================================================================
// User API
//===============================================================================

	//=======================================================
	// Remove filter
	//=======================================================
	this.allAssignments = function()
	{
		if (assignmentData)
		{
			that.collection = assignmentData.filter(noFilter);
			drawData();
		}
	}

	//=======================================================
	// Current assignment filter
	//=======================================================
	this.currentAssignments = function()
	{
		if (assignmentData)
		{
			that.collection = assignmentData.filter(currentFilter);
			drawData();
		}
	}

	//=======================================================
	// Recently graded filter
	//=======================================================
	this.recentlyGraded = function()
	{
		if (assignmentData)
		{
			that.collection = assignmentData.filter(recentFilter);
			drawData();
		}
	}

	//=======================================================
	//
	//=======================================================
	this.setData = function(data)
	{
		assignmentData = data;
		that.allAssignments();
	}

//===============================================================================
// Standard widget API
//===============================================================================

	//=======================================================
	// Called after the widget has been docked
	//=======================================================
	this.docked = function()
	{
		drawHeadings();

		//assignments();
		createContainer();
	}

};
