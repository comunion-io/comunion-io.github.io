const path = require('path');
const { task, src, dest, watch, series, parallel } = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const connect = require('gulp-connect');
const imageMin = require('gulp-imagemin');
const cssmin = require('gulp-minify-css');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const clean = require('gulp-clean');

const destPath = path.resolve(__dirname, 'dist/');
const assetsPath = path.resolve(__dirname, 'dist/assets/');

task('image', () => {
  return src(path.resolve(__dirname, 'src/assets/*.*'))
    .pipe(rev())
    .pipe(
      imageMin({
        optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
        progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
        interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
        multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
      })
    )
    .pipe(dest(assetsPath))
    .pipe(rev.manifest())
    .pipe(dest(assetsPath));
});

task('css', () => {
  return src([path.resolve(__dirname, 'dist/assets/*.json'), path.resolve(__dirname, 'src/index.css')])
    .pipe(
      revCollector({
        replaceReved: true,
      })
    )
    .pipe(rev())
    .pipe(
      autoprefixer({
        cascade: true,
      })
    )
    .pipe(cssmin())
    .pipe(dest(destPath))
    .pipe(rev.manifest())
    .pipe(dest(destPath));
});

task('html', () => {
  return src([path.resolve(__dirname, 'dist/*.json'), path.resolve(__dirname, 'dist/assets/*.json'), path.resolve(__dirname, 'src/index.html')])
    .pipe(
      revCollector({
        replaceReved: true,
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
      })
    )
    .pipe(dest(destPath));
});

task('server', () => {
  connect.server({
    root: 'src',
    livereload: true,
    host: '0.0.0.0',
    port: 2001,
  });
});

task('clean', () => {
  return src(path.resolve(__dirname, 'dist/**/*.*')).pipe(clean());
});

task('clean:json', () => {
  return src(path.resolve(__dirname, 'dist/**/*.json')).pipe(clean());
});

task('reload', () => {
  return src(path.resolve(__dirname, 'src/*.*')).pipe(connect.reload());
});

task('watch', () => {
  return watch(path.resolve(__dirname, 'src/*.*'), series('reload'));
});

task('build', series('clean', 'image', 'css', 'html', 'clean:json'));

task('dev', parallel('watch', 'server'));
