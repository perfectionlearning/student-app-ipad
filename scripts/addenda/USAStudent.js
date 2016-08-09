//===============================================================================
// Addendums to the book content, as displayed in the TOC
//===============================================================================
;(function() {

	//--------------------------------------------
	//--------------------------------------------
	var addList = ['labs'];		// No resources in this version

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
	var students = { name: "Additional Resources", data: [
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
