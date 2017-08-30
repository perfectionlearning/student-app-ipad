//===============================================================================
// Arguments:
//   data: {links:[], nonLinks:[]}
//===============================================================================
framework.widget.standards = function()
{
	var that = this;
	var style = app.style.standards;

	var title, lastLink;

	drawTitle();
	drawLinks();
	drawOthers();

	//=======================================================
	// Draw the title
	//=======================================================
	function drawTitle()
	{
		title = that.add('text', {
			text: "Standard(s): TEKS ",
			color: style.titleColor,
			font: style.titleFont,
		}, {
			top: that.id + ' top',
			left: that.id + ' left'
		});
	}

	//=======================================================
	// Draw linked standards
	//=======================================================
	function drawLinks()
	{
		_.each(that.data.links, function(item) {
			lastLink = that.add('fakeLink', {
				refCode: item.data,		// Pass in an identifier
				text: item.label,
				font: style.linkFont,
				color: style.linkColor,
				hoverColor: style.hoverColor,
				click: linkClicked,
			}, {
				wid: (lastLink ? lastLink : title),
				my: 'top left',
				at: 'top right',
				ofs: style.entryGap + ' 0'
			});
		});
	}

	//=======================================================
	// Click handler for links -- redirect, sending the desired data instead of
	// a useless widget reference
	//=======================================================
	function linkClicked(wid, id)
	{
		that.click && that.click(id);
	}

	//=======================================================
	// Draw non-linked standards
	//=======================================================
	function drawOthers()
	{
		_.each(that.data.nonLinks, function(item) {
			lastLink = that.add('text', {
				text: item,
				color: style.refColor,
				font: style.refFont
			}, {
				wid: (lastLink ? lastLink : title),
				my: 'top left',
				at: 'top right',
				ofs: style.entryGap + ' 0'
			});
		});
	}

//===============================================================================
//  widget API
//===============================================================================

	//=======================================================
	//=======================================================
	this.height = function()
	{
		// This is a large assumption.
		// It's quicker than measuring the height of identical text repeatedly though.
		return title.height();
	}

};
