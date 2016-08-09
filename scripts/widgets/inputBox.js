//======================================================
// A simple input box
// Currently, the input doesn't scroll.  No further input is allowed if the max width is reached.
//
// Should this be at the graphic module level??  That way we could swap between browser input boxes or others.
// Switch to actions!
//
// Arguments:
//  id
//  x
//  y
//  depth: Optional
//  XXX inputFilter: Optional: callback routine that translates keyboard input (can also be used to limit input, e.g. numbers only)
//	text: Optional: text to pre-populate the input
//	hidden: Optional
//	XXX demandFocus: Optional: Callback used when this input gets focus.  It should cause all others to blur.
//
// Style: (inputBox)
//  textColor
//  bgColor
//  borderWidth
//  borderColor
//  focusBorderColor
//	margin
//======================================================
framework.widget.inputBox = function()
{
	var that = this;
	var style = app.style.inputBox;

	var view, box;
	var textWid1, textWid2, cursorWid, widthWid;
	var cursor = 0, cursorState = false, blinkInterval = null;
	var content = "";
	var focused = false;
	var isReadOnly = false;
	var isWrong = false;

	// Create the input widget
	createBox();

	// Create the text widget
	createText();

	// Create the cursor
	createCursor();

	// Pre-populate with text if requested

	// Create a view to handle input
	createView();

	// Display the current contents
	updateText();

	// Flash the cursor
//	enableBlink();

	//=======================================================
	// Create a view to handle input
	//=======================================================
	function createView()
	{
		var inputBoxView = Backbone.View.extend({
			el: that.container,

			// Capture keyboard events
			// Cursor movement, enter needs to be handled specially
			// Others are passed through the filter routine and then inserted

			// Capture clicks
			// Use it to position the cursor

			// Capture clicks/touches on textWid1, textWid2
			events: function() {
				var ev = {};
				var addOn = ' #' + box.id;
				ev['blur' + addOn] = 'blur';
				ev['focus' + addOn] = 'focus';
				ev['keydown' + addOn] = 'key';
				ev['click' + addOn] = 'clickBox';
//				ev['touchstart' + addOn] = 'clickBox';

				ev['click #' + textWid1.id] = 'clickT1';
				ev['click #' + textWid2.id] = 'clickT2';
//				ev['touchstart #' + textWid1.id] = 'clickT1';
//				ev['touchstart #' + textWid2.id] = 'clickT2';
				return ev;
			},

			//----------------------------
			// The box (not any text) was clicked
			// The focus event seems to occur first
			// That means the cursor is visible when
			// the update occurs, making it overly visible.
			//----------------------------
			clickBox: function(ev) {
				if (isReadOnly) return;

				gotFocus();

				// Widget position, relative to parent
				var posX = $(ev.currentTarget).offset().left;

				// Total text width
				var w = textWid1.width() + textWid2.width();

				// Compare the click's x coordinate against the center of the text
				if (ev.pageX - posX - style.marginX < (w / 2))
					cursor = 0;
				else
					cursor = content.length;

				updateText();
			},

			//----------------------------
			// Clicked on textWid1
			//----------------------------
			clickT1: function(ev) {
				if (isReadOnly) return;

				// Move the cursor
				var sel = window.getSelection();
				cursor = sel.anchorOffset;
				updateText();

				// Set focus if unfocused
				if (!focused)
					that.focus();
			},

			//----------------------------
			// Clicked on textWid2
			//----------------------------
			clickT2: function(ev) {
				if (isReadOnly) return;

				// Move the cursor
				var sel = window.getSelection();
				cursor += sel.anchorOffset;
				updateText();

				// Set focus if unfocused
				if (!focused)
					that.focus();
			},

			//----------------------------
			//----------------------------
			blur: function() { lostFocus() },

			//----------------------------
			//----------------------------
			focus: function() { gotFocus() },

			//----------------------------
			//----------------------------
			key: function(ev) {
				if (isReadOnly) return;

				var action = {
					8: keyBackspace,
					13: keyEnter,
					35: keyEnd,
					36: keyHome,
					37: keyLeft,
					39: keyRight,
					46: keyDelete,

					48: '0',	// Regular numbers
					49: '1',
					50: '2',
					51: '3',
					52: '4',
					53: '5',
					54: '6',
					55: '7',
					56: '8',
					57: '9',

					69: 'e',	// Scientific notation

					96: '0',	// Numpad numbers
					97: '1',
					98: '2',
					99: '3',
					100: '4',
					101: '5',
					102: '6',
					103: '7',
					104: '8',
					105: '9',
					109: '-',	// Numpad - -- This key has logic -- but the logic is too complex
					110: '.',	// Number .
					173: '-',	// Firefox Regular - -- This key has logic
					189: '-',	// Chrome only, regular minus
					190: '.'	// Regular .
				};

				// List of keys that require shift.  It's ugly, but they have to be treated differently.
				actionShift = {
					191: '?',	// For problems with unknowns (ASCII 63 + 128)
					69: 'e',	// Actually 'E', but use 'e' anyway.  Scientific notation.
				};

				var key = ev.which;
//				console.log(key);

				var act = undefined;
				if (!ev.shiftKey && action[key])
					act = action[key];
				else if (ev.shiftKey && actionShift[key])
					act = actionShift[key];

				// Check for text insertion
				if (act)
				{
					if (typeof(act) === 'function')
					{
						act();
						ev.preventDefault();
					}
					else
						insertText(act)
				}
			}
		});

		view = new inputBoxView();
	}

	//=======================================================
	// Create the input widget
	//=======================================================
	function createBox()
	{
		box = that.add('rect', {
			x: that.x,	// @NOTE: The width and height include the border, but currently rectangles DON'T
			y: that.y,	// include the border.  Adjust here.  x and y stay the same because they aren't offset by the border width!
			w: that.w,	// - 2 * style.borderWidth,
			h: that.h,	// - 2 * style.borderWidth,
			color: style.bgColor || 'white',
			type: that.type,
			funcTest: that.funcTest,
			depth: that.depth || 0,
			borderWidth: style.borderWidth,
			borderColor: style.borderColor,
			canFocus: true,					// This is a bit hacky.  But it sure saved a lot of time and kept the code small and clean!
//			cursor: 'text',
			hidden: that.hidden
		});
	}

	//=======================================================
	// Create the input widget
	//=======================================================
	function createText()
	{
		var options = {
			x: that.x + style.marginX,	// @NOTE: The width and height include the border, but currently rectangles DON'T
			y: that.y + style.marginY,	// include the border.  Adjust here.  x and y stay the same because they aren't offset by the border width!
			text: '',
			font: style.font,
			color: style.textColor || 'black',
			depth: that.depth || 0,
			cursor: 'text',
			type: 'selectable',
			hidden: that.hidden
		}

		// extend (clone) options each time.  Creating a widget modifies options.
		textWid1 = that.add('text', $.extend({id: that.id + '_t1'}, options));
		textWid2 = that.add('text', $.extend({id: that.id + '_t2'}, options));

		// This widget helps us determine whether text will fit in the input box.
		// We add the text to this off-screen widget, and if it fits we then add it to the real on-screen widget.
		widthWid = that.add('text', $.extend({}, options, {hidden: true, y: -1000, x:-1000}));
	}

	//=======================================================
	//
	//=======================================================
	function createCursor()
	{
		cursorWid = that.add('rect', {
			id: that.id + '_c',
			y: that.y + style.borderWidth + 1,
			w: 1,
			color: style.cursorColor || 'black',
			depth: that.depth || 0,
			hidden: true
		});
	}

	//=======================================================
	//=======================================================
	function updateText()
	{
		// If we could figure out where to position the cursor within a single string,
		// we could use a single text widget instead of two.
		var t1 = content.substr(0, cursor);
		var t2 = content.substr(cursor);

		textWid1.setText(t1);
		var x2 = textWid1.x + textWid1.width();

		textWid2.setPos(x2, textWid2.y);
		textWid2.setText(t2);

		cursorWid.setPos(x2 - 1, cursorWid.y);
	}

	//=======================================================
	// Insert text (one or more characters)
	//=======================================================
	function insertText(data, cursorStay)
	{
		// Insert new data
		var newContent = content.substr(0, cursor) + data + content.substr(cursor);

		// Make sure the new text will fit
		widthWid.setText(newContent);
		if (widthWid.width() + (1 * style.marginX) >= (that.w - 2 * style.borderWidth))
			return;

		// Update the cursor position (if desired)
		if (!cursorStay)
			cursor += (data + '').length;

		// Redraw
		content = newContent;
		updateText();
	}

	//=======================================================
	//=======================================================
	function clearText()
	{
		content = "";
		updateText();
	}

	//=======================================================
	// This was removed, at least temporarily.  We also need
	// minus in the middle of values for scientific notation
	//=======================================================
	function keyMinus()
	{
		// Only allow minus at the beginning
		if (cursor !== 0)
			return;

		// Don't allow minus if there's already a minus sign
		if (content.length > 0 && content[0] === '-')
			return;

		insertText('-');
	}

	//=======================================================
	//=======================================================
	function keyBackspace()
	{
		if (cursor > 0)
		{
			content = content.substr(0, cursor-1) + content.substr(cursor);
			cursor--;
			updateText();
		}
	}

	//=======================================================
	//=======================================================
	function keyEnter()
	{
		fw.eventPublish('keypress:Enter', that);
	}

	//=======================================================
	//=======================================================
	function keyDelete()
	{
		if (cursor < content.length)
		{
			content = content.substr(0, cursor) + content.substr(cursor+1);
			updateText();
		}
	}

	//=======================================================
	//=======================================================
	function keyLeft()
	{
		if (cursor > 0)
		{
			cursor--;
			updateText();
			enableCursor();		// Make sure the cursor is immediately visible
		}
	}

	//=======================================================
	//=======================================================
	function keyRight()
	{
		if (cursor < content.length)
		{
			cursor++;
			updateText();
			enableCursor();		// Make sure the cursor is immediately visible
		}
	}

	//=======================================================
	//=======================================================
	function keyHome()
	{
		if (cursor > 0)
		{
			cursor = 0;
			updateText();
			enableCursor();		// Make sure the cursor is immediately visible
		}
	}

	//=======================================================
	//=======================================================
	function keyEnd()
	{
		if (cursor < content.length)
		{
			cursor = content.length;
			updateText();
			enableCursor();		// Make sure the cursor is immediately visible
		}
	}

	//=======================================================
	// Hide the cursor
	//=======================================================
	function hideCursor()
	{
		cursorWid.hide();
	}

	//=======================================================
	// Display the cursor
	//=======================================================
	function showCursor()
	{
		if (!focused)
			return;

		cursorWid.show();
	}

	//=======================================================
	// Blink the cursor.  Called from an interval.
	//=======================================================
	function blink()
	{
		if (!focused)
			return;

		cursorState = !cursorState;

		if (cursorState)
			showCursor();
		else
			hideCursor();
	}

	//=======================================================
	//
	//=======================================================
	function enableCursor()
	{
		// If already enabled, clear the interval
		blinkInterval && clearInterval(blinkInterval);

		blinkInterval = setInterval(blink, style.blinkRate);
		showCursor();
		cursorState = true;
	}

	//=======================================================
	//
	//=======================================================
	function disableCursor()
	{
		blinkInterval && clearInterval(blinkInterval);
		blinkInterval = null;
		hideCursor();
	}

	//=======================================================
	// The input has received focus.  Do any focus-related actions.
	//=======================================================
	function gotFocus()
	{
		if (!focused)
		{
			focused = true;
			fw.eventPublish('focus:inputbox', that);

			box.borderColor(style.focusBorderColor);
			enableCursor();
		}
	}

	//=======================================================
	//=======================================================
	function lostFocus()
	{
		if (focused)
		{
			focused = false;
			fw.eventPublish('blur:inputbox', that);

			box.borderColor(style.borderColor);
			disableCursor();
		}
	}

	//=======================================================
	// Insert text (one or more characters)
	//=======================================================
	this.write = function(data)
	{
		if (isReadOnly) return;
		insertText(data);
	}

	//=======================================================
	//=======================================================
	this.clear = function()
	{
		if (isReadOnly) return;
		clearText();
	}

	//=======================================================
	//=======================================================
	this.backspace = function()
	{
		if (isReadOnly) return;
		keyBackspace();
	}

	//=======================================================
	// Set focus
	//=======================================================
	this.focus = function(dontBlur)
	{
		if (!focused)
		{
			box.focus();
//			gotFocus();		// Redundant: box.focus fires a focus event, which calls gotFocus.
		}
	}

	//=======================================================
	// Process external requests to blur the current input
	//=======================================================
	this.blur = function()
	{
		lostFocus();
	}

	//=======================================================
	//=======================================================
	this.width = function(w)
	{
		if (defined(w))
		{
			this.w = w;
			box.width(w - 2 * style.borderWidth);
		}

		return this.w;
	}

	//=======================================================
	//=======================================================
	this.height = function(h)
	{
		if (defined(h))
		{
			this.h = h;
			box.height(h);	// - 2 * style.borderWidth);

			textWid1.fontSize(h - 4, h);
			textWid2.fontSize(h - 4, h);
			widthWid.fontSize(h - 4, h);
			cursorWid.height(box.height() - 4);	// Hard-code a 1 pixel margin between the box and the cursor.  The number needs to include the border size.
		}

		return this.h;
	}

	//=======================================================
	// Get or set the box content
	//=======================================================
	this.value = function(val)
	{
		if (defined(val))
		{
			content = val;
			updateText();
		}

		return content;
	}

	//=======================================================
	// Also consider disabling the cursor.  Be careful: clearing read-only
	// shouldn't re-enable the cursor unless the element has focus.
	// There is no easy way to determine that.
	//=======================================================
	this.readOnly = function(enable)
	{
		// Make sure there's a change
		if (isReadOnly === enable)
			return;

		isReadOnly = enable;

		// Set the box color
		if (isReadOnly)
		{
			var color = this.wrong ? app.style.boxROWrongColor : app.style.readOnlyColor;
//			var color = app.style.readOnlyColor;
			box.color(color).allowFocus(false);
			textWid1.cursor('normal');
			textWid2.cursor('normal');
		}
		else
		{
			var color = this.wrong ? app.style.boxWrongColor : style.bgColor;
			box.color(color).allowFocus(true);
			textWid1.cursor('text');
			textWid2.cursor('text');
		}
	}

	//=======================================================
	//=======================================================
	this.wrongAnswer = function()
	{
		this.wrong = true;

		box.color(app.style.boxWrongColor);
	}

	//=======================================================
	//=======================================================
	this.clearWrongs = function()
	{
		this.wrong = false;

		var color = isReadOnly ? app.style.readOnlyColor : style.bgColor;
		box.color(color);
	}

	//=======================================================
	//=======================================================
	this.showSelf = function()
	{
		hideCursor();
	}

	//=======================================================
	//=======================================================
	this.fadeInSelf = function()
	{
		hideCursor();
	}

	//=======================================================
	//=======================================================
	this.fadeOutSelf = function()
	{
		// This seems a bit redundant (especially on desktop) but we need to change the border color and kill the cursor
		lostFocus();
	}

	//=======================================================
	//=======================================================
	this.terminateSelf = function()
	{
		blinkInterval && clearInterval(blinkInterval);

		view.undelegateEvents();
		delete(view);
	}
}