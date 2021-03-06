var getDict = function() {

    // Include images that belong in the Atlas; exclude anything that's used as a tiled background.
    var atlasImages = {
		menuIcons: { name: 'MenuIcons', frameData: { frames: 10, TOC: 0, Factbook: 1, Grades: 2, Help: 3, Homework: 4, LPTOC: 5, Settings: 6, Logout: 7, Admin: 8, Graph: 9 } },
		menuButton: { name: 'MenuButton', frameData: { frames: 2 } },
		NavIcons: { name: 'NavIcons', frameData: { frames: 6, Menu: 0, Search: 3 } },
		Assignment: { name: 'AssignUp', frameData: { frames: 2 }},
		Homework: { name: 'HomeworkUp', frameData: { frames: 2 }},

        DropDown_Top_Left: { name: 'PDSlicesTL' },
        DropDown_Top_Right: { name: 'PDSlicesTR' },
        DropDown_Bottom_Left: { name: 'PDSlicesBL' },
        DropDown_Bottom_Right: { name: 'PDSlicesBR' },
		SmartMenu_Top_Left: { name: 'PDSlicesTL2' },
		SmartMenu_Top_Right: { name: 'PDSlicesTR2' },
        WV_Radio: { name: 'WVRadio', frameData: { frames: 4, Off: 0, On: 2 } },
        WV_Check: { name: 'WVCheck', frameData: { frames: 4, Off: 0, On: 2 } },
        WV_Remove: { name: 'WVRemove', frameData: { frames: 2 } },
		Step_by_Step_Help: { name: 'WVStepHeader' },
        Scroll_Triangles: { name: 'WVStepArrows', frameData: { frames: 6, Down: 3, Up: 0 } },
		Summary_Play_Button: { name: 'WVPlayVid' },
        videoClose: { name: 'VideoExit' },
		Change_Email_11: { name: 'PrefsEmail' },
		Change_Password_08: { name: 'PrefsPassword' },
        WB_Shadow_Top_Left: { name: 'WBShadowTL' },
        WB_Shadow_Top_Right: { name: 'WBShadowTR' },
        WB_Shadow_Bottom_Left: { name: 'WBShadowBL' },
        WB_Shadow_Bottom_Right: { name: 'WBShadowBR' },
        Back_Next_Nav_Buttons_Smaller: { name: 'STIcons', frameData: { frames: 6, Back: 0, Next: 3 } },
        Top_Left_Corner_30x30: { name: 'STBorderTL' },
        Top_Right_Corner_30x30: { name: 'STBorderTR' },
        Bottom_Right_Corner_30x30: { name: 'STBorderBR' },
        Bottom_Left_Corner_30x30: { name: 'STBorderBL' },
        Orange_Divider_Top_35x55: { name: 'STVertLineT' },
        Orange_Divider_Bottom_35x55: { name: 'STVertLineB' },
        Up_Down_Scroll_Arrows_300x20: { name: 'TOCArrows', frameData: { frames: 6, Up: 3, Down: 0 } },
        BlankSummary: { name: 'SUMBlankCard' },
		Logo: {name: 'Logo'},
		Try_Again_14: {name: 'TryAgain', frameData: {frames: 2}},
		loading: {name: 'loading', frameData: { frames: 30 }},

		WVicons: {name: 'WVIcons', frameData: {frames: 6, Menu: 3, Check: 0}},
		WVStepIcon: {name: 'WVStepIcon', frameData: {frames: 3, Step: 0}},
		WVbuttons: {name: 'WVMoveOn', frameData: {frames: 10, TryAnother: 0, TryAgain: 2, NextProblem: 4, NextRound: 6, Done: 8}},
		WVcircles: {name: 'WVStatus', frameData: {frames: 6, New: 0, Wrong: 1, Locked: 2, Correct: 3, Pending: 4, Partial: 5}},
		WV_HelpIcons: {name: 'WVHelpIcons', frameData: {frames: 7, StepByStep: 0, Video: 2, Solution: 3, Abort: 4, Hint: 5, TryAnother: 6}},

		All_Assignments_Recently_Graded_05: {name: 'AllRecent', frameData: { frames: 6, All: 0, AllOn:2, Recent: 3, RecentOn: 5}},
		Current_Assignments_05: {name: 'CurrentAssignments', frameData: { frames: 3, Current: 0, CurrentOn: 2 }},
		Information: { name: 'AssignInfo', frameData: { frames: 2 }},

		Status_Background: {name: 'DrillOverlay'},
		Submit: {name: 'SubmitAssignment', frameData: {frames: 3}},

		login: { name: 'LoginBtn', frameData: { frames: 12, Login: 0, Change: 2, Reset: 4, Create: 6, Register: 8, OK: 10 }},
		RoundedTL: { name: 'RoundedTL'},
		RoundedTR: { name: 'RoundedTR'},
		RoundedBL: { name: 'RoundedBL'},
		RoundedBR: { name: 'RoundedBR'},

		eqInputBackground: { name: 'eqInputBG' },
		eqInputSingle: { name: 'eqInputSingle', frameData: { frames: 60, abs: 0, power: 2, le: 4, ge: 6, notEqual: 8, sqrt: 10, nthRoot: 12, pi: 14, sigma: 16, and: 18, or: 20, fraction: 22, infinity: 24, plusMinus: 26, blank: 28, one: 30, two: 32, three: 34, four: 36, five: 38, six: 40, seven: 42, eight: 44, nine: 46, zero: 48, paren: 50, minus: 52, xvar: 54, yvar: 56, plus: 58 } },
		eqInputDouble: { name: 'eqInputDouble', frameData: { frames: 10, infAnswers: 0, noAnswers: 2, logBase: 4, more: 6, blank: 8 } },

		aTypeIcons: {name: 'aTypeIcons', frameData: {frames: 10, graph: 0, equation: 1, freeInput: 2, multChoice: 3, multiPart: 5, paper: 7}},
        ie:null
    };

    return atlasImages;
};

String.prototype.removePath = function() {
    return this.substr(this.lastIndexOf('/') + 1);
}

var makeFrameDataStr = function(obj) {
    var str = ', frameData: { ';
	var props = [];
	for (var k in obj) {
		props.push(k + ': ' + obj[k]);
	}
	str += props.join(', ') + ' }';
	return props.length > 0 ? str : '';
};

var MakeGetResource = function(input, whichProp)
{
	var dict = getDict();
    input = input.rawString();
	// For some reason, TP is retaining the most recent path for a few sprites.  This cleans them up.
	input = input.removePath();
    if (whichProp == 2) {
        return dict[input].frameData ? makeFrameDataStr(dict[input].frameData) : '';
    }
    else {
   	    return dict[input].name;
  	}

};


MakeGetResource.filterName = "getresource";
MakeGetResource.isSafe = false;
Library.addFilter("MakeGetResource");
