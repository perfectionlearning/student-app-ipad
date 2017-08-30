//===============================================================================
// @FIXME/dg: This behavior is too specific for a widget.  Creating a button widget
// that can stay down (or better yet, extending the existing button widget) would
// be preferable.
//===============================================================================
framework.widget.assignmentButtons = function()
{
	var that = this;
	var style = app.style.assignmentList;
	var buttons = {};
	var CURRENT = 1,
		GRADED = 2;


	var disableButton = function(btn) {
		$.each(buttons, function(idx, bWid) {
			if (idx != btn) {
				bWid.enable();
				bWid.setFrame(bWid.frameOfs);
			}
		});
		buttons[btn].disable();
		buttons[btn].setFrame(buttons[btn].frameOfs+2);
	}

	var filter = function(type) {
		switch (type) {
			case CURRENT:
				disableButton('current');
				fw.eventPublish('currentAssignments:click')
				break;
			case GRADED:
				disableButton('recent');
				fw.eventPublish('recentlyGraded:click')
				break;
			default:
				disableButton('all');
				fw.eventPublish('allAssignments:click')
		}
	}

	//=======================================================
	//
	//=======================================================
	function drawButtons() {
		buttons['recent'] = that.add('button', {
			image: 'AllRecent',
			click: function() { filter(GRADED) },
			frame: 'Recent',
			frameOfs: 3
		}, {
			wid: that,
			my: 'top right',
			at: 'top right',
			ofs: '0 0'
		});

		buttons['current'] = that.add('button', {
			image: 'CurrentAssignments',
			click: function() { filter(CURRENT) },
			depth: 1,
			frameOfs: 0
		}, {
			wid: buttons['recent'],
			my: 'top right',
			at: 'top left',
			ofs: -style.pageButtonGap + ' 0'
		});

		buttons['all'] = that.add('button', {
			image: 'AllRecent',
			click: function() { filter() },
			frame: 'All',
			frameOfs: 0
		}, {
			wid: buttons['current'],
			my: 'top right',
			at: 'top left',
			ofs: -style.pageButtonGap + ' 0'
		});

	}

//===============================================================================
// Standard widget API
//===============================================================================

	//=======================================================
	// Called after the widget has been docked
	//
	// @FIXME/dg: This builds a default into the widget, which is bad form!
	//=======================================================
	this.docked = function()
	{
		drawButtons();
		buttons['all'].disable();
		buttons['all'].setFrame(2);
	}

};
