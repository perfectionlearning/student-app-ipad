//=======================================================
// Problem model / Problem Set collection
//=======================================================
(function() {

	// Valid answer types (after parsing/converting to our internal names)
	// 'multi' is better known as free input.
	// 'multiPart' is now known as multi-step.
	var ansTypes = ['check', 'radio', 'equation', 'multi', 'graphPlot', 'graphConst', 'paper', 'essay', 'multiPart'];

	//=======================================================
	//
	//=======================================================
	function cleanModel(val)
	{
		// @FIXME/dg: Temp! Removes the whiteboard and uses the video field.
		// Instead, this needs to use the video field for videos.
		val.wb = val.video;

		cleanAnswerType(val);

		if (!val.id)		// There shouldn't be an ID of 0.  This should be safe.
			val.id = val.problem_id;

		if (val.diff == 'basic')
			val.diff = 'easy';

		// @FIXME/dg: TEMP HACK!
		cleanStreakAndScore(val);

		cleanQImages(val);

		val.q = cleanEquation(val.q);
		cleanAnswer(val);
		cleanChoices(val);

		cleanGraph(val);
		cleanSteps(val);

		val.q = modifySciNote(val.q);	// Do this before appendInstructions!
		appendInstructions(val);

		cleanStatus(val);

		val.invalid = false;	// This doesn't belong here, but there's no other single point of access.
		return val;
	}

	//=======================================================
	// Clean streak and score-related entries.
	// Most of these are obsolete and will likely be removed.
	//
	// DG: Pruned obsolete items. The rest is unlikely to be
	// removed.
	//=======================================================
	function cleanStreakAndScore(val)
	{
		val.score = parseFloat(val.score);
		val.maxScore = parseFloat(val.maxScore);
	}

	//=======================================================
	//
	//=======================================================
	function cleanStatus(val)
	{
		val.origStatus = val.status; // Preserve original status for use in retrieving approprate status message. Used for last problem submitted.
		val.status = app.translateStatus(val.status);

		for (var i = 0, len = val.solve.length; i < len; i++)
			val.solve[i].status = app.translateStatus(val.solve[i].status);
	}

	//=======================================================
	// Translate between answer types
	//=======================================================
	function cleanAnswerType(val)
	{
		var ansMap = {
			Kinetic: 'equation',
			input: 'equation',
			Multiple: 'check',
			MultKinetic: 'multi',
			VTPGraph: 'graphPlot',
			graphConst: 'graphConst',	// No change
			'no input': 'paper',
			essay: 'essay'
		};

		if (val.ansType && ansMap[val.ansType])
			val.ansType = ansMap[val.ansType];
	}

	//=======================================================
	//
	//=======================================================
	function cleanRange(string)
	{
		var out = string.split(',');

		for (var i = 0; i < out.length; i++)
			out[i] = parseFloat(out[i]);

		return out;
	}

	//=======================================================
	// Clean up equation strings
	//=======================================================
	function cleanEquation(string)
	{
		// String can be null -- safety code
		if (!string)
			return "";

		// Call global MathML cleanup.  After this, the rest is problem-specific.
		string = app.deitalicize(string);
		string = app.cleanMML(string);
		string = app.convertMinus(string);

		// @FIXME/dg: Clean up after a problem editor bug.  This really doesn't belong here.
		// It also isn't helping.
		var regex = /<mtext>(\s*<mn>.+?\s*<\/mn>\s*)<\/mtext>/g;
		string = string.replace(regex, '$1');

		// Remove display:block from MathML
		regex = /(<math[^>]*)display=["']block["']/g;
		string = string.replace(regex, '$1');

		return string;
	}

	//=======================================================
	// Clean up steps / solution
	//=======================================================
	function cleanSteps(val)
	{
		if (!val.solve)
			return;

		for (var i=0; i < val.solve.length; i++)
		{
			var step = val.solve[i];
			cleanAnswerType(step);
			cleanAnswer(step);
			step.q = cleanEquation(step.q);
			step.q_prefix = cleanEquation(step.q_prefix);
			step.hint = cleanEquation(step.hint);

			cleanChoices(step);
			cleanGraph(step);
		}
	}

	//=======================================================
	//
	//=======================================================
	function cleanChoices(item)
	{
		item.choices && $.each(item.choices, function(idx, val) {
			val.answer = cleanEquation(val.answer);
		});
	}

	//=======================================================
	// Clean up question images
	//=======================================================
	function cleanQImages(val)
	{
		// Ensure a valid image size
		if (val.qImg && val.qImgSize === "")
			val.qImgSize = "1,1";

		// Check overlays
		$.each(val.qImageText, function(idx, entry) {
			// Ensure that coordinates are integers
			entry.x = parseInt(entry.x, 10);
			entry.y = parseInt(entry.y, 10);
			// Convert scientific notation from 'e' format to 'x10' format
			entry.text = modifySciNote(entry.text);
		});
	}

	//=======================================================
	// Parse and clean up data relating to graphing
	//=======================================================
	function cleanGraph(inp)
	{
		// Split apart axis information (should have better error checking!)
		if (inp.graphparms)
		{
			inp.graphparms.x = cleanRange(inp.graphparms.x);
			inp.graphparms.y = cleanRange(inp.graphparms.y);
			inp.graphparms.skip = parseFloat(inp.graphparms.skip);
		}

		if (inp.graphequations)
		{
			var out = [];

			$.each(inp.graphequations, function(idx, val) {
				val = cleanEquation(val);
				val = val.replace(/&#8722;/g, '-');		// Convert unicode minus to -
	            var type = val.slice(0, val.indexOf('=')).toLowerCase();
				out.push({
					eq: val,
					type: type,		// This is part of val (but we may want to cache it for speed)
					inCnt: app.graphInputCnt(type)
				});
			});

			inp.graphequations = out;

			// If there's no answer (graph inputs never have the answer field set!), use the first equation as the answer
			// Actually, there's currently nothing preventing the answer field from being set, even through it's not used.
//			if (['graphPlot', 'graphConst'].indexOf(inp.ansType) !== -1 && !inp.a)
			if (['graphPlot', 'graphConst'].indexOf(inp.ansType) !== -1)
				inp.a = inp.graphequations[0].eq;
		}
	}

	//=======================================================
	// Check a single answer (top-level or one step) for scientific
	// notation use.
	//=======================================================
	function checkSingleSci(data)
	{
		// We only care about free inputs ('multi')
		if (data.ansType !== 'multi')
			return false;

		// Look up the list of answers
		var ans = app.getFreeAnswer(data.a);

		for (var i = 0; i < ans.length; i++)
		{
			// If 'e' is found in any, scientific notation is used
			if (ans[i].indexOf('e') !== -1)
				return true;
		}

		// 'e' wasn't found in any answers
		return false;
	}

	//=======================================================
	// Check for scientific notation
	//=======================================================
	function checkSci(data)
	{
		// Scan the top level and each step for free inputs that contain 'e'
		if (checkSingleSci(data))
			return true;

		var steps = data.solve || [];

		for (var i = 0; i < steps.length; i++)
		{
			if (checkSingleSci(steps[i]))
				return true;
		}

		// No scienfitic notation was detected
		return false;
	}

	//=======================================================
	// Convert from 'e' format to 'x10' format for scientific notation
	//=======================================================
	function modifySciNote(string)
	{
		var regex = /(\d)e((-|&#8722;)*)(\d+)/g;
		return string.replace(regex, "$1\xD710<sup>$3$4</sup>");
	}
	//=======================================================
	// Add instructions to problems that require them.
	//
	// Right now, it detects if problems contain answers with
	// scientific notation and displays the appropriate help.
	//=======================================================
	function appendInstructions(data)
	{
		if (checkSci(data))
			data.q += " Enter your answer in scientific notation using e for \xD710. For instance, use 2.0e4 for 2.0\xD710<sup>4</sup>.";
	}

	//=======================================================
	//
	//=======================================================
	function cleanAnswer(data)
	{
		if (data.ansType !== 'essay')
			data.a = cleanEquation(data.a);	// Clean up equations, unless we're sure there aren't any (e.g., essay questions)

		if (data.ansType === 'equation')
		{
			// Split off prefixes and suffixes
			var split = app.splitEqAnswer(data.a);
			data.a = split.a;
			data.ansPrefix = split.pre && app.replaceSpaces(split.pre);
			data.ansSuffix = split.post && app.replaceSpaces(split.post);

			// Convert AND and OR symbols to text
			var fixAnd = /<mo>\u2227<\/mo>/g;
			var fixOr = /<mo>\u2228<\/mo>/g;
			data.a = data.a.replace(fixAnd, '<mtext>&nbsp;and&nbsp;</mtext>');
			data.a = data.a.replace(fixOr, '<mtext>&nbsp;or&nbsp;</mtext>');

			// Do the same with no solutions and infinite solutions
			// @FIXME/dg: Combine them all into a table! This is messy!
			var fixInf = /<mo>\u221E<\/mo>/g;
			var fixNone = /<mo>\u2205<\/mo>/g;
			data.a = data.a.replace(fixInf, '<mtext>&nbsp;infinite&nbsp;solutions&nbsp;</mtext>');
			data.a = data.a.replace(fixNone, '<mtext>&nbsp;no&nbsp;solutions&nbsp;</mtext>');
		}
	}

	//=======================================================
	// Model
	//=======================================================
	app.Question = Backbone.Model.extend({
/*
		urlRoot: function() {
			if (this.mode === "assign")
				return app.pSetPath + this.psetId;
			else
				return app.qcServer
		},
*/
		defaults: {
			id:'',
			q:'',
			q_prefix:'',
			a:'',
			ansType: 'multi',
			equiv: '',
			chID: '',
			qImg: '',
			qImgSize: '0, 0',
			graphequations: [],	// Graph associated with the question (read only VTP graph)
			graphparms: null,
//			choices: [],
			aImg: '',
			aImgSize: '0, 0',
			diff:'easy',
			score:0,
			maxScore:5,
			repetitions: 1,
			wb:'',
			qc:'',
			vid:'',
			solve:[]
		},

		//--------------------------------
		//--------------------------------
		initialize: function() {
			// Because this.url gets set in places to a string, this provides a backup.
			this.origUrl = this.url;
		},

		//--------------------------------
		// Set the mode, which is used for URL construction
		//--------------------------------
		setMode: function(mode) {
			if (mode === "direct")
				this.urlRoot = app.qcServer;
			else
				delete this.urlRoot;
		},

		//--------------------------------
		// Set the URL to reload the problem, but with different values.
		//--------------------------------
		reloadDifferent: function() {
			this.curUrl = this.url;
			this.url = this.origUrl() + "/different";
		},

		//--------------------------------
		// Restore the URL to its normal value.
		//--------------------------------
		resetUrl: function() {
			this.url = this.curUrl;
		},

		//--------------------------------
		// Request the solution
		//--------------------------------
		getSolution: function(setting) {
			// Temporarily override the URL, but keep a backup to restore when we're done
			var curUrl = this.url;
			this.url = this.origUrl() + '/soln';
			// Fetch the solution
			var promise = this.fetch();
			// Restore the url
			this.url = curUrl;
			return promise;
		},

		//--------------------------------
		// Reset a model to its default state
		// Bypasses validation (should be optional)
		//--------------------------------
		reset: function() {
			this.clear({silent:true});
			this.set(this.defaults, {silent: true});
		},

		//--------------------------------
		// Individual models are being returned in the same format as a collection.  Just grab the
		// first entry and use it.
		//
		// In the new backbone (0.9+) model parse gets called for each model in a collection.
		// We have inconsistent data coming in.  Models can either be single item selections, or
		// a proper model.  Try to detect and handle it properly at run-time until we can
		// change the server.
		//--------------------------------
		parse: function(response) {
			return cleanModel(response);
		},

		//--------------------------------
		//--------------------------------
		validate: function(mod)
		{
			try {
				if (typeof(mod) !== 'object')
					throw "Assignment validation didn't receive an object";


			// Check for missing fields
				if (!defined(mod.id) || mod.id === '' || mod.id === null)
					throw 'missing id';
				if (!defined(mod.q) || mod.q === '')
					throw 'missing question';
//				if (!defined(mod.a) || mod.a === '')
//					throw 'missing answer';
				if (!defined(mod.ansType))
					throw 'missing answer type';
				if (ansTypes.indexOf(mod.ansType) == -1)
					throw 'invalid answer type: ' + mod.ansType;
				if ((mod.ansType === 'check' || mod.ansType === 'radio') && (!defined(mod.choices) || !_.isArray(mod.choices) || (mod.choices.length < 1)))
					throw 'no choices for multiple choice problem';
				if (!defined(mod.chID) || mod.chID === '')
					throw 'missing chapter ID';
				if (!defined(mod.diff))
					throw 'missing difficulty';
				if (mod.diff !== 'easy' && mod.diff !== 'medium' && mod.diff !== 'hard')
					throw 'invalid difficulty: "' + mod.diff + '"';
				if (!defined(mod.score) || !defined(mod.maxScore))
					throw 'missing score';
				if ((mod.score > mod.maxScore) || (mod.score < 0))
					throw 'invalid score';
			}
			catch(e)
			{
				fw.warning('Problem validation error (' +  mod.id + '): ' + e);
//				return e;
			}
		}
	});

	//=======================================================
	// Collection
	//=======================================================
	app.ProblemSet = Backbone.Collection.extend({
		model: app.Question,

		url: function() {
			return app.pSetPath + this.id;
		},

		// The server seems to be pre-sorting the list
		comparator: function(model) {
			return parseInt(model.get('problem_num'), 10);
		},

		parse: function(response) {
			var out = [];

			response && $.each(response, function(key, val) {
				out.push(val);
			});

			return out;
		},

		//-----------------------------------------
		// Data utility functions
		//-----------------------------------------
		attemptedCount: function() {

			var cnt = 0;
			for (var i = 0; i < this.length; i++)
			{
				if (this.at(i).get('status') !== 'New')
					cnt++;
			}

			return cnt;
		}

	});

	//=======================================================
	// Instance of Collection
	//=======================================================
	app.problemList = new app.ProblemSet;

	//=======================================================
	// Helper Function: Extract all image paths
	//=======================================================
	app.getProblemImages = function()
	{
		var list = [];
		app.problemList.forEach(function(prob) {
			var img = prob.get('qImg');
			if (img)
				list.push(app.getImageName(img));
		});

		return list;
	}

	//=======================================================
	// Preloads a single image
	//=======================================================
	app.preloadImage = function(model)
	{
		var img = model.get('qImg');
		if (img)
		{
			fw.preloadAssets([img]);
		};
	}

})();
