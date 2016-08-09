//===========================================================================================
// Audio Interface -- Abstraction layer for the audio library
//===========================================================================================
(function() {
	fw.registerModule("audio", {});

	var audioList = [];

	//===========================================================================================
	// API
	//
	// Play(sample, channel)
	// Stop(channel)
	// IsPlaying(channel)
	// queue(list) -- Prepare to load assets
	// load -- Load assets
	//===========================================================================================

	//=======================================================
	// Load all of the audio assets
	// This can be called multiple times with different lists
	//=======================================================
	framework.prototype.audQueue = function(list)
	{
		$.each(list, function(key, val) {
			audioList.push({name: key, src:val.path, instances: val.instances});
		});
	}

	//=======================================================
	// Load all of the audio assets
	// This can be called multiple times with different lists
	//=======================================================
	framework.prototype.audLoad = function(success, error)
	{
		// Perform the load, as long as there are actual assets to load
		if (audioList.length)
		{
//			SoundJS.addBatch(audioList);
//			SoundJS.onLoadQueueComplete = success;	// This is getting called, even on error!
//			SoundJS.onSoundLoadError = function(audElement) {error(audElement.src)};
		}
		else
			success();	// There are no assets.  Do the callback now to ensure it gets called.
	}

	//=======================================================
	// Play a sound effect, given an ID
	//=======================================================
	framework.prototype.audPlay = function(id)
	{
//		return SoundJS.play(id, SoundJS.INTERRUPT_LATE);
	};

	//=======================================================
	// Stop playing a sound effect
	//=======================================================
	framework.prototype.audStop = function(id)
	{
//		return SoundJS.stop(id);
	};

	//=======================================================
	// Checks whether an effect is playing
	//=======================================================
	framework.prototype.isPlaying = function(id)
	{
		// This isn't easy under SoundJS.  We need a callback on sound completion, and to keep
		// track of each sound in this layer.
	};
})();