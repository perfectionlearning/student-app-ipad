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
	// Teacher's Edition Additional Resources
	//--------------------------------------------
	var teachers = { name: "Additional Resources & TEKS/ELPS", data: [
		{
			n: 'Instructor Resources',
			ch: [
				{
					n: 'TEKS Correlation',
					link: app.bookPath + 'Correlations/correlations.html#' + app.stripHash()
				},
				{
					n: 'ELPS Correlation',
					link: app.bookPath + 'elps/correlations/corr_physics.html?' + app.stripHash()
				},
				{
					n: 'ELPS Student Activities',
					link: app.bookPath + 'elps/tocs/toc_activities.html?' + app.stripHash()
				},
				{
					n: 'ELPS Lesson Plans',
					link: app.bookPath + 'elps/tocs/toc_lessons.html?' + app.stripHash()
				},
				{
					n: 'Solutions for Virtual Labs',
					link: app.bookPath + 'labs/Kinetic_Physics_Virtual_Lab_Solutions.pdf'
				},
				{
					n: 'Solutions for Physical Labs and Demonstrations',
					link: app.bookPath + 'labs/Kinetic_Physics_Lab_Solutions.pdf'
				}
/*
				{
					n: "Character Test",
					link: app.bookPath + "CharTest/chartest.html#" + app.stripHash()
				}
*/
			]
		}
	]};

	//--------------------------------------------
	//--------------------------------------------
	var addMap = {
		labs: labs,
		resources: teachers
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
