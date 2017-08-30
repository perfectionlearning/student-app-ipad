//=============================================================================
// Created to return a promise resolving to a list of js files to include in
// a deploy of the ipad version of the app. If this works well, it should also
// serve to generate the list of files for the regular browser app.
//=============================================================================
var fs = require('fs');

// JavaScript files are contained in these directories.
var scriptDirs = [
	'',
	'lib',
	'A1PARCC',
	'tools',
	'framework',
	'framework/graphics',
	'widgets',
	'actions',
	'model',
	'views/PrefsPage', 
	'views/ProblemList', 
	'views/AssignmentList', 
	'views/DrillResults', 
	'views/StudentGrades', 
	'views/Classes', 
	'views/Login', 
	'views/Login', 
	'views/Login', 
	'views/WorkView'
];

// In case needed, files (including paths) to not be included
var excludeFiles = [
	'ipad/scripts/views/Test.js',
	'ipad/scripts/Addendum.js',
	'ipad/scripts/ButtonDefs.js',
	'ipad/scripts/config_staging.js',
	'ipad/scripts/lib/jquery-2.1.0.js',
	'ipad/scripts/lib/jquery-2.1.0.min.js',
	'ipad/scripts/lib/underscore-1.5.1.min.js'
];

// Return array of promises, each of which resolves to a sorted list of files.
function getFileList(paths) {
	var promises = [];
	paths.forEach((path) => {
		var pathParts = ['ipad', 'scripts'];
		if (path) pathParts.push(path);
		promises.push(new Promise((resolve, reject) => {
			let dir = pathParts.join('/');
			fs.readdir(dir, (err, items) => {
				var list = [];
				items = items.filter((item) => { return /\.js$/.test(item); });
				items.forEach((item) => { 
					let pathfile = dir + '/' + item;
					if (excludeFiles.indexOf(pathfile) === -1) {
						list.push(dir + '/' + item); 
					}
				});
				resolve(list.sort());
			});
		}));
	});

	return promises;
}

// Public getList function: returns a promise whose resolution provides the
// desired list of JavaScript files.
exports.getList = () => {
	return Promise.all(getFileList(scriptDirs)).then((res) => { 
		return [].concat(...res);
	});
}

