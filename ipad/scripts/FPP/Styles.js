//===========================================================================================
// Style Definitions
//
// Style control the visual appearance of widgets.
// Currently, images/image assets are NOT included in styles.  That limits the changes possible,
// but a true skin would include not only images but layout as well.  This is a limited subset
// of skins.
//
// This is a first-pass, mainly to streamline the arguments passed into widgets.  Options
// should be combined and simplified before this is actually usable as a skinning system.
//===========================================================================================
;(function() {
	var defaultStyle = {

		readOnlyColor: '#EBEBEB',	//'#FFFBDB',
		boxWrongColor: 'yellow',
		boxROWrongColor: '#DBDB00',

		defaultColor: 'black',
		happyColor: '#47A855',
		sadColor: '#B30021',

		probCreateText: "Creating a new problem",
		probCreateBg: "#9C0C0C",
		probCreateTime: 1000,

		//-----------------------------------------------------
		// Standard backdrop
		//-----------------------------------------------------
		backdrop: {
			bgColor: 'white',
			bgExtendH: 15,
			bgExtendV: 15,
//			borderDepth: 2,
			images: {
				tl: 'STBorderTL',
				tr: 'STBorderTR',
				bl: 'STBorderBL',
				br: 'STBorderBR',
				t: 'STBorderT',
				b: 'STBorderB',
				l: 'STBorderL',
				r: 'STBorderR'
			}
		},

		//-----------------------------------------------------
		// Navigation icons
		//-----------------------------------------------------
		navIcons: {
		  margin: 10,
		  tipDelay: 600
		},

		//-----------------------------------------------------
		// VCR Control icons
		//-----------------------------------------------------
		vcrControls: {
		  margin: 10
		},

		//-----------------------------------------------------
		// Tooltips
		//-----------------------------------------------------
		tooltip: {
		  textColor: 'white',
		  font: 'bold 16px Arial',
		  boxColor: 'black',	//'#0076ab',
		  boxAlpha: 0.6,	//0.75,
		  boxBorder: 2,
		  borderColor: 'white',	//'black',
		  hMargin: 8,
		  vMargin: 6,
		  fadeInTime: 500		// Time, in ms, for tip to fade in.
		},

		//-----------------------------------------------------
		// Color key
		//-----------------------------------------------------
		colorKey: {
		  boxWidth: 15,
		  boxHeight: 15,
		  margin: 5,
		  gap: 14,
		  font: '10px Arial',
		  textColor: 'black',
		  align: 'right'
		},

		//-----------------------------------------------------
		// All question answer inputs
		//-----------------------------------------------------
		input: {
			tipPos: "T",
			tipOfs: [0,-2],
			rightGap: 16
		},

		//-----------------------------------------------------
		// Equation input
		//-----------------------------------------------------
		eqInput: {
			height: 60,
			width: 300,
			margin: 1,
			boxColor: 'white',
			boxBorderWidth: 1,
			boxBorderColor: 'black',
			font: '14px Arial',	// For text buttons
			color: 'black'		// For text buttons
		},

		//-----------------------------------------------------
		// Button grids
		//-----------------------------------------------------
		buttonGrid: {
			vPadding: 8,
			hPadding: 10
		},

		//-----------------------------------------------------
		// Keypad styles
		//-----------------------------------------------------
		keypad: {
			background: 'eqInputBG',
			padding: 12,		// Space between the background and the buttons
			fadeDelay: 100,
			fadeRate: 200
		},

		//-----------------------------------------------------
		// Multiple Choice input
		//-----------------------------------------------------
		multipleChoice: {
		  radioAsset: 'WVRadio',
		  checkAsset: 'WVCheck',
		  yAdjust: -1,
		  font: '16px/20px Trebuchet',	// @FIXME/dg: BROKEN!  Needs to be "Trebuchet MS".  That makes the text longer, which changes wrapping.  Leaving it as-is for now.
		  color: 'black',
		  bgColor: 'white',
		  borderColor: 'black',
		  borderWidth: 1,
		  hMargin: 10,
		  vMargin: 4,
		  selectColor: 'blue',
		  assetGap: 6,
		  hGap: 20,
		  vGap: 6
		},

		//-----------------------------------------------------
		// Free-form multi-box input
		//-----------------------------------------------------
		freeInput: {
			font: '18px/22px Times New Roman',	// This font face (but not size) needs to match the inputBox font face or the width test will be invalid.
			color: 'black',
			wrongColor: 'orange'
		},

		//-----------------------------------------------------
		// Free-form multi-box input
		//-----------------------------------------------------
		multiInput: {
		  align: 'left',
//		  borderWidth: 0,
//		  borderColor: 'black',
//		  padding: '8px',			// This shouldn't be here
		  widthAdjust: -18,
		  depth: 1,
		  hidden: true
		},

		//-----------------------------------------------------
		// Input boxes
		//-----------------------------------------------------
		inputBox: {
			borderWidth: 1,
			borderColor: 'black',
			marginX: 3,
			marginY: 0,
			font: '1px Times New Roman',
			textColor: 'black',
			cursorColor: 'black',
			bgColor: 'white',
			focusBorderColor: 'blue',
			blinkRate: 500		// Cursor blink rate, in milliseconds, for a half cycle.  This is both the time on and the time off.
		},

		//-----------------------------------------------------
		// Graph input
		//-----------------------------------------------------
		graphPlotInput: {
			boxColor: '#BDD2D9',
			borderWidth: 1,
			borderColor: 'black',
			margin: 8,
			titleMargin: 0,
			firstEntryMargin: 28,
			tableMargin: 20,
			tableGap: 8,
			tableTextColor: '#2F2F94',
			iconAsset: 'WVRemove',
			iconYAdjust: 2,
			iconGap: 2,
			pairMargin: 4
		},

		//-----------------------------------------------------
		// Graph input
		//-----------------------------------------------------
		graphConstInput: {
			font: 'bold 14px Arial',
			textColor: 'black',
			boxColor: '#BDD2D9',
			borderWidth: 1,
			borderColor: 'black',
			eqColor: 'blue',
			margin: 8,
			firstFieldY: 8,
			graphMargin: 10,
			inputGap: 4,
			inputWidth: 50,
			fieldMargin: 16
		},

		//-----------------------------------------------------
		// Graph display widget
		//-----------------------------------------------------
		graph: {
		  pointColor: '#2F2F94',
		  pointTextColor: '#2F2F94',
		  bgColor: 'white',
		  gridColor: 'lightgray',
		  axisColor: 'black',
				gridFont: "12px serif",
				gridFontColor: '#707070' // light gray
		},

		//-----------------------------------------------------
		// Progress Meter (problem list)
		//-----------------------------------------------------
		progressMeter: {
		  asset: 'PLPossible',
		  numberAsset: 'PLNumbers',
		  numY: 9,
		  numGap: 1
		},

		//-----------------------------------------------------
		// Points widget in the work view
		//-----------------------------------------------------
		points: {
		  background: 'WVPointsOval',
		  font: '20px Arial',
		  margin: 10,
		  numWidth: 66,
		  yAdjust: -1
		},

		//-----------------------------------------------------
		// Problem List
		//-----------------------------------------------------
		problemList: {
			pageButtonOffsetX: 6,
			pageButtonOffsetY: 0,
			pageButtonGap: 4,
			sectionTopGap: 0,		// Space within the scrollable container between the top and the first line of text on any page
			sectionBottomGap: 0,	// Space reserved at the bottom of the scrollable container.  Anything in that area is considered part of the next page.
			unitGap: 0,		// Space between units
			sectionBGColor: 'white',

			barAsset: 'WVStepLine',
			barNormColor: 'white',
			barSelectColor: '#6098F7',	//'#75A8FF',
			barLeftMargin: 20,
			barRightMargin: 50,

			minHeight: 80,		// Minimum height of a line (total height; vMargin isn't added)
			vMargin: 12,			// Amount of space guaranteed to be above and below each line
			selectMargin: 4,

			numberFont: 'bold 34px/40px Arial',
			numberColor: '#DF6924',
			numMargin: 12,

			statusMargin: 11,

			qFont: '16px/20px Arial',
			qColor: 'black',
			qLeftMargin: 115,	//105,
			qRightMargin: 160,

			pointFont: '20px/24px Arial',
			pointColor: 'black',
			pointRightMargin: 60,
			pointLeftMargin: 40
		},

		//-----------------------------------------------------
		// Quizboard
		//-----------------------------------------------------
		quizboard: {
			qFont: '20px/24px Arial',
			qColor: '#ef732e'
		},

		//-----------------------------------------------------
		// Assignment List
		//-----------------------------------------------------
		assignmentList: {
			rightMargin: 54,
			pageButtonOffsetX: 60,	// 60 -> 66
			pageButtonOffsetY: 5,
			pageButtonGap: 4,
			sectionTopGap: 0,		// Space within the scrollable container between the top and the first line of text on any page
			sectionBottomGap: 0,	// Space reserved at the bottom of the scrollable container.  Anything in that area is considered part of the next page.
			unitGap: 0,		// Space between units
			sectionBGColor: 'white',
			headerColor: '#0c79cf',
			headerHeight: 30,
			borderWidth: 2,
			minHeight: 39,			// 39 makes lines with icons the same size as lines without icons

			// Fixed widths for column headers
			leftMargin: 8,
			assignmentNameWidth: 478,
			dateAssignedWidth: 80,
			dateDueWidth: 80,
			assignmentTypeWidth:75,
			gradeWidth: 56,
			iconWidth: 33,

			// Column header styles
			qHeadingFont: 'bold 12px/15px Arial',
			qHeadingColor: 'white',
			scoreColor: 'yellow',

			// Bar styles
			barAsset: 'WVStepLine',
			barRowEven: 'white',
			barRowOdd: '#ebf2fa',
			barRowEvenHigh: '#6098F7',
			barRowOddHigh: '#6098F7',

			// Table text styles
			qFont: '12px/15px Arial',
			qColor: 'black',
			pastDueColor: '#C40000',

			noResultsFont: '12px/15px Arial',
			noResultsColor: 'red',
			noResultsTopMargin: 10,
		},

		//-----------------------------------------------------
		// Question text (with associated icons)
		//-----------------------------------------------------
		question: {
		  numberColor: '#F05A24',
		  numberFont: 'bold 16px/20px Trebuchet MS',
		  margin: 6,
		  yAdjust: -2,
		  color: 'black',
		  font: '16px/20px Trebuchet MS',
		  instructFont: 'bold 16px/20px Trebuchet MS',
		  instructColor: 'black',
		  instructGap: 10,
		  diffAsset: 'WVDifficulty',
		  diffPos: -27		// Horizontal margin of the difficulty icon, relative to the question widget (the text is aligned with the Q widget, and the icon sticks out to the left)
		},

		//-----------------------------------------------------
		// Step-by-step input
		//-----------------------------------------------------
		steps: {
			titleAsset: 'WVStepHeader',
			textFont: 'bold 16px/20px Arial',
			textSpace: 48,
			bgColor: 'white',	//#F3E8CC',

			qColor: 'black',
			qFont: '16px/20px Trebuchet MS',
			qWidth: 160,	//200,
			qEqWidth: 0.75,  // Width of a question, in percentage of current width
			qGap: 14,    // Horizontal gap between question and answer input
			rGap: 6,

			buttonY: 20,  // Position below answerInput
			eqMargin: 4,  // Vertical space between the question and the equation input box
			eqWidth: 0.75,  // Width of the equation entry box (percentage)
			eqHeight: 80,  // Height of the equation entry box

			// Multi-input for step-by-step
			multiInput: {
				depth: 1,
				hidden: true,
				widthAdjust: 0
			},

			hintColor: '#063bb9',	//'#499FF5',
			messageTime: 1500,    // Time that correct message is displayed
			textFadeRate: 500  //300
		},

		//-----------------------------------------------------
		// Scrollable list
		//-----------------------------------------------------
		scroller: {
			// Used by the scroller container
		  boxColor: '#f8f0e1',
		  boxBorderWidth: 2,
		  boxBorderColor: '#80b6e2', //'#b1b1b1',

		  arrowAsset: 'WVStepArrows',
		  arrowFadedAlpha: 0.3,
		  arrowFadeInRate: 300,
		  arrowFadeOutRate: 600,

			// Used by the inner scroller
		  scrollRate: 550,  //450,
		  forcedScrollRate: 600,
		  widFadeInRate: 500,
		  lineAsset: 'WVStepLine',
		  gap: 13,	// The gap needs to be at least 1 larger than the vMargin.  Equal *should* work but is 1 pixel off.
		  hMargin: 8,
		  vMargin: 12
		},

		//-----------------------------------------------------
		// Solution text
		//-----------------------------------------------------
		solution: {
		  font: '16px/20px Arial',
		  color: 'black',
		  bgColor: 'white',
		  borderColor: 'black',
		  borderWidth: 2,
		  hMargin: 20,
		  vMargin: 10,
		  gap: 4
		},

		//-----------------------------------------------------
		// Reward sprite for correct answers
		//-----------------------------------------------------
		reward: {
		  preFadeTime: 1000,
		  fadeTime: 1000
		},

		//-----------------------------------------------------
		// Streak animation
		//-----------------------------------------------------
		streak: {
		  rate: 18,    // Frame rate
		  objectSkip: 100,
		  margin: 10
		},

		//-----------------------------------------------------
		// Stars in work view
		//-----------------------------------------------------
		stars: {
		  asset: 'WVStars',
		  gap: 0
		},

		//-----------------------------------------------------
		// Problem Status Icon
		//-----------------------------------------------------
		probStatus: {
			asset: 'WVStatus'
		},

		//-----------------------------------------------------
		// Points/Percent display in problem lists and work view
		//-----------------------------------------------------
		score: {
			color: '#F2DE00',
			font: '20px Arial'
		},

		//-----------------------------------------------------
		// "Tries left" display on work view (OHW only)
		//-----------------------------------------------------
		submissions: {
			color: '#E38724',	// Orange
			font: '20px Arial'
//			font: '16px/20px Arial'
		},

		//-----------------------------------------------------
		// Fireworks
		//-----------------------------------------------------
/*
		fireworks: {
		  minDuration: 1500,
		  extraDuration: 80,
		  hMargin: 200,
		  riseFrameRate: 10,
		  boomFrameRate: 15,
		  boomRateDelta: 3,

		  minBurst: 300,    // Lowest y coordinate of explosion
		  maxBurst: 80,    // Highest y coordinate of explosion
		  minRiseTime: 500,  // Minimum time for firework to reach its explosion height
		  maxRiseTime: 1500,  // Maximum time for firework to reach its explosion height

		  small: {
			list: [
			  ['Firework4A', 'Firework4B']
			],
			xOffset: 20,
			yOffset: 20
		  },

		  medium: {
			list: [
			  ['Firework1A', 'Firework1B'],
			  ['Firework2A', 'Firework2B'],
			  ['Firework3A', 'Firework3B']
			],
			xOffset: 75/2,
			yOffset: 75/2
		  },

		  large: {
			list: [
			  ['Firework5A', 'Firework5B']
			],
			xOffset: 215/2,
			yOffset: 230/2
		  }
		},
*/

		//-----------------------------------------------------
		// Work view help menu
		//-----------------------------------------------------
		helpMenu: {
			box: {
				color: 'white',
				borderColor: '#0033B1',
				borderWidth: 2,
				rate: 250,
				fadeRate: 300
			},

			menu: {
				hMargin: 10,
				vMargin: 10,
	//        topMargin: 10,
				lineHeight: 25,
				font: "14px Helvetica Medium",
				color: 'black',
				align: 'left',
	//        iconMargin: 11,
				textGap: 10,
				iconAsset: 'WVHelpIcons',
				barColor: '#0076ab',
				barAdjustY: -3,
				fadeRate: 400,
				fadeDelay: 0,
				fadeOut: 100
			},

			// Actual size of the video
			video: {
				height: 344,
				width: 640
			}
		},

		//-----------------------------------------------------
		// Whiteboard widget
		//-----------------------------------------------------
		whiteboard: {
			bgColor: '#247591',
			borderWidth: 8,
			borderHeight: 8,
//			ActBgHmargin: 32,
//			ActHeightAdjustment: -3,
//			ActWidthAdjustment: 0,
//			ActBgWidthOfs: 63,
			ActTextYOfs: 147,

			titleHeight: 40,
			titleFont: 'bold 28px Arial',
			titleColor: 'white',
			titleHmargin: 18+8,
			titleVmargin: 4,
			titleActVmargin: 2,

			textBoxHeight: 2+97,
			textFont: 'bold 20px/24px Arial',
			textColor: 'white',
			textHmargin: 48,
			textVmargin: 10,
			textActVmargin: 32,

			bulletHmargin: 16,
			bulletVmargin: 2,

			buttonXOfs: -43,
			buttonYOfs: -30
		},

		//-----------------------------------------------------
		// Section Text widget
		//-----------------------------------------------------
		sectionText: {
			bgColor: 'white',
			cardOffsetH: 20,
			cardOffsetV: 20,
			interCardMargin: 10,
			dividerMargin: 16,
			titleColor: '#ef732e',
			titleFont: 'bold 27px/32px Arial',
			titleHmargin: 0,
			titleVmargin: 0,
			termColor: '#09f',
			termFont: 'bold italic 14px/16px Arial',
			termVmargin: 5,
			termHmargin: -10,
			defColor: '#09f',
			defFont: '15px/18px Arial',
			defVmargin: 8,
			textColor: 'black',
			textFont: '14px/16px Arial',
			textVmargin: 14,
			textRmarginAdjust: 55,
			linkFont: '12px/15px Arial',
			linkColor: '#449EBD',
			hoverColor: '#ef732e', //'#61A85E',

			borderLMargin: 20,
			borderRMargin: 20,
			borderTMargin: 20,
			borderBMargin: 20,

			imageExtension: '.png'
		},

		//-----------------------------------------------------
		// Standards widget
		//-----------------------------------------------------
		standards: {
			titleColor: 'black',
			titleFont: 'bold 14px/16px Arial',
			linkColor: '#449ebd',
			linkFont: '14px/16px Arial',
			hoverColor: '#ef732e',
			refColor: '#333',
			refFont: '14px/16px Arial',
			entryGap: 5
		},

		//-----------------------------------------------------
		// Summary Text widget
		//-----------------------------------------------------
		summary: {
			bgColor: 'white',
			dividerOffsetV: 30,
			dividerOffsetH: -10,
			cardOffsetL: 34,		// Left margin for cards
			cardOffsetR: 24,		// Right margin for cards
			topCardOffsetV: 80,
			cardOffsetV: 30,		// Space between top and bottom cards
			cardScale: 1.2,
			titleColor: '#145064',
			titleFont: 'bold 27px/32px Arial',
			titleHmargin: 0,
			titleVmargin: 29,
			textVmargin: -4,
			textRmarginAdjust: 10
		},

		//-----------------------------------------------------
		// Whiteboard cards
		//-----------------------------------------------------
		wbCard: {
			bottomImage: 'STCardBottom',
			titleColor: 'white',
			titleFont: 'bold 15px/18px Arial',
			titleHmargin: 7,
			titleVmargin: 2,
			textColor: 'white',
			textFont: '14px/16px Arial',
			textHmargin: 2,
			textVmargin: 3,
			bottomMargin: 10,
			textRmarginAdjust: 15,
			cardHeight: 175		// These are loaded dynamically, so we can't determine the height automatically
		},

		//-----------------------------------------------------
		// Quickcheck cards
		//-----------------------------------------------------
		qcCard: {
			startScale: (290+6)/317,	// Add in the border width (*2)
			hoverScale: 1.25,		// Beyond this we have overlapping issues
			iconAsset: 'WVPlayVid'
		},

		//-----------------------------------------------------
		// Table of contents widget
		//-----------------------------------------------------
		toc: {
			chapterFont: '16px/19px Arial',
			chapterTextGap: 1,
			chapterBGColor: 'white',
			chapterTextColor: 'black',
			chapterHMargin: 30,
			chapterVMargin: 50,
			chapterHoverColor: '#61A85E',
			chapterHighlightColor: 'blue',

			TOCStringFont: 'bold 20px/24px Arial',
			TOCStringColor: '#4560CC',
			TOCStringGap: 5,		// Space between the "Table of Contents" strings and the chapter list on the left side
			TOCStringVMargin: 16, //19,
			TOCStringHMargin: 24,

			// Unit/section box and header
			titleFont: 'bold 18px/21px Arial',
			titleColor: 'blue',
			titleVMargin: 16,	//22,
			titleHMargin: 20,
			titleGap: 2,

			unitCountFont: 'bold 15px/18px Arial',
			unitCountColor: 'blue',
			unitCountGap: 8,

			dividerColor: '#145064',
			dividerHeight: 2,

			// Unit/Section list
			sectionBGColor: 'white',
			pageButtonOffsetX: 6,
			pageButtonOffsetY: 0,
			pageButtonGap: 4,

			sectionSideMargin: 20,	//14,		// Space between section box and scrollable window
			sectionBottomMargin: 8,	// Space between section box and scrollable window

			sectionTopGap: 12,		// Space within the scrollable container between the top and the first line of text on any page
			sectionBottomGap: 10,	// Space reserved at the bottom of the scrollable container.  Anything in that area is considered part of the next page.
			unitGap: 12		// Space between units
		},

		//-----------------------------------------------------
		// Preference View
		//-----------------------------------------------------
		prefsList: {
			bgColor: 'white',
			titleColor: '#ef732e',
			titleFont: 'bold 27px/32px Arial',
			titleHmargin: 0,
			titleVmargin: 0,
			tabColor: 'black',
			tabFont: 'bold 18px/21px Arial',
			tabVmargin: -4,
			textColor: 'black',
			textFont: '14px/16px Arial',
			textVmargin: -4,
			textRmarginAdjust: 10
		},

		//-----------------------------------------------------
		// UnitToc widget: atomic unit entry
		//-----------------------------------------------------
		unitToc: {
			unitFont: '17px/20px Arial',
			unitTextColor: '#4560CC',
			unitTextGap: 2,			// Space between unit title and text
			sectionFont: '16px/19px Arial',
			sectionTextGap: 0,		// Space between section entries
			sectionTextColor: 'black',
			sectionIndent: 20,		// Horizontal space (indent) between unit name and section names

			hoverColor: '#61A85E'
		},

		//-----------------------------------------------------
		// Multi-pulldown system to facilitate book navigation
		//-----------------------------------------------------
		topNav: {
			gap: 8		// Space between pulldowns
		},

		//-----------------------------------------------------
		// Multi-pulldown system to facilitate book navigation
		//-----------------------------------------------------
		navPulldown: {
			titleFont: 'bold 10px Arial',
			titleColor: '#EC9734',
			locationFont: 'bold 12px Arial',
			locationColor: 'white',

			headerFont: 'bold 11px/14px Arial',
			headerColor: 'black',
			subItemMargin: 12,		// Horizontal space between the header and subitems
			itemFont: '11px/14px Arial',
			itemColor: 'black',
//			itemHMargin: 13 + 7,	// Horizontal space between the left edge and items or headers, if there are headers (7 is the left border width)
			itemHMargin: 4,	// Horizontal space between the left edge and items or headers, if there are headers (7 is the left border width)
			itemRMargin: 13,		// Hack to balance out left and right sides given that border widths aren't symmetrical
			itemVMargin: 2,			// Vertical space between items
			itemHighlightColor: 'white',
			selectedColor: '#F86B00',

			barColor: '#F69935',
			barHMargin: 5,		// Space between the bar's left/right edge and the text

			tabOffsetX: -7,	// Offset of the tab asset to the title text
			tabOffsetY: -2,
			bgMargin: 5,	// Horizontal space between the tab's left and right sides and the background (invisible border)
			bgTopMargin: -5,	// Space between the bottom of the top and the top of the background
			bgBottomMargin: 6,	// Space between the bottom of the list and the bottom of the background
			bgColor: '#E3F0F4',
			bgAlpha: 0.9,
			bgBorder: {
				tl: 'PDSlicesTL',
				tr: 'PDSlicesTR',
				bl: 'PDSlicesBL',
				br: 'PDSlicesBR',
				t: 'PDSlicesT',
				b: 'PDSlicesB',
				l: 'PDSlicesL',
				r: 'PDSlicesR'
			}
		},

		//-----------------------------------------------------
		// Version and copyright string
		//-----------------------------------------------------
		statusLine: {
			gap: 8,	// Space between text entries
			font: '12px/15px Arial',

			crColor: '#449EBD',
			crString: '&copy;2014 Perfection Learning&reg; Corporation',
			verColor: '#449EBD',
			separator: '&#8226;',	// Other options: &middot; or emdash: &#8212;
			sepColor: '#449EBD'
		},

		//-----------------------------------------------------
		// Slide out menu
		//-----------------------------------------------------
		slideOut: {
			bgColor: '#7D7D7D',
			bgAlpha: 0.96,
			bgBorderWidth: 1,
			bgBorderColor: 'black',

			easeIn: 'swingPast',
			easeInRate: 600,
			easeOut: 'swing',
			easeOutRate: 600,

			overhang: 20,		// The amount of the container hidden beyond the left edge.  This is because of easing.  The overhang is briefly visible.

			itemHMargin: 8,
			itemVMargin: 10,
			tabSize: 12,			// Width, in pixels, of each indent level
			font: '16px/20px Arial',
			textColor: 'black',
			lineHeight: 20
		},

		//-----------------------------------------------------
		// Search widget
		//-----------------------------------------------------
		search: {
			gap: 8,	// Space between text entries
			searchFieldPad: 20,
			resultsFont: '12px/15px Arial',
			resultsColor: '#449EBD',
			searchDescFont: 'bold 12px/15px Arial',
			searchDescColor: '#145064',
			hoverColor: '#ef732e', //'#61A85E',
			defaultColor: '#000',

			// Unit/Section list
			sectionBGColor: 'white',
			pageButtonOffsetX: 6,
			pageButtonOffsetY: 0,
			pageButtonGap: 4,

			sectionSideMargin: 75, //20,	//14,		// Space between section box and scrollable window
			sectionBottomMargin: 8,	// Space between section box and scrollable window

			fieldWidth: 600,
			searchBtnGap: 10,

			sectionTopGap: 10,		// Space within the scrollable container between the top and the first line of text on any page
			sectionBottomGap: 10,	// Space reserved at the bottom of the scrollable container.  Anything in that area is considered part of the next page.
			unitGap: 12		// Space between units

		},

		//-----------------------------------------------------
		// Login widget
		//-----------------------------------------------------
		login: {
			gap: 8,	// Space between text entries
			fieldLabelFont: '13pt arial',
			fieldLabelColor: 'black',
			defaultColor: '#000',
			buttonFont: 'bold 13pt arial',
			buttonColor: '#0051c1',
			buttonHoverColor: '#f90',

			bgColor: '#FFFBD5',

			sidePadding: 15,
			fromTheTop: 70,
			fromTheBottom: 20,
			fromTheTopInternal: 50,
			msgFromTheBottom: 65,

			betweenFields: 10,

			fieldWidth: 225,

			width: 415,
			changePasswordHeight: 320,
			changeEmailHeight: 320,
			changeConfirmHeight: 135,
			loginHeight: 250,
			loginRegCodeHeight: 255,
			createHeight: 360,
			resetHeight: 175
		},

		//-----------------------------------------------------
		// Workview problem image overlays
		//-----------------------------------------------------
		overlayList: {
			font: 'bold 12px Arial',	// The size is ignored, but we need a default
			borderWidth: 3				// Used in WorkView widgetList
		},

		//-----------------------------------------------------
		//-----------------------------------------------------
		navMenu: {
			font: 'bold 14px/16px Arial',
			iconGap: 4,		// Space between icon and text
			itemGap: 6,		// Space between each line (part of the highlight bar)
			vMargin: 12,	// Space between border and entries
			hMargin: 18,	// Space between border and entries
			barLMargin: 7,	// Space between the border and the bar (should be less than hMargin)
			barRMargin: 10,	// Space between the border and the bar (should be less than hMargin)

			easeIn: 'swing',
			easeInRate: 300,
			easeOut: 'swing',
			easeOutRate: 200,

			closeDelay: 400,	// Time before closing when the mouse leaves the menu
			autoClose: 1200		// Amount of time before the menu closes if the mouse doesn't enter (ms)
		},

		//-----------------------------------------------------
		//-----------------------------------------------------
		assignName: {
			font: 'bold 16px/20px Arial',
			color: 'white'
		},

		//-----------------------------------------------------
		//-----------------------------------------------------
		form: {
			titleVMargin: 10,
			titleHMargin: 11,
			titleGap: 10,
//			titleFont: 'bold 23px/27px Arial',
//			titleColor: '#0051C1',
			titleFont: 'bold 17px/21px Arial',
			titleColor: 'black',

			bgColor: '#FFFBD5',

			fieldVMargin: 20,	// Vertical space between the subtitle and the first field
			fieldGap: 8,		// Vertical space between fields
			labelFont: '17px/21px Arial',
			labelColor: 'black',
			labelWidth: 0.40,	// Width of the label, as a percentage of the entire widget
			inputWidth: 0.50,	// Width of the input field, as a percentage of the entire widget

			buttonVMargin: 66,	// Vertical space between the inputs and buttons
			buttonGap: 5,		// Space between buttons

			resultFont: '17px/21px Arial',
			resultColor: '#FF0001',
			resultMargin: 12,	// Vertical space between the result text and fields

			textFont: '17px/21px Arial',
			textColor: 'black'
		},

		//-----------------------------------------------------
		//-----------------------------------------------------
		optionList: {
			vGap: 10,
			iconGap: 6,
			color: '#0051C1',
			hoverColor: '#f90',
			font: '17px/21px Arial'
		},

		//-----------------------------------------------------
		//-----------------------------------------------------
		textBox: {
			borderWidth: 2,
			borderColor: 'black',
			titleGap: 15,
			titleFont: 'bold 18px/21px Arial',
			titleColor: 'white',
			font: '13px/16px Arial',
			color: 'white',
			textFadeRate: 200,

			boxColor: '#0076AB',
			scaleRate: 350,
			boxFadeRate: 200,
			padding: 8
		}

	}	// Default style

    //-----------------------------------------------------
	// Cheesy override for mobile.  This should be done in
	// a better fashion!
    //-----------------------------------------------------
	app.style = defaultStyle;
	if (app.MOBILE)
		app.style.steps.buttonY = -38;

})();
