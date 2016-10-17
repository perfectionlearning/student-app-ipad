//=============================================================================
// Page Title
//
//  id
//  x, y, w
//  text
//
// Style: (pageTitle)
//  pageTitle.font
//  pageTitle.color
//  pageTitle.align
//=============================================================================
framework.widget.title = function()
{
	var style = app.style.pageTitle;

	this.add('text', {
		x: this.x,
		y: this.y,
		w: this.w,
		text: this.text,

		font: style.font,
		color: style.color,
		align: style.align
	});
}
