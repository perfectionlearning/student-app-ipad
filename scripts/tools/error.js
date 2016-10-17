//===========================================================================================
// Fatal Error Handling Module
//===========================================================================================
(function() {

	// These are Firefox-specific! They aren't good enough for cross-browser use.
	var ignoreErrs = [
		"TypeError: event.item is undefined",
		"ReferenceError: Utils is not defined",
		"TypeError: element.item is undefined",
		"Script error."
	];

	//=======================================================
	// Generic Exception Handler
	//=======================================================
	app.exception = function(err, file, line, col, errorObj)
	{
		// Removing video in Firefox causes a bogus exception!
		// Use this hack until Firefox is fixed.
		if (ignoreErrs.indexOf(err) !== -1)
		{
			fw.debug('ignored exception: ' + err);
			return;
		}

		if (err.indexOf('prayer failed') !== -1)
		{
			fw.debug('Ignoring MathQuill exception: ' + err);
			return;
		}

		// And now back to our regularly scheduled exception handler
		var strip = 'uncaught exception: ';
		if (err.indexOf(strip) === 0)
			err = err.substr(strip.length);

		// err is a valid error string
		// Depending on how we got here, either file+line or app.errInfo contain error location information

		var id = Math.floor(Math.random() * 1000000);

//		createError('<b>A fatal error has occurred</b><br/><br/>' + err );
		var url = '//www.perfectionlearning.com/kinetic-feedback?' +
			'pid=' + app.pid +
			'&errno=' + id +
			'&ver=' + app.getVersionString();

		createError('<b><span id="errTitle">An error has occurred.</span><br/><br/>' +
					'It certainly was not our intention for you to get here.<br/>' +
					'Please close and restart your book.<br/><br/>' +
					'If you continue to get here, please <a href="' + url + '">submit a support ticket</a><br/>' +
					'to customer service and include this number: <span id="errno">' + id + '</span></b>');

		sendError(id, err, file, line, col, app.errInfo, errorObj);
	}

	//=======================================================
	//
	//=======================================================
	app.error = function(err)
	{
		createError(err);
	}

	//=======================================================
	// Place error text in a pretty box
	//=======================================================
	function createError(html)
	{
		var out = '<div id="error" class="container"><div id="errorBox">' + html + '</div></div>';
		$('body').html(out);

		var x = ($('#error').width() - $('#errorBox').outerWidth()) / 2;
		var y = ($('#error').height() - $('#errorBox').outerHeight()) / 2;
		$('#errorBox').css({left: x + 'px', top: y + 'px'});
	}

	//=======================================================
	// Generate a string with the current navigation location
	//=======================================================
	function curNavString()
	{
		return app.curNav.scheme + "," +
			   app.curNav.chapter + "," +
			   app.curNav.unit + "," +
			   app.curNav.topic + "," +
			   app.curNav.section;
	}

	//=======================================================
	// Send error information to the mothership
	//=======================================================
	function sendError(id, str, file, line, column, trace, errorObj)
	{
		if (typeof(errorObj) !== "undefined" && errorObj.stack)
			var errStack = errorObj.stack;

		var position = file + "@" + line + ":" + column;

		var out = '<script src="//search.kineticbooks.com:3005/?' +		// 3001 for FPP, 3005 for A1
			'id:' + safeEncode(id) +						// A random ID we can use to tie a customer to an error
			'|bk:' + safeEncode(app.book_id) +				// Book ID (we won't always be in FPP)
			'|pid:' + safeEncode(app.pid) +					// Product ID
			'|v:' + safeEncode(app.getVersionString()) +	// Major, browser, build, back-end
			'|obj:' + safeEncode(app.curObjName) +			// Current object name
			'|nav:' + safeEncode(curNavString()) +			// Current navigation location
			'|asn:' + safeEncode(app.curAssign) +			// Current assignment ID
			'|prbidx:' + safeEncode(app.curProbIndex) +		// Current problem index
			'|prob:' + safeEncode(app.curProblem) +			// Current problem ID
			'|e:' + safeEncode(str) +						// Error message
			'|ua:' + safeEncode(navigator.userAgent) +		// User agent
//			'|unm:' + safeEncode('') +						// User name
			'|stk:' + safeEncode(trace) +					// Stack trace for fw.error fatal errors
			'|stk2:' + safeEncode(errStack) +				// Stack trace for modern browsers
			'|url:' + safeEncode(position) +				// File and line number of exceptions
		'"></script>'

//		console.log(out);
		$(out).appendTo('body');
	}

	//=======================================================
	// Encode a string, but only if it isn't already encoded (darn you, IE!)
	//=======================================================
	function safeEncode(str)
	{
		if (decodeURI(str) === str)
			return encodeURIComponent(str);

		// Already encoded
		return str;
	}
})();
