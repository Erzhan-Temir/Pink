let project_folder = "dist";
let source_folder = "src";

let path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
  },
  src: {
    html: source_folder + "/*.html",
    css: source_folder + "/scss/main.scss",
    js: source_folder + "/js/",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source_folder + "/fonts/*.*",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: "./" + project_folder + "/"
}

let {src, dest} = require('gulp');
let gulp = require('gulp');
let browsersync = require("browser-sync").create();
let del = require("del");
let scss = require("gulp-sass");
let autoprefixer = require("gulp-autoprefixer");
let group_media = require("gulp-group-css-media-queries");
let clean_css = require("gulp-clean-css");
let rename = require("gulp-rename");
let plumber = require("gulp-plumber");
let imagemin = require("gulp-imagemin");
let newer = require("gulp-newer");

let browserSync = function () {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
};

let html = function () {
  return src(path.src.html)
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
};

let js = function () {
  return src(path.src.js)
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
};

let css = function () {
  return src([path.src.css, "src/scss/photo.scss", "src/scss/form.scss"])
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(plumber())
    .pipe(
      group_media()
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
};

let images = function () {
  return src(path.src.img)
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(newer(path.build.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        interPlaced: true,
        optimizationLevel: 3,
      })        
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
};

let fonts = function () {
  return src(path.src.fonts)
    .pipe(dest(path.build.fonts))
    .pipe(browsersync.stream())
};

let watchFiles = function () {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.img], images);
};

let clean = function () {
  return del(path.clean);
};

let build = gulp.series(clean, gulp.parallel(images, css, html, js, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;