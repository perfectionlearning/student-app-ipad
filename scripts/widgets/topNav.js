//=============================================================================
// Top-level navigation widget.  Currently consists of 3 pulldowns
//
//  id
//  x, y
//  chapter, topic, section
//
// Style: (topNav)
//=============================================================================
framework.widget.topNav = function()
{
	var that = this;
	var style = app.style.topNav;

	var pd1, pd2, pd3;

	this.w = fw.assetWidth(this.chapter.tabAsset) +
			 fw.assetWidth(this.topic.tabAsset) +
			 fw.assetWidth(this.section.tabAsset);

	this.h = fw.assetHeight(this.chapter.tabAsset);

	that.chapter.click = setChapter;
	that.topic.click = setTopic;
	that.section.click = setSection;

	//=======================================================
	//
	//=======================================================
	function createPulldown(entry)
	{
		return that.add('navPulldown', {
			title: entry.title,
			tabAsset: entry.tabAsset,
			data: entry.data,
			selection: entry.selection,
			click: entry.click,
			depth: that.depth
		});
	}

	//=======================================================
	// Jump to the first topic of the selected chapter
	//=======================================================
	function setChapter(idx)
	{
		var obj = app.getObjByLocation(idx, 0, 0, 0);

		// NEW: Try going to the TOC
		var nav = app.currentLocation();
//		app.curNav.chapter = idx;		// This is highly suspect, but it should work.  Linking to the TOC sets the lastObject to curObject.  The TOC uses lastObject
		app.setNav(idx, 0, 0, 0, nav.scheme);

		app.TOC();

		// OLD: Go to the new chapter, topic 1, section 1
//		app.linkToObject(obj);
	}

	//=======================================================
	// Jump to the first section of the selected topic
	//=======================================================
	function setTopic(idx)
	{
		var cur = app.currentLocation();		// Get our currect location
		var unTop = app.getUnitByTopic(cur.chapter, idx, cur.scheme);
		app.navJump(cur.chapter, unTop[0], unTop[1], 0, cur.scheme);
	}

	//=======================================================
	// Jump to the selected section within the current topic
	//=======================================================
	function setSection(idx)
	{
		var cur = app.currentLocation();		// Get our currect location
		app.navJump(cur.chapter, cur.unit, cur.topic, idx, cur.scheme);
	}

	//=======================================================
	//=======================================================
	this.docked = function()
	{
		// Create 3 pulldowns
		// Create the 1st pulldown
		pd1 = createPulldown(that.chapter);
		fw.dock(pd1, {wid: that, my: 'top left', at: 'top left'});

		// Create the 2nd pulldown
		pd2 = createPulldown(that.topic);
		fw.dock(pd2, {
			wid: pd1,
			my: 'top left',
			at: 'top right',
			ofs: style.gap + ' 0'
		});

		// Create the 3rd pulldown
		pd3 = createPulldown(that.section);
		fw.dock(pd3, {
			wid: pd2,
			my: 'top left',
			at: 'top right',
			ofs: style.gap + ' 0'
		});
	}
};