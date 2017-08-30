//===========================================================================================
// Asynchronous Request Manager
//===========================================================================================
(function() {
	fw.registerModule('asyncmgr', {reset: reset});

	var proxiedSync = Backbone.sync;

	var requestList = {};

	var id = 0;

	//=======================================================
	//=======================================================
	function reset()
	{
		requestList = {};
	}

	//=======================================================
	// Mark an asynchronous request as aborted.
	//=======================================================
	framework.prototype.abortAsync = function() {
		for (k in requestList) {
			requestList[k].status = 'abort';
		}
	};

	//=======================================================
	// Hijacked Done callback -- This is for promises
	//=======================================================
	function doneProxy(data, statusText, xhr) {
		var id = xhr && xhr.asyncMgrId;

		var req = requestList[id];
		if (req) {
			if (req.status !== 'abort')
				req.promise.resolve.apply(this, arguments);

			// once callback has been handled, remove item from requestList.
			delete requestList[id];
		}
//		else
//			fw.warning("doneProxy: requestList "+id+" not set.");
	};

	//=======================================================
	// Hijacked Fail callback -- This is for promises
	//=======================================================
	function failProxy(xhr) {
		var id = xhr && xhr.asyncMgrId;

		var req = requestList[id];
		if (req)
		{
			if (req.status !== 'abort')
				req.promise.reject.apply(this, arguments);

			delete requestList[id];
		}
//		else
//			fw.warning("failProxy: requestList "+id+" not set.");
	};

	//=======================================================
	// Hijacked Success callback -- This is for AJAX callbacks
	//=======================================================
	function successProxy(data, textStatus, xhr) {
		var id = xhr && xhr.asyncMgrId;

		if (requestList[id]) {
			if (requestList[id].status !== 'abort')
				requestList[id].success.apply(this, arguments);

			//delete requestList[id];	-- The promise occurs afterwards.  We can't delete the entry until then.
		}
//		else
//			fw.warning("successProxy: requestList "+id+" not set.");
	};

	//=======================================================
	// Hijacked Error callback -- This is for AJAX callbacks
	//=======================================================
	function errorProxy(xhr) {
		var id = xhr && xhr.asyncMgrId;

		if (requestList[id])
		{
			if (requestList[id].status !== 'abort')
				//requestList[id].error.apply(this, arguments);
				requestList[id].error(xhr);

			//delete requestList[id];	-- The promise occurs afterwards.  We can't delete the entry until then.
		}
//		else
//			fw.warning("errorProxy: requestList "+id+" not set.");
	};


	//=======================================================
	// Add some flavoring to the Backbone AJAX mechanism.
	//=======================================================
	Backbone.sync = function(method, model, options) {
		var promise = $.Deferred();

		var reqOptions = {
			promise: promise,
			success: options.success,
			error: options.error,
			status: 'inprocess'
		};
		requestList[id] = reqOptions;

		// Intercept the success and error callbacks so it can be aborted if the request is so marked.
		options.success = successProxy;
		options.error = errorProxy;
		var result = proxiedSync(method, model, options);

		if (result) {
			result.asyncMgrId = id++;
			result.fail(failProxy).done(doneProxy);
		}
		return promise;
	}

})();
