//===============================================================================
// Login page
//===============================================================================
;(function() {

	var vw = app.Views.Help = {};

	var helpDL = makeHelpDL();

	//=======================================================
	// Initialize the page
	//=======================================================
	vw.init = function(container)
	{
		vw.drawList = fw.drawList(app.addToArray(app.globalDrawList({noNav: true}), drawList, helpDL));
		app.router.navigate('help');
		fw.setLayout('Help');

		var objs = _.pluck(app.studentHelpVids, 1);
		if (app.teacherHelpVids)
			objs = objs.concat(_.pluck(app.teacherHelpVids, 1));
		app.setVideoUrls(objs, false);
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
	vw.close = function()
	{
		fw.abortAsync();
	}

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	var drawList = {
		backdrop: [
			'backdrop', 'borderedBox', app.style.backdrop
		],

		Logo: [
			'Logo', 'image', {
				image: 'Logo'
			}
		],

		title: [
			'title', 'text', {
//				text: 'Help Topics',
				text: 'Select a Help Topic',
				font: 'bold 27px Arial',	// @FIXME/dg: Move to style
				color: '#0051C1'
			}
		],

		credits: [
			'credits', 'fakeLink', {
				text: 'Media Credits',
				font: '12px/15px Arial',
				color: '#449EBD',
				hoverColor: '#55C0E6',
				click: showCredits,
//				hidden: true
			}
		]
	};

	//=======================================================
	//
	//=======================================================
	function makeHelpDL()
	{
		var out = {
			student: [
				'studentOnly', 'form', {
					id: 'student',
					w: 380,			// @FIXME/dg

					title: 'Student Topics',
					titleFont: 'bold 18px/21px Arial',
					bottomMargin: 20,
					links: makeLinks(app.studentHelpVids)
				}
			]
		}

		if (app.teacherHelpVids)
		{
			// Set student layout
			out.student[0] = 'student';

			// Add teacher
			out.teacher = [
				'teacher', 'form', {
					id: 'teacher',
					w: 380,			// @FIXME/dg

					title: 'Teacher Topics',
					titleFont: 'bold 18px/21px Arial',
					bottomMargin: 20,
					links: makeLinks(app.teacherHelpVids)
				}
			]
		}

		return out;
	}

	//=======================================================
	//
	//=======================================================
	function makeLinks(data)
	{
		var out = [];

		$.each(data, function(idx, val) {
			out.push({label: val[0], click:showVideo});
		});

		return out;
	}

	//=======================================================
	//=======================================================
	function showVideo(wid)
	{
		var info = wid.data.split('_');
		if (info.length == 2)
		{
			if (info[0] === 'student')
			{
				var obj = app.studentHelpVids[info[1]][1];
				var idx = info[1];
			}
			else
			{
				obj = app.teacherHelpVids[info[1]][1];
				idx = parseInt(info[1],10) + app.studentHelpVids.length;
			}

			app.linkToObject(obj);
		}
	}

	//=======================================================
	// Media credits clicked on
	//=======================================================
	function showCredits()
	{
		app.externalJump(app.paths.mediaCreds + '#' + location.href);
	}

})();
