//======================================================
// Creates a form full of input fields and buttons (OK, cancel, and variations)
//
// Arguments:
//	id
//  w: A width is required.  Height is automatically set.
//	title: Main title
//	fields: List of fields with titles, validation types, and more
//	buttons: List of buttons to display
//======================================================
framework.widget.form = function()
{
	var that = this;
	var style = app.style.form;

	var title, result, info, links;
	var inputs = [];
	var buttons = [];

	var depth = (that.depth || 0) + 1;

	var errorMap = {
		missing: "Please fill in all of the fields."
	}

	drawForm();

	//=======================================================
	//
	//=======================================================
	function drawForm()
	{
		drawTitles();

		if (that.fields)
			drawFields();

		if (that.infoText)
			drawText();

		if (that.links)
			drawLinks();

		drawButtons();
		drawBackground();
		drawResult();

		setFocus(0);
	}

	//=======================================================
	// Choose the bottom widget, based on what is included in the form
	//=======================================================
	function getBottomWid(doSkipButtons)
	{
		if (!doSkipButtons && that.buttons && buttons.length)
			return buttons[0].id;

		if (that.links && links)
			return links.id;

		if (that.infoText && info)
			return info.id;

		if (that.fields && inputs.length)
			return _.last(inputs).id;

		return title.id;
	}

	//=======================================================
	//
	//=======================================================
	function drawTitles()
	{
		// Main title
		title = that.add('text', {
			font: that.titleFont || style.titleFont,
			color: that.titleColor || style.titleColor,
			text: that.title,
			w: that.w,
			depth: depth
		},{
			top: that.id + ' top ' + style.titleVMargin,
			left: that.id + ' left ' + style.titleHMargin,
			right: that.id + ' right -' + style.titleHMargin
		});

		// Subtitle
		/*
		sub = that.add('text', {
			font: style.subtitleFont,
			color: style.subtitleColor,
			text: that.subtitle,
			w: that.w,
			depth: depth
		},{
			top: title.id + ' bottom ' + style.titleGap,
			left: title.id + ' left'
		});
		*/
	}

	//=======================================================
	// Create all of the requested input fields
	//=======================================================
	function drawFields()
	{
		var label, inp;

		$.each(that.fields, function(idx, val) {

			// Label
			label = that.add('text', {
				text: val.label,
				font: style.labelFont,
				color: style.labelColor,
				w: Math.floor(that.w * style.labelWidth),
				depth: depth
			}, {
				top: idx === 0 ? (title.id + ' bottom ' + style.fieldVMargin) : (label.id + ' bottom ' + style.fieldGap),
				left: title.id + ' left'
			});

			// Input
			inp = that.add('inputPrimitive', {
				w: Math.floor(that.w * style.inputWidth),
				password: val.type === 'pw',
				depth: depth
			}, {
				centery: label.id + ' center',
				right: that.id + ' right -' + style.titleHMargin	// @FIXME/dg: This isn't necessarily correct
			});

			inp.applyAction('keypress', {press: keyPress});
			inputs.push(inp);
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawLinks()
	{
		var top = getBottomWid();

		links = that.add('optionList', {
			options: that.links,
			data: that.id,
			depth: depth
		},{
			top: top + ' bottom ' + style.fieldVMargin,
			left: title.id + ' left',
			right: title.id + ' right'
		});
	}

	//=======================================================
	// Create informational text
	//=======================================================
	function drawText()
	{
		var top = getBottomWid();

		info = that.add('text', {
			text: that.infoText,
			font: style.textFont,
			color: style.textColor,
			w: Math.floor(that.w * style.labelWidth),
			depth: depth
		}, {
			top: top + ' bottom ' + style.fieldVMargin,
			left: title.id + ' left',
			right: title.id + ' right'
		});
	}

	//=======================================================
	// Create all of the requested buttons
	//=======================================================
	function drawButtons()
	{
		var vmargin = that.buttonVMargin || style.buttonVMargin;
		var topWid = getBottomWid();
		var top = topWid + ' bottom ' + vmargin;
		var wid;

		that.buttons && $.each(that.buttons, function(idx, val) {

			wid = that.add('button', {
				image: val.image,
				frame: val.frame,
				click: val.type === "OK" ? performAction : val.click,	// "OK" buttons perform validation first
				index: idx,
				depth: depth
			},{
				top: top,
				right: idx === 0 ? (that.id + ' right -' + style.titleHMargin) : (wid.id + ' left -' + style.buttonGap)
			});

			buttons.push(wid);
		});
	}

	//=======================================================
	//
	//=======================================================
	function drawBackground()
	{
		var btm = getBottomWid();
		var margin = defined(that.bottomMargin) ? that.bottomMargin : style.titleVMargin;

		var bg = that.add('rect', {
			color: style.bgColor,
			borderColor: 'black',
			borderWidth: 1,
			borderRadius: 15,
			depth: depth - 1
		}, {
			left: that.id + ' left',
			right: that.id + ' right',
			top: that.id + ' top',
			bottom: btm + ' bottom ' + margin
		});

		that.h = bg.height();
	}

	//=======================================================
	// Set the focus for a given field
	//=======================================================
	function setFocus(idx)
	{
		if (idx >= 0 && idx < inputs.length)
			inputs[idx].focus();
	}

	//=======================================================
	// Allow Enter to toggle through fields
	//=======================================================
	function keyPress(key, wid)
	{
		if (key !== app.Keys.Enter)
			return;

		$.each(inputs, function(idx, val) {
			if (val === wid)
			{
				if (idx < inputs.length-1)
					setFocus(idx+1);
				else
					performAction();
			}
		});
	}

	//=======================================================
	//
	//=======================================================
	function performAction(wid)
	{
		// Clear any old errors
		showError('');

		// Validate input fields
		var errCheck = validateFields();

		// Display any validation errors
		if (!errCheck.isValid)
		{
			showError(errCheck.error);
			return;
		}

		// If a button wasn't passed in, find one with a type of OK
		if (!defined(wid))
		{
			$.each(that.buttons, function(idx, val) {
				if (val.type === 'OK')
				{
					wid = buttons[idx];
					return false;
				}
			});
		}

		// Call the appropriate click behavior
		var data = getValues();
		that.buttons[wid.index].click && that.buttons[wid.index].click(data);
	}

	//=======================================================
	//
	//=======================================================
	function validateFields()
	{
		err = '';

		that.fields && $.each(that.fields, function(idx, val) {
			var inp = inputs[idx].value();

			if (inp === '')
			{
				err = errorMap.missing;
				return false;		// break
			}

			// Perform field-specific checking here
			if (val.validate)
			{
				var extValid = val.validate(inp, getValues());
				if (!extValid.isValid)
				{
					err = extValid.error;
					return false;
				}
			}
		});

		return {
			isValid: err == '',
			error: err
		};
	}

	//=======================================================
	//
	//=======================================================
	function getValues()
	{
		var out = [];

		that.fields && $.each(that.fields, function(idx, val) {
			out.push(inputs[idx].value());
		});

		return out;
	}

	//=======================================================
	//
	//=======================================================
	function drawResult()
	{
		var btmWid = getBottomWid(true);

		result = that.add('text', {
			text: '',
			font: style.resultFont,
			color: style.resultColor
		},{
			left: title.id + ' left',
			right: btmWid + ' right',
			top: btmWid + ' bottom ' + style.resultMargin
		});
	}

	//=======================================================
	// Display an error message
	//=======================================================
	function showError(msg)
	{
		result.setText(msg);
	}

	//=======================================================
	// Show a message
	//
	// @TODO: Add color support
	//=======================================================
	this.showMessage = function(msg)
	{
		showError(msg);
	}
};
