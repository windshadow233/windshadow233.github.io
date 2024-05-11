---
title: gulp-clean-css插件优化时的bug及解决方案
disableNunjucks: false
id: 11197
date: 2024-04-18 18:13:10
categories:
  - [Debug]
  - [博客相关]
tags:
  - Gulp
  - npm
  - NodeJS
  - Web前端
cover:
---

[之前的文章](/blog/11084/)提到我为了控制静态文件版本使用了一个叫Gulp的包，同时为了压缩css文件大小，在其中使用了一个名为[gulp-clean-css](https://github.com/scniro/gulp-clean-css)的插件，不过这个插件存在一个~~比较严重~~其实也不是很严重的bug。

---

一次，我魔改完主题样式，在本地测试效果良好的前提下，啪啪一顿执行`npm run b && npm run d`将其部署上服务器，结果从手机上打开网站一看，发现菜单样式完全崩坏，与本地测试时看到的样子截然不同。

花了几分钟定位问题，发现优化完的css文件中有一些奇怪的东西：

```css
.menus_item_child li:not(#sidebar-menusli){
    ...
}
```

显然该样式本来应该是这样的：

```css
.menus_item_child li:not(#sidebar-menus li){
    ...
}
```

插件将`:not`选择器里的空格优化掉了。在`clean-css`的GitHub issues下面，果然找到了多条相关的bug，例如：

[Spaces removed from :not statement](https://github.com/clean-css/clean-css/issues/996)

[Issue with minifying not pseudo-class alongside using selector inside it](https://github.com/clean-css/clean-css/issues/1175)

第一条issue下面，项目的维护者回复:

> Fixed in `e651f24`

第二条则有其他用户的评论:

> I tested the version `5.1.3` and this issue is fixed in this version.

于是，只要将gulp-clean-css插件依赖的clean-css版本修改到`5.1.3`，应该就可以解决问题。

然而直接改`package.json`应该不太行，于是我又找到了一条[相关的issue](https://github.com/scniro/gulp-clean-css/issues/91)，下面有人评论：

> Here’s a fork that appears better maintained https://github.com/aptuitiv/gulp-clean-css

火速卸载`gulp-clean-css`，再安装`@aptuitiv/gulp-clean-css`:

```bash
npm uninstall gulp-clean-css --save
npm install @aptuitiv/gulp-clean-css --save
```

再将之前的`gulpfile.js`修改一下:

```diff
@@ -1,5 +1,5 @@
 const gulp = require('gulp');
-const cleancss = require('gulp-clean-css');
+const cleancss = require('@aptuitiv/gulp-clean-css');
 const uglify = require('gulp-uglify-es').default;
 const htmlmin = require('gulp-html-minifier-terser');
 const rev = require('gulp-rev-all');
```

即可修复这个bug。