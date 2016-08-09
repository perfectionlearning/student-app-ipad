//===============================================================================
// Addendums to the book content, as displayed in the TOC
//===============================================================================
;(function() {

	//--------------------------------------------
	//--------------------------------------------
	var addList = ['labs', 'resources'];

	//--------------------------------------------
	// Labs
	//--------------------------------------------
	var labs = { name: "Labs", data: [
		{
			n: 'Labs',
			ch: [
				{
					n: 'Physical Labs and Demonstrations',
					link: app.bookPath + 'labs/tocplab.html#' + app.stripHash()
				},
				{
					n: 'Virtual Labs',
					link: app.bookPath + 'labs/tocvlab.html#' + app.stripHash()
				},
				{
					n: 'Course Apparatus',
					link: app.bookPath + 'labs/tocVideo.html#' + app.stripHash()
				}
			]
		}
	]};

	//--------------------------------------------
	// Student Edition Additional Resources
	//--------------------------------------------
	var students = { name: "Additional Resources & TEKS/ELPS", data: [
		{
			n: 'Student Resources',
			ch: [
				{
					n: 'TEKS Correlation',
					link: app.bookPath + 'Correlations/correlations.html#' + app.stripHash()
				},
				{
					n: 'ELPS Correlations',
					link: app.bookPath + 'elps/correlations/corr_physics.html?' + app.stripHash()
				},
				{
					n: 'ELPS Student Activities',
					link: 'http://www.kineticbooks.com/physics/fpp/1_0/content/elps/tocs/toc_activities.html?' + app.stripHash()
				}
			]
		}
	]};

	//--------------------------------------------
	//--------------------------------------------
	var addMap = {
		labs: labs,
		resources: students
	}

	//=======================================================
	// Return a list of addendum names
	//=======================================================
	app.getAddendumList = function()
	{
		return addList;
	}

	//=======================================================
	// Return an addendum object, given an addendum name
	//=======================================================
	app.getAddendum = function(name)
	{
		return addMap[name];
	}

})();
