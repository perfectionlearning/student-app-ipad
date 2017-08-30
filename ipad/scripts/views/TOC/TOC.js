//===============================================================================
// Table of Contents
//===============================================================================
;(function() {
	var vw = app.Views.TOC = {};

	var cb, bookDefinition;

	//=======================================================
	// Initialize the page
	// container seems to be the HTML tag.
	//=======================================================
	vw.init = function(container) {
		var cl = app.currentLocation();

		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true}), drawList));

		if (app.isHiddenChapter())
			app.resetNav();

		// @FIXME/dg: This is a bad idea.  The actual data structures should be isolated!

		var chap = app.tocChapter || 0;		// Use tocChapter instead of curNav since it might be invalid.  curNav can't be invalid!
		if (chap < 0 || chap >= app.chapterCount())
			chap = 0;
		vw.drawList.setParam('TOC', 'curChapter', chap);
		vw.drawList.setParam('TOC', 'data', app.curScheme());
		vw.drawList.setParam('TOC', 'scheme', cl.scheme);

		var title = cl.scheme === 'lessonPlan' ? 'Lesson Plans: Table of Contents' : 'Table of Contents';
		vw.drawList.setParam('TOC', 'title', title);

		app.router.navigate('toc/' + cl.scheme + '/' + (chap+1));
		fw.setLayout('TOC');
	}

	//=======================================================
	//=======================================================
	vw.ready = function() {
		app.globalUIInit();

		if (app.FunctionalTestMode) {
			app.globalReadyForFunctionalTest();
		}

		// The first time the book runs, play an intro video
		if (document.kbCheckFirstRun && document.kbCheckFirstRun())
		{
			fw.createWidget('videoPlayer', {
				w: 640,		// @FIXME/dg: Move this to styles.  Eventually add auto-detect to the video player
				h: 480,
				depth: fw.ZENITH,	// fw.TOP is below the navigation, which is a bit odd.
				url: app.getVideoPath() + app.introVideo
			});
		}

		// @REMOVEME/dg: Temp!
		if (app.server !== "marias" && app.server !== "mariasdb")
		{
			fw.getWidget('tempLink').hide();
			fw.getWidget('tempLink2').hide();
		}
	}

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {
		Logo: [
			'Logo', 'image', {
				image: 'Logo'
			}
		],

		TOC: [
			'TOC', 'toc', {
				itemSelected: gotoSection,
//				chapterNotify: chapterChanged
			}
		],

		// @REMOVEME/dg: Temporary
		tempLink: [
			'grades', 'fakeLink', {
				text: 'Step Problems',
				font: '12px/15px Arial',
				color: 'yellow',
				hoverColor: '#55C0E6',
				click: tempLink
			}
		],

		// @REMOVEME/dg: Temporary
		tempLink2: [
			'homework', 'fakeLink', {
				text: 'No Step Problems',
				font: '12px/15px Arial',
				color: 'yellow',
				hoverColor: '#55C0E6',
				click: tempLink2
			}
		]
	};

	//=======================================================
	//
	//=======================================================
	function gotoSection(ch, un, top)
	{
		var sch = app.curNav.scheme;

		// Convert linear topic to relative topic
//		var top = app.getRelativeTopic(ch, linTop, sch);

		app.navJump(ch, un, top, 0, sch);
	}

	//=======================================================
	// @REMOVEME/dg: Temp link for review
	//=======================================================
	function tempLink()
	{
		// Go to first object in the scheme
//		app.navJump(0, 0, 0, 0, 'OHWProblems');

		// Go to the scheme TOC
		app.setNav(0, 0, 0, 0, 'OHWProblems');
		app.TOC();
	}

	//=======================================================
	// @REMOVEME/dg: Temp link for review
	//=======================================================
	function tempLink2()
	{
		// Go to first object in the scheme
//		app.navJump(0, 0, 0, 0, 'OHWProblems');

		// Go to the scheme TOC
		app.setNav(0, 0, 0, 0, 'OHWProblemsNoSteps');
		app.TOC();
	}

})();
