//============================================================
// Button Definitions
//
// These cover Kinetic Input on PCs, and the keypad for tablets
//============================================================
;(function() {

	//=======================================================
	// This will be maintained by the server
	//=======================================================
	app.buttonRules = {
		1001: [  //review
			"frac",
			"minusplus"
		],

		1026: [
			"frac",
			"minusplus"
		],

		1022: [  //intro to algebra
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens"
		],

		1027: [  //initial assesssment
			"lt",
			"gt",
			"lte",
			"gte",
			"frac",
			"expo",
			"equal"
		],

		1002: [
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"andOp"
		],

		1004: [
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"expo",
			"andOp"
		],

		1003: [
			"minus",
			"frac",
			"minusplus"
		],

		1005: [
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"equal"
		],

		1006: [  //systems equations
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"infiniteSol",
			"noSol"
		],

		1007: [  //inequalities
			"lt",
			"gt",
			"lte",
			"gte",
			"frac",
			"andOp",
			"orOp",
			"equal",
			"notequal"
		],

		1008: [  //exponents
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"expo",
			"snmult",
			"parens"
		],

		1009: [  //polynomials
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"expo",
			"andOp",
			"noSol"
		],

		1010: [  //factoring
			"plus",
			"minus",
			"mult",
			"minusplus",
			"parens",
			"expo"
		],

		1011: [  //Rational
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"expo",
			"andOp",
			"orOp",
			"noSol",
			"lte",
			"gte"
		],

		1012: [ //Radicals
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"nroot",
			"abs",
			"orOp",
			"andOp",
			"noSol"
		],

		1013: [
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"lte",
			"gte",
			"orOp",
			"andOp",
			"noSol"
		],

		1023: [
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"expo",
			"andOp",
			"noSol"
		],

		1024: [
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"nroot",
			"abs",
			"orOp",
			"andOp",
			"noSol"
		],

/*
		1031: [
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"andOp"
		],
*/
		// 1031 = 1113 (trig functions logic used from Alg2)
		1031: [
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"sqrt",
			"sin",
			"cos",
			"tan",
			"pi",
			"andOp"
		],

		//////////////ALGEBRA 2 specific chapters/////////////////////////
		1100: [ //using radicals algI logic (1012)
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"nroot",
			"abs",
			"orOp",
			"andOp",
			"noSol"
		],

		1101: [  //Expressions, Equations and Functions
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"lt",
			"gt",
			"lte",
			"gte",
			"andOp",
			"orOp"
		],

		1102: [  //Linear Equations and Functions
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"equal"
		],

		1103: [  //Systems of Equations and Inequalities
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"lt",
			"gt",
			"lte",
			"gte",
			"noSol",
			"infiniteSol"
		],

		1104: [  //Quadratics
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"lte",
			"gte",
			"orOp",
			"andOp",
			"noSol"
		],

		1105: [  //poly functions
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"andOp"
		],

		1106: [	//Functions, using AlgI functions (1023)
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"expo",
			"andOp",
			"noSol"
		],

		1107: [  //radicals and powers
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"lte",
			"gte",
			"nroot",
			"abs",
			"andOp",
			"noSol"
		],

		1108: [  //logs
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"log",
			"natLog",
			"pi",
			"e",
			"equal"
		],

		1109: [  //Rational
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"expo",
			"andOp",
			"equal",
			"noSol"
		],

		1110: [  //Conics
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"equal",
			"andOp"
		],

		1111: [  //sequnces and series
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"expo",
			"sqrt",
			"infinity",
			"sigma",
			"ellipsis",
			"andOp"
		],

		1112: [  //Probability
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus"
		],
/*
		1113: [  //trig functions
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"sqrt",
			"sin",
			"cos",
			"tan",
			"pi",
			"andOp"
		],
*/
		1113: [  // Now using 1114 buttons
			"frac",
			"parens",
			"expo",
			"sqrt",
			"pi",
			"andOp",
			"sin",
			"cos",
			"tan",
			"cot",
			"sec",
			"csc",
			"noSol"
		],

		1114: [  //triangle equations and identities
			"frac",
			"parens",
			"expo",
			"sqrt",
			"pi",
			"andOp",
			"sin",
			"cos",
			"tan",
			"cot",
			"sec",
			"csc",
			"noSol"
		],

		1115: [  //Uses the buttons from 1114
			"frac",
			"parens",
			"expo",
			"sqrt",
			"pi",
			"andOp",
			"sin",
			"cos",
			"tan",
			"cot",
			"sec",
			"csc",
			"noSol"
		],

		1181: [  //A1 Review
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"andOp"
		],

		///////////////////// PREALGEBRA //////////////////////
		1201: [  //intro to algebra (uses chapter 1 Alg1)
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens"
		],

		1202: [	// 1002
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"andOp"
		],

		1203: [
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"expo",
			"andOp",
			"lt",
			"gt",
			"lte",
			"gte"
		],

		1204: [
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"andOp"
		],

		1205: [	// 1002
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"andOp"
		],

		1206: [
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"expo",
			"andOp"
		],

		1207: [
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"expo",
			"andOp"
		],

		1208: [
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"lt",
			"gt",
			"lte",
			"gte",
			"andOp"
		],

		1209: [  //exponents (1008)
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"expo",
			"snmult",
			"parens"
		],

		1210: [
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"nroot",
			"andOp",
			"sin",
			"cos",
			"tan"
		],

		1211: [  //data analysis
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens"
		],

		1212: [  //polynomials (1009)
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"expo",
			"andOp",
			"noSol"
		],

		1281: [	//1204
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"andOp"
		],

		//GEOMETRY BUTTONS
		2001: [  // Geometry Essentials
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"sqrt"
		],

		2002: [	// 1005
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"equal"
		],

		2003: [	// 1005
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"equal"
		],

		2004: [  // Geometry Essentials (2001)
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"sqrt"
		],

		2005: [  //Quadratics (1104)
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"lte",
			"gte",
			"orOp",
			"andOp",
			"noSol"
		],

		2006: [  // Geometry Essentials (2001)
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"sqrt"
		],

		2007: [  // Right Triangles and Trigonometry - use 1210 buttons but remove the nroot button
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"andOp",
			"sin",
			"cos",
			"tan"
		],

		2008: [  // 1011 buttons without “or” and “NS” buttons
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"expo",
			"andOp",
			"lte",
			"gte"
		],

		2009: [  //Conics (1110)
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"sqrt",
			"equal",
			"andOp"
		],

		2010: [  // Geometry Essentials (2001)
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"sqrt"
		],

		2081: [  //geo appendix
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"snmult",
			"lt",
			"gt",
			"lte",
			"gte"
		],

		2102: [  //Expressions, Equations and Functions (1101)
			"plus",
			"minus",
			"mult",
			"frac",
			"parens",
			"expo",
			"lt",
			"gt",
			"lte",
			"gte",
			"andOp",
			"orOp"
		],

		2111: [  // 1011 buttons without “or” and “NS” buttons (2008)
			"plus",
			"minus",
			"mult",
			"frac",
			"minusplus",
			"parens",
			"expo",
			"andOp",
			"lte",
			"gte"
		]
	};

	//=======================================================
	// Used if the chapter ID can't be located within app.buttonRules
	//=======================================================
	app.defaultButtonRules = [
		"lt",
		"gt",
		"lte",
		"gte",
		"frac",
		"parens",
		"plus",
		"minus",
		"mult",
		"div",
		"sigma"	// END
	]

	//=======================================================
	//=======================================================
	app.mobileButtonRules = [
	  [
		"varx", "vary", "varz", "equal",
	  ],
	  [
		"seven", "four", "one",  "zero",
		"eight", "five", "two",  "deci",
		"nine",  "six",  "three","comma",
	  ],
	  [
		"expo", "mult", "plus",  "back",
		"sqrt", "frac", "minus", "clear",
	  ],
	];

	//=======================================================
	//=======================================================
	app.mobileButtonRulesMulti = [
	  [
		  "seven", "four", "one",  "zero",
		  "eight", "five", "two",  "deci",
		  "nine",  "six",  "three","minus",
	  ],
	  [
		"skip", "skip", "back", "clear"
	  ]
	];


})();
