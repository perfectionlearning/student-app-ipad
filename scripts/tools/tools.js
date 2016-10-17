//=============================================================================
// General tool chest
//=============================================================================
;(function() {

	//=======================================================
	// Remove final hash from current browser window location.
	// Used by Addendums.js
	//=======================================================
	app.stripHash = function()
	{
		return app.basePath() + '#toc/' + app.schemeList[0] + '/1';
	};

	//=======================================================
	//=======================================================
	app.basePath = function()
	{
		var href = window.location.href;
		if (href.lastIndexOf('#') != -1)
			href = href.substr(0, href.lastIndexOf('#'));

		return href;
	};

	//=======================================================
	// Concatenates all arguments into a single string.
	// This is useful for generating a single hash when
	// memoizing functions
	//=======================================================
	app.joinArgs = function()
	{
		return Array.prototype.join.call(arguments, '_');
	}

	//=======================================================
	// jQuery Easing function.  Designed to be a slightly
	// damped version of easeOutBounce.
	//
	// t, millisecondsSince, startValue, endValue, totalDuration
	// Start is always 0, end is always 1 (assuming we're not starting in the middle)
	// t ranges from 0-1.
	//=======================================================
	$.easing.smallBounce = function(x, t, b, c, d)
	{
		if (x < (1.0/2.75))
			return c*(7.5625*x*x) + b;
		else if (x < (2.0/2.75))
			return c*(3.5625*(x-=(1.5/2.75))*x + .88) + b;
		else if (x < (2.5/2.75))
			return c*(3.5625*(x-=(2.25/2.75))*x + .97) + b;
		else
			return c*(3.5625*(x-=(2.625/2.75))*x + .99) + b;
	}

	//=======================================
	//=======================================
	$.easing.singleBounce = function(x, t, b, c, d) {
		if (x < 0.82) {
			return c*(1.49*x*x) + b;
		} else {
//			return c*(3.5625*(x-=(2.5/2.75))*x + 0.97) + b;		// Very small bounce
//			return c*(7.5625*(x-=(2.5/2.75))*x + 0.94) + b;		// Slightly bigger bounce
			return c*(1.5625*(x-=(2.5/2.75))*x + 0.99) + b;		// Micro bounce

		}
	}

	//=======================================================
	// From jQueryUI.
	// This is all we use from jQueryUI, so just incorporate it here.
	//=======================================================
	$.easing.easeOutBounce = function (x, t, b, c, d)
	{
        if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    }

	//=======================================
	// Weird, large end hop
	//=======================================
	$.easing.swingHop = function( p, t, s, e, d ) {
		if (p < 0.87)
			return 0.5 - Math.cos( (p*1.2)*Math.PI ) / 2;
		else
			return Math.sin(10.2*p*Math.PI)*0.06 + 0.97;
	}

	//=======================================
	// Weird, large end hop
	//=======================================
	$.easing.swingPast = function( p, t, s, e, d ) {
		// y trans - p*freq / amp
//		return 0.528 - Math.cos( (p*1.15)*Math.PI ) / 1.9;		// Mid-sized bump
		return 0.513 - Math.cos( (p*1.1)*Math.PI ) / 1.95;		// Shorter, smaller bump
	}

	//=======================================================
	// Determine the width of the widest digit using the input
	// box font.  That allows us to properly determine the box width.
	//
	// This is returning the rounded width.  It would be better
	// to return the real width, which can be a fractional number.
	//=======================================================
	app.calcCharWidth = function(font)
	{
		var test = fw.createWidget('text', {
			x: -100,
			y: -100,
			font: font,
			text: '8',
			hidden: true
		});

		var w = test.width();

		test.terminate();
		return w;
	}

	//=======================================================
	// Remove italics from uppercase Greek letters
	// Currently only do delta.  The data needs to be cleaned
	// up instead of doing this at run-time.
	//=======================================================
	app.deitalicize = function(mml)
	{
		// Convert <mi> with a single non-letter to a non-italicized version
		var regex = /<mi>(\u0394<\/mi>)/g;
		var out = mml.replace(regex, "<mi mathvariant='normal'>$1");

		// Do the same thing, but checking for entities such as &Delta;
		regex = /<mi>(&Delta;<\/mi>)/g;
		out = out.replace(regex, "<mi mathvariant='normal'>$1");

		// And finally, check for direct numeric entities
		regex = /<mi>(&#916;<\/mi>)/g;
		out = out.replace(regex, "<mi mathvariant='normal'>$1");

		return out;
	}

	//=======================================================
	// Perform general MathML cleanup.  Do it in the app to
	// change it real-time, leaving the original data alone
	// (for better or worse)
	//=======================================================
	app.cleanMML = function(mml)
	{
		// Insert <mspace width="0"/> between italicized and non-italicized <mi> tags.
		// This ensures they are close together.
		var regex = /(<mi>[^<]+<\/mi>)\s*(<mi mathvariant=['"]normal['"]>[^<]+<\/mi>)/g;
		var out = mml.replace(regex, '$1<mrow><mspace width="0" />$2</mrow>');

		regex = /(<mi mathvariant=['"]normal['"]>[^<]+<\/mi>)\s*(<mi>[^<]+<\/mi>)/g;
		out = out.replace(regex, '$1<mrow><mspace width="0" />$2</mrow>');

		// Perform XML-based modifications that are too complex for regular expressions
		out = cleanMathML(out);

		return out;
	}

	//=======================================================
	//
	//=======================================================
	function cleanMathML(string)
	{
		// Convert
		var xml = app.xmlLib.stringToXML(string);
		if (xml === 'fail')
			return string;
		xml = $(xml);

		// Process
		wrapParens(xml);
		scaleFractions(xml);

		// Convert back
		return app.xmlLib.XMLToString(xml[0]);
	}

	//=======================================================
	// Wrap closing parentheses in <mrow> tags
	//=======================================================
	function wrapParens(xml)
	{
		xml.find('mo').each(function() {
			if (this.textContent === ')' && this.parentNode.nodeName !== 'mrow')
				app.xmlLib.xmlWrapNode(this, 'mrow');
		});
	}

	//=======================================================
	// Increase the size of fractions. We're using inline mode,
	// which tries hard to shrink everything vertically. We'd
	// rather avoid that.
	//=======================================================
	function scaleFractions(xml)
	{
		xml.find('mfrac').each(function() {
			var style = app.xmlLib.xmlWrapNode(this, 'mstyle');
			style.setAttribute('mathsize', '140%');
		});
	}


	//=======================================================
	// Convert from standard minus sign to the unicode minus character.
	//
	// We can't do this in <maction> blocks, which makes life difficult.
	//
	// DG: I don't think we need to prevent conversion inside <maction>
	// anymore. That was probably only needed before SSV.
	//=======================================================
	app.convertMinus = function(mml)
	{
		var out = mml.replace(/-/g, '&#8722;');

//		var regex = /<maction[^>]*>.*?<\/maction>/g;
//		out = out.replace(regex, restoreMinus);

		return out;
	}

	//=======================================================
	// Restore minus signs inside <maction>
	//=======================================================
	function restoreMinus(all)
	{
		return all.replace(/&#8722;/g, '-');
	}

	//=======================================================
	// Replace the spaces in a string that aren't part of tags
	//=======================================================
	var replaceSpace = / /g;
	app.replaceSpaces = function(string)
	{
		// Convert to XML
		var xml = app.xmlLib.stringToXML(string);
		if (xml === 'fail')
			return string;

		// Find all text nodes
		var textNodes = app.xmlLib.findContaining(xml, '');

		// Replace spaces in all text nodes
		$.each(textNodes, function(idx, val) {
			val.textContent = val.textContent.replace(replaceSpace, '\u00A0');
		});

		// Convert back to a string
		return app.xmlLib.XMLToString(xml);
	}

	//=======================================================
	// Get answers for free input questions
	//=======================================================
	app.getFreeAnswer = function(data)
	{
		var regex = /<maction[^>]*>(.+?)<\/maction>/g;
		var matches = data.match(regex) || [];

		var ans = [];
		for (var i = 0 ; i < matches.length; i++)
		{
			var val = matches[i];

			// Strip any tags
			if (val.indexOf('<') !== -1)
				ans.push($.trim($(val).text()));
			else
				ans.push(val);
		}

		return ans;
	}

	//=======================================================
	// Expects an array and then a number of items to be
	// added to it
	//=======================================================
	app.addToArray = function()
	{
		var out = arguments[0];

		for (var i = 1; i < arguments.length; i++)
			out.push(arguments[i]);

		return out;
	}

	//=======================================================
	// Checks formation of email address.
	//=======================================================
	app.validEmail = function(emailStr) {
		var result = true;
		var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i;
		if (!re.test(emailStr)) {
			result = false;
		}
		return result;
	}

	//=======================================================
	//=======================================================
	var errMap = {
		403: 'NotLoggedIn'
	};

	app.getError = function(err)
	{
		if (err && errMap[err.status])
			return errMap[err.status];

		return 'Unknown';
	}

	//=======================================================
	// This has multiple allocations, so it's not tremendously efficient
	//=======================================================
	app.delayedPromise = function(time, parm)
	{
		var def = new $.Deferred();
		setTimeout(function() {
			def.resolve(parm);
		}, time);

		return def;
	}

	//=======================================================
	// Find all instances of a substring within a string.
	// The return value is an array of indices.
	//=======================================================
	function findAll(needle, haystack)
	{
		var out = [];
		var idx = -1;

		while (true)
		{
			idx = haystack.indexOf(needle, idx+1);

			if (idx === -1)
				break;

			out.push(idx);
		}

		return out;
	}

	//=======================================================
	//=======================================================
	app.splitEqAnswer = function(str)
	{
		str = str.trim();

		if (typeof(str) !== 'string')
			return {a: str};

		var open = findAll('<outside>', str);
		var close = findAll('</outside>', str);

		var errString = 'Prefix/Suffix error!';

		// Tag mismatch or too many tags
		if ((open.length !== close.length) || open.length > 2)
			return {a: errString};

		// No outside tags -- most common occurrence
		if (!open.length)
			return {a: str};

		var outOpen = "<outside>";
		var outClose = "</outside>";

		if (open[0] === 0)
		{
			var pre = str.substring(open[0] + outOpen.length, close[0]);
			open.shift();
			close.shift();
		}

		if (close.length && (close[0] === str.length - outClose.length))
		{
			var post = str.substring(open[0] + outOpen.length, str.length - outClose.length);
			open.shift();
			close.shift();
		}

		// Check for tags not at the start or end of the string
		if (open.length)
			return {a: errString};

		// Strip all outside tags
		var regex = /<outside>.*?<\/outside>/g;
		str = str.replace(regex, '');

		return {
			a: str.trim(),
			pre: pre,
			post: post
		};
	};

	//=======================================================
	// Used for debug, and possibly for external queries
	//=======================================================
	app.probID = function()
	{
		return app.problemList.at(app.curProbIndex).get('problem_id');
	};

	//=======================================================
	//=======================================================
	app.translateStatus = function(val)
	{
		var translate = {
			'correct': 'Correct',
			'incorrect': 'Locked',
			'pending': 'Pending',
			'new': 'New',
			'partial': 'Partial',
			'default': 'New'
		};
		return translate[val] ? translate[val] : translate['default'];
	};

	//=======================================================
	//=======================================================
	app.translateType = function(val)
	{
			if (val === undefined) val = 'Undefined';
			var typeMap = {
					quiz: 'Quiz',
					test: 'Test',
					homework: 'Homework',
					quickcheck: 'Quickcheck',
					quizboard: 'Quizboard',
					practice: 'i-Practice',
					ihomework: 'i-Practice',
					ipractice: 'i-Practice'
			};

			return typeMap[val] ? typeMap[val]: val[0].toUpperCase() + val.slice(1);
	};

	//=======================================================
	// Determine the top-level status for a multi-part problem.
	// States is an array of status strings, one per part.
	//=======================================================
	app.multiPartStatus = function(states)
	{
		// All new: New
		// Any new: Partial
		// Any pending: Pending
		// All correct: Correct
		// Locked

		var counts = {};

		for (var i = 0, len = states.length; i < len; i++)
			counts[states[i]] = (counts[states[i]] || 0) + 1;

		if (counts.New === len)
			return 'New';

		if (counts.New > 0)
			return 'Partial';

		if (counts.Pending > 0)
			return 'Pending';

		if (counts.Correct === len)
			return 'Correct';

		return 'Locked';
	}

	//=======================================================
	//=======================================================
	app.getCurStep = function(steps)
	{
		for (var curStep = 0, len = steps.length; curStep < len; curStep++)
		{
			if (steps[curStep].status.toLowerCase() === 'new')
				return curStep;
		}

		return 0;		// All steps are completed. This is bad, but better than returning something out of range
	}

//=============================================================================
// Date/Time Processing
//=============================================================================

	//=======================================================
	// Convert date string to JavaScript date object
	//
	// Input format: 2014-09-27 07:00:00
	//=======================================================
	app.getJSDate = function(dateStr)
	{
		if (!dateStr)
			dateStr = '2000-01-01 00:00:00';	// We need a default. Make one up.

//		dateStr = dateStr.replace(/ /g, 'T') + 'Z';
		return new Date(dateStr);
	}

	//=======================================================
	// Convert from UTC to local time
	//
	// Format passed in: "2014-09-27 07:00:00"
	//
	// Browser test: new Date("2014-09-25T00:00:00Z").toString()
	// IE 11:     "Wed Sep 24 2014 17:00:00 GMT-0700 (Pacific Daylight Time)"
	// Chrome 38: "Wed Sep 24 2014 17:00:00 GMT-0700 (Pacific Daylight Time)"
	// FF 33:     "Wed Sep 24 2014 17:00:00 GMT-0700 (Pacific Standard Time)"
	// Safari:    "Wed Sep 24 2014 17:00:00 GMT-0700 (PDT)"
	//=======================================================
	app.localTime = function(timeStr)
	{
		var lt = app.getJSDate(timeStr);

		// This is a bit of a hack. During daylight savings time, add an hour to the time.
		// It turns out this wasn't needed. The system handles it automatically.
//		if (app.isDST(lt))
//			lt.setTime(lt.getTime() + (1000*60*60));	// 1 hour = 60 minutes * 60 seconds * 1000 milliseconds

		var newT = lt.getFullYear() + '-' +
		           ('0' + (1+lt.getMonth())).slice(-2) + '-' +
				   ('0'+lt.getDate()).slice(-2) + ' ' +
		           ('0'+lt.getHours()).slice(-2) + ':' +
				   ('0'+lt.getMinutes()).slice(-2) + ':' +
				   ('0'+lt.getSeconds()).slice(-2);

		return newT;
	}

	//=======================================================
	//=======================================================
	app.isDST = function(dateObj)
	{
		// Convert to a date object
//		var dateObj = app.getJSDate(dateStr);

		// Check timezone offsets in January and July, which should always be different
		var jan = new Date(dateObj.getFullYear(), 0, 1);
		var jul = new Date(dateObj.getFullYear(), 6, 1);
		var stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());

	    return dateObj.getTimezoneOffset() < stdTimezoneOffset;
	}

})();
