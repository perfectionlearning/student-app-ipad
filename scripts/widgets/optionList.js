//======================================================
// Creates a fake HTML link, essentially a text button
//
// Arguments:
//	id
//  options: array of {label: string, click: callback, disabled: boolean)
//
//======================================================
framework.widget.optionList = function()
{
	var that = this;
	var style = app.style.optionList;

	var textWids = [];

	drawOptions();

	//=======================================================
	//=======================================================
	function drawOptions()
	{
		var wid, icon;
		that.w = 0;

		$.each(that.options, function(idx, val) {

			if (val.disabled)
				return true;

			// Icon
			icon = that.add('image', {
				image: 'BulletGT',
				depth: that.depth
			}, {
				left: that.id + ' left',
				top: idx === 0 ? (that.id + ' top') : (wid.id + ' bottom ' + style.vGap)
			});

			// Text
			wid = that.add('fakeLink', {
				text: val.label,
				font: style.font,
				color: style.color,
				hoverColor: style.hoverColor,
				click: val.click,
				data: that.data + '_' + idx,
				depth: that.depth
			}, {
				centery: icon.id + ' center',
				left: icon.id + ' right ' + style.iconGap
			});

			var w = wid.x + wid.width() - icon.x;
			that.w = Math.max(that.w, w);

			textWids.push(wid);
		});

		that.h = wid.y + wid.height() - that.y;
	}
};
