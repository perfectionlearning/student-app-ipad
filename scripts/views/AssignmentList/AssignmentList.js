//===============================================================================
// Assignment List Module: Displays a list of all assignments
//===============================================================================
;(function() {

	var vw = app.Views.AssignmentList = {};

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container) {
		fw.setLayout('AssignmentList');

		fw.eventSubscribe('allAssignments:click', allAssignments);
		fw.eventSubscribe('currentAssignments:click', currentAssignments);
		fw.eventSubscribe('recentlyGraded:click', recentlyGraded);

		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true}), drawList));
		vw.drawList.setParam('assignmentList', 'collection', app.assignments);

		loadAssignmentList();
		app.router.navigate('assignments');
	}

	//=======================================================
	// READY function
	//=======================================================
	vw.ready = function()
	{
		app.globalUIInit();
	}

	//=======================================================
	// Context CLOSE function
	//=======================================================
	vw.close = function()
	{
		// Abort any requests in progress
		fw.abortAsync();
		fw.eventUnsubscribe('allAssignments:click');
		fw.eventUnsubscribe('currentAssignments:click');
		fw.eventUnsubscribe('recentlyGraded:click');
	}

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {
		backdrop: [
			'backdrop', 'borderedBox', app.style.backdrop
		],

		banner: [
			'HWBanner', 'image', {image: 'Logo'}
		],

		assignmentList: [ // connect to all four edges of backdrop.
			'assignmentList', 'assignmentList', {
				click: assignSelected
			}
		],

		assignmentButtons: [
			'assignmentButtons', 'assignmentButtons', {}
		]
	};

	//=======================================================
	//
	//=======================================================
	function loadAssignmentList() {
		app.loadingBox();

		app.assignments.fetch().done(loadAssignmentsSuccess).fail(loadFailure);
	}

	//=======================================================
	//
	//=======================================================
	var loadFailure = app.failHandler("list");

	//=======================================================
	// Assignment list successfully loaded
	//=======================================================
	function loadAssignmentsSuccess()
	{
		app.clearLoadingBox();

		// Create the main widget
		if (app.assignments.length)
			showList();
		else
			noAssignments();
	}

	//=======================================================
	//
	//=======================================================
	function showList()
	{
		var wid = fw.getWidget('assignmentList');
		wid && wid.setData(app.assignments);
	}

	//=======================================================
	//
	//=======================================================
	function changeScoreMode(isPercent)
	{
		var wid = fw.getWidget('assignmentList');
		wid && wid.setScoreMode(isPercent);
	}

	//=======================================================
	//
	//=======================================================
	function allAssignments()
	{
		var wid = fw.getWidget('assignmentList');
		wid.allAssignments();
	}

	//=======================================================
	//
	//=======================================================
	function currentAssignments()
	{
		var wid = fw.getWidget('assignmentList');
		wid.currentAssignments();
	}

	//=======================================================
	//
	//=======================================================
	function recentlyGraded()
	{
		var wid = fw.getWidget('assignmentList');
		wid.recentlyGraded();
	}

	//=======================================================
	//=======================================================
	function assignSelected(assignID)
	{
		app.curAssign = assignID;
		app.gotoProbList();
	}

	//=======================================================
	// No assignments exist
	//=======================================================
	function noAssignments()
	{
		app.infoPopup('No Assignments',
					  "Assignments haven't been posted for this course yet.",
					  {noBG: true}
		);
	}

})();
