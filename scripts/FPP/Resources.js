//===========================================================================================
// Resource Manifest for the project
//
// @FIXME/dg: Would there be any benefit to turning this into a collection?
//	Resource lists could be fetched with AJAX
//	We could iterate over the collection with _ helpers
//===========================================================================================
(function() {

	// Asset init: request object {id: path}
	// Graphics: h, w are dynamic properties.  Need: frame count.  Later, add cut manifests.

	// Images:
	//	path -- path and filename of image resource
	//	frames -- frame count
	//	size:"auto" -- if present, will assign a width and height property to the image.  Assumes a sprite sheet with a single row of sprites of equal width.
	//	This is where we'd define sequence lists as well.  They need to be propagated to the graphics module

	var PATH = "imagesFPP/Product/Tiled/";

	app.Resources.images = {
		// Atlas
		TextureAtlas: {path: "imagesFPP/atlas/atlas.png"},
		TOCFadeDown: {path:PATH + "fadedn.png"},
		STBorderT: {path:PATH + "Top_Shadow_Tile_1x20.png"},
		STBorderB: {path:PATH + "Bottom_Shadow_tile_1x20.png"},
		STBorderL: {path:PATH + "Left_Shadow_tile_20x1.png"},
		STBorderR: {path:PATH + "Right_Shadow_Tile_20x1.png"},
		STVertLineM: {path:PATH + "Orange_Divider_Tile_35x1.png"},
		PDSlicesT: {path:PATH + "DropDown_Top.png"},
		PDSlicesB: {path:PATH + "DropDown_Bottom.png"},
		PDSlicesL: {path:PATH + "DropDown_Left.png"},
		PDSlicesR: {path:PATH + "DropDown_Right.png"},
		PDSlicesT2: {path:PATH + "SmartMenu_Top.png"},
		RoundedT: {path:PATH + "RoundedT.png"},
		RoundedB: {path:PATH + "RoundedB.png"},
		RoundedL: {path:PATH + "RoundedL.png"},
		RoundedR: {path:PATH + "RoundedR.png"},
		WBShadowT: {path:PATH + "WB_Shadow_Top.png"},
		WBShadowB: {path:PATH + "WB_Shadow_Bottom.png"},
		WBShadowL: {path:PATH + "WB_Shadow_Left.png"},
		WBShadowR: {path:PATH + "WB_Shadow_Right.png"},
		WBActivityTextBox: {path:PATH + "Activity_wb_text_area_tile.png"},
		WBTextBox: {path:PATH + "TextBox.png"},
		WVStepLine:  {path:PATH + "WVStepLine.png"}

	},

	// Audio assets -- later expand to hold multiple types for different platforms
	app.Resources.audio = {
		//SFXCorrect: {path:'audio/correct.ogg', instances: 1},
		//SFXWrong: {path:'audio/wrong.ogg', instances: 1}
	}
})();
