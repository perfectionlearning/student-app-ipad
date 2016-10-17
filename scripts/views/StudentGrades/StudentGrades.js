//===============================================================================
// Simple view that shows preferences
//===============================================================================
;(function() {

	var vw = app.Views.StudentGrades = {};
	var assignmentTypes, chartData = [];
	
	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container)
	{
		app.router.navigate('studentGrades');

		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true}), drawList));
		initData(app.studentGradeData);

		fw.setLayout('StudentGrades');
	};

	//=======================================================
	//
	//=======================================================
	function initData(data)
	{
		setAssignName();
		var studentName = formatName();
		if (data && data.overall) {
			setChartTitleText(studentName);
			assignmentTypes = getTypes(app.studentGradeData);
			setData(data);
		}
		else
			setChartTitleText("No grade data");
	}

	//=======================================================
	// Set the assignment name
	//=======================================================
	function setAssignName()
	{
		var name = 'Student and Overall Grade Report';

		vw.drawList.setParam('aName', 'text', name);
	}

	//=======================================================
	//
	//=======================================================
	function formatName()
	{
		var first = app.loginResults.get("first");
		var last = app.loginResults.get("last");
		return last + ", " + first;
	}

	//=======================================================
	//
	//=======================================================
	function setChartTitleText(title)
	{
		vw.drawList.setParam('chartTitleText', 'text', title);
	}

	//=======================================================
	//
	//=======================================================
	function setClassAverageText()
	{
		var text = "Class Average";

		vw.drawList.setParam('classAverageText', 'text', text);
	}

	//=======================================================
	// Get list of assignment types
	//=======================================================
	function getTypes(data) {
		var types = Object.keys(data.overall);

		return types;
	}
	
	//=======================================================
	// Calculate total score and total points
	//=======================================================
	function getTotal(obj) {
		var score = 0;
		var points = 0;
		assignmentTypes.forEach(function(type) {
			if (obj[type]) {
				score += obj[type].score;
				points += obj[type].points;
			}
		});
		return {
			score: score,
			points: points
		};
	}
	
	//=======================================================
	// Build chart data
	//=======================================================
	function setData(data)
	{
		// Headings
		var studentTotal = getTotal(data.student);
		var classTotal = getTotal(data.overall);
		var studentPct = studentTotal['points'] > 0 ? studentTotal['score'] / studentTotal['points'] * 100 : 0;
		var classPct = classTotal['points'] > 0 ? classTotal['score'] / classTotal['points'] * 100 : 0;

		// Overall
		chartData[1][1].text = Math.round(studentPct) + '%';
		chartData[1][2].text = Math.round(classPct) + '%';

		assignmentTypes.forEach(function(type) {
			var studentPct = data.student[type].points ? data.student[type].score / data.student[type].points * 100 : 0;
			var classPct = data.overall[type].points ? data.overall[type].score / data.overall[type].points * 100 : 0;
			var chartRow = [
				{type: 'text', text: app.translateType(type), align: 'right'},
				{type: 'text', text: Math.round(studentPct) + '%', align: 'center'},
				{type: 'text', text: Math.round(classPct) + '%', align: 'center'},
			];

			chartData.push(chartRow);
		});
	}

	//=======================================================
	// READY function
	//=======================================================
	vw.ready = function()
	{
		app.globalUIInit();
	}

	chartData = [
		[
			{type: 'text', text: '', align: 'right'},
			{type: 'text', text: 'Student Grades', align: 'center'},
			{type: 'text', text: 'Class Average', align: 'center'},
		],

		[
			{type: 'text', text: 'Overall', align: 'right', color: 'green'},
			{type: 'text', text: '0%', align: 'center'},
			{type: 'text', text: '0%', align: 'center'},
		]
	];

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {
/*
		Logo: [
			'Logo', 'image', {
				image: 'Logo'
			}
		],
*/
		backdrop: [
			'backdrop', 'borderedBox', app.style.backdrop
		],

		goUp: [
			'goUp', 'button', {
				image: 'HomeworkUp',
				click: app.upLink,
				depth: fw.MIDPLUS
			}
		],

		aName: [
			'aName', 'textSmartAlign', {
				font: app.style.assignName.font,
				color: app.style.assignName.color
			}
		],

		chartTitleText: [
			'chartTitleText', 'text', {
				font: 'bold 30px Arial',
				color: '#666'
			}
		],
		
		chart1: [
			'chart1', 'chart', {
				lineHeight: 33,
				colWidths: [154+50, 247+59, 247+59],
				data: chartData
			}
		]
	};



})();
