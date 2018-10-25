// *****
// OstKost Gulp 4 config 25.10.2018
// *****

import gulp from 'gulp'
import browserSync from 'browser-sync'
import del from 'del'
import htmlmin from 'gulp-htmlmin'
import sass from 'gulp-sass'
import cssnano from 'gulp-cssnano'
import autoprefixer from 'gulp-autoprefixer'
import babel from 'gulp-babel'
import uglify from 'gulp-uglify'
import changed from 'gulp-changed'
import imagemin from 'gulp-imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import pngquant from 'imagemin-pngquant'

// Clean folders
const clean = () => del(['dist/css/*', 'dist/js/*'])
const cleanImages = () => del(['dist/images/*'])

// Copy html
function html() {
	return (
		gulp
			.src('src/index.html')
			// NOT WORKING WITH BROWSERSYNC !!!
			// .pipe(
			// 	htmlmin({
			// 		removeComments: true,
			// 		collapseWhitespace: true,
			// 		collapseBooleanAttributes: true,
			// 		removeAttributeQuotes: true,
			// 		removeRedundantAttributes: true,
			// 		removeEmptyAttributes: true,
			// 		removeScriptTypeAttributes: true,
			// 		removeStyleLinkTypeAttributes: true,
			// 		removeOptionalTags: true
			// 	})
			// )
			.pipe(gulp.dest('dist'))
			.pipe(browserSync.stream())
	)
}

// Compile SCSS into CSS & auto-inject into browsers
function styles() {
	return (
		gulp
			.src('src/scss/*.scss')
			.pipe(sass())
			.pipe(
				autoprefixer({
					// browsers: ['last 2 versions'],
					browsers: [
						'ie >= 10',
						'ie_mob >= 10',
						'ff >= 30',
						'chrome >= 34',
						'safari >= 7',
						'opera >= 23',
						'ios >= 7',
						'android >= 4.4',
						'bb >= 10'
					],
					cascade: false
				})
			)
			.pipe(cssnano())
			// .pipe(gulp.dest('src/assets/css'))
			.pipe(gulp.dest('dist/css'))
			.pipe(browserSync.stream())
	)
}

// Compile JS & auto-inject into browsers
function scripts() {
	return (
		gulp
			.src('src/js/main.js', { sourcemaps: true })
			.pipe(
				babel({
					presets: ['@babel/preset-env']
				})
			)
			.pipe(uglify())
			// .pipe(gulp.dest('src/assets/js'))
			.pipe(gulp.dest('dist/js'))
			.pipe(browserSync.stream())
	)
}

// Optimize Images
function images() {
	return (
		gulp
			.src('src/images/**/*.{jpg,jpeg,png,gif,svg}', {
				since: gulp.lastRun(images)
			})
			.pipe(changed('dist/images/'))
			.pipe(
				imagemin([
					imagemin.gifsicle({ interlaced: true }),
					imagemin.jpegtran({ progressive: true }),
					mozjpeg({ progressive: true }),
					imagemin.optipng({ optimizationLevel: 7 }),
					pngquant({ quality: '85-100' }),
					imagemin.svgo({ plugins: [{ removeViewBox: true }] })
				])
			)
			// .pipe(tinypng('get your token on tinypng site')) // works fine too, but 500 pics per month
			.pipe(gulp.dest('dist/images/'))
	)
}

// Static Server + watching scss/scripts/html files
function serve() {
	browserSync({
		server: 'dist'
	})

	gulp.watch('src/scss/main.scss', gulp.series(styles))
	gulp.watch('src/js/**/*.js', gulp.series(scripts))
	gulp.watch('src/index.html', gulp.series(html))
	gulp.watch('dist/index.html').on('change', browserSync.reload)
}

const build = gulp.parallel(images, html, styles, scripts)

gulp.task('default', gulp.series(clean, build, serve))

module.exports = {
	clean,
	cleanImages,
	build,
	serve
}
