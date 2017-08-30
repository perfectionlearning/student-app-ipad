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
	var teachers = { name: "Additional Resources", data: [
		{
			n: 'Instructor Resources',
			ch: [
				{
					n: 'ELL Student Activities',
					link: app.bookPath + 'elps/tocs/toc_ell_activities.html?' + app.stripHash()
				},
				{
					n: 'ELL Lesson Plans',
					link: app.bookPath + 'elps/tocs/toc_ell_lessons.html?' + app.stripHash()
				},
				{
					n: 'Solutions for Virtual Labs',
					link: app.bookPath + 'labs/Kinetic_Physics_Virtual_Lab_Solutions.pdf'
				},
				{
					n: 'Solutions for Physical Labs and Demonstrations',
					link: app.bookPath + 'labs/Kinetic_Physics_Lab_Solutions.pdf'
				}
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
