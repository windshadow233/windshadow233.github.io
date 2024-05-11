---
title: WordPress全站Ajax化
id: 1973
date: 2020-07-18 07:39:56
categories:
  - [博客相关]
tags: ['JavaScript', 'Web前端', 'WordPress']
cover: 
disableNunjucks: true
---

Ajax技术通常用于网站的局部刷新，从而提高网站刷新资源内容的效率。


我的需求来源：添加了一个音乐播放器，但是网站内部切换导航栏时，会刷新整个网页，导致音乐播放中断，因此考虑全站ajax化。

首先我尝试了一下WordPress的插件Advanced AJAX Page Loader，但好像和主题不太兼容（存疑，也可能是我太菜了），故提取了插件中的主要代码，写入了一个文件ajaxfy.js，修改了部分参数后导入主题即可。[文件下载戳这儿](https://gist.github.com/windshadow233/953d2fe4c068504519f003386fcfbbe7)


主要需要修改的代码参数有以下：

```js
var ajaxhome='';
var ajaxcontent = 'content';
var ajaxsearch_class = 'searchform';
var ajaxignore_string = new String('#, /wp-, .pdf, .zip, .rar, /goto'); 
var ajaxignore = ajaxignore_string.split(', ');
var ajaxloading_code = 'loading';
var ajaxloading_error_code = 'error';
```

- `ajaxhome`是主页地址，用以判断网站内的链接是否需要ajax加载
- `ajaxcontent`是需要ajax加载的区域的id，WordPress主题一般都是content，我根据需求改成了main。
- `ajaxsearch_class`是需要ajax加载的搜索表单的class。
- `ajaxignore_string`用以结合后面的`ajaxcheck_ignore`函数，可以在函数中根据需求自定义一些逻辑来判断哪些url不需要ajax加载。
- `ajaxloading_code`是ajax加载过程中显示在界面上的内容。
- `ajaxloading_error_code`是ajax加载失败时显示在界面上的内容。

在修改完基本的参数后，若~~代码~~魔改能力比较强，还可以需要根据自己的需求修改一些代码的细节。
