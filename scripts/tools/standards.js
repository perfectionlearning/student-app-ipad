//===========================================================================================
// Standards Reference:  correlate instructional materials with standards.
//
// Standards are stored in app.standardsList, which was loaded on startup
//===========================================================================================
(function() {

	// List of group IDs, and data formatting behavior associated with each
	var GroupIDs = {
		2: 'link'
	}

	//=======================================================
	// shouldShowStandards:  indicate whether or not standards
	//    should be displayed for this object.
	//=======================================================
	app.shouldShowStandards = function()
	{
		return false;
	}
	//=======================================================
	// formatStandardsLink: get the portion of the standards
	//    code that will be used to scroll to the place in
	//    the standards document.
	//
	// This is specificially for TEKS.  For example, for
	// standard (4)(B)(vi), go to the beginning of (4)(B).
	// This is done by scrolling to (4)(B)(i).
	//
	// raw: the entire standards code; e.g., (4)(B)(vi)
	//=======================================================
	var formatStr = /\((\d+)\)\((\w+)\)(\(\w+\)|$)/;
	function formatStandardsLink(raw)
	{
		return raw.replace(formatStr, '$1$2');
	}

	//=======================================================
	// standardsClick:  handle click of standards link.
	//    Should go to appropriate section in correlations
	//    document.
	//=======================================================
	app.standardsClick = function(ref) {
		var basePath = app.basePath();

		// @FIXME/dg: VERY SERIOUS! This doesn't include the full path, which means the destination
		// code needs to have specific knowledge of how to navigate within the book. It also means
		// we can't change that. CLEAN UP THE CORRELATIONS CODE! REMOVE ALL KNOWLEDGE OF SCHEME NAMES!
		var link = app.paths.correlations + '?' + basePath + '#' + ref;

		app.externalJump(link);
	}

	//=======================================================
	// Collect and format the list of standards associated with
	// an object.
	//
	// Assume the data file is pre-sorted or arranged as desired.
	// There's no need to waste time processing at run-time.
	//=======================================================
	app.standardData = function(obj)
	{
		var stds = app.standardsList[obj];
		if (!stds)
			return null;

		// Sort the references into buckets based on group ID
		var out = {
			links: [],
			nonLinks: []
		};

		var unique = {};

		// Each entry has a "gid" and "c" field. Why "c"?
		_.each(stds, function(val, idx) {
			if (GroupIDs[val.gid] && GroupIDs[val.gid] === 'link')
			{
				// Group type: LINK. Ensure uniqueness since we're only displaying a subset of the available data.
				var formatted = formatStandardsLink(val.c);
				if (!unique[formatted])
				{
					unique[formatted] = true;
					out.links.push({label: formatted, data: val.c});
				}
			}
			else
				out.nonLinks.push(val.c);	// These should be guaranteed unique in the datafile
		});

		return out;
	}

})();
