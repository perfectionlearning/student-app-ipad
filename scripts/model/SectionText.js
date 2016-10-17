//=======================================================
// SectionText Data File
//=======================================================
(function() {

	var ilId = 0;

	//=======================================================
	// Model
	//=======================================================
	var secTextModel = Backbone.Model.extend({

		// Do some special processing of the section text
		// Relative links will point to the wrong location (code instead of content).  Fix them.
		parse: function(data) {

			// Fix links inside section text
			data.secText = fixLinks(data.secText);
			data.secText = internalLinks(data.secText);

			// Clean up MML stored in the data files
			fixCardMML(data);
			fixDefinitionMML(data);
			fixTextMML(data);

			return data;
		}
	});

	//=======================================================
	// Relative links will point to the wrong location (code instead of content).  Fix them.
	//=======================================================
	function fixLinks(text)
	{
		var regex = /(<a href=")([^"]*)("[^>]*>.*?<\/a>)/g;
		for (var i=0; i < text.length; i++)
		{
			// Break the link into parts ([1] = <a href=" [2] = URL [3] = >display text</a>
			var link = regex.exec(text[i]);
			if (link && link.length >= 4)
			{
				// If there's no colon, it's a relative link.  Add the book path.
				if (link[2].indexOf(':') === -1)
					text[i] = text[i].replace(regex, "$1" + app.bookPath + "$2$3");
			}
		}

		return text;
	}

	//=======================================================
	// @FIXME/dg: Improve this!  We want as little HTML dependencies as possible!
	//=======================================================
	function makeLink(text, obj)
	{
		if (!text || !obj)
			return "";

		var url = window.location.pathname + '#obj/' + obj;
		return "<a href='" + url + "'>" + text + "</a>";
	}

	//=======================================================
	// Construct internal links
	//=======================================================
	function internalLinks(text)
	{
		var regex = /\[OBJ:([^:]+):([^\]]+)\]/g;
		for (var i=0; i < text.length; i++)
		{
			// Replace internal links.  If there's an error, return the full text, effectively doing nothing.
			text[i] = text[i].replace(regex, function(full, obj, text) {
				return makeLink(text, obj) || full;
			});
		}

		return text;
	}

	//=======================================================
	// Run card text through the MML cleanup processor
	//=======================================================
	function fixCardMML(data)
	{
		$.each(data.cards, function(cardIdx, card) {

			$.each(card.lines, function(lineNo, line) {
				line.text = app.cleanMML(line.text);
			});
		});
	}

	//=======================================================
	//=======================================================
	function fixDefinitionMML(data)
	{
		data.definitions && $.each(data.definitions, function(idx, def) {
			def.term = app.cleanMML(def.term);
			def.def = app.cleanMML(def.def);
		});
	}

	//=======================================================
	//=======================================================
	function fixTextMML(data)
	{
		for (var i = 0, len = data.secText.length; i < len; i++)
			data.secText[i] = app.cleanMML(data.secText[i]);
	}

	//=======================================================
	// Instance
	//=======================================================
    app.sectionTextModel = new secTextModel();

})();
