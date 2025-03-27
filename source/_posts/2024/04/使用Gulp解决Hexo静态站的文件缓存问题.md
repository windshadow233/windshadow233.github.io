---
title: 使用Gulp解决Hexo静态站的文件缓存问题
disableNunjucks: false
date: 2024-04-12 21:50:06
id: 11084
categories: 
  - [博客相关]
tags:
  - Hexo
  - Web前端
  - NodeJS
  - Gulp
  - npm
cover:
---

作为一个喜欢魔改网站主题的人，在将博客迁移到静态站后，首先需要解决的便是浏览器的缓存问题。浏览器在遇到对静态资源的请求时，通常会采取两种缓存策略，分别是**强制缓存**和**协商缓存**。

- 强制缓存：在一定时间（由服务器给出的请求头标识）内不再向服务器发出请求，而是直接使用缓存的内容。
- 协商缓存：与服务器协商是否需要重新请求。

显然，由于缓存策略的存在，当服务端的静态文件发生变更后，客户端经常不会立刻加载最新版本的文件。对于这一点，之前我在动态博客中的解决方案是手动为静态文件加一个版本号，例如`theme.css?v=1.2.1`。不过在Hexo中所有的html页面都是自动编译生成的，而且会产生一大堆页面，因此并不可能一个一个地手动为静态文件添加版本。

经过一番搜索，我在一条[GitHub issue](https://github.com/hexojs/hexo/issues/3042#issuecomment-369648375)下面找到了一个看上去不错的方案：

> directly use webpack or gulp (commend to install at root folder). first, hexo generate the publish files, then webpack or gulp revision the files.

不过我先前几乎没有这些前端工作流的经验，因此花了半天时间才大概搞明白这句话的含义并让这个方案work。

## 安装依赖

Gulp是一个强大的前端自动化构建工具，其有很多插件，能够满足许多需求，为文件名添加hash只是其中一个插件的功能，还有一些插件可以用来优化文件大小，这里就顺带一并装上。

先全局安装gulp，并安装一些用于优化静态文件的插件：

```bash
npm install gulp --global
npm install gulp gulp-clean-css gulp-uglify-es gulp-html-minifier-terser
```

然后安装一个可以为静态文件打版本tag的插件：

```bash
npm install gulp-rev-all --save
```

这里的问题是，默认的gulp-rev-all版本是4，并不支持通过旧规范的`require`语句导入，因此我手动降了一下版本，将package.json里的大版本号改到了3，这里我使用的版本信息如下：

```json
...
  "dependencies": {
    "gulp": "^5.0.0",
    "gulp-clean-css": "^4.3.0",
    "gulp-html-minifier-terser": "^7.1.0",
    "gulp-rev-all": "^3.0.0",
    "gulp-uglify-es": "^3.0.0",
    ...
  }
...
```

做了版本号调整后，再重新安装，这样便能通过旧的语法进行导入了。

## 编写gulpfile.js文件

在博客项目的根目录下创建gulpfile.js，内容如下：

```js
const gulp = require('gulp');
const cleancss = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const htmlmin = require('gulp-html-minifier-terser');
const RevAll = require('gulp-rev-all');


gulp.task('minify-css', () => {
    return gulp.src('./public/**/*.css')           // 处理public目录下所有的css文件，下同
        .pipe(cleancss({ compatibility: 'ie8' }))  // 兼容到IE8
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
            collapseWhitespace: true,             // 移除空格和空行
            minifyCSS: true,                      // 压缩HTML中的CSS
            minifyJS: true,                       // 压缩HTML中的JS
            minifyURLs: true                      // 压缩HTML中的链接
        }))
        .pipe(gulp.dest('./public'))
});

gulp.task('rev', () => {
    return gulp.src('public/**/*.{css,js,html}')
        .pipe(RevAll.revision({
          dontRenameFile: ['.html'],
          dontUpdateReference: ['.html']
        }))
        .pipe(gulp.dest('./public'))
        .pipe(RevAll.manifestFile())
        .pipe(gulp.dest('./public'))
})

gulp.task('default', gulp.parallel(
    'minify-css', 'minify-js', 'minify-html', 'rev'
));
```

该文件首先定义了四个任务，前三个任务分别优化css、js、html文件的大小，第四个任务用来为css、js的文件名添加hash值标签，默认生成8位的hash值，同时处理所有html，将其中对本地css、js文件的引用处修改为带hash标签的。

最后定义了一个默认任务，用以在执行`gulp`命令而不带任何参数时自动执行前面四个任务。

## 配置npm脚本

在package.json中添加`scripts`字段，配置脚本：

```json
...
  "scripts": {
    "b": "npx hexo clean && npx hexo g && gulp",
    ...
  }
...
```

这样只要在项目的根目录下执行`npm run b`，就可以直接完成编译+优化+添加版本一条龙。

---

最近发现有个奇怪的bug，我只要用了`gulp-html-minifier-terser`，就会有一个html文件被“优化”成了空文件，研究了下发现原来不应该将最后的`rev`任务和前面三个并行起来，改成下面这样就好了:

```js
gulp.task('default', gulp.series(
    gulp.parallel('minify-css', 'minify-js', 'minify-html'),
    'rev'
));
```

