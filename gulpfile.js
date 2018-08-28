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
        slides: folder.build + "slides/",
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

gulp.task("slides_main",function(){
    gulp.src(folder.src + "/slides/*").pipe(newer(out.slides)).pipe(gulp.dest(out.slides));
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
    var jsfiles = ["js/portal/customization/jquery_ui_selectmenu_other",
                   "js/portal/utils",
                   "js/portal/navigation/Menus",
                   "js/portal/content/Comments",
                   "js/portal/content/songs/Slots",
                   "js/portal/content/songs/Songlists",
                   "js/portal/content/Service",
                   "js/portal/content/tabs/People",
                   "js/portal/content/tabs/Details",
                   "js/portal/content/tabs/Structure",
                   "js/portal/content/tabs/Infoslides",
                   "js/portal/content/tabs/Songs",
                   "js/portal/content/ManageableLists",

                   "js/portal/content/Servicelist",
                   "js/portal/content/listfactory/Responsibilities",
                   "js/portal/content/listfactory/Seasons",
                   "js/portal/content/listfactory/Events",
                   "js/portal/content/listfactory/Services",
                   "js/portal/content/listfactory/Offerings",

                   "js/portal/service_structure/GeneralStructure",
                   "js/portal/service_structure/songslide",
                   "js/portal/service_structure/bibleslide",
                   "js/portal/service_structure/infoslide",
                   "js/portal/service_structure/SlotFactory",
                   "js/portal/service_structure/LightBox",
                   "js/portal/service_structure/Headers",
                   "js/portal/service_structure/Images",
                   "js/portal/service_structure/Preview",
                   "js/portal/service_structure/InjectableData",
                   "js/portal/service_structure/DataLoading",
                   "js/portal/service_structure/DragAndDrop",
                   "js/portal/plugins/BibleModule",
                   "js/portal/actions",

                   "js/slides/plugins/jquery.waituntilexists",
                   "js/slides/plugins/spectrum",

                   "js/slides/ContentLoader",
                   "js/slides/Presentation",
                   "js/slides/Controls",
                   "js/slides/Contentlist",

                   "js/slides/widgets/Widgets",
                   "js/slides/widgets/contentadders/TextContentAdder",
                   "js/slides/widgets/contentadders/BibleContentAdder",
                   "js/slides/widgets/contentadders/SongContentAdder",
                   "js/slides/widgets/contentadders/ImageAdder",
                   "js/slides/widgets/contentadders/YoutubeAdder",

                   "js/slides/styles/Controller",
                   "js/slides/styles/FontControllers",

                   "js/slides/widgets/stylewidgets/BackgroundChanger",
                   "js/slides/widgets/stylewidgets/FontChanger",
                   "js/slides/widgets/stylewidgets/LayoutLoader",
                   "js/slides/widgets/stylewidgets/PositionChanger",


                   "js/slides/actions",
                   ];

    var jsprefix = folder.src + "/";

    for (idx=0;idx<jsfiles.length;idx++){
        jsfiles[idx] = jsprefix + jsfiles[idx] + ".js";
    }

    var jsbuild = gulp.src(jsfiles).pipe(deporder()).pipe(concat('main.js'));
    return jsbuild.pipe(gulp.dest(folder.build + 'js/'));
});

gulp.task("css_portal",function(){
        gulp.src(folder.src + "sass/portal/**/*.scss")
    	sass(folder.src + "sass/portal/**/*.scss")
		.on('error', sass.logError)
		.pipe(gulp.dest(folder.build + "stylesheets/"))
});

gulp.task("css_slides_pres",function(){
        gulp.src(folder.src + "sass/slides/presentation/**/*.scss")
    	sass(folder.src + "sass/slides/presentation/**/*.scss")
		.on('error', sass.logError)
		.pipe(gulp.dest(folder.build + "/slides/stylesheets/presentation"))
});


gulp.task("css_slides_ctrl",function(){
        gulp.src(folder.src + "sass/slides/controls/**/*.scss")
    	sass(folder.src + "sass/slides/controls/**/*.scss")
		.on('error', sass.logError)
		.pipe(gulp.dest(folder.build + "/slides/stylesheets/controls"))
});


gulp.task("watch",function(){

    gulp.watch(folder.src + "php/**/*",["phputils"]);
    gulp.watch(folder.src + "*.php",["phpmain"]);
    gulp.watch(folder.src + "*.html",["htmlmain"]);
    gulp.watch(folder.src + "/slides/*",["slides_main"]);
    gulp.watch(folder.src + "views/**/*",["templates"]);
    gulp.watch(folder.src + "js/**/*.js",["js"]);
    gulp.watch(folder.src + "sass/portal/**/*",["css_portal"]);
    gulp.watch(folder.src + "sass/slides/presentation/**/*",["css_slides_pres"]);
    gulp.watch(folder.src + "sass/slides/controls/**/*",["css_slides_ctrl"]);
    gulp.watch(folder.src + "assets/**/*",["assets"]);

});

gulp.task('run',['phputils','phpmain','templates','js','css_portal','vendors','assets','htmlmain','slides_main','css_slides_pres','css_slides_ctrl']);
gulp.task('default',['run','watch']);
