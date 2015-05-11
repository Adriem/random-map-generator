/* GULP DEPENDENCIES */
var gulp = require("gulp"),
    coffee = require("gulp-coffee"),
    maps = require("gulp-sourcemaps"),
    uglify = require("gulp-uglify"),
    rename = require("gulp-rename"),
    cssmin = require("gulp-minify-css"),
    htmlmin = require("gulp-minify-html"),
    gutil = require("gulp-util"),
    inject = require("gulp-inject");

/* GULP TASKS */
gulp.task("coffee", function(){
    gulp.src("src/coffee/*.coffee")
        .pipe(maps.init())
        .pipe(coffee({bare: true}).on('error', gutil.log))
        .pipe(maps.write())
        .pipe(gulp.dest("src/js/"))
});

gulp.task("js", ["coffee"], function(){
    gulp.src("src/js/*.js")
        //.pipe(uglify())
        .pipe(rename({
            extname: ".min.js"
        }))
        .pipe(gulp.dest("dist/js/"))
});

gulp.task("css", function(){
    gulp.src("src/css/*.css")
        .pipe(cssmin())
        .pipe(rename({
            extname: ".min.js"
        }))
        .pipe(gulp.dest("dist/css/"))
});

gulp.task("build-dev", ["coffee"], function(){
    var sources = gulp.src(['./src/js/*.js', './src/css/*.css'], {read: false});
    gulp.src("./src/*.html")
        .pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest("./src"))
});

gulp.task("build-dist", ["css", "js"], function(){
    var sources = gulp.src(['./dist/js/*.js', './dist/css/*.css'], {read: false});
    gulp.src("./src/*.html")
        .pipe(inject(sources, {relative: true}))
        .pipe(htmlmin({
            empty: false,
            cdata: false,
            comments: false,
            conditionals: false,
            spare: false,
            quotes: false,
            loose: false
        }))
        .pipe(gulp.dest("./dist"))
});