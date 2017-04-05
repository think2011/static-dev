const gulp        = require('gulp')
const $           = require('gulp-load-plugins')()
const runSequence = require('run-sequence')
const browserSync = require('browser-sync').create()

let rootDir   = __dirname
let staticDir = `${__dirname}/static`

let paths = {
    src : `${rootDir}/src`,
    dist: `${rootDir}/dist`,
}

const EXTS       = 'less|ico|xls|psd|html|css|woff|woff2|otf|eot|svg|ttf|gif|png|jpg|swf'
const WATCH_EXTS = `${EXTS}|js`

gulp.task('copy', () => {
    return gulp.src(`${paths.src}/**/*.+(${EXTS})`)
        .pipe($.changed(paths.dist))
        .pipe(gulp.dest(paths.dist))
})

gulp.task('static', () => {
    return gulp.src(`${staticDir}/**`)
        .pipe($.changed(`${paths.dist}/static`))
        .pipe(gulp.dest(`${paths.dist}/static`))
})

gulp.task('scss', () => {
    return gulp.src(`${paths.src}/**/*.scss`)
        .pipe($.plumber())
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers: ['last 10 versions']
        }))
        .pipe($.cssBase64())
        .pipe($.changed(paths.dist, {extension: '.css', hasChanged: $.changed.compareSha1Digest}))
        .pipe(gulp.dest(paths.dist))
})

gulp.task('js', () => {
    return gulp.src(`${paths.src}/**/*.js`)
        .pipe($.changed(paths.dist))
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist))
})

gulp.task('server', () => {
    browserSync.init({
        watchOptions: {
            ignoreInitial: true,
            ignored      : ['*.map', '*.scss']
        },
        server      : {
            baseDir  : paths.dist,
            directory: true
        },
        files       : [`${rootDir}/**/*.(${WATCH_EXTS})`]
    })
})

gulp.task('default', () => {
    $.watch(`${paths.src}/**/*.+(${EXTS})`).pipe(gulp.dest(paths.dist))
    $.watch(`${staticDir}/**`).pipe(gulp.dest(`${paths.dist}/static`))

    $.watch(`${paths.src}/**/*.js`, () => gulp.start('js'))
    $.watch(`${paths.src}/**/*.scss`, () => gulp.start('scss'))

    runSequence(['copy', 'static', 'js', 'scss'], 'server')
})
