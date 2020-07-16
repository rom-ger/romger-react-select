const gulp = require('gulp');
const gutil = require("gulp-util");
const concat = require("gulp-concat");
const lazyLoad = require('gulp-load-plugins')();
const cleanCSS = require('gulp-clean-css');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const del = require('del');

const paths = {
    allSrcJs: 'src/**/*.js',
    libDir: 'lib',
};

const errorHandler = title => {
    return error => {
        gutil.log(gutil.colors.red(`[${title}]`), error.toString());
        this.emit('end');
    };
};

gulp.task('clean', () => {
    return del(paths.libDir);
});

gulp.task('styles', () => {
    return gulp.src('src/**/*.scss')
        .pipe(lazyLoad.sourcemaps.init())
        .pipe(lazyLoad.sass({ style: 'expanded' })).on('error', errorHandler('Sass'))
        .pipe(lazyLoad.autoprefixer()).on('error', errorHandler('Autoprefixer'))
        .pipe(cleanCSS({ compatibility: 'ie9' }))
        .pipe(lazyLoad.sourcemaps.write())
        .pipe(concat('index.min.css'))
        .pipe(gulp.dest('./lib'));
});

gulp.task('lint', () => {
    return gulp.src(['./src/**/*.js', './src/**/*.jsx'])
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('index.d.ts', () => {
    return gulp.src('src/index.d.ts')
        .pipe(gulp.dest(paths.libDir));
});

gulp.task('scripts', () => {
    return gulp.src(paths.allSrcJs)
        .pipe(babel())
        .pipe(buffer()).pipe(uglify())
        .pipe(gulp.dest(paths.libDir));
});

gulp.task('build',
    gulp.series('clean',
        gulp.parallel('styles', 'lint', 'index.d.ts', 'scripts')
    )
);

gulp.task('default', gulp.series('build'));
