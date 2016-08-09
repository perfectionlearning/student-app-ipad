//===============================================================================
// Simple view that shows a single static image
//===============================================================================
;(function() {

	var vw = app.Views.DrillResults = {};

	var savedCurAssign;

	//=======================================================
	// Initialize the page
	// container seems to be the HTML tag.
	//=======================================================
	vw.init = function(container)
	{
		// We're not going to drop a route here
		// Is that bad? This is too dynamic to return to.
		// !!!!!!!!!! How do we prevent a user from returning to problems in the original assignment?!
		// This should act like pressing F5 on a problem -> redirect to assignment list? Or can we do better?
		// Redirect to the current problem list?
		// DG: Attempt to invalidate the current assignment
		savedCurAssign = app.curAssign;
		app.curAssign = null;

		// Set the drawlist
		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true}), drawList));

		// Fill in data in the drawlist
		var score = app.calcDrillScore();	// mastered, remaining, needsWork, score, totalPoints
		initData(score);

		// Init the button, based on the score
		initButton(score);

		// Select the layout
		fw.setLayout('DrillResults');
	};

	//=======================================================
	//
	//=======================================================
	function initData(score)
	{
		setAssignName();
		setRoundNumber();
		setProblemCount();
		setData(score);
	}

	//=======================================================
	// Set the assignment name
	//=======================================================
	function setAssignName()
	{
		var assign = app.assignments.get(savedCurAssign);
		var name = assign ? assign.get('name') : '';
		vw.drawList.setParam('aName', 'text', name);
	}

	//=======================================================
	//
	//=======================================================
	function setRoundNumber()
	{
		var rnd = app.turnIn.get('round') || 0;
		var text = "End of Round " + rnd;

		vw.drawList.setParam('roundText', 'text', text);
	}

	//=======================================================
	//
	//=======================================================
	function setProblemCount()
	{
		var cnt = app.problemList.length;
		var text = "Number of Problems: " + cnt;

		vw.drawList.setParam('problemText', 'text', text);
	}

	//=======================================================
	//
	//=======================================================
	function setData(score)
	{
		var cnt = app.problemList.length;

		// Correct
		chart1Data[0][1].text = score.mastered;
		chart1Data[0][2].text = Math.round(score.mastered / cnt * 100) + '%';
		chart1Data[0][3].percent = score.mastered / cnt * 100;

		// Partial credit
/*
		var partial = score.needsWork - score.wrong;
		chart1Data[1][1].text = partial;
		chart1Data[1][2].text = Math.round(partial / cnt * 100) + '%';
		chart1Data[1][3].percent = partial / cnt * 100;
*/
		// Wrong
		var fail = score.wrong;
		chart1Data[2-1][1].text = fail;
		chart1Data[2-1][2].text = Math.round(fail / cnt * 100) + '%';
		chart1Data[2-1][3].percent = fail / cnt * 100;

		// Incomplete
		var fail = score.remaining;
		chart1Data[3-1][1].text = fail;
		chart1Data[3-1][2].text = Math.round(fail / cnt * 100) + '%';
		chart1Data[3-1][3].percent = fail / cnt * 100;

		// Score -- Current round
		var percent = Math.round(score.score / score.totalPoints * 100);
		chart2Data[0][1].text = score.score + '/' + score.totalPoints + ' (' + percent + '%)';
		chart2Data[0][2].percent = percent;

		// Score -- Overall
		var score = app.turnIn.get('score') || 0;
		var scoreMax = app.turnIn.get('totalPoints') || 100;	// Make something up for a default. It should never be used!
		percent = Math.round(score / scoreMax * 100);
		chart2Data[1][1].text = score + '/' + scoreMax + ' (' + percent + '%)';
		chart2Data[1][2].percent = percent;
	}

	//=======================================================
	// Set the button text (frame) and behavior.
	//
	// Not complete: Button says "Next Round", clicking goes
	// 			     to the next round's assignment.
	// Complete:     Button says "Done". Clicking goes to the
	//               Assignment list
	//=======================================================
	function initButton(score)
	{
		if (score.remaining > 0 || score.needsWork > 0)
		{
			vw.drawList.setParam('nextButton', 'frame', 'NextRound');
			vw.drawList.setParam('nextButton', 'click', nextRound);
		}
		else
		{
			vw.drawList.setParam('nextButton', 'frame', 'Done');
			vw.drawList.setParam('nextButton', 'click', assignmentComplete);
		}
	}

	//=======================================================
	// Move to the next round. Some problems remain.
	//=======================================================
	function nextRound()
	{
		app.curAssign = savedCurAssign;		// Restore the assignment (re-validate it)
		app.linkToObject('probList');
	}

	//=======================================================
	// The assignment has been completed. All problems are correct.
	//=======================================================
	function assignmentComplete()
	{
		app.linkToObject('assignList');
	}

	//=======================================================
	// READY function
	//=======================================================
	vw.ready = function()
	{
		app.globalUIInit();
	}

	//=======================================================
	// This shouldn't be necessary in this module.  Do it anyway.
	//=======================================================
	vw.close = function()
	{
		fw.abortAsync();
	}

	//=======================================================
	// Table Data
	//=======================================================
	var chart1Data = [
		[
			{type: 'text', text: 'Correct', align: 'right'},
			{type: 'text', align: 'center'},
			{type: 'text', align: 'center'},
			{type: 'bar',  color: 'green'},
		],
/*
		[
			{type: 'text', text: 'Partial Credit', align: 'right'},
			{type: 'text', align: 'center'},
			{type: 'text', align: 'center'},
			{type: 'bar',  color: 'yellow'},
		],
*/
		[
			{type: 'text', text: 'Incorrect', align: 'right'},
			{type: 'text', align: 'center'},
			{type: 'text', align: 'center'},
			{type: 'bar',  color: 'red'},
		],

		[
			{type: 'text', text: 'Not Answered', align: 'right'},
			{type: 'text', align: 'center'},
			{type: 'text', align: 'center'},
			{type: 'bar',  color: 'red'},
		]
	];

	var chart2Data = [
		[
			{type: 'text', text: 'This Round', align: 'right'},
			{type: 'text', align: 'center'},
			{type: 'bar',  color: 'blue'},
		],

		[
			{type: 'text', text: 'Overall', align: 'right'},
			{type: 'text', align: 'center'},
			{type: 'bar',  color: 'orange'},
		]
	];

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {

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

		roundText: [
			'roundText', 'text', {
				font: 'bold 20px Arial',
				color: '#666'
			}
		],

		problemText: [
			'problemText', 'text', {
				font: 'bold 20px Arial',
				color: '#666'
			}
		],

		chart1: [
			'chart1', 'chart', {
				lineHeight: 33,
				colWidths: [154+50, 59, 59, 545-50],
				data: chart1Data
			}
		],

		summaryText: [
			'summaryText', 'text', {
				text: 'Score',
				font: 'bold 20px Arial',
				color: '#666'
			}
		],

		chart2: [
			'chart2', 'chart', {
				lineHeight: 33,
				colWidths: [154+50, 118, 545-50],
				data: chart2Data
			}
		],

		nextButton: [
			'nextButton', 'button', {
				image: 'WVMoveOn'
			}
		]
	};

})();
