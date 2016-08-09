//=============================================================================
// A single line of text, with hover and click behavior
//
//  id
//  x, y
//  hidden (optional)
//  depth (optional)
//
//	title:
//  titleClick: callback for click
//
//  text:
//  textClick: callback for click
//
// Style (unitToc)
//  unitFont:
//  unitTextColor:
//  unitTextGap: Space between unit title and text
//  sectionFont:
//  sectionTextGap: Space between section entries
//  sectionBGColor:
//  sectionTextColor:
//  sectionIndent: Horizontal space (indent) between unit name and section names
//
//=============================================================================
framework.widget.lineToc = function()
{
	var that = this;
	var style = app.style.unitToc;

	var textWidget;

	var curY;

	createText();

    //=======================================================
	// // Create a view to manage the hover states
    //=======================================================
    var myWidView = Backbone.View.extend({
	    el: that.container,

	    events: function() {
			var type = that.id + '_text';
			var ev = {};
			ev["mouseenter ." + type] = 'hover';
			ev["mouseleave ." + type] = 'stopHover';
			ev["click ." + type] = 'click';
			return ev;
	    },

	    hover: function(ev) {
			var id = ev.currentTarget.id;
			that.cmd(id, 'color', '#61A85E');
	    },

	    stopHover: function(ev) {
			var id = ev.currentTarget.id;
			that.cmd(id, 'color', style.sectionTextColor);
	    },

		click: function(ev) {
			var id = ev.currentTarget.id;
			var idx = id.substring(id.indexOf('_') + 1);
			that.click && that.click(that.link);
		}
    });

    var view = new myWidView();

	//=======================================================
	// Draw the title text
	//=======================================================
	function createText()
	{
		textWidget = that.add('text', {
			type: that.id + '_text',
			id: that.id + '_0',
			x: that.x,
			y: that.y,
			w: that.w,
			text: that.text,
			font: style.unitFont,
			color: style.sectionTextColor,
			hidden: that.hidden,
			cursor: 'pointer',
			depth: that.depth
		});

		curY = that.y + textWidget.height() + style.unitTextGap;
	}

	//=======================================================
	// Calculate height on the fly.  Positioning may change
	// wrapping, which would change the height.
	//=======================================================
	this.height = function(h)
	{
		if (defined(h))
		{
			that.h = h;
			return this;
		}

		// Calculate height on the fly
		var last = textWidget;

		if (last)
			return last.y + last.height() - that.y;
	}
};