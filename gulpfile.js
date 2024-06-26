const gulp = require('gulp');
const cleancss = require('@aptuitiv/gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const htmlmin = require('gulp-html-minifier-terser');
const rev = require('gulp-rev-all');


gulp.task('minify-css', () => {
    return gulp.src('./public/**/*.css')           // 处理public目录下所有的css文件，下同
        .pipe(cleancss({compatibility: 'ie8'}))
        .pipe(gulp.dest('./public'));
});

gulp.task('minify-js', () => {
    return gulp.src('./public/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./public'));
});

gulp.task('minify-html', () => {
    return gulp.src('./public/**/*.html')
        .pipe(htmlmin({
            removeComments: true,                 // 移除注释
            removeEmptyAttributes: true,          // 移除值为空的参数
            removeRedundantAttributes: true,      // 移除值跟默认值匹配的属性
            collapseBooleanAttributes: true,      // 省略布尔属性的值
            minifyCSS: true,                      // 压缩HTML中的CSS
            minifyJS: true,                       // 压缩HTML中的JS
            minifyURLs: true                      // 压缩HTML中的链接
        }))
        .pipe(gulp.dest('./public'))
});

gulp.task('rev', () => {
    return gulp.src('./public/**/*.{css,js,html}')
        .pipe(rev.revision({
          dontRenameFile: ['.html'],
          dontUpdateReference: ['.html']
        }))
        .pipe(gulp.dest('./public'))
        .pipe(rev.manifestFile())
        .pipe(gulp.dest('./public'))
});

gulp.task('default', gulp.series(
    gulp.parallel('minify-css', 'minify-js', 'minify-html'),
    'rev'
));

