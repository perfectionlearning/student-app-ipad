//===============================================================================
// External Application (Such as a Javascript activity)
//
// Note that in most views we perform an AJAX abort on closing.  In this view
// we specifically don't want to do that.  The 'external' widget handles AJAX
// loading and aborting.  Without very careful abort control for activities,
// the whole app will crash.
//===============================================================================
;(function() {

	var vw = app.Views.External = {};

	var requirements = ['Shared/caat-min.js'];

	//=======================================================
	// Initialize the page
	// container seems to be the HTML tag.
	//=======================================================
	vw.init = function(container)
	{
		app.containerColor('Stage', app.style.productColor);	// Dark slate blue

		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList(), drawList));
		fw.setLayout('External');

		setActivityParams();
	}

	//=======================================================
	//=======================================================
	vw.ready = function()
	{
		app.globalUIInit();
	}

	//=======================================================
	//
	//=======================================================
	function setActivityParams()
	{
		var name = app.curObjName;
		var entry = app.activityList[name] || app.activityList.defaults;

		vw.drawList.setParam('external', 'name', name);
//		vw.drawList.setParam('external', 'path', path);

		var h = entry.h || app.activityList.defaults.h;
		var w = entry.w || app.activityList.defaults.w;
		vw.drawList.setParam('external', 'h', h);
		vw.drawList.setParam('external', 'w', w);

		// Construct file list
		var files = _.clone(requirements);
		if (defined(entry.files))
			var extra = entry.files;
		else
			extra = app.activityList.defaults.files;

		// Add the correct path to each of the non-shared files
		$.each(extra, function(idx, val) {
			files.push(name + '/' + val);
		});

		vw.drawList.setParam('external', 'files', files);
	}

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {

		external: [
			'external', 'external', {path: app.bookPath + app.paths.jsact}
		]
	};

})();
