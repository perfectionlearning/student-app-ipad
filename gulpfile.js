var gulp = require('gulp');
var _ = require('lodash');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var jsFiles = require('./deploy/js-files');
var appProcess = require('./deploy/student-app-process.js');

var jsDest = './dist';

//--------------------------------------
// DEPLOY: Student, Online, Test
//--------------------------------------
var config = {
    'student-test': {
        title: 'Student, Online, Test',
        out_dir: 'studenttest',
        user_type: 'student',
        environment: 'online',
        server: 'testdb'
    },

//--------------------------------------
// DEPLOY: Teacher, Online, Test
//--------------------------------------
    'teacher-test': {
        title: 'Teacher, Online, Test',
        out_dir: 'teachertest',
        user_type: 'teacher',
        environment: 'online',
        server: 'testdb'
    },

//--------------------------------------
// DEPLOY: Student, Online, Live
//--------------------------------------
    'student-live': {
        title: 'Student, Online, Live',
        out_dir: 'student',
        user_type: 'student',
        environment: 'online',
        server: 'livedb'
    },

//--------------------------------------
// DEPLOY: Teacher, Online, Live
//--------------------------------------
    'teacher-live': {
        title: 'Teacher, Online, Live',
        out_dir: 'teacher',
        user_type: 'teacher',
        environment: 'online',
        server: 'livedb'
    }
};

_.each(config, (cfg, key) => {
    gulp.task(key, function() {
        var deploy_var_list = {
            'BACKEND_SERVER': config[key].server,
            'USER_LEVEL': config[key].user_type
        };
        return gulp.src(jsFiles.list)
            .pipe(concat(key + '.js'))
            .pipe(appProcess.replaceVars(config[key].user_type, deploy_var_list))
            .pipe(minify({ext: { src: '-debug.js', min: '.js' }}))
            .pipe(gulp.dest(jsDest))
        ;
    });
});

var deployTasks = Object.keys(config);
gulp.task('default', deployTasks);
