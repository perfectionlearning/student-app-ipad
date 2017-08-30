//===============================================================================
// Arguments:
//  id
//  x, y, w, h
//  hidden: Optional -- not implemented, but should be
//  depth: Optional -- not implemented, but should be
//
// Style: (whiteboard)
//	bgColor: Background color
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
//===============================================================================
framework.widget.prefsList = function()
{
	var that = this;
	var style = app.style.prefsList;

	var bg;
	var title;
	var prefSection = [];

	//=======================================================
	//=======================================================
	function createContainer()
	{
		// Bordered box around the entire widget
		bg = that.add('borderedBox', app.style.backdrop,
		{
			top: that.id + ' top',
			bottom: that.id + ' bottom',
			left: that.id + ' left',
			right: that.id + ' right'
		});

	}

	//=======================================================
	//
	//=======================================================
	function createText()
	{
		//-----------------
		// Add the title
		title = that.add('text', {
			text: '',
			color: style.titleColor,
			font: style.titleFont
		},
		{
			wid: bg,
			my: 'top left',
			at: 'top left',
			ofs: '50 50'
		});
	}

	//=======================================================
	//=======================================================
	function createSections(prefSections)
	{
		var prefButton;

		$.each(prefSections, function(idx, section) {
			var anchorEl = idx == 0 ? title : prefButton;
			var headingOffset = idx == 0 ? 10 : 40;

			//---------------------
			// Add definitions
			var prefHeading = that.add('text', {
				text:section.label,
				color:style.tabColor,
				font:style.tabFont
			},
			{
				top: anchorEl.id + ' bottom ' + headingOffset,
				left: title.id + ' left ',
				right: bg.id + ' right -' + style.textRmarginAdjust,
			});

			//---------------------
			var prefBlock = that.add('text', {
				text:section.text,
				color:style.textColor,
				font:style.textFont
			},
			{
				top: prefHeading.id + ' bottom ' + 5,
				left: prefHeading.id + ' left ',
				right: bg.id + ' right -' + style.textRmarginAdjust
			});

			//---------------------
			prefButton = that.add('button', {
				image:section.button,
				click:section.action,
			},
			{
				wid: prefBlock,
				my: 'top left',
				at: 'bottom left',
				ofs: '0 10'
			});
		});
	}

//===============================================================================
// Standard widget API
//===============================================================================

	//=======================================================
	// Called after the widget has been docked
	//=======================================================
	this.docked = function()
	{
		createContainer();

		createText();
		createSections(that.sections);
	}

};
