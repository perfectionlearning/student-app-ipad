//===============================================================================
// Arguments:
//  id
//  x, y, w, h
//  hidden: Optional
//  depth: Optional
//
// Style: (whiteboard)
//	bgColor: Background color (border around the video)
//	borderWidth: width of the border around the video
//	borderHeight: height of the border around the video
//	titleHeight: box height
//	titleFont: font used for title text
//	titleColor: color of title text
//	titleHmargin: space between the left edge of the video and the title
//	titleVmargin: space between the title and the top of the title box
//	textBoxHeight: text box height
//	textFont: font used by slide text
//	textColor: slide text color
//	textHmargin: Space between the left edge of the text box and the headline
//	textVmargin: Space between the text and the top of the text box
//	bulletVMargin: Space between the header and the bullets
//===============================================================================
framework.widget.wbContainer = function()
{
	var that = this;
	var style = app.style.whiteboard;	// Change to a new name!

	// Widget references
	var vid, bg, textBox, button, title, headline, bullet;

	var maxBullets = 99;
	var bulletChar = 8226;	// dot operator(8901).  Others: middle dot (183), bullet(8226)

	// List of draw actions for each WB type
	var actions = {
		der: [],
		actwb: ['midTextbox', 'text'],
		appsec: ['button'],
		defaultType: ['bg', 'bottomTextbox', 'text']
	}

	// List of functions associated with each draw action
	var funcs = {
		bg: drawBG,
		bottomTextbox: drawBtmTextBox,
		midTextbox: drawMidTextBox,
		text: drawText,
		button: drawButton
	}

	//=======================================================
	//=======================================================
	function create(type)
	{
		// We always have a drop-shadow.  Don't bother with an action.
		drawShadow();

		var acts = actions[type] || actions.defaultType;
		$.each(acts, function(idx, val) {
			funcs[val]();
		});
	}

	//=======================================================
	// @FIXME/dg: The shadow isn't visible!  These assets have a ton
	// of transparent outer space.  More importantly, they dock
	// to the inside of this widget, rather than the outside.
	//=======================================================
    function drawShadow()
    {
		that.add('borderedBox', {
			bgColor: 'black',
			images: {t: 'WBShadowT', b: 'WBShadowB', l: 'WBShadowL', r: 'WBShadowR',
				tl: 'WBShadowTL', bl: 'WBShadowBL', tr: 'WBShadowTR', br: 'WBShadowBR'
			},
			borderOutside: true
		}, fw.dockTo(that));
    }

	//=======================================================
	//
	//=======================================================
	function drawBG()
	{
		// Add the top background
		bg = that.add('rect', {
			color: style.bgColor,
		}, {
			top: that.id + ' top',
			bottom: that.id + ' bottom -' + style.textBoxHeight,	// Includes the title box
			left: that.id + ' left',
			right: that.id + ' right'
		});
	}

	//=======================================================
	// Add the text area
	//=======================================================
	function drawBtmTextBox()
	{
		textBox = that.add('image', {
//				id: 'wb_textBox',
				image: 'WBTextBox',
				repeat: 'x',
				depth: 2,
				funcTest: 'wb_textbg',
				w: that.w
			},
			{
				wid: bg,
				my: 'top left',
				at: 'bottom left'
			}
		);
	}

	//=======================================================
	// This is different enough from the bottom text box that
	// we can keep it separate.
	//=======================================================
	function drawMidTextBox()
	{
		textBox = that.add('image', {
//				id: 'wb_textBox',
				image: 'WBActivityTextBox',
				repeat: 'x',
				depth: 2,
				w: that.w
			},
			{
				wid: that.id,
				my: 'bottom left',
				at: 'bottom left',
				ofs: '0 -' + style.ActTextYOfs
			}
		);
	}

	//=======================================================
	// Add the title
	//=======================================================
	function drawText()
	{
		// Unfortunate special-case hack
		if (that.type === 'actwb')
		{
			var vOfs = style.titleActVmargin;
			var textOfs = style.textActVmargin;
			var vEdge = 'top';
		}
		else
		{
			vOfs = style.titleVmargin;
			var textOfs = style.textVmargin;
			var vEdge = 'bottom';
		}

		// Construct docking object, since of the edges is variable
		var dock = {
			left: textBox.id + ' left ' + style.titleHmargin,
			right: textBox.id + ' right -' + style.titleHmargin
		}
		dock[vEdge] = textBox.id + ' top -' + vOfs;

		// Now, back to our regularly scheduled common code
		title = that.add('text', {
			text: '&nbsp;',
			color: style.titleColor,
			funcTest: 'wb_title',
			font: style.titleFont,
			depth: 2
		}, dock);

		createHeadlines(textOfs);
	}

	//=======================================================
	// Add the headlines
	//=======================================================
	function createHeadlines(margin)
	{
		//-----------------
		// Add the headline
		headline = that.add('text', {
			text: '&nbsp;',
			color: style.textColor,
			depth: 2,
			funcTest: 'wb_text',
			font: style.textFont
		},
		{
			top: textBox.id + ' top ' + margin,
			left: textBox.id + ' left ' + style.textHmargin,
			right: textBox.id + ' right -' + style.textHmargin
		});

		//-----------------
		// Add the bullet
		bullet = that.add('text', {
			text: '',
			depth: 2,
			color: style.textColor,
			funcTest: 'wb_bullet',
			font: style.textFont
		});
	}

	//=======================================================
	// Create button to display Answer video in Question /
	// Answer pair.
	//=======================================================
	function drawButton()
	{
		// Only do this for video 1!
		if (!that.firstVid)
			return;

		button = that.add('button',
		{
			image: 'WBPlayAnswer',
			depth: 2,
			click: buttonClicked
		},
		{
			wid: that.id,
			my: 'bottom right',
			at: 'bottom right',
			ofs: '-43 -30'
		});
	}

	//=======================================================
	//
	//=======================================================
	function buttonClicked()
	{
		button && button.hide();
		that.nextFunc();
	}

//===============================================================================
// Video management API
//===============================================================================

	//=======================================================
	// Add the video
	//
	// @FIXME/dg: This routine needs a major overhaul
	// It was designed for "normal" whiteboards on a desktop machine
	// First, make sure it works okay on an iPad.  The video is probably
	// too small.
	// Second, the handling for activity whiteboards is questionable.
	// It will definitely need to be changed to better accomodate variable
	// resolutions.
	// Third, the widget creation should only occur once.
	// Only special case the x,y,w,h calculations and then use
	// combined code to actually create the video widget.
	//=======================================================
	this.createVideo = function(url)
	{
		if (vid)
			vid.terminate();

		// Pre-calculate the width and height.  We can't set them retroactively with docking.
		// calculate dimensions for video if within an activity whiteboard.
		var w = that.w;
		var h = that.h;

		// calculate dimensions for video within regular regular whiteboard or summary.
		// This should probably be turned into a table, but it won't be much shorter or simpler
		// at this point.  If we add more exceptions, it will be.
		if (that.type === 'wb' || that.type === 'sum')
		{
			w -= style.borderWidth * 2;
			h = textBox.y - bg.y - style.titleHeight - style.borderHeight;
			var offset = style.borderWidth + ' ' + style.borderHeight;
		}

		vid = that.add('video', {
			url: url,
			controls: app.showControls,
			w: w,
			h: h,
			depth: 1,
			timeUpdate: that.timerUpdate
		},{
			wid: that,
			my: 'top left',
			at: 'top left',
			ofs: offset
		});
	}

	//=======================================================
	// This is a minor architectural violation.  The API
	// should reside within this module, instead of requesting
	// a private member and manipulating it externally.
	//=======================================================
	this.getVideo = function()
	{
		return vid;
	}

	//=======================================================
	//=======================================================
	this.videoDuration = function()
	{
		return vid.duration();
	}

	//=======================================================
	// Get or set the current time (seek)
	//=======================================================
	this.vidCurrentTime = function(time)
	{
		if (defined(time))
			return vid.currentTime(time);
		else
			return vid.currentTime();
	}

	//=======================================================
	//=======================================================
	this.videoPause = function()
	{
		vid.pause();
	}

	//=======================================================
	//=======================================================
	this.videoResume = function()
	{
		vid.resume();
	}

	//=======================================================
	//=======================================================
	this.videoStop = function()
	{
		vid.stop();
	}

//===============================================================================
// Content Control API
//===============================================================================

	//=======================================================
	// set the title
	//=======================================================
	this.setTitle = function(text)
	{
		// Make sure the title block is present before attempting to set it.
		// It won't be for an Application object.
		if (title) {
			title.setText(text);
		}
	}

	//=======================================================
	//=======================================================
	this.setHeadline = function(text)
	{
		// The headline block won't be present for an Application object.
		if (headline) {
			headline.setText(text || '');

			// Dock bullet section to headline after headline is drawn.  This is because
			// headline can span multiple lines.
			fw.dock(bullet, {
				top: headline.id + ' bottom ' + style.bulletVmargin,
				left: headline.id + ' left ' + style.bulletHmargin,
				right: headline.id + ' right'
			});
		}
	}

	//=======================================================
	//=======================================================
	this.setBullets = function(textList)
	{
//textList.push("the time has come, the walrus said, to talk of many things.");
//textList.push("of shoes and ships and sealing wax, of cabbages and kings.");
		var bulletPoints = [];
		var maxIdx = 0;
		for (var i = 0; i < maxBullets; i++)
		{
			if (textList[i]) {
				bulletPoints.push(String.fromCharCode(bulletChar) + ' ' + textList[i]);
				maxIdx = i;
			}
			else {
				// Not sure why bullet points were added to complete the maximum; was it to allow for blanks?
				bulletPoints.push('');
			}
		}
		// bulletPoints has maxBullets elements in it; truncate so last element has text.
		bulletPoints.length = maxIdx + 1;
		if (bullet && bullet.id) {
			bullet.setText(bulletPoints.join('<br/>'));
		}
	}

//===============================================================================
// Standard widget API
//===============================================================================

	//=======================================================
	//=======================================================
	that.docked = function()
	{
		create(that.type);
	}
}