var _ = require('lodash');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var PLUGIN_NAME = 'replace-vars';
var student_pid = '101';
var teacher_pid = '102';

function replaceVars(user_type, vars) {
	var change_list = [];
	if (!vars) {
		throw new PluginError(PLUGIN_NAME, 'Missing vars');
	}

	function add_change(from, to) {
		change_list.push([from, to])
	}

	function conditional_delete() {
		var matches = arguments;
		if (vars[matches[1]] === matches[2]) {
			return matches[3]
		} else {
			return '';
		}
	}

	var stream = through.obj(function(file, enc, cb) {
		if (file.isStream()) {
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
			return cb();
		}

		if (file.isBuffer()) {
			var contents = file.contents.toString();
			add_change("app.bookPath = ['\"].+['\"]", "app.bookPath = '../content/'");
			if (user_type === "student") {
				pid = student_pid;
			} else {
				pid = teacher_pid;
			}
			add_change("app.pid = 999", "app.pid = " + pid);
			add_change(new RegExp('//REMOVEME:', 'g'), '')

			_.each(change_list, (change) => {
				contents = contents.replace(change[0], change[1])
			});

			_.each(vars, (item, key) => {
				var re = new RegExp('%%' + key + '%%', 'g');
				contents = contents.replace(re, item);
			});
			_.each(vars, (item, key) => {
				var re = new RegExp('//%\\?(' + key + ')=(\\w+)%([^]+?)//\\?%', 'g');
        			contents = contents.replace(re, conditional_delete)
			});
			contents = new Buffer(contents);
			file.contents = Buffer.concat([contents]);
		}

		// make sure the file goes through the next gulp plugin
		this.push(file);

		// tell the stream engine that we are done with this file
		cb();
	});

	// returning the file stream
	return stream;
}


exports.replaceVars = replaceVars;
