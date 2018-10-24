// *****
// OstKost Gulp 4 config 24.10.2018
// *****

import browserSync from 'browser-sync'
import del from 'del'
import psi from 'psi'
import gulp from 'gulp'
import htmlmin from 'gulp-htmlmin'
import sass from 'gulp-sass'
import cssnano from 'gulp-cssnano'
import autoprefixer from 'gulp-autoprefixer'
import _critical from 'critical'
import babel from 'gulp-babel'
import uglify from 'gulp-uglify'
import imagemin from 'gulp-imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import pngquant from 'imagemin-pngquant'
// import tinypng from 'gulp-tinypng'

const paths = {
	html: {
		src: 'index.html',
		dest: 'assets/'
	},
	styles: {
		src: 'src/scss/**/*.scss',
		dest: 'assets/css/',
		exclude: '!src/scss/partials/**/*.scss'
	},
	scripts: {
		src: 'src/js/**/*.js',
		dest: 'assets/js/'
	},
	images: {
		src: 'src/images/**/*.{jpg,jpeg,png,gif,svg}',
		dest: 'assets/images/'
	},
	fonts: {
		src: 'src/fonts/**/*.{otf,eot,woff2,woff,ttf,svg}',
		dest: 'assets/fonts/'
	},
	data: {
		src: 'src/data/**/*.json',
		dest: 'assets/data/'
	}
}

const site = 'navesi.hol.es'

/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */
const clean = () => del(['assets'])
const reload = browserSync.reload

// Development build specific tasks
function html() {
	return gulp
		.src(paths.html.src)
		.pipe(
			htmlmin({
				removeComments: true,
				collapseWhitespace: true,
				collapseBooleanAttributes: true,
				removeAttributeQuotes: true,
				removeRedundantAttributes: true,
				removeEmptyAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				removeOptionalTags: true
			})
		)
		.pipe(gulp.dest(paths.html.dest))
		.pipe(reload({ stream: true }))
}

function json() {
	return gulp.src(paths.data.src).pipe(gulp.dest(paths.data.dest))
}

function fonts() {
	return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest))
}

function images() {
	return (
		gulp
			.src(paths.images.src, { since: gulp.lastRun(images) })
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
			.pipe(gulp.dest(paths.images.dest))
	)
	// .pipe(reload({ stream: true }))
}

function critical(cb) {
	_critical.generate(
		{
			base: 'assets/',
			inline: true,
			src: 'index.html',
			// css: [paths.styles.src],
			dimensions: [
				{ width: 320, height: 480 },
				{ width: 768, height: 1024 },
				{ width: 1280, height: 960 },
				{ width: 1920, height: 1080 }
			],
			dest: 'index-critical.html',
			minify: true,
			extract: false,
			ignore: ['font-face']
		},
		cb
	)
}

function styles() {
	return gulp
		.src([paths.styles.src, paths.styles.exclude], { sourcemaps: true })
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
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(reload({ stream: true }))
}

function scripts() {
	return gulp
		.src(paths.scripts.src, { sourcemaps: true })
		.pipe(
			babel({
				presets: ['@babel/preset-env']
			})
		)
		.pipe(uglify())
		.pipe(gulp.dest(paths.scripts.dest))
		.pipe(reload({ stream: true }))
}

function build(done) {
	gulp.series(
		clean,
		gulp.parallel(html, styles, scripts, images, json, fonts)
	)(done)
}

function serve(done) {
	browserSync(
		{
			server: {
				baseDir: 'assets',
				browser: `C:\\Program Files\\Firefox Developer Edition\\firefox.exe`
			},
			port: 3000,
			notify: false,
			open: false,
			logPrefix: 'WSK'
		},
		done
	)
}

// By default we use the PageSpeed Insights free (no API key) tier.
// Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
// key: 'YOUR_API_KEY'
function psi_mobile() {
	return psi(site, {
		// key: key
		nokey: 'true',
		strategy: 'mobile'
	}).then(data => {
		console.log('Mobile Speed score: ' + data.ruleGroups.SPEED.score)
		console.log(
			'Mobile Usability score: ' + data.ruleGroups.USABILITY.score
		)
	})
}

function psi_desktop() {
	return psi(site, {
		nokey: 'true',
		// key: key,
		strategy: 'desktop'
	}).then(data => {
		console.log('Desktop Speed score: ' + data.ruleGroups.SPEED.score)
	})
}

function pagespeed(done) {
	gulp.parallel(psi_mobile, psi_desktop)(done)
}

function watch_html() {
	gulp.watch(paths.html.src, html)
}

function watch_styles() {
	gulp.watch(paths.styles.src, styles)
}

function watch_images() {
	gulp.watch(paths.images.src, images)
}

function watch_script() {
	gulp.watch(paths.scripts.src, gulp.series(scripts))
}

// example
function watch_all() {
	gulp.watch(
		[paths.html.src, paths.scripts.src, paths.images.src],
		gulp.series(build)
	)
}

function watch(done) {
	gulp.parallel(watch_html, watch_styles, watch_images, watch_script)(done)
}

// Production build specific tasks

// TODO

// gulp.task('html:prod', function() {
// return gulp
// 	.src(paths.html)
// 	.pipe(
// 		replaceHtml({
// 			css: 'all.min.css',
// 			js: 'all.min.js'
// 		})
// 	)
// 	.pipe(gulp.dest(paths.dirs.build))
// })

// gulp.task('json:prod', function() {
// return gulp
// 	.src(paths.json)
// 	.pipe(minifyJson())
// 	.pipe(gulp.dest(paths.dirs.build))
// })

// gulp.task('images:prod', function() {
// return gulp
// 	.src(paths.images)
// 	.pipe(minifyImg())
// 	.pipe(gulp.dest(paths.dirs.build))
// })

// gulp.task('fonts:prod', function() {
// return gulp
// 	.src(paths.vendor.bower.fonts)
// 	.pipe(gulp.dest(paths.dirs.build + '/fonts'))
// })

// gulp.task('scripts:prod', function() {
// var vendorJsStream = gulp.src(paths.vendor.bower.js)
// var vendorComponentsJsStream = gulp.src(paths.vendor.components.js)
// var coffeeStream = gulp
// 	.src(paths.coffee)
// 	.pipe(coffee({ bare: true }))
// 	.pipe(
// 		ngAnnotate({
// 			remove: true,
// 			add: true,
// 			single_quotes: true
// 		})
// 	)

// return merge(coffeeStream, vendorComponentsJsStream, vendorJsStream)
// 	.pipe(
// 		order(
// 			[
// 				'bower_components/jquery/dist/jquery.js',
// 				'bower_components/lodash/dist/lodash.js',
// 				'bower_components/angular/angular.js',
// 				'bower_components/**/*.js',
// 				'app/components/angularjs-jwplayer/vendor/jwplayer/jwplayer.js',
// 				'app/components/**/vendor/**/*.js',
// 				'app/**/app.js'
// 			],
// 			{ base: '.' }
// 		)
// 	)
// 	.pipe(concat('all.min.js'))
// 	.pipe(uglifyJs())
// 	.pipe(gulp.dest(paths.dirs.build))
// })

// gulp.task('styles:prod', function() {
// var cssStream = gulp.src(paths.vendor.bower.css)

// var sassStream = gulp.src(paths.sass).pipe(sass())

// var lessStream = gulp.src(paths.less).pipe(less())

// return merge(cssStream, lessStream, sassStream)
// 	.pipe(concat('all.min.css'))
// 	.pipe(minifyCss({ keepSpecialComments: 0 }))
// 	.pipe(gulp.dest(paths.dirs.build))
// })

// gulp.task(
// 	'all:prod',
// 	gulp.parallel(
// 		'html:prod',
// 		'images:prod',
// 		'json:prod',
// 		'scripts:prod',
// 		'styles:prod',
// 		'fonts:prod',
// 		'flash:prod',
// 		'xml:prod'
// 	)
// )

// gulp.task('build:prod', gulp.series('clean', 'all:prod'))

exports.clean = clean
exports.serve = serve
exports.html = html
exports.styles = styles
exports.scripts = scripts
exports.images = images
exports.build = build
exports.pagespeed = pagespeed
exports.critical = critical

export default function start(done) {
	gulp.series(build, serve, watch)(done)
}
