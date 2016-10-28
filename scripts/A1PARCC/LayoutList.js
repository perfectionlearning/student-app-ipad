//===========================================================================================
// List of all layouts for the project
//
// Ultimately, this should be split apart.  While it's nice to group layouts by size, it probably makes more sense
// to group them by screen.  Each screen can be self-contained, and own the information needed to display it at various resolutions.
//
// There are global and local layouts.  Local layouts have precedence.
//
// Layouts are broken down by view, and then further by a selector.
// The selector allows for views to have multiple layouts, such as for various resolutions.
// The global layout list uses the same selectors as local layouts.
//
// Layout fields:
//    dock: String for simple mode, object for complex mode
//    dock (Simple mode): Target widget to dock with
//    my (Simple mode only): Edge on this widget to dock with
//    at (Simple mode only): Edge on target widget to dock with
//    ofs (Simple mode only): String with x and y offsets to modify docking position
//
//   dock (Complex mode): Object with docking info.  See docking.js for full docs.
//
// Todo:
//    font?  Or is this just a custom field?  Change size or whole font string?
//
// Custom fields can also be defined in here.  They will be passed through to the widgets.
// Any custom fields should be related directly to layout, such as column count and column widths for a grid.
//===========================================================================================
;(function() {
	//======================================================
	// @FIXME/dg: Temporary!  This needs to live outside of this module!
	// These also aren't used very much.
	//======================================================
	var layoutWidth = 970; //window.innerWidth;
	var layoutHeight = 500; //window.innerHeight;

	// And this is why.  We can't special case like this.
	if (app.MOBILE)
	{
		layoutWidth = 1024;
		layoutHeight = 500;
	}

	//======================================================
	//======================================================
	app.Layouts.Global = {

		//----------------------------
		// standard
		//----------------------------
		'standard': {

			iconBar: {
				dock: 'stage',
				my: 'top center',
				at: 'top center',
				ofs: '20 0'
			},

			//======================================
			// New system
			//======================================
			topNav: {
				dock: 'stage',
				my: 'top left',
				at: 'top left',
				ofs: '180 12'		// This is with 4 icons on the left
//				ofs: '140 12'		// This is with 2 icons on the left
			},

			// Navigation icons
			navIcons: {
				dock: 'stage',
				my: 'top left',
				at: 'top left',
//				ofs: '29 15'		// This is with 2 icons on the left
				ofs: '10 7'
			},

			menuButton: {
				dock: 'stage',
				my: 'top left',
				at: 'top left',
				ofs: '9 14'
			},

			goUp: {
				dock: 'stage',
				my: 'top left',
				at: 'top left',
				ofs: '42 10'
			},

			navSlider: {
				dock: {
					right: 'stage left',		// Adjust for border (x2 on bottom and right)
					top: 'menuButton top -9'
				}
			},

			statusLine: {
				dock: 'stage',
				my: 'center bottom',
				at: 'center bottom',
				ofs: '0 -4'
			},

			Logo: {
				dock: 'menuButton',
				my: 'top left',
				at: 'top right',
				ofs: '30 -3'
			},

			OHWLogo: {
				dock: {
					top: 'stage top 16',
//					left: 'navIcons right 15'
					centerx: 'stage center'
				}
			},

			backdrop: {
				dock: {
					top: 'stage top 60',
					bottom: 'stage bottom 20',
					left: 'stage left 0',
					right: 'stage right 0'
				}
			},

			helpIcon: {
				dock: 'stage',
				my: 'top right',
				at: 'top right',
				ofs: '-38, 11'
			},

			nextButton: {
				dock: 'stage',
				my: 'bottom right',
				at: 'bottom right',
				ofs: '-4 -5'
			},

			backButton: {
				dock: 'stage',
				my: 'bottom left',
				at: 'bottom left',
				ofs: '6 -5'
			},

			statusOverlay: {
				dock: 'stage',
				my: 'top right',
				at: 'top right',
				ofs: '-18 5'
			},

			//======================================
			// Reward animation
			//======================================
			reward: {
				dock: 'stage',
				ofs: '20 30'
			},

			//================================================
			// Work View items -- Placed globally since there are 3 work views
			//================================================

			// Assignment title text
			wvAssignText: {
				dock: 'stage',
				ofs: '10 5'
			},

			wvPoints: {
				dock: 'stage',
				ofs: '-7 5',
				my: 'top right',
				at: 'top right'
			},

			//================================================
			// Shared by both the problem list and work view
			//================================================
			aName: {
				dock: {
					top: 'stage top 3',
					bottom: 'backdrop top -2',
					left: 'goUp right 12',
					left2: 'qzGoUp right 12',
					right: 'score left -12',
					right2: 'backdrop right'
				}
			}
		}
	};

	//======================================================
	// At a Glance View
	//======================================================
	app.Layouts.AtAGlance = {

		//----------------------------
		// standard
		//----------------------------
		'standard': {

			// Grid (Clean this up!  Use complex mode!)
			grid: {
				dock: 'stage',
				ofs: '2 50',
				// @FIXME/dg: The widget requires width and height to render.  So render in the dock() routine!
				w: layoutWidth-4,
				h: layoutHeight-50-56-30,		// - Start y - bottomBar height - key height
				columns: 5,
				headerWidth: 1.2
			},

			key: {
				dock: 'barBottom',
				my: 'bottom right',
				at: 'top right',
				ofs: '-10 -10'
			}
		}
	};


	//======================================================
	// Problem List View
	//======================================================
	app.Layouts.ProblemList = {

		//----------------------------
		// standard
		//----------------------------
		'standard': {

			score: {
				dock: 'stage',
				my: 'top right',
				at: 'top right',
				ofs: '-86 11'
//				ofs: '-8 11'
			},

			submit: {
				dock: 'stage',
				my: 'top right',
				at: 'top right',
				ofs: '-12 7'
			},

			// Problem List widget.  The majority of the page.
			probList: {
				dock: {
					top: 'Backdrop top 20',
					bottom: 'Backdrop bottom -20',
					left: 'Backdrop left 20',
					right: 'Backdrop right -20'
				}
			},

			submitBox: {
				dock: 'stage',
				my: 'center',
				at: 'center',
				w: 280,
				h: 230
			}

		}
	};
	//======================================================
	// Quizboard View
	//======================================================
	app.Layouts.Quizboard = {
		//----------------------------
		// standard
		//----------------------------
		'standard': {
			directions: {
				dock: {
					top: 'Backdrop top 20',
					left: 'Backdrop left 40'
				}
			},
			score: {
				dock: 'stage',
				my: 'top right',
				at: 'top right',
				ofs: '-86 64'
			},
			// Problem List widget.  The majority of the page.
			probList: {
				dock: {
					top: 'directions bottom 10',
					bottom: 'Backdrop bottom -20',
					left: 'Backdrop left 20',
					right: 'Backdrop right -20'
				}
			},
			submitBox: {
				dock: 'stage',
				my: 'center',
				at: 'center',
				w: 280,
				h: 230
			},
			nextButton: {
				dock: 'stage',
				my: 'bottom right',
				at: 'bottom right',
				ofs: '-4 -5'
			},
			backButton: {
				dock: 'stage',
				my: 'bottom left',
				at: 'bottom left',
				ofs: '6 -5'
			},
		}
	};

	//======================================================
	// Work View: Tall Images (Image on right)
	//======================================================
	app.Layouts.WorkView2 = {
		//----------------------------
		// standard
		//----------------------------
		'standard': {
			divider: {
				dock: {
					top: 'backdrop top 17',
					bottom: 'backdrop bottom -17',
					left: 'backdrop left 331'
				}
			},

			qImage: {
				dock: {
					top: 'backdrop top 7',	// Top docks below the title bar
					left: 'backdrop left 27' 	// Right side docks to stage
				}
			},

			card1: {
				w: 317,		// I hate having these here, but we need this information.
				h: 175,		// This has to be an even number to avoid a Firefox shifting bug (but then it repeats the image!)
				dock: {
					top: 'qImage bottom 7',
					top2: 'backdrop top 7',
					left: 'backdrop left 27'
				}
			},

			card2: {
				w: 317,		// I hate having these here, but we need this information.
				h: 175,
				dock: {
					top: 'card1 bottom 7',
					left: 'qImage left'
				}
			},

			status: {
				dock: {
					top: 'backdrop top 17',
					left: 'divider left 14',
					left2: 'backdrop left 27'	// If there's no divider, use the backdrop
				}
			},

			title: {
				dock: {
					centery: 'status centery 2',
					left: 'status right 8'
				}
			},

			question: {
				dock: {
					top: 'title bottom 12',
					left: 'status left',
					right: 'backdrop right -22'
				},
			},

			questionCenter: {
				dock: 'backdrop',
				my: 'top center',
				at: 'top center',
				ofs: '0 57'
			},

			statusCenter: {
				dock: 'question',
				my: 'bottom left',
				at: 'top left',
				ofs: '0 -12'
			},

			answerInput: {
				dock: {
					left: 'question left',
					top: 'question bottom 13',
					right: 'question right'
				}
			},

			responseText: {
				dock: {
					left: 'question left',
					right: 'question right',
					top: 'answerInput bottom 10',
					top2: 'question bottom 44'	// 4 + button height + 10
				}
			},

			score: {
				dock: 'stage',
				my: 'top right',
				at: 'top right',
				ofs: '-86 11'
			},

			submits: {
				dock: {
					top: 'score bottom 30',
					top2: 'statusOverlay bottom 10',
					right: 'score right',
					right2: 'statusOverlay right'
				}
			},

			nextButton: {
				dock: 'stage',
				my: 'top right',
				at: 'top right',
				ofs: '36 250'
			},
			backButton: {
				dock: 'stage',
				my: 'top left',
				at: 'top left',
				ofs: '-40 250'
			},
			nextProb: {
				dock: {
					left: 'question left',
					top: 'question bottom 13',
				}
			},

			keypad: {
			dock: {
				top: 'stage scrolltop 499',
				left: 'stage left 0',
			}
		}
			// {
			// 	dock: 'backdrop',
			// 	my: 'top left',
			// 	at: 'top left',
			// 	ofs: '24 353'
			// }
		}
	};


	//======================================================
	// Whiteboard layout
	//======================================================
	app.Layouts.Whiteboard = {
		//----------------------------
		// standard
		//----------------------------
		'standard': {

			whiteboard: {
				dock: 'stage',
				my: 'top center',
				at: 'top center',
				ofs: '0 48'
			},

      vcrControls: {
				dock: 'stage',
				my: 'bottom center',
				at: 'bottom center',
			}
		}
	};

	//======================================================
	// SectionText layout
	//======================================================
	app.Layouts.SectionText = {
		//----------------------------
		// standard
		//----------------------------
		'standard': {
			sectionText: {

				dock: {
					top: 'stage top 48',
					bottom: 'stage bottom -32',
					left: 'stage left 29',
					right: 'stage right -29'
				}
			}

		}
	};

	//======================================================
	// SectionText layout
	//======================================================
	app.Layouts.Summary = {
		//----------------------------
		// standard
		//----------------------------
		'standard': {

			summary: {
				dock: {
					top: 'stage top 48',
					bottom: 'stage bottom -32',
					left: 'stage left 29',
					right: 'stage right -29'
				}
			},

			blankSumCard: {
				dock: 'summary',
				my: 'top left',
				at: 'top left',
				ofs: '45 80'
			}

		}
	};

	//======================================================
	// Table of Contents for the new books
	//======================================================
	app.Layouts.TOC = {
		//----------------------------
		// standard
		//----------------------------
		'standard': {

			TOC: {
				dock: {
					top: 'stage top 48',	// 22
					bottom: 'stage bottom -28',
					left: 'stage left 30',
					right: 'stage right -30'
				}
			},

			// @TEMP
			grades: {
				dock: 'TOC',
				my: 'top left',
				at: 'bottom left',
				ofs: '0 9'
			},

			homework: {
				dock: 'tempLink',
				my: 'top left',
				at: 'top right',
				ofs: '20 0'
			}
		}
	};

	//======================================================
	// External activities, injected into our page
	//======================================================
	app.Layouts.External = {
		//----------------------------
		// standard
		//----------------------------
		'standard': {

			external: {
				dock: 'stage',
				my: 'center',
				at: 'center',
				ofs: '0 11'		// The largest size overlaps the top navigation.  Hopefully nobody will notice that it's slightly off-center now
			}
		}
	};

	//======================================================
	// Simple static image view with navigation
	//======================================================
	app.Layouts.ImageView = {
		//----------------------------
		// standard
		//----------------------------
		'standard': {
			Backdrop: {
				dock: {
					top: 'stage top 48',
					bottom: 'stage bottom -32',
					left: 'stage left 29',
					right: 'stage right -29'
				}
			},

			image: {
				dock: 'Backdrop',
				my: 'center',
				at: 'center',
			}
		}
	};

	//======================================================
	// Simple static image view with navigation
	//======================================================
	app.Layouts.TextView = {
		//----------------------------
		// standard
		//----------------------------
		'standard': {
			Backdrop: {
				dock: {
					top: 'stage top 48',
					bottom: 'stage bottom -32',
					left: 'stage left 29',
					right: 'stage right -29'
				}
			},

			Title: {
				dock: {
					top: 'Backdrop top 25',
					left: 'Backdrop left 20',
					right: 'Backdrop right -20'
				}
			},

			Standards: {
				dock: {
					top: 'Title bottom 14',
					left: 'Title left',
					right: 'Title right'
				}
			},

			Text: {
				dock: {
					top: 'Standards bottom 14',
					top2: 'Title bottom 14',
					left: 'Title left',
					right: 'Title right'
				}
			}
		}

	};

	//======================================================
	// Preferences view
	//======================================================
	app.Layouts.PrefsPage = {
		//----------------------------
		// standard
		//----------------------------
		'standard': {

			prefs: {
				dock: {
					top: 'stage top 48',
					bottom: 'stage bottom -32',
					left: 'stage left 29',
					right: 'stage right -29'
				}
			}
		}
	};

	//======================================================
	// Pencil and Paper Questions (similar to WorkViewNoImage)
	//======================================================
	app.Layouts.Paper = {

		//----------------------------
		// standard
		//----------------------------
		'standard': {

			question: {
				dock: 'stage',
				my: 'top center',
				at: 'top center',
				ofs: '0 150',
				w: 700
			},

			responseText: {
				dock: 'question',
				my: 'top left',
				at: 'bottom left',
//				ofs: '0 30',		// Should dock to the top bar, but we can't (yet) have complex mode and centering
				w: 700				// Should match the answerBox width
			}

		}
	};

	//======================================================
	//
	//======================================================
	app.Layouts.AssignmentList = {

		//----------------------------
		// standard
		//----------------------------
		'standard': {

			HWBanner: {
				dock: 'menuButton',
				my: 'top left',
				at: 'top right',
				ofs: '30 -3'
			},

			backdrop: {
				dock: {
					top: 'stage top 48',
					bottom: 'stage bottom -32',
					left: 'stage left 0',
					right: 'stage right 0'
				}
			},

			assignmentList: {
				dock: {
					top: 'backdrop top 23',
					bottom: 'backdrop bottom -25',
					left: 'backdrop left 0',
					right: 'backdrop right 0'
				}

			},

			assignmentButtons: {
				dock: {
					top: 'stage top 20',
					left: 'stage left 8',
					right: 'stage right -8'
				}
			}

		}
	};

	//======================================================
	//
	//======================================================
	app.Layouts.StudentGrades = {

		//----------------------------
		// standard
		//----------------------------
		'standard': {

			chartTitleText: {
				dock: 'backdrop',
				my: 'top left',
				at: 'top left',
				ofs: '67 46'
			},

			chart1: {
				dock: 'chartTitleText',
				my: 'top left',
				at: 'bottom left',
				ofs: '-10, 8'
			}

		}
/*
		//----------------------------
		// standard
		//----------------------------
		'standard': {

			HWBanner: {
				dock: 'menuButton',
				my: 'top left',
				at: 'top right',
				ofs: '30 -3'
			},

			backdrop: {
				dock: {
					top: 'stage top 48',
					bottom: 'stage bottom -32',
					left: 'stage left 8',
					right: 'stage right -8'
				}
			},

			assignmentList: {
				dock: {
					top: 'backdrop top 23',
					bottom: 'backdrop bottom -25',
					left: 'backdrop left 48',
					right: 'backdrop right -20'
				}

			},

			assignmentButtons: {
				dock: {
					top: 'stage top 20',
					left: 'stage left 8',
					right: 'stage right -8'
				}
			}
		}
*/
	};

	//======================================================
	//
	//======================================================
	app.Layouts.Login = {

		//----------------------------
		// standard
		//----------------------------
		'standard': {

			backdrop: {
				dock: {
					top: 'stage top 48',
					bottom: 'stage bottom -32',
					left: 'stage left 30',
					right: 'stage right -30'
				}
			},

			title: {
				dock: {
					top: 'stage top 146',
					centerx: 'backdrop center',
				}
			},

			login: {
				dock: {
					top: 'title bottom 50',
					centerx: 'backdrop center',
				}
			},

			options: {
				dock: {
					top: 'login bottom 30',
					left: 'login left'
//					centerx: 'backdrop center'
				}
			},

/*
			errMsg: {
				dock: {
					top: 'stage top 186',
					centerx: 'backdrop center',
				},
				w: 400-22
			}
*/
		}
	};

	//======================================================
	//
	//======================================================
	app.Layouts.LoginCreate = {

		//----------------------------
		// standard
		//----------------------------
		'standard': {

			backdrop: {
				dock: {
					top: 'stage top 48',
					bottom: 'stage bottom -32',
					left: 'stage left 30',
					right: 'stage right -30'
				}
			},

			title: {
				dock: {
					top: 'stage top 126',
					centerx: 'backdrop center',
				}
			},

			login: {
				dock: {
					top: 'title bottom 30',
					centerx: 'backdrop center',
				}
			},

			options: {
				dock: {
					top: 'login bottom 30',
					left: 'login left'
//					centerx: 'backdrop center'
				}
			},

			instruct: {
				dock: {
					top: 'login bottom 15',
					left: 'login left 11',
					right: 'login right'
				}
			}

		}
	};

	//======================================================
	//
	//======================================================
	app.Layouts.Help = {

		//----------------------------
		// standard
		//----------------------------
		'standard': {

			backdrop: {
				dock: {
					top: 'stage top 48',
					bottom: 'stage bottom -32',
					left: 'stage left 30',
					right: 'stage right -30'
				}
			},
/*
			student: {
				dock: {
//					top: 'title bottom 50',
					top: 'backdrop top 130',
//					left: 'backdrop left 80',
					centerx: 'backdrop center',
				}
			},

			teacher: {
				dock: {
					top: 'student bottom 40',
					left: 'student left',
				}
			},
*/
			title: {
				dock: {
					top: 'stage top 140',	//100
					centerx: 'backdrop center',
				}
			},

			student: {
				dock: {
					top: 'title bottom 50',
//					top: 'backdrop top 130',
//					left: 'backdrop left 80',
					left: 'backdrop left 55',
				}
			},

			teacher: {
				dock: {
					top: 'student top',
					right: 'backdrop right -55',
				}
			},

			studentOnly: {
				dock: {
					top: 'title bottom 50',
					centerx: 'backdrop center',
				}
			},

			// Media credits link
			credits: {
				dock: {
					bottom: 'stage bottom -4',
					right: 'backdrop right -8'
				}
			}
		}
	};

	//======================================================
	//
	//======================================================
	app.Layouts.ErrorScreen = {

		//----------------------------
		// standard
		//----------------------------
		'standard': {

			backdrop: {
				dock: {
					top: 'stage top 48',
					bottom: 'stage bottom -32',
					left: 'stage left 30',
					right: 'stage right -30'
				}
			},

			title: {
				dock: {
					top: 'stage top 166',
					centerx: 'backdrop center',
				}
			},

			message: {
				dock: 'backdrop',
				my: 'center',
				at: 'center'
			}

		}
	};

	//======================================================
	//======================================================
	app.Layouts.DrillResults = {

		//----------------------------
		// standard
		//----------------------------
		'standard': {

			roundText: {
				dock: 'backdrop',
				my: 'top left',
				at: 'top left',
				ofs: '67 46'
			},

			problemText: {
				dock: 'roundText',
				my: 'top left',
				at: 'top right',
				ofs: '74 0'
			},

			chart1: {
				dock: 'roundText',
				my: 'top left',
				at: 'bottom left',
				ofs: '-10, 8'
			},

			summaryText: {
				dock: 'chart1',
				my: 'top left',
				at: 'bottom left',
				ofs: '10 30'
			},

			chart2: {
				dock: 'summaryText',
				my: 'top left',
				at: 'bottom left',
				ofs: '-10 8'
			},

			nextButton: {
				dock: 'chart2',
				my: 'top right',
				at: 'bottom right',
				ofs: '0 50'
			}
		}
	};

	//======================================================
	//
	//======================================================
	app.Layouts.Classes = {

		//----------------------------
		// standard
		//----------------------------
		'standard': {

			backdrop: {
				dock: {
					top: 'stage top 48',
					bottom: 'stage bottom -32',
					left: 'stage left 30',
					right: 'stage right -30'
				}
			},

			classList: {
				dock: {
					top: 'backdrop top 20',
					bottom: 'backdrop bottom -10',
					left: 'backdrop left 20',
					right: 'backdrop right -70'
				}
			}

		}
	};

})();
