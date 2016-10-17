//===========================================================================================
// BookDefinition.xml parsing and support functions
//
// @FIXME/dg: This should break into 2 pieces.
//   One would deal with BookDefinition.json loading, parsing, and storing
//   The second would handle all active navigation
//===========================================================================================
(function() {

	var callback;

	//=======================================================
	// Product-specific setup
	//=======================================================
	app.loadBookDefinition = function(cb)
	{
		callback = cb;	// Globals are cheesy. The only alternative is allocation via an anonymous done function.
						// Actually, using a second done via .done(cb) would be much more elegant.
						// Keep in mind that allocation is out of our hands inside jQuery. Adding another done may
						// allocate more than we're saving.

		var bookDefFile = app.bookPath + app.bookFile;

		// use promise interface
		$.getJSON(bookDefFile, {})
			.done(processBookDefinition)
			.error(function() {
				fw.error('Failed to load book definition file.')	// Fatal error
			});
	}

	//=======================================================
	// Save and process book definition data
	//=======================================================
	function processBookDefinition(data)
	{
		app.objectList = data.objects;
		app.navSchemes = data.navigation || [];

		// Append book-specific addenda
		supplementBook();

		createTopicList();

		// Fill in extra info
		//   object: primary scheme

		// Let the world know we're done
		callback();
	}

	//=======================================================
	//=======================================================
	app.curScheme = function()
	{
		return app.navSchemes[app.curNav.scheme];
	}

	//=======================================================
	// Accept supplement data (e.g., lab links, TEKS link), and format it to go with the book definition.
	//=======================================================
	function supplementBook(chapter)
	{
		var adds = app.getAddendumList();	// List of desired addenda (may be smaller than the list in the book definition)

		// Step through each scheme
		$.each(app.navSchemes, function(scheme, nav) {

			// Within a scheme, step through each top-level nav construct (generally a chapter)
			$.each(nav, function(idx, obj) {

				// Find all addenda chapters, and ensure they are known (in the addenda list)
				if (obj.t && obj.t === "addendum")
				{
					if (adds.indexOf(obj.n) !== -1)
					{
						var ad = app.getAddendum(obj.n);
						obj.n = ad.name;
						obj.ch = ad.data;		// text:, link: instead of objects
					}
					else
						nav.splice(idx,1);	// @FIXME/dg: Doing this inside a $.each seems bound to fail. It's better to use a non-each loop (preferably in reverse order). It only works now because it's deleting the last entry.
				}
			});
		});
	}

	//=======================================================
	// Create extra data structures to aid nav lookups.
	// This could generally be created on the fly, but it gets
	// accessed very often. We want to limit allocation, so we
	// create static lists once.
	// Another option would have been to memoize the helper routines.
	//
	// chapterTopics: Formatted text.  Includes units, prefixed by '!'.  Used for nav display.
	//				  This includes unit intros, but they are prefixed by '?'.
	// sectionsInTopic: A list of formatted section names, accessed by chapter and topic (not unit)
	//                  This DOES include hidden chapters.
	// skippedTopicMap: Converts from full linear topic numbers to topic numbers that don't include hidden topics.
	//=======================================================
	function createTopicList()
	{
		// Create a list of topics, by chapter.  Ignore units.
		app.chapterTopics = {};
		app.sectionsInTopic = {};
		app.skippedTopicMap = {};

		// Step through each scheme
		$.each(app.navSchemes, function(scheme, nav) {

			app.chapterTopics[scheme] = [];
			app.sectionsInTopic[scheme] = [];
			app.skippedTopicMap[scheme] = [];

			// Within a scheme, step through each chapter
			$.each(nav, function(chIdx, chap) {
				var tops = [];
				var linTop = 0;			// Index, which is constantly incremented even if skipping
				var topSkip = 0;	// Custom numbering display, since we skip some items
				app.sectionsInTopic[scheme][chIdx] = [];
				app.skippedTopicMap[scheme][chIdx] = [];

				if (chap.t && chap.t === "addendum")
					return true;		// continue -- skip addenda

				// Within a chapter, step through each unit
				$.each(chap.ch, function(unIdx, unit) {
					tops.push('!' + unit.n);	// ! prefix means title

					// Within a unit, step through each topic
					$.each(unit.ch, function(topIdx, top) {

						app.skippedTopicMap[scheme][chIdx].push(topSkip);

						// Skip intros, which act like hidden entries
						if (top.t !== 'unitIntro')
							tops.push(++topSkip + ': ' + top.n);
						else
							tops.push('?' + top.n);	// ? prefix means hidden

						app.sectionsInTopic[scheme][chIdx].push([]);

						// Within a topic, step through each section
						$.each(top.ch, function(secIdx, sec) {
							app.sectionsInTopic[scheme][chIdx][linTop].push(app.getNthLetter(secIdx) + '. ' + sec.n);
						});

						linTop++;
					});
				});

				app.chapterTopics[scheme].push(tops);	// Add a chapter worth of topics
			});
		});
	}

	//=======================================================
	// Add an object to the object list
	//
	// This is used for built-in objects such as the TOC and
	// prefs pages.
	//=======================================================
	app.addObject = function(name, type, metaType, children)
	{
		if (app.objectList[name])
		{
			fw.warning('Attempting to add a duplicate named object to the object list.');
			return;
		}

		app.objectList[name] = {
			t: type,
			mt: metaType,
			ch: children,
			builtIn: true	// @FIXME/dg: A bit of a hack.  We can't change the type, and need to set a flag.
		};
	}


	//=======================================================
	// Get an object by indices.  Shortcut.
	//=======================================================
	function getSecAt(ch, un, top, sec, scheme)
	{
		scheme = scheme || app.schemeList[0];

		/* This is crashing under some circumstances. Search results were out of sync, so it's a definite possibility.
		var abc = app.navSchemes[scheme];
		if (abc[ch] &&
			abc[ch].ch[un] &&
			abc[ch].ch[un].ch[top] &&
			abc[ch].ch[un].ch[top].ch[sec])
				return abc[ch].ch[un].ch[top].ch[sec];
		else
			return null;
		*/

// This is cleaner and faster, but it is annoying during development since it generates an exception.
		try {
			return app.navSchemes[scheme][ch].ch[un].ch[top].ch[sec];
		} catch(e) {
			return null;
		}

	}

	//=======================================================
	// Get an object by indices.  Shortcut.
	//=======================================================
	function getTopAt(ch, un, top, scheme)
	{
		scheme = scheme || app.schemeList[0];
		var abc = app.navSchemes[scheme];
		if (abc[ch] &&
			abc[ch].ch[un] &&
			abc[ch].ch[un].ch[top])
				return abc[ch].ch[un].ch[top];
		else
			return null;

	}

	//=======================================================
	// Get an object by indices.  Shortcut.
	//=======================================================
	app.getUnit = function(ch, un, scheme)
	{
		scheme = scheme || app.schemeList[0];
		var abc = app.navSchemes[scheme];
		if (abc[ch] &&
			abc[ch].ch[un])
				return abc[ch].ch[un];
		else
			return null;

	}

	//=======================================================
	//=======================================================
	app.getChapterList = function(prefix, allowAddendums, scheme)
	{
		scheme = scheme || app.schemeList[0];
		var out = [];

		$.each(app.navSchemes[scheme], function(idx, val) {
			if (!(val.t === "addendum") || allowAddendums)
				out.push(prefix + (idx+1) + ': ' + val.n);	// Use idx instead of val.num.  Chapter numbers aren't linear!
		});

		return out;
	}

	//=======================================================
	//=======================================================
	app.chapterID = function()
	{
		var sch = app.curNav.scheme;
		var ch = app.curNav.chapter;
		return app.navSchemes[sch][ch].id || 3002;
	}

	//=======================================================
	// Cache this for speed.  There will be 3-4 different
	// versions, so this isn't the most RAM-friendly method.
	// getChapterList() will be called often though, so this
	// prevents a fair bit of allocation and offers a miniscule
	// speed savings as well.
	//
	// Currently broken -- app.joinArgs didn't appear to be called!
	//=======================================================
//	app.getChapterList = _.memoize(getChapterList, app.joinArgs);

	//=======================================================
	// Returns the full chapter count (including addendums)
	//=======================================================
	app.chapterCount = function(scheme)
	{
		scheme = scheme || app.schemeList[0];
		return app.navSchemes[scheme].length;
	}

	//=======================================================
	// Returns the unit count for the current chapter
	//=======================================================
	function unitCount(ch, scheme)
	{
		scheme = scheme || app.schemeList[0];

		try {
			return app.navSchemes[scheme][ch].ch.length;
		} catch(e) {
			return -1;
		}
	}

	//=======================================================
	// Returns the topic count for the current unit
	//=======================================================
	function topicCount(ch, un, scheme)
	{
		scheme = scheme || app.schemeList[0];

		try {
			return app.navSchemes[scheme][ch].ch[un].ch.length;
		} catch(e) {
			return -1;
		}
	}

	//=======================================================
	// Returns the section count for the current topic
	//=======================================================
	function sectionCount(ch, un, top, scheme)
	{
		scheme = scheme || app.schemeList[0];

		try {
			return app.navSchemes[scheme][ch].ch[un].ch[top].ch.length;
		} catch(e) {
			return -1;
		}
	}

	//=======================================================
	// This uses the metatype, if available. If not, it uses
	// the object type.
	//
	// Look up the type for an object.  The supplied object
	// can be an object reference or an object name.
	//=======================================================
	app.getObjType = function(obj, noMeta)
	{
		if (typeof(obj) === "string")
			obj = app.objectList[obj];

		if (noMeta)
			return obj.t;
		else
			return obj.mt || obj.t;		// Use metatype if one is defined, otherwise use type
	}

	//=======================================================
	// This always checks the type, never the metatype
	//=======================================================
	app.curObjType = function()
	{
		var obj = app.objectList[app.curObjName];
		return obj.t;
	}

	//=======================================================
	// Given a nav object, return the name of the section it's in
	//=======================================================
	app.getSectionName = function(nav)
	{
		// Use the chapter, unit, and section number to locate the name
		var sec = getSecAt(nav.chapter, nav.unit, nav.topic, nav.section, nav.scheme);

		// Special case for intro sections
		if (sec && sec.t && sec.t === "intro")
			return "Unit Overview: " + sec.n;

		return sec && sec.n;
	}

	//=======================================================
	// Given a nav object, return the name of the topic it's in
	//=======================================================
	app.getTopicName = function(nav)
	{
		// Use the chapter, unit, and section number to locate the name
		var top = getTopAt(nav.chapter, nav.unit, nav.topic, nav.scheme);
		return top && top.n;
	}

	//=======================================================
	// Given a nav object, return the name of the unit it's in
	//=======================================================
	app.getUnitName = function(nav)
	{
		// Use the chapter and unit to locate the name
		var unit = app.getUnit(nav.chapter, nav.unit, nav.scheme);
		return unit && unit.n;
	}

	//=======================================================
	// Given a nav object, return the name of the chapter it's in
	//=======================================================
	app.getChapterName = function(nav)
	{
		try {
			return app.navSchemes[nav.scheme][nav.chapter].n;
		}
		catch(e)
		{
			return "";
		}
	}

	//=======================================================
	//=======================================================
	app.getChapterId = function(obj)
	{
//		if (obj.chapter >= 0)
//			return app.bookDef.chapters[obj.chapter].uid;
//		else
			return 0;
	}

//===========================================================================================
// Path and file routines
//===========================================================================================

	//=======================================================
	//
	//=======================================================
	function chapterPath(obj)
	{
		return app.bookPath + app.bookDef.chapters[obj.chapter].path;
	}

	//=======================================================
	// Given an object name, return the data file path
	//=======================================================
	app.getWbPath = function(obj)
	{
		return app.bookPath + 'json/wb/';
	}

	//=======================================================
	// Given an object name, return the data file path
	//=======================================================
	app.getTextPath = function(obj)
	{
		return app.bookPath + 'json/sectext/';
	}

	//=======================================================
	// Given an object name, return the data file path
	//=======================================================
	app.getImagePath = function(name)
	{
		return app.bookPath + 'image/';
	}

	//=======================================================
	// Given an object name, return the data file name
	//=======================================================
	app.getCardImage = function(name)
	{
		var path = app.getImagePath(name);
		return path + name + '.png';
	}

	//=======================================================
	// Given an object name, return the data file path
	//=======================================================
	app.getVideoPath = function()
	{
		return app.bookPath + 'video/';
	}

//===========================================================================================
// Object lookup
//===========================================================================================

	//=======================================================
	//=======================================================
	app.currentLocation = function()
	{
		return app.curNav;
	}

	//=======================================================
	//=======================================================
	app.getObjByLocation = function(chapter, unit, topic, section, scheme)
	{
		return getSecAt(chapter, unit, topic, section, scheme).o;
	}

	//=======================================================
	// Determine where an object exists within the book
	// It can be in more than one place.  This will only
	// return the first instance.
	//
	// This is fairly slow.  Do it only when necessary.
	//=======================================================
	app.findObject = function(name, scheme)
	{
		scheme = scheme || app.schemeList[0];
		var sch = app.navSchemes[scheme];

		// Walk the nav tree until the object is found
		// Use for loops to allow "return" to work at any depth
		if (sch)
		{
			for (var chIdx = 0; chIdx < sch.length; chIdx++)
			{
				var ch = sch[chIdx];
				if (ch.t !== "addendum")
				{
					for (var unIdx = 0; unIdx < ch.ch.length; unIdx++)
					{
						var un = ch.ch[unIdx];
						for (var topIdx = 0; topIdx < un.ch.length; topIdx++)
						{
							var top = un.ch[topIdx];
							for (var secIdx = 0; secIdx < top.ch.length; secIdx++)
							{
								var sec = top.ch[secIdx];
								if (sec.o === name)
									return [chIdx, unIdx, topIdx, secIdx, scheme];

								// Check object children too.  It's a serious error, but it's
								// possible that a nav area has no children
								var obj = app.objectList[sec.o];
								if (obj && obj.ch)
								{
									for (var i = 0; i < obj.ch.length; i++)
									{
										if (obj.ch[i] === name)
											return [chIdx, unIdx, topIdx, secIdx, scheme];
									}
								}
							}
						}
					}
				}
			}
		}

		// Not found, or invalid scheme
		return [];
	}

	//=======================================================
	//
	//=======================================================
	app.getObjectsByChapter = function(chIdx, scheme)
	{
		scheme = scheme || app.schemeList[0];
		var sch = app.navSchemes[scheme];

		var results = {};

		// Walk the nav tree until the object is found
		// Use for loops to allow "return" to work at any depth
		var ch = sch[chIdx];
		if (ch.t !== "addendum")
		{
			for (var unIdx = 0; unIdx < ch.ch.length; unIdx++) {
				var un = ch.ch[unIdx];
				for (var topIdx = 0; topIdx < un.ch.length; topIdx++) {
					var top = un.ch[topIdx];
					for (var secIdx = 0; secIdx < top.ch.length; secIdx++) {
						var sec = top.ch[secIdx];
						var pre = sec.o.substr(0, sec.o.indexOf('_'));
						results[sec.o] = { "t": pre };

						var obj = app.objectList[sec.o];
						if (obj && obj.ch)
						{
							for (var i = 0; i < obj.ch.length; i++) {
								pre = obj.ch[i].substr(0, obj.ch[i].indexOf('_'));
								results[obj.ch[i]] = { "t": pre };
//								results[pre] = 'ch';
							}
						}
					}
				}
			}
		}

		return results;
	}

	//=======================================================
	// Returns the unit number, given a chapter and absolute topic number
	// Also adjusts the topic number from absolute (within a chapter) to
	// relative (within a unit)
	// @TESTME/dg
	//=======================================================
	app.getUnitByTopic = function(ch, top, scheme)
	{
		scheme = scheme || app.schemeList[0];

		var chap = app.navSchemes[scheme][ch];

		var un = 0;

		while (true)
		{
			if (!chap.ch[un])		// Ensure we haven't run out of units
				return [-1, -1];

			var len = chap.ch[un].ch.length;

			if (top < len)	// If the topic is in the current unit
				return [un, top];

			top -= len;		// Subtract the current unit's topic count to move to the next unit
			un++;
		}
	}

	//=======================================================
	// Converts from a linear topic number to a relative topic
	// number.
	//=======================================================
	app.getRelativeTopic = function(ch, linTop, scheme)
	{
		var res = app.getUnitByTopic(ch, linTop, scheme);
		return res[1];
	}

	//=======================================================
	// Convert from a relative topic number within a unit to
	// a linear topic number
	//=======================================================
	app.getLinearTopic = function(ch, un, top, scheme)
	{
		scheme = scheme || app.schemeList[0];
		var chap = app.navSchemes[scheme][ch];

		var out = 0;

		// Add the topic count
		for (var i = 0; i < un; i++)
			out += chap.ch[i].ch.length;

		out += top;

		return out;
	}

	//=======================================================
	// Convert from full linear topic number to a numbering
	// system that skips hidden topics.
	//=======================================================
	app.getTranslatedTopic = function(scheme, chapter, topic)
	{
		scheme = scheme || app.schemeList[0];
		var res;
		try {
			res = app.skippedTopicMap[scheme][chapter][topic];
		}
		catch(e) {}

		if (defined(res))
			return res;

		return topic;		// Error: don't perform translation
	}

	//=======================================================
	// Convert from abbreviated linear topic number to a numbering
	// system that counts all topics.
	//=======================================================
	app.getFullTopicNum = function(scheme, chapter, topic)
	{
		scheme = scheme || app.schemeList[0];

		var data = app.skippedTopicMap[scheme][chapter];

		for (var i = 0, len = data.length; i < len; i++)
		{
			if (data[i] === topic)
				return i;
		}

		return -1;	// Error, not found
	}

	//=======================================================
	// Returns the list of data files associated with a given object
	//=======================================================
	app.getDataFiles = function(objName)
	{
		if (objName && app.objectList[objName] && app.objectList[objName].df)
			return app.objectList[objName].df;

		return [];
	}

	//=======================================================
	// Determines whether the current chapter is "hidden"
	//=======================================================
	app.isHiddenChapter = function()
	{
		return app.curNav.scheme === "OHW";	// If an object doesn't have a primary scheme, it's considered "hidden"
	}

	//=======================================================
	// Determines whether the current chapter is "hidden"
	//=======================================================
	app.isHelpChapter = function()
	{
		// This is an edge case
		if (app.curNav.scheme === "Help")
			return true;

		if (app.curObjName === "help")
			return true;

		return false;
	}

	//=======================================================
	// Set the current navigation location without jumping.
	// The user is presumably already there.
	//=======================================================
	app.setNav = function(ch, un, top, sec, sch)
	{
		// Set the fields rather than creating a new object.  The code is more
		// awkward, but there is no allocation this way.
		app.curNav.chapter = ch*1;
		app.curNav.unit = un*1;
		app.curNav.topic = top*1;
		app.curNav.section = sec*1;
		app.curNav.scheme = sch;
	}

	//=======================================================
	// Jump to a new navigation node, activating the object
	// at that node.
	//=======================================================
	app.navJump = function(ch, un, top, sec, sch)
	{
		// Support nav objects as well as separate C,U,T,S,S parameters
		if (typeof(ch) === "object")
		{
			var nav = ch;
			ch = nav.chapter;
			un = nav.unit;
			top = nav.topic;
			sec = nav.section;
			sch = nav.scheme;
		}

		app.setNav(ch, un, top, sec, sch);

		var node = getSecAt(ch, un, top, sec, sch);
		node && app.linkToObject(node.o);
	}

	//=======================================================
	// Deprecated, but used extensively
	// Jump to an object.  Now we usually jump around based on
	// a navigation object.
	//
	// This is still used when linking to an object's child,
	// and when we don't have a navigation object.
	// It is also used for linking to the TOC, prefs page, etc.
	//
	// @FIXME/dg: This is too big and messy!
	//=======================================================
	app.linkToObject = function(name)
	{
		if (!defined(name))
			name = app.defaultView;

		app.curObjName = name;
		if (app.objectList[name])
			var obj = app.objectList[name];
		else
		{
			name = app.defaultView;
			obj = app.objectList[app.defaultView];
			app.curNav.scheme = app.schemeList[0];
		}

		// @FIXME/dg: Move this to a sub-function.
		// Ensure that we have a valid scheme (only important for TOC)
		if (name === 'TOC' && !app.navSchemes[app.curNav.scheme])
			app.curNav.scheme = app.schemeList[0];

		// Special unity hack.
		if (obj && obj.t && obj.t === "unityact")
		{
			app.launchUnity(name);

			// If direct linking to the unity activity, we need to load SOMETHING or the loading
			// page will stay forever.  If so, launch the activity and also the TOC.
			if (!app.curObject)
			{
				name = app.defaultView;
				obj = app.objectList[app.defaultView];
			}
			else
				return;
		}

		// Set the global app.curObject for direct access by views
		app.curObject = obj;

		// Notify the app about the change
		app.navigationChange(obj, name);

		// @FIXME/dg: Move these lines out to a product-specific link helper function
		app.reviewObject(name, app.curNav);
		app.updateNavUI();		// Update the nav bar here, so we don't have to do it in every view

		app.changeContext(app.route.getViewFromObj(obj));
	}

	//=======================================================
	//=======================================================
	function isChildObject(obj)
	{
		var objType = app.getObjType(obj);
		return (objType === 'whiteboard' || objType === 'activity');
	}

	//=======================================================
	// Is there a previous section?
	//=======================================================
	app.hasPrevSection = function()
	{
		var ch = app.curNav.chapter;
		var un = app.curNav.unit;
		var top = app.curNav.topic;

		// for 'whiteboard' types, previous section is the parent, so the section we're already in.
		var sec = isChildObject(app.curObject) ? app.curNav.section : app.curNav.section - 1;

		// Unless we're at the first unit, topic, and section, the answer is yes.  No knowledge
		// of the book is necessary.
		return (un || top || (sec != -1));
	}

	//=======================================================
	//=======================================================
	app.hasNextSection = function()
	{
		// @FIXME/dg: Huge hack!  Fix me!
		if (app.isHelpChapter())
			return false;

		var sch = app.curNav.scheme;

		var ch = app.curNav.chapter;
		var un = app.curNav.unit;
		var top = app.curNav.topic;
		var sec = app.curNav.section;

		// Check to see if we're on the last section of the last topic of the last unit
		if (un === unitCount(ch, sch)-1 &&
			top === topicCount(ch, un, sch)-1 &&
			sec === sectionCount(ch, un, top, sch)-1)
				return false;

		return true;
	}

	//=======================================================
	//=======================================================
	app.nextSection = function()
	{
		var sch = app.curNav.scheme;
		var ch = app.curNav.chapter;
		var un = app.curNav.unit;
		var top = app.curNav.topic;
		var sec = app.curNav.section;

		// Attempt to get the next section within this topic
		var nextObj = getSecAt(ch, un, top, ++sec, sch);

		// Check for another topic
		if (!nextObj)
			nextObj = getSecAt(ch, un, ++top, sec=0, sch);

		// If that was the last topic of the unit, try the next unit instead
		if (!nextObj)
			nextObj = getSecAt(ch, ++un, top=0, 0, sch);

		// We don't link between chapters, so give up
		if (nextObj)
			app.navJump(ch, un, top, sec, sch);
	}

	//=======================================================
	//=======================================================
	app.prevSection = function()
	{
		// @FIXME/dg: Huge hack!  Fix me!
		if (app.isHelpChapter())
			return app.linkToObject('help');

		var sch = app.curNav.scheme;
		var ch = app.curNav.chapter;
		var un = app.curNav.unit;
		var top = app.curNav.topic;

		// for 'whiteboard' types, previous section is the parent, so the section we're already in.
		var sec = isChildObject(app.curObject) ? app.curNav.section : app.curNav.section - 1;

		// Check for more sections within this topic
		var nextObj = getSecAt(ch, un, top, sec, sch);

		// Move to the last section of the previous topic, if one exists
		if (!nextObj && top)
		{
			sec = sectionCount(ch, un, --top, sch) - 1;
			nextObj = getSecAt(ch, un, top, sec, sch);
		}

		// Move to the last topic and section of the previous unit, if one exists
		if (!nextObj && un)
		{
			top = topicCount(ch, --un, sch) - 1;
			sec = sectionCount(ch, un, top, sch) - 1;
			nextObj = getSecAt(ch, un, top, sec, sch);
		}

		// We don't link between chapters, so give up
		if (nextObj)
			app.navJump(ch, un, top, sec, sch);
	}

	//=======================================================
	// The "up" button was pressed.  Figure out where to go.
	//=======================================================
	app.upLink = function()
	{
		// Look up target type based on current object type or metatype
		var targetType = app.route.getUpNav(app.curObject.t, app.curObject.mt);

		// Ideally, this will never happen.  In reality, we have to guard against it.
		if (!targetType)
		{
			fw.warning("I don't know how to go up from this object type: " + app.curObject.t);
			return;
		}

		// We have a target type.  Act on it, in a way specific to the type.
		app.route.performUp(targetType);
	}

	//=======================================================
	// Return to the previous/parent object
	//
	// This is currently only used by prefs.
	//=======================================================
	app.returnToSection = function()
	{
		// Go back -- This is only used by the prefs page currently.  This is exactly the behavior we want (except that state is lost).
		window.history.back();
	}

	//=======================================================
	// Convert a number to a letter
	//=======================================================
	app.getNthLetter = function(idx, isCap)
	{
		var base = (isCap ? 65 : 97);
		return String.fromCharCode(base + idx);
	}

})();
