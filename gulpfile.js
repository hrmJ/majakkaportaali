// Gulp.js configuration
var 
    // modules
    gulp = require('gulp'),
    newer = require('gulp-newer'),
    concat = require('gulp-concat'),
    deporder = require('gulp-deporder'),
    sass = require('gulp-ruby-sass'),
    es = require('event-stream'),
    autoprefixer = require('gulp-autoprefixer'),

    //development mode?
    devBuild = (process.env.NODE_ENV !== 'production'),

    //folders
    folder = {
        src: 'src/',
        build: 'build/'
    }

;

out = {phputils: folder.build + "php/", 
        phpmain: folder.build,
        templates: folder.build + "templates/",
        };


// PHP-tiedostojen siirto

gulp.task("phputils",function(){
    return gulp.src(folder.src + "php/**/*").pipe(newer(out.phputils)).pipe(gulp.dest(out.phputils));
});

gulp.task("assets",function(){
    return gulp.src(folder.src + "assets/**/*").pipe(newer(folder.build + "assets/")).pipe(gulp.dest(folder.build + "assets/"));
});

gulp.task("phpmain",function(){
    gulp.src(folder.src + "*.php").pipe(newer(out.phpmain)).pipe(gulp.dest(out.phpmain));
});

gulp.task("templates",function(){
    gulp.src(folder.src + "templates/**/*").pipe(newer(out.templates)).pipe(gulp.dest(out.templates));
});

gulp.task("vendors",function(){
    gulp.src(folder.src + "js/vendor/**/*").pipe(newer(folder.build + "js/vendor/")).pipe(gulp.dest(folder.build + "js/vendor/"));
});

gulp.task("js",function(){
    var jsbuild = gulp.src(folder.src + "js/site/**/*.js").pipe(deporder()).pipe(concat('main.js'));
    return jsbuild.pipe(gulp.dest(folder.build + 'js/'));
});

gulp.task("css",function(){
        gulp.src(folder.src + "sass/**/*.scss")
    	sass(folder.src + "sass/**/*.scss")
		.on('error', sass.logError)
		.pipe(gulp.dest(folder.build + "stylesheets/"))
});

gulp.task("watch",function(){

    gulp.watch(folder.src + "php/**/*",["phputils"]);
    gulp.watch(folder.src + "*.php",["phpmain"]);
    gulp.watch(folder.src + "templates/**/*",["templates"]);
    gulp.watch(folder.src + "js/site/**/*.js",["js"]);
    gulp.watch(folder.src + "sass/**/*",["css"]);
    gulp.watch(folder.src + "assets/**/*",["assets"]);

});

gulp.task('run',['phputils','phpmain','templates','js','css','vendors','assets']);
gulp.task('default',['run','watch']);
