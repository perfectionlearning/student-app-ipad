//=============================================================================
// Communication Layer between the application and the outside world
//
// API:
//
//  Subscribe to event:
//    Problem ID change
//    Assignment ID change
//    Context change
//    Error occurred
//    Closing/leaving
//    Login
//    Logout
//
//  Get current problem ID
//  Get current assignment
//  Get current user
//  Refresh view
//  Reload assignment
//=============================================================================
;(function() {

	//=======================================================
    // obj: object from Book Definition file
	//=======================================================
	app.reviewObject = function(name, nav) {

		/*
		var obj = app.objectList[name] || {};
		var wbs = obj.ch ? obj.ch : [];
		var type = app.getObjType(obj);

		var sectionData = {
			wbs: wbs,
			chapterId: app.getChapterId(obj),		// @FIXME/dg: Currently invalid, but I don't believe it's used anymore.
			sectionName: name.replace(/\s/g, '_'),
			type: type,
			//bugChapterName: 'Ch ' + (1*obj.chapter+1) + ': ' + app.getChapterName(obj),
			// Chapter name format change.
			bugChapterName: app.getChapterName(nav).trim(),
			bugSectionName: (nav.chapter+1) + '.' + (nav.topic+1) + ' ' + app.getSectionName(nav)
		};

		if (parent.window.app && parent.window.app.renderReviewViews)
			parent.window.app.renderReviewViews(sectionData);

		*/
	};

})();