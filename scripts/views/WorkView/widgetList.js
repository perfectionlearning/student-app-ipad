//===============================================================================
// Screen Creation List: List of widgets with no coordinate or style information
//===============================================================================
;(function() {

	var view = app.Views.WorkView;
	view.widgetLists = {};

	//=======================================================
	// Screen Creation List: List of widgets with no coordinate information
	//=======================================================
	view.widgetLists.preLoad = {
		backdrop: [
			'backdrop', 'borderedBox', app.style.backdrop
		]
	}

	view.widgetLists.divider = {
		divider: [
			'divider', 'vertDivider', {
				assets: {t: 'STVertLineT', b: 'STVertLineB', m: 'STVertLineM'}
			}
		]
	}

	//-------------------------------------------------------
	//-------------------------------------------------------
	// Non-standard pieces.  Do these last since they depend on other pieces.
	view.widgetLists.questionLeft = {

		status: [
			'status', 'probStatus', {
				state: 'New',
				depth: 5
			}
		],

		title: [
			'title', 'text', {
//				text: 'Quick Check',
				color: '#0C4F65',		// @FIXME/dg: Move to style!
				font: 'bold 28px Arial'
			}
		],

		question: [
			'question', 'question', {hidden: true}
		]
	}

	//-------------------------------------------------------
	//-------------------------------------------------------
	// Non-standard pieces.  Do these last since they depend on other pieces.
	view.widgetLists.questionCenter = {

		question: [
			'questionCenter', 'question', {hidden: true}
		],

		status: [
			'statusCenter', 'probStatus', {
				state: 'New',
				depth: 5
			}
		],

		title: [
			'title', 'text', {
//				text: 'Quick Check',
				color: '#0C4F65',		// @FIXME/dg: Move to style!
				font: 'bold 28px Arial'
			}
		]
	}

	//-------------------------------------------------------
	//-------------------------------------------------------
	view.widgetLists.answerWids = {
		answerInput: [
			'answerInput', 'answerInput',
			{
				buttonAlign: 'L',
				buttonGap: 5,
				buttonX: 2,
				buttonY: 4,

				multiInput: app.style.multiInput
			}
		]
	};

	//-------------------------------------------------------
	//-------------------------------------------------------
	view.widgetLists.responseText = {
		responseText: [
			'responseText', 'text',
			{
				id: 'responseText',
				text: '&nbsp;',			// Empty strings take no vertical space
				font: 'bold 16px/20px Arial',
//				depth: 1
			}
		]
	};

	//-------------------------------------------------------
	// Hacky hidden chapter logo
	//-------------------------------------------------------
/*
	view.widgetLists.logo = {
		OHWHeader: [
			'OHWLogo', 'image', {image: 'OHWHeader'}
		]
	}
*/
	//-------------------------------------------------------
	// Assignment Up Button
	//-------------------------------------------------------
	view.widgetLists.assignUpButton = {

		goUp: [
			'goUp', 'button', {
				image: 'AssignUp',
				click: app.upLink,
				depth: fw.MIDPLUS
			}
		]
	}

	//-------------------------------------------------------
	// Quizboard Up Button
	//-------------------------------------------------------
	view.widgetLists.quizboardUpButton = {
		qzGoUp: [
			'qzGoUp', 'button', {
				image: 'QuizboardUp',
				click: app.upLink,
				depth: fw.MIDPLUS
			}
		]
	}

	//-------------------------------------------------------
	// Assignment Name
	//-------------------------------------------------------
	view.widgetLists.aName = {
		aName: [
			'aName', 'textSmartAlign', {
				font: app.style.assignName.font,
				color: app.style.assignName.color
			}
		]
	}

	//-------------------------------------------------------
	// Image associated with the question
	//-------------------------------------------------------
	view.widgetLists.qImage = {

		qImage: [
			'qImage', 'qImage', {
				borderWidth: app.style.overlayList.borderWidth,
				bgColor: app.style.backdrop.bgColor,
				depth: 6
			}
		]
	}

	//-------------------------------------------------------
	//-------------------------------------------------------
	view.widgetLists.sumCard = {
		card1: [
			'card1', 'qcCard', {
				blank: 'SUMBlankCard',
				scaleOrigin: 'L',
				click: view.watchVideo,
				depth: 6	// Needs to be larger than the input box
			}
		],
/*
		card2: [
			'card2', 'qcCard', {
				blank: 'SUMBlankCard',
				scaleOrigin: 'BL',
				click: view.watchVideo,
				depth:2
			}
		]
*/
	}

	//-------------------------------------------------------
	// Image overlays (assuming there is an image)
	//-------------------------------------------------------
/*
	view.widgetLists.qImageOverlay = {
		overlay: [
			'qImage', 'overlayList', {hidden: true}
		]
	}
*/

	//-------------------------------------------------------
	// Streak animation
	//-------------------------------------------------------
	view.widgetLists.streak = {
		streakAnim: [
			'wvStreakAnim', 'streakAnim',
			{
				bg: 'ANBG',
				'char': 'ANChar',
				object: 'ANObj',
				action: 'ANAct',
				motion: 'ANMove',
				end: 'ANEnd'
			}
		]
	};

	//-------------------------------------------------------
	//-------------------------------------------------------
	view.widgetLists.stepByStep =
	{
		id: 'stepByStep',    // Needed for toggler

		input: {

			/////////////////////////////////
			buttonList: [
				{asset: 'WVIcons', frame: 'Check', callback: view.stepSubmit},	//, tip: 'Check Answer'},
				{asset: 'WVIcons', frame: 'Menu', callback: view.stepHelpMenu}	//, tip: 'Menu'},
			],

//			buttonAlign: 'R',
			buttonGap: 4,
			buttonX: 0,
			buttonY: 4,
			lineWidth: 8,
		}
	};

	//-------------------------------------------------------
	//-------------------------------------------------------
	view.widgetLists.stars =
	{
		stars: [
			'stars', 'stars', {
				cur: 1,
				best: 3,
				max: 5
			}
		]
	}

	//-------------------------------------------------------
	//-------------------------------------------------------
	view.widgetLists.score =
	{
		score: [
			'score', 'score', {
				isPercent: false,
				modeChange: view.scoreModeChange
			}
		]
	}

	//-------------------------------------------------------
	//-------------------------------------------------------
	view.widgetLists.statusOverlay =
	{
		statusOverlay: [
			'statusOverlay', 'statusOverlay', {
				doSubmit:  app.submitAssignment,
				depth: 50
			}
		]
	}

	//-------------------------------------------------------
	//-------------------------------------------------------
	view.widgetLists.submits =
	{
		submits: [
			'submits', 'submissions', {
			}
		]
	}

	//-------------------------------------------------------
	//-------------------------------------------------------
	view.widgetLists.nextButton =
	{
		nextProb: [
			'nextProb', 'button', {
				image: 'WVMoveOn',
				frame: 'NextProblem',
				click: view.nextProblem
			}
		]
	}

	//-------------------------------------------------------
	// Nav arrows for OHW
	//-------------------------------------------------------
	view.widgetLists.arrows =
	{
		nextButton: [
			'nextButton', 'button', {
				image: 'STIcons',
				frame: 'Next',
				depth: fw.MIDPLUS,
				click: view.nextProblem
			}
		],

		backButton: [
			'backButton', 'button', {
				image: 'STIcons',
				frame: 'Back',
				depth: fw.MIDPLUS,
				click: view.prevProblem
			}
		]
	}

	//-------------------------------------------------------
	//-------------------------------------------------------
	view.widgetLists.keypad =
	{
		keypad: [
			'keypad', 'keypad', {
			}
		]
	}

})();
