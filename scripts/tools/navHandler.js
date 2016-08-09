//=============================================================================
// Intelligent Navigation Manager
//=============================================================================
;(function() {

	//-------------------------------------------------------
	// This contains all types of navigation items
	//-------------------------------------------------------
	var navList = {};

//=============================================================================
// Pre-defined Data
//=============================================================================

	//-------------------------------------------------------
	// Style definitions for the major navigation categories
	//-------------------------------------------------------
	var styles = {
		contexts: {},

		history: {
			header: 'Recent',	// Header displayed before entries in this category
			tip: 'Recently visited areas',
			showEmpty: true,	// Show the header even when the category is empty
			max: 5				// Maximum entries in this list.  Adding more cause the oldest to be removed.
		},

		bookmarks: {
			header: 'Bookmarks',	// Header displayed before entries in this category
			showEmpty: true			// Show the header even when the category is empty
		},

		global: {}
	};

	//-------------------------------------------------------
	// The order in which to display navigation categories
	//-------------------------------------------------------
	var order = ['contexts', 'history', 'global', 'bookmarks'];

	//-------------------------------------------------------
	// Global items that always appear in the navigation menu
	//-------------------------------------------------------
	var globalNav = [
		{
			text: 'Lesson Plans',
			icon: 'NAVIcons,TOC',		// Icon image asset, Icon frame name
			tip: 'Lesson Plan TOC',	// Optional tooltip
			action: 'func',			// Types: header (can't click), obj, url, func
			dest: 'lpTOC',
		},

		{
			text: 'Settings',	// There will be a default font, but the size should shrink to fit the text
			icon: 'NAVIcons,Prefs',		// Icon image asset, Icon frame name
			tip: 'Change your system preferences',	// Optional tooltip
			action: 'obj',	// Types: header (can't click), obj, url, func
			dest: 'prefs',
		}
	];

	//-------------------------------------------------------
	// Initialize the navList
	//-------------------------------------------------------
	resetAll();

//=============================================================================
// List Management
//=============================================================================

	//=======================================================
	// Add a navigation item to the appropriate list
	// If the max entries is exceeded, remove one from the list.
	//=======================================================
	function addToNav(category, type, dest, options)
	{
		// Ensure the desired category exists
		if (!defined(navList[category]))
		{
			fw.warning('Attempted to add navigation element to unknown category');
			return;
		}

		// Create a data object for the new entry
		var data = $.extend({
			action: type,
			dest: dest
		}, options);

		// Check to see if we're exceeding the maximum allowed.  If so, delete the oldest entry.
		// @TODO

		// Add the entry to the appropriate list
		navList[category].push(data);
	}

	//=======================================================
	// Reset a single category
	//=======================================================
	function resetCategory(category)
	{
		navList[category] = [];
	}

	//=======================================================
	// Reset all categories
	//=======================================================
	function resetAll()
	{
		// Empty the navigation list
		navList = {};

		// Clear each category
		$.each(order, function(idx, val) {
			resetCategory(val);
		});

		// Add global entries
		navList.global = globalNav;

		// @TEMP!
		addToNav('bookmarks', 'obj', 'TOC', {text:'Sample bookmark'});
		addToNav('bookmarks', 'obj', 'TOC', {text:'Bookmark 2'});
		addToNav('history', 'obj', 'TOC', {text:'Assignment #3'});
		addToNav('history', 'obj', 'TOC', {text:'1.3.a: Distance'});
		addToNav('history', 'obj', 'TOC', {text:'2.2.a: An example of a rate'});
	}

//=============================================================================
// List Queries
//=============================================================================

	//=======================================================
	//=======================================================
	app.getNavList = function()
	{
		var out = [];	// Array of objects [{head:,list:[]}]

		// Step through the order list
		$.each(order, function(idx, key) {
			var indent = 0;

			// 'key' is the key to both the navList and styles objects.
			// Add each header and associated entries to the output list.

			// Check for a header
			if (styles[key] && styles[key].header)
			{
				// There is a header.  If its list is empty, we may or may not want to display it
				if ((navList[key] && navList[key].length) || styles[key].showEmpty)
					out.push({
						text: styles[key].header,
						icon: styles[key].icon,
						tip: styles[key].tip,
						type: key,
						indent: indent++
					});
			}

			// Add each entry.  Trust that there are no more than the maximum allowed, which was enforced
			// by the addToNav routine.
			navList[key] && $.each(navList[key], function(idx, entry) {
				out.push({
					text: entry.text,
					icon: entry.icon,
					tip: entry.tip,
					action: entry.action,
					dest: entry.dest,
					indent: indent,
					type: key
				});
			});

		});

		return out;
	}

})();
