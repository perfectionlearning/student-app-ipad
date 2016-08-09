//===========================================================================================
// Storage Module
//===========================================================================================
(function() {
	fw.registerModule("storage", {});

	//=======================================================
	// Retrieve a variable from session storage
	//=======================================================
	framework.prototype.load = function(id)
	{
//		if (Modernizr.localstorage)
			return localStorage.getItem(id);
	};
	
	//=======================================================
	// Set a session storage variable
	//=======================================================
	framework.prototype.save = function(id, val)
	{
//		if (Modernizr.localstorage) 
			localStorage.setItem(id, val);
	};

})();