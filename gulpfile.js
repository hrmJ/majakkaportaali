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
        templates: folder.build + "views/",
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

gulp.task("htmlmain",function(){
    gulp.src(folder.src + "*.html").pipe(newer(out.phpmain)).pipe(gulp.dest(out.phpmain));
});

gulp.task("templates",function(){
    gulp.src(folder.src + "views/**/*").pipe(newer(out.templates)).pipe(gulp.dest(out.templates));
});

gulp.task("vendors",function(){
    gulp.src(folder.src + "js/vendor/**/*").pipe(newer(folder.build + "js/vendor/")).pipe(gulp.dest(folder.build + "js/vendor/"));
});

//gulp.task("js",function(){
//    var jsbuild = gulp.src(folder.src + "js/site/**/*.js").pipe(deporder()).pipe(concat('main.js'));
//    return jsbuild.pipe(gulp.dest(folder.build + 'js/'));
//});


gulp.task("js",function(){
    //Huom: tiedostojen järjestys oleellinen: mieti, mikä pitää olla ladattuna ennen mitäkin
    //HUOM2: kirjoita tiedostot ilman .js-päätettä
    var jsfiles = ["customization/jquery_ui_selectmenu_other",
                   "utils",
                   "navigation/Menus",
                   "content/Comments",
                   "content/songs/Slots",
                   "content/songs/Songlists",
                   "content/Service",
                   "content/tabs/People",
                   "content/tabs/Details",
                   "content/tabs/Structure",
                   "content/tabs/Infoslides",
                   "content/tabs/Songs",
                   "content/Servicelist",
                   "service_structure/GeneralStructure",
                   "service_structure/songslide",
                   "service_structure/bibleslide",
                   "service_structure/infoslide",
                   "service_structure/SlotFactory",
                   "service_structure/LightBox",
                   "service_structure/Headers",
                   "service_structure/Images",
                   "service_structure/Preview",
                   "service_structure/InjectableData",
                   "service_structure/DataLoading",
                   "service_structure/DragAndDrop",
                   "plugins/BibleModule",
                   "actions"
                   ];
    var jsprefix = folder.src + "js/site/";
    for (idx=0;idx<jsfiles.length;idx++){
        jsfiles[idx] = jsprefix + jsfiles[idx] + ".js";
    }
    var jsbuild = gulp.src(jsfiles).pipe(deporder()).pipe(concat('main.js'));
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
    gulp.watch(folder.src + "*.html",["htmlmain"]);
    gulp.watch(folder.src + "views/**/*",["templates"]);
    gulp.watch(folder.src + "js/site/**/*.js",["js"]);
    gulp.watch(folder.src + "sass/**/*",["css"]);
    gulp.watch(folder.src + "assets/**/*",["assets"]);

});

gulp.task('run',['phputils','phpmain','templates','js','css','vendors','assets','htmlmain']);
gulp.task('default',['run','watch']);
