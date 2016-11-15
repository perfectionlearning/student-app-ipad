(function() {
app.Resources.manifest = {  
eqInputBG: { w: 1024, h: 205, x: 0, y: 0 },
SubmitAssignment: { w: 420, h: 20, x: 0, y: 205, frameData: { frames: 3 } },
TOCArrows: { w: 300, h: 20, x: 420, y: 205, frameData: { frames: 6, Up: 3, Down: 0 } },
aTypeIcons: { w: 200, h: 20, x: 720, y: 205, frameData: { frames: 10, graph: 0, equation: 1, freeInput: 2, multChoice: 3, multiPart: 5, paper: 7 } },
WVHelpIcons: { w: 133, h: 19, x: 920, y: 205, frameData: { frames: 7, StepByStep: 0, Video: 2, Solution: 3, Abort: 4, Hint: 5, TryAnother: 6 } },
eqInputDouble: { w: 2860, h: 45, x: 1024, y: 0, frameData: { frames: 26, infAnswers: 0, noAnswers: 2, logBase: 4, more: 6, blank: 8, letters: 10, numbers: 12, equations: 14, functions: 16, backspace: 18, numbers_dn: 20, equations_dn: 22, functions_dn: 24 } },
DrillOverlay: { w: 200, h: 78, x: 3884, y: 0 },
eqInputSingle: { w: 2438, h: 45, x: 1024, y: 78, frameData: { frames: 46, abs: 0, power: 2, le: 4, ge: 6, notEqual: 8, sqrt: 10, nthRoot: 12, pi: 14, sigma: 16, and: 18, or: 20, divide: 22, infinity: 24, plusMinus: 26, blank: 28, multiply: 30, left: 32, right: 34, lessthan: 36, greaterthan: 38, fraction: 40, backspace: 42, empty: 44 } },
SUMBlankCard: { w: 317, h: 175, x: 3462, y: 45 },
WVPlayVid: { w: 74, h: 74, x: 3779, y: 45 },
STBorderBL: { w: 30, h: 30, x: 3853, y: 45 },
STBorderBR: { w: 30, h: 30, x: 3853, y: 75 },
PDSlicesTR: { w: 9, h: 3, x: 1053, y: 220 },
WBShadowTR: { w: 7, h: 2, x: 1053, y: 223 },
WBShadowTL: { w: 3, h: 2, x: 1060, y: 223 },
PDSlicesTL: { w: 7, h: 3, x: 1062, y: 220 },
WVIcons: { w: 270, h: 45, x: 3779, y: 119, frameData: { frames: 6, Menu: 3, Check: 0 } },
PDSlicesBR: { w: 9, h: 11, x: 3853, y: 105 },
PDSlicesBL: { w: 7, h: 11, x: 3862, y: 105 },
PDSlicesTR2: { w: 9, h: 7, x: 3869, y: 105 },
PDSlicesTL2: { w: 7, h: 7, x: 3869, y: 112 },
WBShadowBR: { w: 7, h: 7, x: 3876, y: 112 },
WBShadowBL: { w: 3, h: 7, x: 3878, y: 105 },
STVertLineB: { w: 35, h: 55, x: 4049, y: 78 },
STVertLineT: { w: 35, h: 55, x: 4049, y: 133 },
TryAgain: { w: 260, h: 37, x: 3779, y: 188, frameData: { frames: 2 } },
STBorderTL: { w: 30, h: 30, x: 4039, y: 188 },
NavIcons: { w: 162, h: 27, x: 3883, y: 78, frameData: { frames: 6, Menu: 0, Search: 3 } },
WVStepArrows: { w: 96, h: 17, x: 3779, y: 164, frameData: { frames: 6, Down: 3, Up: 0 } },
WVCheck: { w: 80, h: 19, x: 3875, y: 164, frameData: { frames: 4, Off: 0, On: 2 } },
WVRadio: { w: 80, h: 19, x: 3955, y: 164, frameData: { frames: 4, Off: 0, On: 2 } },
loading: { w: 960, h: 32, x: 1024, y: 45, frameData: { frames: 30 } },
LoginBtn: { w: 900, h: 30, x: 1984, y: 45, frameData: { frames: 12, Login: 0, Change: 2, Reset: 4, Create: 6, Register: 8, OK: 10 } },
CurrentAssignments: { w: 453, h: 22, x: 2884, y: 45, frameData: { frames: 3, Current: 0, CurrentOn: 2 } },
Logo: { w: 90, h: 25, x: 3337, y: 45 },
STBorderTR: { w: 30, h: 30, x: 3427, y: 45 },
WVMoveOn: { w: 1312, h: 45, x: 1024, y: 123, frameData: { frames: 10, TryAnother: 0, TryAgain: 2, NextProblem: 4, NextRound: 6, Done: 8 } },
AllRecent: { w: 720, h: 22, x: 1024, y: 168, frameData: { frames: 6, All: 0, AllOn: 2, Recent: 3, RecentOn: 5 } },
STIcons: { w: 600, h: 57, x: 1744, y: 168, frameData: { frames: 6, Back: 0, Next: 3 } },
PrefsEmail: { w: 265, h: 30, x: 1053, y: 190 },
PrefsPassword: { w: 265, h: 30, x: 1318, y: 190 },
AssignInfo: { w: 66, h: 29, x: 1583, y: 190, frameData: { frames: 2 } },
VideoExit: { w: 30, h: 29, x: 1649, y: 190 },
WVRemove: { w: 38, h: 19, x: 1679, y: 190, frameData: { frames: 2 } },
WVStepHeader: { w: 653, h: 40, x: 2336, y: 123 },
AssignUp: { w: 336, h: 49, x: 2989, y: 123, frameData: { frames: 2 } },
HomeworkUp: { w: 336, h: 49, x: 2344, y: 163, frameData: { frames: 2 } },
WVStepIcon: { w: 306, h: 45, x: 2680, y: 163, frameData: { frames: 3, Step: 0 } },
MenuIcons: { w: 290, h: 23, x: 2986, y: 172, frameData: { frames: 10, TOC: 0, Factbook: 1, Grades: 2, Help: 3, Homework: 4, LPTOC: 5, Settings: 6, Logout: 7, Admin: 8, Graph: 9 } },
WVStatus: { w: 168, h: 28, x: 3276, y: 172, frameData: { frames: 6, New: 0, Wrong: 1, Locked: 2, Correct: 3, Pending: 4, Partial: 5 } },
    ie: null
};
})();
