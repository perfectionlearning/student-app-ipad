//===========================================================================================
// Global helper functions
//===========================================================================================

//==============================
//==============================
function defined(v)
{
	return (typeof(v) != 'undefined');
}

//==============================
// Object.keys shiv/shim/polyfill/whatever
//==============================
if (!Object.keys)
{
	Object.keys = function(o) {
		if (o !== Object(o))
			throw new TypeError('Object.keys called on non-object');
		var ret=[],p;
		for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
		return ret;
	}
}

//==============================
// Array identity check
//==============================
//function isArray(array) { return !!(array && array.constructor == Array); }

//===========================================================================================
// Game Framework
//
// @TODO/dg: Add a module init system where each module can register an init routine.
//	The init routine will need access to passed in data via an init object.
//
// @FIXME/dg: It's silly to make this a constructor. We don't need more than one instance of
// the framework!
//===========================================================================================
var framework = function() {
	this.modules = {};
};

//=======================================================
//=======================================================
framework.prototype.registerModule = function(id, modObj)
{
	this.modules[id] = modObj;
}

//=======================================================
// Resets all modules
//=======================================================
framework.prototype.reset = function()
{
	$.each(this.modules, function(key, val) {
		if (defined(val.reset))
			val.reset();
	});
}

//=======================================================
// Log a debug message
//=======================================================
framework.prototype.debug = function(msg)
{
	if (document.consoleMessage)
		document.consoleMessage(msg);
	else
		console.info(msg);
}

//=======================================================
// Log a general information message
//=======================================================
framework.prototype.log = function(msg)
{
	if (document.consoleMessage)
		document.consoleMessage(msg);
	else
		console.info(msg);
}

//=======================================================
// Log a fatal error
//=======================================================
framework.prototype.error = function(msg)
{
	if (document.consoleMessage)
		document.consoleMessage(msg);
	else
		console.error(msg);

	// Capture and save a stack trace
	try {
		this.failOnPurpose();		// Throw an error to generate a stack trace
	} catch (e) {
		app.errInfo = e.stack;	//.replace(/\n/g, '<br/>');
	}

	// Generate an exception
	throw(msg);
}

//=======================================================
// Log a non-fatal warning
//=======================================================
framework.prototype.warning = function(msg)
{
	if (document.consoleMessage)
		document.consoleMessage(msg);
	else
		console.warn(msg);
}

var fw = new framework();	// Construct the framework object
