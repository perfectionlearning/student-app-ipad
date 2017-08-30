//===============================================================================
//===============================================================================
framework.widget.plainText = function()
{
	var that = this;
	var style = app.style.sectionText;

//	var bg, tBorder, bBorder, rBorder, lBorder, divider, waiting;
	var title = '', bodyText = '';

	//=======================================================
	// Construct the major widgets
	//=======================================================
	function createST()
	{
		createText();
	}

	//=======================================================
	//
	//=======================================================
	function createText()
	{
		var titleText = that.title || 'Title Filler';

		//-----------------
		// Add the title
		title = that.add('text', {
			text: titleText,
			color: style.titleColor,
			font: style.titleFont
		},
		{
			top: that.id + ' top 50',
			left: that.id + ' left 30'
        });

		// Set definition text widget to default to title settings.
		bodyText = that.add('text', {
			text: '&nbsp;',
			color: style.textColor,
			font: style.textFont
		},
		{
			top: title.id + ' bottom 20',
			left: that.id + ' left 30',
			right: that.id + ' right -30'
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
		createST();
	}


	//=======================================================
	// Called after section text data have been loaded
	//=======================================================
	this.afterDataLoaded = function(model)
	{
		var para = model.get('secText');
		var text = para.map(function(item) { return '<p>' + item + '</p>'; }).join('');

		bodyText.setText(text);

	}

};
